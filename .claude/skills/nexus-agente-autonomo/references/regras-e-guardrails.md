# Regras de negócio e guardrails

O vet é o caso extremo (por isso o Kaian quer sair do GPTMaker): tem muita regra
dura — espécie, porte, protocolo de vacina, retorno, emergência, plano. Este arquivo
mostra **onde** cada regra mora e **como** impedir o agente de fazer besteira.

## O princípio: a regra mora no banco, o comportamento mora no prompt

Duas camadas, porque falham por motivos diferentes:

- **Banco** = impede o **dado errado**. Mesmo que o LLM enlouqueça, o banco não
  deixa gravar horário ocupado, escrever no cliente errado, ou marcar vacina em
  espécie incompatível. É a rede de segurança que não depende do modelo.
- **Prompt** = impede o **comportamento errado**. O que o agente nunca diz, quando
  ele escala, como ele não chuta. Depende do modelo, então é a primeira linha, não
  a única.

Regra crítica vive nas **duas**. Ex.: "não agenda em horário ocupado" está na RPC
(banco não devolve horário cheio) E no prompt ("ofereça só os horários que a tool
retornou").

## Regras no banco — os 4 mecanismos

### 1. Views que já aplicam a regra
A fila, o estado, a elegibilidade — tudo como view. O consumidor (agente ou motor
proativo) só lê; a regra fica versionada e única.

```sql
-- Fila de reativação de vacina: a REGRA está aqui, não no workflow
create view v_fila_lembrete_vacina as
select v.id as vaccination_id, p.nome as pet_nome, t.nome as tutor_nome,
       t.telefone, v.vacina, v.proxima_dose,
       case when v.proxima_dose < current_date then 'atrasada' else 'a_vencer' end as situacao
from vaccinations v
  join pets p   on p.id = v.pet_id
  join tutors t on t.id = p.tutor_id
where v.proxima_dose <= current_date + 7                    -- vence em ≤7 dias OU
   or v.proxima_dose < current_date                          -- já atrasada
  and (v.lembrado_em is null or v.lembrado_em < now() - interval '20 days');  -- cool-down
```

### 2. Funções RPC que validam antes de calcular/gravar
Cálculo com regra (horário livre, próxima dose, preço com desconto de plano) = RPC.
O agente chama; a regra é do banco.

```sql
create function buscar_horarios_disponiveis(p_clinic_id uuid, p_service_id uuid, p_data date)
returns table(inicio timestamptz) as $$
  -- gera os slots do expediente, subtrai o que já está agendado,
  -- respeita duração do serviço e bloqueios. NUNCA devolve horário ocupado.
$$ language plpgsql;
```

### 3. RLS por tenant (isolamento multi-cliente)
Row Level Security por `clinic_id`. Cliente A **nunca** enxerga dado de B, mesmo com
bug no workflow. Combina com a regra de ouro nº 1 (clinic_id fixo na instalação).

```sql
alter table appointments enable row level security;
create policy tenant_isolation on appointments
  using (clinic_id = current_setting('request.clinic_id')::uuid);
```

### 4. Constraints que tornam o estado inválido impossível
Espécie ∈ (cao, gato, outro); status ∈ (agendada, finalizada, cancelada); vacina de
FeLV só em gato; não agendar no passado. O banco recusa; o agente não tem como
inventar.

## Regras no prompt — as travas de comportamento

Ver `references/persona-e-prompt.md` pro template completo. As não-negociáveis:

- **Nunca inventa fato do cliente.** Preço, horário, protocolo, dose, saldo, status →
  só via tool. Sem tool → "deixa eu confirmar isso certinho", não chuta.
- **Confirma antes de ação irreversível.** Cancelar, cobrar, remarcar → repete o que
  vai fazer e espera o "pode".
- **Não dá conselho clínico como se fosse o veterinário.** Orienta o geral ("a
  antirrábica costuma ser anual"), mas o **protocolo do animal é sempre o vet quem
  define** — e emergência é escalada na hora.
- **Escala quando deve** (próxima seção).

## Escalonamento pro humano — quando o agente para e chama a equipe

Autonomia sem porta de saída é passivo. Todo agente sabe reconhecer o que **não é
dele** e transferir, avisando a equipe (notificação no canal interno / ClickUp):

| Gatilho | Ação |
|---|---|
| **Emergência clínica** (pet passando mal, urgência) | Para tudo, orienta procurar atendimento JÁ, transfere pro humano com prioridade |
| **Cliente irritado / reclamação** | Reconhece, não discute, transfere pra pessoa |
| **Fora do escopo** (jurídico, financeiro complexo, algo que não tem tool) | "Vou te passar pra alguém do time que resolve isso certinho" |
| **Pedido de falar com humano** | Transfere direto, sem insistir em resolver sozinho |
| **Loop / não entendeu 2x** | Transfere em vez de irritar |

O escalonamento também é regra de negócio: defina, por nicho, o que **nunca** é da
IA. No vet, emergência é a linha vermelha — errar aqui é grave, então na dúvida,
escala.

## Checklist de regras por agente novo

Antes de entregar, responda:

- [ ] O `clinic_id` está fixo na instalação e nunca vem da IA?
- [ ] Toda regra calculada virou view/RPC (nada de regra no workflow)?
- [ ] RLS por tenant ligada nas tabelas com dado de cliente?
- [ ] Constraints tornam os estados inválidos impossíveis?
- [ ] O prompt lista o que o agente nunca inventa e quando escala?
- [ ] A linha vermelha do nicho (ex.: emergência no vet) está coberta nas duas
      camadas?
