-- ============================================================
-- NEXUS VET — schema inicial (Supabase / Postgres)
-- Herda a arquitetura provada do NEXUS Odonto (multi-tenant + RLS dia 1)
-- e adapta ao nicho: paciente vira TUTOR + PET, odontograma vira
-- CARTEIRA DE VACINA (o motor de recorrência do vet).
-- Rodar no SQL Editor do Supabase (uma vez).
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- MULTI-TENANT  (idêntico ao odonto — reaproveitado 1:1)
-- ------------------------------------------------------------
create table if not exists organizations (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists clinics (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  nome        text not null,
  cidade      text,
  telefone    text,
  cnpj        text,
  -- específico do atendimento IA
  horarios    text,                -- funcionamento, exibido pela IA
  emergencia_24h boolean not null default false,
  referencia_emergencia text,      -- pra onde encaminhar fora do horário
  created_at  timestamptz not null default now()
);

create table if not exists memberships (
  user_id     uuid not null references auth.users(id) on delete cascade,
  org_id      uuid not null references organizations(id) on delete cascade,
  papel       text not null default 'dono'
              check (papel in ('dono','veterinario','recepcao','financeiro')),
  primary key (user_id, org_id)
);

create table if not exists professionals (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references clinics(id) on delete cascade,
  nome          text not null,
  especialidade text,              -- clínico geral, cirurgião, banho&tosa...
  telefone      text,
  ativo         boolean not null default true
);

-- ------------------------------------------------------------
-- TUTOR + PET  (aqui o vet difere do odonto: o cliente é o tutor,
-- mas o paciente é o pet)
-- ------------------------------------------------------------
create table if not exists tutors (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references clinics(id) on delete cascade,
  nome          text not null,
  cpf           text,
  telefone      text,              -- chave de identificação no WhatsApp
  email         text,
  origem        text,              -- Instagram Ads, Indicação, Google...
  etapa_funil   text not null default 'lead'
                check (etapa_funil in ('lead','agendado','cliente','inativo')),
  saldo         numeric(12,2) not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists pets (
  id             uuid primary key default gen_random_uuid(),
  clinic_id      uuid not null references clinics(id) on delete cascade,
  tutor_id       uuid not null references tutors(id) on delete cascade,
  nome           text not null,
  especie        text not null default 'cao' check (especie in ('cao','gato','outro')),
  raca           text,
  sexo           text check (sexo in ('M','F')),
  nascimento     date,             -- base do cálculo de protocolo vacinal
  peso_kg        numeric(6,2),
  castrado       boolean,
  microchip      text,
  alerta_saude   text,             -- alergias, condições (equivale ao alerta do odonto)
  foto_url       text,             -- carteirinha digital
  status         text not null default 'ativo'
                 check (status in ('ativo','inativo','obito')),
  created_at     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- CATÁLOGO DE SERVIÇOS  (melhoria vs odonto, que usava texto livre:
-- a IA precisa de preço estruturado pra nunca inventar valor)
-- ------------------------------------------------------------
create table if not exists services (
  id           uuid primary key default gen_random_uuid(),
  clinic_id    uuid not null references clinics(id) on delete cascade,
  nome         text not null,
  categoria    text not null default 'consulta'
               check (categoria in ('consulta','vacina','banho_tosa','exame','cirurgia','outro')),
  preco        numeric(12,2) not null default 0,
  duracao_min  int not null default 30,
  ativo        boolean not null default true
);

-- ------------------------------------------------------------
-- AGENDA  (herdado do odonto; status igual = anti no-show)
-- ------------------------------------------------------------
create table if not exists appointments (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null references clinics(id) on delete cascade,
  professional_id uuid references professionals(id) on delete set null,
  tutor_id        uuid references tutors(id) on delete set null,
  pet_id          uuid references pets(id) on delete set null,
  service_id      uuid references services(id) on delete set null,
  inicio          timestamptz not null,
  duracao_min     int not null default 30,
  procedimento    text,
  status          text not null default 'pendente'
                  check (status in ('pendente','confirmada','atendida','falta','cancelada')),
  canal           text not null default 'ia' check (canal in ('ia','recepcao')),
  lembrete_enviado_em timestamptz,          -- controle do lembrete D-1
  created_at      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ORÇAMENTOS  (herdado 1:1 — vet também tem cirurgia/tratamento)
-- ------------------------------------------------------------
create table if not exists budgets (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references clinics(id) on delete cascade,
  tutor_id      uuid references tutors(id) on delete set null,
  pet_id        uuid references pets(id) on delete set null,
  procedimento  text not null,
  valor         numeric(12,2) not null default 0,
  status        text not null default 'aguardando'
                check (status in ('aguardando','follow-up','aprovado','recusado')),
  follow_ups    int not null default 0,
  ultima_acao   text,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 💉 VACINAS — o odontograma do vet. É o motor de recorrência.
-- ------------------------------------------------------------

-- Protocolos por espécie (referência da clínica; o vet dela valida)
create table if not exists vaccine_protocols (
  id                uuid primary key default gen_random_uuid(),
  clinic_id         uuid not null references clinics(id) on delete cascade,
  especie           text not null check (especie in ('cao','gato','outro')),
  vacina            text not null,          -- V10, Antirrábica, Tríplice felina...
  doses_filhote     int not null default 3, -- nº de doses no esquema inicial
  intervalo_dias    int not null default 30,-- entre doses do filhote
  reforco_meses     int not null default 12,-- reforço (anual = 12)
  idade_minima_dias int not null default 45,
  ativo             boolean not null default true
);

-- Histórico aplicado por pet + próxima dose calculada
create table if not exists vaccinations (
  id               uuid primary key default gen_random_uuid(),
  clinic_id        uuid not null references clinics(id) on delete cascade,
  pet_id           uuid not null references pets(id) on delete cascade,
  protocol_id      uuid references vaccine_protocols(id) on delete set null,
  vacina           text not null,
  data_aplicacao   date not null,
  proxima_dose     date,                    -- calculada; alimenta a Reativação
  lote             text,
  professional_id  uuid references professionals(id) on delete set null,
  ultimo_lembrete  date,                    -- idempotência do lembrete (recorrência-safe)
  created_at       timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 📋 PRONTUÁRIO — o registro clínico do atendimento.
-- É a tela que o veterinário mais usa e o que mais prende o cliente.
-- Escrito SEMPRE por humano: a IA não diagnostica nem prescreve.
-- ------------------------------------------------------------
create table if not exists consultations (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null references clinics(id) on delete cascade,
  pet_id          uuid not null references pets(id) on delete cascade,
  professional_id uuid references professionals(id) on delete set null,
  appointment_id  uuid references appointments(id) on delete set null,
  data            date not null default current_date,

  motivo          text not null,          -- queixa principal
  anamnese        text,                   -- histórico relatado pelo tutor
  exame_fisico    text,                   -- achados do exame
  peso_kg         numeric(6,2),           -- peso do dia (alimenta a evolução)
  temperatura     numeric(4,1),
  diagnostico     text,
  conduta         text,                   -- tratamento indicado
  prescricao      text,                   -- receituário (impressão)
  observacoes     text,
  created_at      timestamptz not null default now()
);

alter table consultations enable row level security;
create policy cons_all on consultations for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));

create index if not exists idx_cons_pet on consultations(pet_id, data desc);
create index if not exists idx_cons_clinic on consultations(clinic_id, data desc);

-- Ao registrar peso no atendimento, atualiza o peso atual do pet.
-- Evita o vet ter que digitar em dois lugares (praticidade > pureza).
create or replace function sync_peso_pet() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.peso_kg is not null then
    update pets set peso_kg = new.peso_kg where id = new.pet_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_peso on consultations;
create trigger trg_sync_peso after insert on consultations
  for each row execute function sync_peso_pet();

-- ------------------------------------------------------------
-- 💰 FINANCEIRO — lançamentos a receber e a pagar.
-- É a brecha declarada contra o líder: nas reclamações reais dele os
-- clientes citam "relatórios incompletos" e "vendas que somem".
-- Por isso aqui: um lançamento por linha, com origem rastreável.
-- ------------------------------------------------------------
create table if not exists finance_entries (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null references clinics(id) on delete cascade,
  tipo            text not null check (tipo in ('receber','pagar')),

  descricao       text not null,
  categoria       text,                   -- consulta, vacina, aluguel, fornecedor...
  valor           numeric(12,2) not null check (valor > 0),
  vencimento      date not null,
  pago_em         date,                   -- null = em aberto
  forma_pagamento text check (forma_pagamento in ('dinheiro','pix','credito','debito','boleto','outro')),

  -- rastreabilidade: de onde veio esse dinheiro
  tutor_id        uuid references tutors(id) on delete set null,
  pet_id          uuid references pets(id) on delete set null,
  appointment_id  uuid references appointments(id) on delete set null,

  observacoes     text,
  created_at      timestamptz not null default now()
);

alter table finance_entries enable row level security;
create policy fin_all on finance_entries for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));

create index if not exists idx_fin_clinic_venc on finance_entries(clinic_id, vencimento);
create index if not exists idx_fin_aberto on finance_entries(clinic_id, tipo) where pago_em is null;
create index if not exists idx_fin_tutor on finance_entries(tutor_id);

-- Inadimplência: quem está devendo e há quanto tempo.
-- Alimenta a régua de cobrança da Bia.
create or replace view v_inadimplencia as
select
  f.id, f.clinic_id, f.descricao, f.valor, f.vencimento,
  (current_date - f.vencimento) as dias_atraso,
  t.id as tutor_id, t.nome as tutor_nome, t.telefone,
  p.nome as pet_nome
from finance_entries f
join tutors t on t.id = f.tutor_id
left join pets p on p.id = f.pet_id
where f.tipo = 'receber'
  and f.pago_em is null
  and f.vencimento < current_date
  and t.telefone is not null;

-- Fluxo de caixa por dia (realizado + previsto)
create or replace view v_fluxo_caixa as
select
  clinic_id,
  coalesce(pago_em, vencimento) as dia,
  sum(case when tipo = 'receber' then valor else 0 end) as entradas,
  sum(case when tipo = 'pagar'   then valor else 0 end) as saidas,
  sum(case when tipo = 'receber' then valor else -valor end) as saldo,
  bool_and(pago_em is not null) as realizado
from finance_entries
group by clinic_id, coalesce(pago_em, vencimento);

-- ------------------------------------------------------------
-- INTERAÇÕES  (timeline do Pet 360 + CRM)
-- ------------------------------------------------------------
create table if not exists interactions (
  id           uuid primary key default gen_random_uuid(),
  clinic_id    uuid not null references clinics(id) on delete cascade,
  tutor_id     uuid references tutors(id) on delete set null,
  pet_id       uuid references pets(id) on delete set null,
  ocorrido_em  timestamptz not null default now(),
  tipo         text not null default 'recebida'
               check (tipo in ('recebida','enviada','lembrete','reativacao')),
  resumo       text,
  resultado    text check (resultado in ('agendou','sem_resposta','duvida','reclamacao'))
);

-- ------------------------------------------------------------
-- Helpers de tenant  (idêntico ao odonto)
-- ------------------------------------------------------------
create or replace function user_org_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select org_id from memberships where user_id = auth.uid()
$$;

create or replace function user_clinic_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select c.id from clinics c where c.org_id in (select user_org_ids())
$$;

-- ------------------------------------------------------------
-- RLS — cada usuário só enxerga a(s) sua(s) clínica(s)
-- ------------------------------------------------------------
alter table organizations     enable row level security;
alter table clinics           enable row level security;
alter table memberships       enable row level security;
alter table professionals     enable row level security;
alter table tutors            enable row level security;
alter table pets              enable row level security;
alter table services          enable row level security;
alter table appointments      enable row level security;
alter table budgets           enable row level security;
alter table vaccine_protocols enable row level security;
alter table vaccinations      enable row level security;
alter table interactions      enable row level security;

create policy org_read   on organizations for select using (id in (select user_org_ids()));
create policy clinic_all on clinics for all
  using (org_id in (select user_org_ids())) with check (org_id in (select user_org_ids()));
create policy mem_read   on memberships for select using (user_id = auth.uid());

create policy prof_all on professionals for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));
create policy tutor_all on tutors for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));
create policy pet_all on pets for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));
create policy svc_all on services for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));
create policy appt_all on appointments for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));
create policy bud_all on budgets for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));
create policy vprot_all on vaccine_protocols for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));
create policy vacc_all on vaccinations for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));
create policy inter_all on interactions for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));

