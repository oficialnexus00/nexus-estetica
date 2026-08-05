# Arquitetura ponta a ponta — agente autônomo NEXUS

Este arquivo mostra a carcaça inteira montada: como os 4 planos se ligam, o que roda
no n8n, e por que o cérebro sai do GPTMaker e entra no AI Agent node.

## Visão de cima

```
                         ┌───────────────────────────┐
                         │   SUPABASE (fonte de       │
                         │   verdade, por tenant)     │
                         │   tabelas + views + RPC    │
                         └────────────┬──────────────┘
                                      │ (o banco guarda a REGRA)
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
 ┌──────▼───────┐            ┌────────▼────────┐           ┌────────▼────────┐
 │ PLANO REATIVO │           │ PLANO FERRAMENTAS│          │ PLANO PROATIVO  │
 │ (responde)    │◄──tools──►│ tool-server MCP  │          │ (inicia sozinho)│
 │ AI Agent node │           │ 1 por cliente    │          │ schedules+eventos│
 └──────┬───────┘            └─────────────────┘           └────────┬────────┘
        │                                                            │
        │        Evolution API (WhatsApp)  ◄─── dispara em lote ─────┘
        │                    ▲
        └────── responde ────┘
```

O **Plano de Regras** não é uma caixa separada no desenho — ele está *dentro* do
banco (views/RPC/constraints) e *dentro* do prompt. Regra viva nos dois lugares:
o banco impede o dado errado, o prompt impede o comportamento errado.

## Plano 1 — Reativo (o cérebro que responde)

Fluxo de uma mensagem recebida. O encanamento de entrada (extração de payload da
Evolution, dedup, buffer no Redis, memória) é o que a skill **`agente-virtual-expert`**
detalha — não reescreva, referencie. O que muda aqui é o **cérebro**:

```
WhatsApp → Evolution (webhook) → n8n Webhook Trigger
   → [filtros: fromMe, tipo, grupo]            (agente-virtual-expert)
   → [dedup messageId no Redis]                (agente-virtual-expert)
   → [smart buffer: espera terminar de digitar](agente-virtual-expert)
   → [memória: sessão Redis + histórico Postgres]
   → ┌──────────────────────────────────────────────┐
     │  AI AGENT NODE (n8n)   ← era o GPTMaker        │
     │  system prompt (persona) + histórico + msg    │
     │  tools: conecta no tool-server MCP do cliente │
     │  LLM agnóstico (Anthropic/OpenAI/Google)      │
     └──────────────────────────────────────────────┘
   → [ação executada JÁ escreveu no banco via tool]  (fecha o circuito)
   → resposta → Evolution → WhatsApp
   → persiste sessão (Redis) + histórico (Postgres)
```

**Por que sair do GPTMaker:** o GPTMaker é ótimo pra começar, mas é caixa-preta e
tem teto. No AI Agent node você controla o system prompt inteiro, escolhe o LLM,
conecta suas próprias tools, e principalmente **pode plugar regra de negócio pesada**
via tool-server. O vet é o caso onde o teto do GPTMaker aperta — protocolo de vacina,
porte, espécie, retorno, emergência não cabem numa config genérica.

**Ligação com as tools:** o AI Agent node consome o tool-server do cliente via
**MCP Client Tool** (`@n8n/n8n-nodes-langchain.mcpClientTool`) apontando pro
`mcpTrigger` daquele tenant. Detalhes de SSE vs Streamable HTTP e armadilhas: skill
`n8n-mcp-expert`.

## Plano 2 — Ferramentas (tool-server por cliente)

Um workflow separado por cliente, exposto como servidor MCP. É a mão do agente.
Padrão completo em `references/ferramentas.md`. O essencial da arquitetura:

- **Um `mcpTrigger` por tenant**, com `path` único (ex.: `essencial-vet`,
  `essencial-odonto-clinica-x`). O `clinic_id` é **constante do workflow**, cravado
  na instalação — nunca `fromAi()`.
- Tools de leitura/escrita direta = `supabaseTool`. Tool com cálculo = `toolHttpRequest`
  batendo num **RPC** do Supabase (a regra fica no banco).
- Cada tool tem `toolDescription` que ensina **quando** usar e **quando não** usar.

## Plano 3 — Proativo (o diferencial)

Workflows independentes, disparados por **schedule** (cron) ou **evento** (webhook de
mudança de estado no banco), que fazem o agente **iniciar** conversa. Padrão real da
NEXUS (motor de reativação de vacina):

```
scheduleTrigger (ex.: 0 10 * * 1-6)      ← ou evento de estado
   → lê uma VIEW do banco (a fila já filtrada pela regra)
   → monta mensagem no tom da Bia (Code node)
   → splitInBatches (lote 20)
      → delay aleatório 40–100s
      → Evolution API (envia)
      → marca "lembrado" no banco (não repetir)
   → onError: continueRegularOutput
```

A regra ("quem entra na fila") mora na **view**, não no workflow — mesma regra de
ouro nº 2. Playbook de cadências, next-best-action e anti-spam em
`references/proatividade.md`.

## Plano 4 — Regras e guardrails

Dois níveis, porque falham por motivos diferentes:

- **No banco** (impede o dado errado): RLS por `clinic_id`, constraints, views que
  já aplicam a regra, RPC que valida antes de gravar. Ex.: `buscar_horarios_disponiveis`
  nunca devolve horário ocupado, então o agente não tem como agendar em cima.
- **No prompt** (impede o comportamento errado): o que nunca fazer, quando escalar,
  como não alucinar. Ver `references/persona-e-prompt.md`.

Detalhe em `references/regras-e-guardrails.md`.

## Multi-tenant: o formato que escala

```
                    ┌──────────────────────────────┐
                    │  1 base de código / template   │
                    └───────────────┬───────────────┘
             instala por cliente     │
      ┌──────────────┬───────────────┼───────────────┐
   Clínica A      Clínica B       Clínica C   …  (50+)
   tool-server    tool-server     tool-server
   clinic_id=A    clinic_id=B     clinic_id=C
   instância      instância       instância
   Evolution A    Evolution B     Evolution C
        └── todas leem/escrevem no MESMO Supabase, isoladas por clinic_id (RLS) ──┘
```

- O **template** é um; o que muda por cliente é **config** (clinic_id, instância
  Evolution, catálogo de serviços, tom, cadências ativas).
- Isolamento por `clinic_id` + **RLS no Supabase** — cliente A nunca vê dado de B.
- Instalar um cliente novo = clonar o tool-server, trocar as constantes, criar as
  credenciais, ligar no AI Agent. Roteiro em `references/produtizacao.md`.

## O que SEMPRE marcar como pendência de deploy

Espelhe o padrão dos workflows existentes: entregue o artefato **validado mas não
publicado** e liste no cabeçalho o que depende do Kaian:

```
// PENDÊNCIAS p/ deploy (Kaian):
//   - Rodar `schema-*.sql` no Supabase (tabelas + views + RPC).
//   - Criar credenciais: "Supabase <cliente>" e "Evolution API <cliente>".
//   - Definir clinic_id real e a instância Evolution.
//   - Ligar o tool-server no AI Agent node do cliente.
```
