# CLAUDE.md — Contexto-mestre da NEXUS

> Este arquivo é o cérebro do repositório. Ele é lido pelo Claude Code no início de
> cada sessão e concentra tudo que a IA precisa saber pra agir como sócio do Kaian.
> Os arquivos das pastas (`empresa/`, `produto/`, `comercial/`, `stack/`, `pmo/`)
> são o detalhamento. Quando algo mudar, atualize aqui primeiro.

---

## Quem é a empresa

**NEXUS INTELIGÊNCIA ARTIFICIAL LTDA** — CNPJ 59.468.222/0001-86.
Fundada em **1º de julho de 2025** por Kaian Silva Motta.
Healthtech B2B brasileira de **automação com IA para clínicas de saúde e estética**.
Sede em Balneário Camboriú/SC. Operação 100% remota, atendimento nacional.
Hoje atende **50+ clínicas**.

O que a NEXUS entrega: agente comercial de IA, automação de WhatsApp, CRM próprio
(`app.nexushealth.com.br`) e gestão de tráfego pago — o pacote que tira o dono da
clínica do operacional de atendimento e vendas.

## Quem é o fundador

**Kaian Silva Motta** — CEO e fundador. Chamar de **Kaian**.
No digital desde 2018 (tráfego pago + funis). Direto, rápido, hands-on.
Gestão com disciplina de PMO. Valida com um canal antes de escalar pra todos.

## Equipe (4 pessoas)

- **Kaian** — CEO, estratégia, ads, vendas de linha de frente
- **Jennifer** — outbound / qualificação / financeiro
- **Cayan** — demos / fechamento
- **Marco** — backend / infraestrutura / Supabase

## Stack técnico

- **Frontend/CRM:** Lovable.dev → `app.nexushealth.com.br`
- **Backend:** Supabase (Edge Functions, Postgres)
- **Agentes de IA:** GPTMaker (Bia = comercial, Aurora = canal cliente)
- **Automação:** n8n (conta do Kaian), Apify (scraping Meta Ad Library)
- **Voz:** ElevenLabs (tier Creator, modelos Flash/Turbo)
- **Ads:** Meta Ads Manager (objetivo Click-to-WhatsApp)
- **Gestão:** ClickUp
- **Pagamento/cobrança:** **Nexus OS** (sistema próprio) — substituiu o PagTrust.
  Documentar em `stack/` (pendente: Kaian mostrar o Nexus OS)
- **Linguagem:** React/TypeScript, Supabase Edge Functions

## Identidade visual

- Cor principal: **#00BFA5** (teal)
- Tipografia: **Inter**
- Estética: minimalista, dark-mode (estilo Apple/Linear)

## Como o Claude deve trabalhar

- Extrair estrutura de ideias faladas soltas e devolver entregável pronto pra colar,
  não orientação conceitual.
- Português do Brasil, tom direto.
- PMO: prioridade P0–P3, dono nomeado, KPI.
- Lovable: Kaian manda print → Claude devolve **um prompt preciso** pro Lovable.
- ClickUp: escrita exige aprovar o "Permitir" na UI — avisar **antes** de responder.

## Princípios de negócio já validados

- Porta de entrada é **"ativação assistida"**, nunca "desconto".
- Agente de IA fica **fora** do trial de 7 dias (risco operacional).
- Criativo humanizado/coloquial > locução engessada.
- Depoimento real de cliente > narração do fundador.
- Preço só a partir da 4ª mensagem no fluxo da Bia; sem perguntas empilhadas; ✅ no
  lugar de bullet no WhatsApp.

## Pricing / Deal Desk

Tabela de preços, combos, pisos de negociação e casos reais vivem em
[`comercial/pricing/`](comercial/pricing/README.md). Quando a pergunta for
**"quanto eu cobro?"**, a resposta sai de lá — e volta pra lá como caso em
`comercial/pricing/casos/`.

- **Preço de IA por faixa de volume, nunca por mensagem** (aprovado 12/08/2026).
- Nunca desconto no mensal; se ceder, cede em ativação, prazo ou escopo.
- Upgrade de cliente ativo: o que ele já paga vira crédito integral no combo.
- Preço só depois de saber volume de leads, nº de unidades e nº de atendentes.
- Preço avulso confirmado hoje: **disparo R$ 397/mês**. Os demais estão propostos e
  aguardam confirmação do Kaian.

## Pendências que dependem do Kaian

- [x] ~~Arquivo do logo~~ → recriado em vetor em `empresa/logo/` (falta só o
  arquivo-fonte oficial, se houver)
- [x] ~~Ano de fundação da NEXUS~~ → **1º de julho de 2025**
- [x] ~~Aprovar missão/visão/valores~~ → **aprovado** (`empresa/missao-visao-valores.md`)
- [x] ~~Confirmar sede~~ → **Balneário Camboriú/SC** (contrato confirmado)
- [ ] **Confirmar preços avulsos** de sistema (proposto R$ 497) e IA (proposto
      R$ 697) — trava a tabela oficial em `comercial/pricing/README.md`
- [ ] Definir se contrato de 12 meses vira padrão do combo Completo
- [ ] **Mostrar o Nexus OS** pro Claude documentar — e limpar as referências velhas
      a PagTrust em `stack/stack-tecnico.md`, `produto/piloto-mvp.md` e
      `produto/kickoff-repo-sistema.md`