-- ------------------------------------------------------------
-- 🔁 VIEW: fila do lembrete de vacina
-- É daqui que o workflow de Reativação lê (uma fonte de verdade só,
-- em vez de uma Data Table paralela no n8n).
-- Regra: vence em ≤7 dias OU está atrasada, e não foi lembrado nos
-- últimos 20 dias.
-- ------------------------------------------------------------
create or replace view v_fila_lembrete_vacina as
select
  v.id            as vaccination_id,
  v.clinic_id,
  p.id            as pet_id,
  p.nome          as pet_nome,
  p.especie,
  t.id            as tutor_id,
  t.nome          as tutor_nome,
  t.telefone,
  v.vacina,
  v.proxima_dose,
  (v.proxima_dose - current_date) as dias_para_vencer,
  case when v.proxima_dose < current_date then 'atrasada' else 'proxima' end as situacao
from vaccinations v
join pets   p on p.id = v.pet_id
join tutors t on t.id = p.tutor_id
where p.status = 'ativo'
  and t.telefone is not null
  and v.proxima_dose is not null
  and v.proxima_dose <= current_date + 7
  and (v.ultimo_lembrete is null or v.ultimo_lembrete < current_date - 20);

-- ------------------------------------------------------------
-- 🐾 VIEW: Pet 360 — o que a equipe vê de uma vez
-- ------------------------------------------------------------
create or replace view v_pet_360 as
select
  p.id as pet_id, p.clinic_id, p.nome as pet_nome, p.especie, p.raca, p.nascimento,
  t.id as tutor_id, t.nome as tutor_nome, t.telefone, t.etapa_funil,
  (select count(*) from appointments a where a.pet_id = p.id and a.status = 'atendida') as atendimentos,
  (select max(a.inicio) from appointments a where a.pet_id = p.id and a.status = 'atendida') as ultimo_atendimento,
  (select min(a.inicio) from appointments a where a.pet_id = p.id and a.inicio > now()
     and a.status in ('pendente','confirmada')) as proximo_agendamento,
  (select min(v.proxima_dose) from vaccinations v where v.pet_id = p.id and v.proxima_dose is not null) as proxima_vacina,
  exists (select 1 from vaccinations v where v.pet_id = p.id and v.proxima_dose < current_date) as tem_vacina_atrasada
