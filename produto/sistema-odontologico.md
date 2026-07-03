# Sistema Odontológico NEXUS — Documento de Visão

> **Status:** visão inicial aprovada pelo Kaian (direção: sistema completo).
> **Decisão estratégica:** competir de frente com Simples Dental, Clinicorp,
> CoDental, Feegow — sistema de gestão odontológica completo, não só vertical
> do CRM atual.
> **Data:** julho/2026.

---

## 1. A tese

O mercado de software odonto no Brasil é grande, consolidado e **tecnicamente
parado**: os líderes são sistemas de gestão competentes, mas nenhum tem
**IA comercial de verdade operando WhatsApp** — que é exatamente o músculo da
NEXUS (Bia + automação + tráfego + 50+ clínicas de carteira).

**Posicionamento:** não vender "mais um sistema de gestão", e sim
**"o sistema odontológico que enche e mantém a agenda cheia sozinho"** —
gestão completa + motor comercial de IA embutido.

## 2. Benchmark — contra quem vamos jogar

| Player | Força | Fraqueza explorável |
|---|---|---|
| **Simples Dental** | Líder de mercado, UX simples, marca forte | IA/atendimento raso; comercial da clínica fica por conta do dono |
| **Clinicorp** | Gestão robusta, multi-unidade, franquias | Complexo, caro, foco em rede grande; clínica pequena/média mal atendida |
| **CoDental** | Preço acessível | Produto raso, pouca inovação |
| **Feegow** | Multi-especialidade, marketplace | Genérico (não é odonto-first), UX datada |

**Brecha comum a todos:** o software gerencia a clínica, mas **não vende pela
clínica**. Follow-up de orçamento não aprovado, reativação de paciente sumido,
confirmação inteligente anti no-show, captação via ads — ninguém faz isso bem
nativo. A NEXUS faz isso **hoje**, antes mesmo de ter o sistema.

## 3. Diferenciais NEXUS (a vantagem injusta)

1. **Bia nativa no sistema** — agenda, confirma, faz follow-up de orçamento e
   reativa paciente pelo WhatsApp, sem humano.
2. **Máquina de aquisição embutida** — integração com Meta Ads
   (Click-to-WhatsApp) + gestão de tráfego como serviço. O concorrente entrega
   relatório; a NEXUS entrega paciente na cadeira.
3. **Carteira própria de validação** — 50+ clínicas para beta, feedback e case.
4. **DNA de funil** — o produto é desenhado por quem vive de conversão, não por
   quem vive de feature.

## 4. Mapa de módulos (produto completo)

### Núcleo comercial (já existe na NEXUS — porta de entrada)
- CRM de leads e pipeline
- Bia (IA WhatsApp): captação, qualificação, agendamento
- Automação de follow-up e reativação
- Integração Meta Ads / origem do lead

### Agenda e recepção
- Agenda por dentista / cadeira / unidade
- Encaixe, bloqueio, recorrência
- Confirmação automática via WhatsApp (anti no-show)
- Lista de espera inteligente
- Check-in / sala de espera

### Clínico
- Prontuário eletrônico do paciente (PEP)
- **Odontograma digital** (dentição permanente e decídua)
- Anamnese customizável com alertas (alergias, condições)
- Evolução clínica por procedimento, assinada
- Imagens e anexos (RX, fotos, documentos)
- Receituário, atestado e termos com **assinatura digital**

### Orçamento e plano de tratamento
- Orçamento por procedimento/região/dente, tabelas de preço
- Aprovação total/parcial, versões
- **Follow-up automático de orçamento não aprovado via Bia** 💰 (killer feature)
- Parcelamento e simulação

### Financeiro
- Contas a receber/pagar, fluxo de caixa, DRE simplificado
- Split/comissão por dentista (percentual, fixo, tabela)
- Convênios: tabelas, glosas, **TISS** (fase 2+)
- Emissão de NFS-e, boleto/Pix/cartão (link de pagamento)
- Inadimplência com régua de cobrança automática (Bia)

### Gestão e BI
- Dashboard: produção por dentista, taxa de aprovação de orçamento,
  no-show, LTV, origem de pacientes (ROI de ads nativo)
