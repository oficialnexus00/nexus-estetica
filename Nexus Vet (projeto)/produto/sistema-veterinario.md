# Sistema Veterinário NEXUS — Documento de Visão

> **Status:** proposta inicial — aguardando validação do Kaian.
> **Decisão estratégica sugerida:** competir de frente com SimplesVet, LoopVet,
> Vetus, Vetsys — sistema de gestão veterinária completo com IA comercial nativa.
> **Data:** julho/2026. **Autor:** Rodrigo (+ Claude).
> **Precedente:** mesma tese e mesmo formato de `produto/sistema-odontologico.md`,
> que vive no repositório-mãe [`nexus-estetica`](https://github.com/oficialnexus00/nexus-estetica)
> — a pesquisa do vet chegou de forma independente à mesma conclusão do odonto.

---

## 1. A tese

O mercado de software veterinário no Brasil é grande, consolidado e **tecnicamente
parado**: os líderes são sistemas de gestão competentes, mas nenhum tem **IA de
verdade operando WhatsApp** — que é exatamente o músculo da NEXUS.

### A motivação de origem (a mesma do odonto — e confirmada na pesquisa)

> **Nenhum sistema veterinário libera API aberta.** Verificamos SimplesVet,
> LoopVet, Vetus e Vetsys: nenhum tem API pública documentada. Sem isso, a Bia
> não consegue escrever na agenda nem ler o histórico do pet — a clínica teria
> que **redigitar tudo à mão**, o que destrói a proposta de praticidade.

Duas consequências diretas — idênticas às do odonto:

1. **Construir o próprio sistema remove o teto**: com a gestão dentro de casa, a
   Bia opera com dado completo (agenda real, vacina real, histórico real).
2. **API-first vira pilar**: o sistema NEXUS Vet nasce com API e webhooks desde o
   MVP — exatamente o que os concorrentes se recusam a dar.

**Posicionamento:** não vender "mais um sistema veterinário", e sim
**"o sistema que enche a agenda e traz o pet de volta sozinho"** — gestão
completa + motor de recorrência de IA embutido.

## 2. Benchmark — contra quem vamos jogar

### Sistemas de gestão (incumbentes)
| Player | Força | Fraqueza explorável |
|---|---|---|
| **SimplesVet** (+8.200 clínicas) | Líder absoluto, prontuário amado, marca forte | WhatsApp só dispara (e cobra **R$0,50/msg**); portal do tutor só visualiza; financeiro/relatórios com falhas reclamadas; suporte lento (70% resolvido, ~1d16h) |
| **LoopVet** | Agenda + financeiro + prontuário | Sem API; menor escala |
| **Vetus / Vetsys** | Anamnese e média/alta complexidade | Sem API; UX datada |
| **Peti9 / NuvemVet / ZettaPet** | Preço acessível | Produto raso |

### IA no WhatsApp (rivais DIRETOS — a ameaça real)
| Player | Preço | Observação |
|---|---|---|
| **Fly Vet** | R$147,90/mês OU R$2.800 implantação | Vet-nativa, qualificação SPIN, funil CRM. Integra com **Google Calendar**, não com o sistema da clínica |
| **VeterIA** (GoVets, 600+ clínicas) | "acessível" (~½ recepcionista) | Memória de cliente, reativação, **lembrete de vacina** |
| **ChatGuru / genéricos** | R$0–100/mês | Regras por palavra-chave; deixa o pesado pro humano |

**Brecha comum a todos:** o sistema gerencia mas **não vende**; a IA conversa mas
**não gerencia**. Ninguém junta os dois. A NEXUS já faz o lado comercial hoje.

## 3. Diferenciais NEXUS (a vantagem injusta)

1. **Bia nativa no sistema** — agenda, confirma, lembra vacina e reativa tutor pelo
   WhatsApp, sem humano.
2. **Recorrência estruturada** — vacina tem data previsível; é receita agendada que
   hoje se perde. Custo real do lembrete ≈ **R$0,03** (vs. R$0,50 cobrados pelo líder).
3. **Motor de aquisição embutido** — Meta Ads (Click-to-WhatsApp) + tráfego como serviço.
4. **Maturidade** — motor já roda em 50+ clínicas de saúde/estética; rivais vet-only são startups.
5. **Suporte e honestidade** — exatamente onde o líder mais apanha no Reclame Aqui.

## 4. Mapa de módulos

### Núcleo comercial (já existe na NEXUS)
- CRM de leads e pipeline · Bia (captação, qualificação, agendamento) · automação de
  follow-up e reativação · integração Meta Ads

### Agenda e recepção
- Agenda por veterinário/banhista · bloqueio e recorrência · **confirmação automática
  anti no-show** · encaixe e lista de espera

### Clínico
- Prontuário do pet (PEP) · **carteira de vacinação digital** · anamnese com alertas
  (alergias) · anexos (exames, fotos) · receituário e atestado

### Recorrência (o killer feature do vet) 💰
- **Protocolos de vacina por espécie** · cálculo automático da próxima dose ·
  **lembrete e reativação automáticos via Bia** · alerta de atrasadas

### Financeiro
- Contas a pagar/receber · fluxo de caixa · comissão por profissional ·
  inadimplência com régua de cobrança (Bia) · NFS-e (fase 2)

### Gestão e BI
- Dashboard: ocupação, no-show, ticket médio, serviço mais lucrativo, origem do cliente

### Plataforma
- Multi-tenant e permissões · LGPD desde o dia 1 · **API pública + webhooks no MVP**

## 5. Roadmap em fases

### Fase 0 — Validação (agora)
- Escolher **1 clínica-piloto** (perfil: pequena, sem sistema, ativa no WhatsApp)
- Entrevistar 5–10 donos: o que usam, quanto pagam, o que mais dói
- **KPI:** converter 3+ em beta pagante

### Fase 1 — MVP "agenda cheia + pet volta" (0 → 6 meses)
Núcleo comercial + agenda + confirmação IA + **prontuário e vacina com lembrete
automático** + financeiro básico.
- **KPI:** 10 clínicas pagantes; no-show ≥30% menor; taxa de retorno de vacina subindo

### Fase 2 — Paridade competitiva (6 → 14 meses)
Estoque com fracionamento, NFS-e, comissões, BI completo, multi-unidade.
- **KPI:** churn < 3%/mês, 50+ clínicas

### Fase 3 — Ultrapassagem (14 meses+)
App do tutor, API pública, banho&tosa completo, IA clínica de apoio.

## 6. Modelo de negócio (hipótese a validar)

- SaaS mensal por clínica (tiers por nº de profissionais/unidades)
- Porta de entrada: **ativação assistida** (princípio validado — nunca desconto)
- **Tensão de preço a resolver:** rivais diretos custam R$147–400/mês. A R$859 só
  se sustenta vendendo **sistema operacional completo**, não "chatbot".
  Sugestão de tiers: entrada R$597 · completo R$859 · multi R$1.290+

## 7. Riscos e como mitigar

| Risco | Mitigação |
|---|---|
| Mercado já tem rivais diretos (Fly Vet, VeterIA) | Não competir como bot; competir como sistema único integrado |
| Preço acima dos rivais | Posicionar em outra categoria; provar ROI (no-show + vacina) |
| Escopo gigante | Fases; MVP focado em "agenda cheia + recorrência de vacina" |
| Chip/Evolution instável e ban | Lembrete é transacional (uso seguro); arquitetura híbrida com API oficial pra escala |
| Capacidade tech (Marco sozinho) | Reaproveitar o codebase do sistema odonto; avaliar reforço |
| Migração de dados do SimplesVet | Importador no MVP — barreira nº1 de troca |
| IA dar orientação clínica | Guardrail duro: nunca diagnóstico/dose; encaminha ao vet (ver base de conhecimento) |

## 8. Perguntas abertas (Kaian)

- [ ] Reaproveitar o **codebase do sistema odonto** como base do vet, ou projeto separado?
- [ ] Nome do produto: "NEXUS Vet"?
- [ ] Clínica-piloto: existe alguma veterinária na carteira/rede de contatos?
- [ ] Preço-alvo e tier de entrada (ver tensão na seção 6)
- [ ] Instância Evolution dedicada pro vet?

---

## O que já está construído (pronto pra revisão)

| Entrega | Onde | Status |
|---|---|---|
| Ferramentas da IA (tool-server) | [`stack/essencial-vet.workflow.js`](../stack/essencial-vet.workflow.js) | ✅ validado no n8n |
| Motor de reativação de vacina | [`stack/reativacao-vacina-vet.workflow.js`](../stack/reativacao-vacina-vet.workflow.js) | ✅ validado no n8n |
| Persona da Bia Vet | [`produto/bia-vet-persona.md`](./bia-vet-persona.md) | rascunho v0 |
| Base de conhecimento | [`produto/base-conhecimento-vet.md`](./base-conhecimento-vet.md) | estrutura pronta |
| Modelo de dados Pet 360 | [`produto/modelo-de-dados-pet360.md`](./modelo-de-dados-pet360.md) | pronto |
| Plano de teste | [`produto/plano-teste-vet.md`](./plano-teste-vet.md) | pronto |
| Pesquisa de concorrentes | [`comercial/pesquisa-concorrentes.md`](../comercial/pesquisa-concorrentes.md) | pronto |
| Templates de mensagem | [`comercial/templates-bia-vet.md`](../comercial/templates-bia-vet.md) | v0 |
| Dados de vacina + custo WhatsApp | [`stack/dados-vacina-e-whatsapp.md`](../stack/dados-vacina-e-whatsapp.md) | pronto |

> **Próximo entregável sugerido:** roteiro de entrevista de validação com donos de
> clínica veterinária (Fase 0) + escolha da clínica-piloto.