from pets p
join tutors t on t.id = p.tutor_id;

-- ------------------------------------------------------------
-- 📅 RPC: horários disponíveis
-- A única "ferramenta" da IA que não é leitura simples de tabela — precisa
-- calcular. Fica no banco (e não no workflow) pra ser a mesma regra em
-- qualquer lugar. Sem SECURITY DEFINER de propósito: o RLS continua valendo,
-- então o usuário só enxerga a agenda da própria clínica.
-- Chamada via PostgREST: POST /rest/v1/rpc/buscar_horarios_disponiveis
-- ------------------------------------------------------------
create or replace function buscar_horarios_disponiveis(
  p_clinic_id       uuid,
  p_service_id      uuid,
  p_data            date,
  p_professional_id uuid default null
)
returns table(horario time, professional_id uuid, profissional text)
language plpgsql stable set search_path = public as $$
declare
  v_dur   int;
  v_abre  time := '08:00';
  v_fecha time := '18:00';
begin
  select coalesce(s.duracao_min, 30) into v_dur from services s where s.id = p_service_id;
  if v_dur is null or v_dur <= 0 then v_dur := 30; end if;

  return query
  with profs as (
    select p.id, p.nome
    from professionals p
    where p.clinic_id = p_clinic_id
      and p.ativo
      and (p_professional_id is null or p.id = p_professional_id)
  ),
  slots as (
    select gs as inicio
    from generate_series(
      (p_data + v_abre)::timestamptz,
      (p_data + v_fecha)::timestamptz - make_interval(mins => v_dur),
      make_interval(mins => v_dur)
    ) gs
  )
  select sl.inicio::time, pr.id, pr.nome
  from slots sl
  cross join profs pr
  where not exists (
    select 1
    from appointments a
    where a.clinic_id = p_clinic_id
      and a.professional_id = pr.id
      and a.status in ('pendente','confirmada')
      and tstzrange(a.inicio, a.inicio + make_interval(mins => a.duracao_min))
          && tstzrange(sl.inicio, sl.inicio + make_interval(mins => v_dur))
  )
  order by 1, 3;
end;
$$;

-- ------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------
create index if not exists idx_tutors_clinic     on tutors(clinic_id);
create index if not exists idx_tutors_telefone    on tutors(telefone);
create index if not exists idx_pets_clinic        on pets(clinic_id);
create index if not exists idx_pets_tutor         on pets(tutor_id);
create index if not exists idx_appt_clinic_inicio on appointments(clinic_id, inicio);
create index if not exists idx_appt_pet           on appointments(pet_id);
create index if not exists idx_budgets_clinic     on budgets(clinic_id);
create index if not exists idx_vacc_pet           on vaccinations(pet_id);
create index if not exists idx_vacc_proxima       on vaccinations(clinic_id, proxima_dose);
create index if not exists idx_inter_tutor        on interactions(tutor_id);
create index if not exists idx_services_clinic    on services(clinic_id);