- Metas por unidade/dentista
- Estoque e materiais (fase 2+)

### Paciente
- App/portal do paciente: agendamento, documentos, pagamentos (fase 3)
- Pesquisa de satisfação (NPS) automática

### Plataforma
- Multi-tenant, multi-unidade, papéis e permissões (dono, dentista,
  recepção, financeiro)
- **LGPD para dado sensível de saúde** (desde o dia 1: criptografia,
  auditoria, consentimento, termos)
- API pública e integrações (fase 3)

## 5. Roadmap em fases

### Fase 0 — Validação (agora)
- **Kaian já tem ~5 clínicas da carteira dispostas a testar** ✅
- Entrevistar os 5 donos: o que usam hoje (Simples Dental? Clinicorp?),
  quanto pagam, o que mais dói, o que os faria trocar
- Mapear o fluxo real de agenda/orçamento/prontuário de cada uma
- **KPI:** das 5, converter 3+ em beta pagante do MVP

### Fase 1 — MVP "agenda cheia" (0 → 6 meses)
Núcleo comercial (já existe) + **agenda clínica + confirmação IA + orçamento
com follow-up automático + prontuário/odontograma básico + financeiro básico**.
- É o mínimo pra clínica trocar de sistema sem perder o essencial — e ganhar
  o que ninguém dá (IA comercial).
- **KPI:** 10 clínicas ativas pagantes, no-show reduzido ≥30% nos betas,
  taxa de aprovação de orçamento subindo com follow-up da Bia.

### Fase 2 — Paridade competitiva (6 → 14 meses)
Convênios/TISS, assinatura digital completa, estoque, comissões avançadas,
NFS-e, BI completo, multi-unidade.
- **KPI:** churn < 3%/mês, 50+ clínicas no sistema.

### Fase 3 — Ultrapassagem (14 meses+)
App do paciente, teleodonto, API pública, marketplace de serviços
(radiologia, protética), IA clínica (sugestão de plano, análise de RX).

## 6. Modelo de negócio (hipótese a validar)

- SaaS mensal por clínica (tiers por nº de dentistas/unidades)
- Upsell: gestão de tráfego (serviço já existente) + Bia em tiers de volume
- Porta de entrada: **ativação assistida** (princípio validado da NEXUS —
  nunca desconto)
- Referência de preço dos concorrentes: ~R$150–600/mês por clínica pequena/média
  (validar tabela atual na Fase 0)

## 7. Riscos e como mitigar

| Risco | Mitigação |
|---|---|
| Escopo gigante (sistema completo) | Fases; MVP focado em "agenda cheia"; não perseguir paridade total antes de ter tração |
| Marco sozinho no backend | Definir capacidade real; considerar reforço tech antes da Fase 1 |
| Lovable como frontend de produto grande | Validar limites; plano B: migração progressiva pra codebase própria React/TS |
| LGPD/dado de saúde | Arquitetura de segurança desde o dia 1; DPO/consultoria jurídica cedo |
| TISS/convênios é pântano técnico | Empurrar pra Fase 2; MVP foca clínica particular |
| Concorrentes têm 10+ anos de feature | Não competir por checklist; competir por resultado (agenda cheia, orçamento aprovado) |
| Migração de dados da concorrência | Ferramenta de importação (pacientes, agenda) já no MVP — barreira nº1 de troca |

## 8. Perguntas abertas (Kaian)

- [x] ~~Quantas clínicas da carteira atual são odonto?~~ → **~5 clínicas
  disponíveis pra teste/beta**
- [ ] Nome do produto: marca própria (ex: "NEXUS Odonto") ou nova marca?
- [ ] Capacidade tech: Marco sozinho dá conta do MVP? Contratar?
- [ ] Preço-alvo e tier de entrada?
- [ ] Frontend: seguir no Lovable ou codebase própria desde o MVP?

---

> **Próximo entregável sugerido:** roteiro de entrevista de validação com os
> donos de clínica odonto da carteira (Fase 0) + planilha comparativa de
> preços/planos dos 4 concorrentes.
