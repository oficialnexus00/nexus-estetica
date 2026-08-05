-- ============================================================
-- NEXUS VET — camada PROATIVA (aditivo ao schema-vet.sql)
-- As "filas" do agente proativo. A REGRA de quem entra em cada
-- cadência mora AQUI (view), nunca no workflow do n8n — uma fonte
-- de verdade só, reaproveitada pelo motor proativo E pela Bia.
--
-- Idempotência: reaproveita a tabela `interactions` como log de
-- disparo (fecha o circuito banco→IA→WhatsApp→banco). Cada envio
-- grava uma linha com `cadencia` preenchida; as views excluem quem
-- já recebeu dentro da janela de cool-down.
--
-- Rodar no SQL Editor do Supabase DEPOIS do schema-vet.sql.
-- ============================================================

-- Marcador de qual cadência gerou a interação (aditivo, não quebra nada).
alter table interactions add column if not exists cadencia text;
create index if not exists idx_inter_cadencia on interactions(clinic_id, cadencia, ocorrido_em desc);

-- ------------------------------------------------------------
-- 1) RETORNO PÓS-CONSULTA
-- Consulta aconteceu entre 7 e 20 dias atrás, o pet segue ativo,
-- não há atendimento futuro marcado, e ninguém lembrou nos últimos 30 dias.
-- Valor: receita recorrente + cuidado (o vet indicou acompanhar).
-- ------------------------------------------------------------
create or replace view v_fila_retorno as
select
  c.id            as consultation_id,
  c.clinic_id,
  p.id            as pet_id,
  p.nome          as pet_nome,
  t.id            as tutor_id,
  t.nome          as tutor_nome,
  t.telefone,
  c.data          as data_consulta,
  (current_date - c.data) as dias_desde
from consultations c
join pets   p on p.id = c.pet_id
join tutors t on t.id = p.tutor_id
where p.status = 'ativo'
  and t.telefone is not null
  and c.data between current_date - 20 and current_date - 7
  and not exists (                       -- não tem retorno já marcado
    select 1 from appointments a
    where a.pet_id = p.id and a.inicio > now()
      and a.status in ('pendente','confirmada')
  )
  and not exists (                       -- cool-down 30 dias
    select 1 from interactions i
    where i.pet_id = p.id and i.cadencia = 'retorno'
      and i.ocorrido_em > now() - interval '30 days'
  );

-- ------------------------------------------------------------
-- 2) PÓS-OPERATÓRIO (check-in D+1)
-- Cirurgia atendida ontem → mensagem de cuidado no dia seguinte.
-- Valor: segurança do paciente + relacionamento (ninguém faz isso).
-- ------------------------------------------------------------
create or replace view v_fila_pos_op as
select
  a.id            as appointment_id,
  a.clinic_id,
  p.id            as pet_id,
  p.nome          as pet_nome,
  t.id            as tutor_id,
  t.nome          as tutor_nome,
  t.telefone,
  a.inicio        as data_cirurgia
from appointments a
join services s on s.id = a.service_id and s.categoria = 'cirurgia'
join pets   p on p.id = a.pet_id
join tutors t on t.id = p.tutor_id
where p.status = 'ativo'
  and t.telefone is not null
  and a.status = 'atendida'
  and a.inicio::date = current_date - 1        -- ontem
  and not exists (
    select 1 from interactions i
    where i.pet_id = p.id and i.cadencia = 'pos_op'
      and i.ocorrido_em > now() - interval '5 days'
  );

-- ------------------------------------------------------------
-- 3) CLIENTE SUMIDO (reativação)
-- Último atendimento há 90–180 dias, sem retorno marcado, pet ativo,
-- não reativado nos últimos 60 dias. (Teto de 180d evita puxar quem
-- já virou inativo de vez — esses entram em campanha de Marketing, não aqui.)
-- Valor: reativação barata do que já é cliente.
-- ------------------------------------------------------------
create or replace view v_fila_cliente_sumido as
select
  p.id            as pet_id,
  p.clinic_id,
  p.nome          as pet_nome,
  t.id            as tutor_id,
  t.nome          as tutor_nome,
  t.telefone,
  max(a.inicio)   as ultimo_atendimento,
  (current_date - max(a.inicio)::date) as dias_sumido
from pets p
join tutors t on t.id = p.tutor_id
join appointments a on a.pet_id = p.id and a.status = 'atendida'
where p.status = 'ativo'
  and t.telefone is not null
  and not exists (
    select 1 from appointments a2
    where a2.pet_id = p.id and a2.inicio > now()
      and a2.status in ('pendente','confirmada')
  )
  and not exists (
    select 1 from interactions i
    where i.pet_id = p.id and i.cadencia = 'reativacao'
      and i.ocorrido_em > now() - interval '60 days'
  )
group by p.id, p.clinic_id, p.nome, t.id, t.nome, t.telefone
having max(a.inicio)::date between current_date - 180 and current_date - 90;

-- ------------------------------------------------------------
-- 4) ANIVERSÁRIO DO PET (relacionamento)
-- Nascimento cai hoje. Baixa prioridade (relacionamento), mas encanta.
-- ------------------------------------------------------------
create or replace view v_fila_aniversario_pet as
select
  p.id            as pet_id,
  p.clinic_id,
  p.nome          as pet_nome,
  t.id            as tutor_id,
  t.nome          as tutor_nome,
  t.telefone,
  extract(year from age(p.nascimento))::int as idade
from pets p
join tutors t on t.id = p.tutor_id
where p.status = 'ativo'
  and t.telefone is not null
  and p.nascimento is not null
  and extract(month from p.nascimento) = extract(month from current_date)
  and extract(day   from p.nascimento) = extract(day   from current_date)
  and not exists (
    select 1 from interactions i
    where i.pet_id = p.id and i.cadencia = 'aniversario'
      and i.ocorrido_em > now() - interval '300 days'
  );

-- ------------------------------------------------------------
-- 5) FILA PROATIVA ÚNICA (next-best-action no BANCO)
-- Une as 4 cadências, aplica a PRIORIDADE e entrega UMA linha por telefone
-- (a de maior prioridade). O motor do n8n lê só esta view — assim uma fila
-- vazia (ex.: nenhum pós-op no dia) não quebra nada, e a regra de
-- próxima-melhor-ação fica no banco, não no workflow.
--   Prioridade: 1 pos_op (segurança) · 2 retorno (receita) ·
--               3 reativacao (recuperar) · 4 aniversario (relacionamento)
-- ------------------------------------------------------------
create or replace view v_fila_proativa as
with unioned as (
  select clinic_id, pet_id, pet_nome, tutor_id, tutor_nome, telefone,
         'pos_op'::text as cadencia, 1 as prioridade from v_fila_pos_op
  union all
  select clinic_id, pet_id, pet_nome, tutor_id, tutor_nome, telefone,
         'retorno', 2 from v_fila_retorno
  union all
  select clinic_id, pet_id, pet_nome, tutor_id, tutor_nome, telefone,
         'reativacao', 3 from v_fila_cliente_sumido
  union all
  select clinic_id, pet_id, pet_nome, tutor_id, tutor_nome, telefone,
         'aniversario', 4 from v_fila_aniversario_pet
)
select distinct on (telefone)
  clinic_id, pet_id, pet_nome, tutor_id, tutor_nome, telefone, cadencia, prioridade
from unioned
order by telefone, prioridade;   -- 1 cadência por telefone: a de maior prioridade
