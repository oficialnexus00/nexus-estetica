# Piloto MVP — Sistema Odonto NEXUS (design partner: clínica de 6 profissionais)

> **Contexto:** clínica da carteira (6 profissionais) usa **Capim** hoje e deu
> acesso ao Kaian pra estudo. Ideia: construir o piloto do sistema NEXUS **com**
> essa clínica como design partner, ela usa no lugar da Capim, e se validar,
> vira o produto que a NEXUS vende (ver `sistema-odontologico.md`).

## Sobre a Capim (o sistema atual dele)

- Startup fintech (2021), **Série A de R$ 132M** (Valor Capital, QED), ~6 mil
  clínicas.
- O negócio real é **BNPL**: paciente parcela em até 36x no boleto (até
  R$ 30 mil), clínica recebe à vista, Capim assume o risco.
- O ERP (agenda, prontuário, odontograma, orçamento, financeiro, estoque) é
  o gancho pra vender o financiamento.
- Plano único, sem taxa de adesão (valor não público).
- API pública: não documentada/anunciada — caixa fechada como os demais.

**Implicação:** não competimos com a Capim no financiamento (é fintech com
capital — não replicar BNPL no piloto). A clínica pode até MANTER a Capim só
como meio de financiamento e rodar a gestão no NEXUS.

## ⚠️ LGPD — regra do acesso à Capim do cliente

- Acesso serve pra **estudar fluxos e telas** (pesquisa de produto).
- **Não exportar/copiar dados de pacientes** pra nenhum ambiente NEXUS sem
  contrato/termo de tratamento de dados assinado com a clínica.
- Quando houver migração real de dados, ela é feita COM a clínica, com termo,
  direto pro ambiente de produção dela no NEXUS.

## Escopo do piloto — núcleo operacional (definido pelo Kaian)

> Direção do Kaian: **"é só o operacional mesmo — agenda, financeiro, um dash,
> paciente, essas coisas. BNPL esquece, não é da nossa alçada."**

### v1 — o que entra (núcleo)

1. **Agenda** por dentista/cadeira + confirmação automática via Bia (WhatsApp)
2. **Pacientes** — cadastro, ficha do paciente, anamnese simples com alertas
3. **Financeiro básico** — recebimentos, contas, link de pagamento (PagTrust),
   repasse simples por dentista
4. **Dashboard** — produção por dentista, no-show, agenda ocupada, recebido
   no mês, origem do paciente
5. **Orçamentos simples** + **follow-up automático da Bia no orçamento não
   aprovado** (é operacional E é a killer feature — barato de incluir, paga o
   piloto sozinho)
6. **Importador CSV** de pacientes/agenda (migração assistida da Capim)
7. **API + webhooks** desde o início (pilar NEXUS)

### v1.1 — logo depois (se os dentistas pedirem)

- Odontograma (permanente + decídua)
- Evolução clínica assinada / documentos

### Fora do jogo (não é da nossa alçada)

- ❌ **BNPL/financiamento** — a clínica mantém a Capim SÓ pra isso se quiser
- ❌ Convênios/TISS, estoque, multi-unidade, app do paciente

## Custo de construir o piloto

### Cenário A — dentro de casa (recomendado)
Time: Marco (backend/Supabase) + Kaian (produto/validação) + Claude Code
(desenvolvimento acelerado). Stack já dominada: Lovable + Supabase + GPTMaker +
n8n + PagTrust.

| Item | Custo/mês |
|---|---|
| Supabase Pro | ~R$ 140 (US$ 25) |
| Lovable (tier de trabalho) | ~R$ 140–560 (US$ 25–100) |
| Domínio/e-mail/incidentais | ~R$ 50 |
| GPTMaker, n8n, ElevenLabs, WhatsApp | já pagos na operação atual |
| **Total caixa** | **~R$ 350–750/mês** |

- **Prazo estimado: 8–12 semanas** pro piloto utilizável (escopo acima).
- Custo real = **tempo do Marco** (custo de oportunidade sobre a infra atual
  da NEXUS — dimensionar quanto do tempo dele dá pra alocar).
- **Custo total do piloto: < R$ 3 mil em caixa.** O resto é suor.

### Cenário B — com reforço (se o Marco não tiver banda)
- 1 dev fullstack PJ pleno (React/TS + Supabase): R$ 8–14 mil/mês × 3 meses
- **Total: ~R$ 25–45 mil** + ferramentas do Cenário A

### Cenário C — terceirizar em agência/software house
- R$ 60–150 mil+. **Não recomendado**: o conhecimento do domínio (o ativo
  real) fica fora de casa.

## Modelo com o design partner (não fazer de graça)

- Cliente fundador paga **preço de fundador travado** (ex: R$ 197–297/mês)
  desde o beta — pagante valida de verdade; grátis só gera opinião educada.
- Em troca: prioridade de feature, canal direto, condição vitalícia.
- Com 6 profissionais, ele economiza vs qualquer alternativa (Feegow ~R$ 774,
  Clinicorp + API ~R$ 250–350) e ganha a Bia dentro.
- Piloto validado → replicar nas outras 4 clínicas do teste → **KPI Fase 1:
  10 clínicas pagantes.**

## Riscos específicos do piloto

| Risco | Mitigação |
|---|---|
| Clínica depende do financiamento Capim | Ela mantém Capim SÓ pro BNPL; gestão roda no NEXUS |
| Odontograma é UI complexa no Lovable | Prototipar cedo (semana 1–2); plano B: componente React custom |
| Marco vira gargalo (infra NEXUS + piloto) | Definir % de alocação ANTES de começar; senão, Cenário B |
| Dado de paciente no beta | Termo de tratamento de dados + backup + RLS no Supabase desde o dia 1 |

## Próximos passos

- [ ] P0 | Kaian: fechar com o dono o acordo de design partner (preço fundador)
- [ ] P0 | Kaian + Marco: definir alocação do Marco (Cenário A ou B)
- [ ] P1 | Claude: escopo técnico detalhado (telas, fluxos, modelo de dados,
      desenho da API) pra estimativa fina com o Marco
- [ ] P1 | Kaian: mapear na Capim (com o acesso que tem) os fluxos exatos que
      a clínica usa — o que ela usa MESMO vs o que ignora → corta escopo
