# Agente Bia Vet — na infra da NEXUS (fora do GPTMaker)

Pacote completo do agente veterinário rodando **na nossa infra** (n8n + Supabase +
Evolution), construído com a carcaça `nexus-agente-autonomo`. Este é o passo de tirar
o cérebro do GPTMaker e ganhar a camada proativa que o mercado não tem.

## O que compõe o agente (os 4 planos da carcaça)

| Plano | Arquivo | O que é |
|---|---|---|
| **Reativo** (o cérebro) | `cerebro-bia-vet.workflow.js` | AI Agent node no n8n — **substitui o GPTMaker**. Recebe do WhatsApp, pensa, usa as tools, responde. |
| Persona | `prompt-bia-vet.md` | System prompt da Bia Vet (tom, guardrails, proatividade, linha vermelha de emergência). |
| **Ferramentas** | `essencial-vet.workflow.js` | Tool-server MCP (já existia). O que a Bia PODE fazer no sistema. |
| **Proativo** (vacina) | `reativacao-vacina-vet.workflow.js` | Motor de reforço/atraso de vacina (já existia). |
| **Proativo** (o resto) | `cadencias-proativas-vet.workflow.js` | **Novo.** Pós-op, retorno, cliente sumido, aniversário. |
| **Regras** | `schema-vet.sql` + `schema-vet-proativo.sql` | Fonte de verdade: tabelas, views (filas), RPC, RLS. |

## Fluxo em uma imagem

```
  TUTOR no WhatsApp
        │
        ▼
  Evolution (bia-vet) ──► cerebro-bia-vet (AI Agent / Claude)
        ▲                     │  usa tools ▼
        │                essencial-vet (MCP) ──► Supabase (fonte de verdade)
        │                                              ▲
        └──────── cadências proativas ◄── views (filas) ┘
             (vacina 10h · pós-op/retorno/sumido/aniversário 9h30)
```

## Ordem de deploy (uma clínica)

1. **Banco:** rodar no Supabase, nesta ordem: `schema-vet.sql` → `schema-vet-proativo.sql`.
2. **Catálogo:** popular `services` (com `categoria` certa — a cirurgia alimenta o
   pós-op), `vaccine_protocols`, `professionals`, e os dados da `clinics`
   (nome, cidade, horarios, emergencia_24h/referencia_emergencia — viram variáveis
   do prompt).
3. **Credenciais no n8n:** `Supabase NEXUS Vet`, `Supabase REST (apikey)`,
   `Anthropic NEXUS`, `Postgres NEXUS Vet` (memória), `Redis NEXUS`, `Evolution API`.
4. **Tool-server:** importar/publicar `essencial-vet` e copiar a URL do MCP Server.
5. **Cérebro:** importar `cerebro-bia-vet`, colar o `prompt-bia-vet.md` no System
   Message do AI Agent, apontar o MCP Client pra URL do passo 4, setar `CLINIC_ID`,
   `EVOLUTION_INST`. **Validar as subconexões model/memory/tool no canvas.**
6. **Proativo:** importar `reativacao-vacina-vet` e `cadencias-proativas-vet`;
   conferir horários e cadências ativas.
7. **Evolution:** apontar o webhook da instância `bia-vet` pro webhook do
   `cerebro-bia-vet` (`/webhook/bia-vet-in`).
8. **Teste de aceite (obrigatório):** mandar "socorro meu cachorro comeu chocolate e
   tá tremendo" → a Bia TEM que escalar/orientar emergência. Se falhar, não sobe.

## Migração do GPTMaker (sem trauma)

1. **Espelhe primeiro.** O `cerebro-bia-vet` já replica o que o GPTMaker fazia
   (atende, agenda, cota, vacina) — o cliente não sente regressão.
2. **Rode em sombra** alguns dias se der: compare respostas antes de virar a chave.
3. **Vire o número:** aponte o webhook da Evolution pro n8n. Desligue o GPTMaker só
   com o n8n estável.
4. **Entregue o upgrade:** ligue as cadências proativas novas (pós-op, retorno,
   sumido, aniversário) — é o "a mais" que justifica migrar e cobrar mais.
5. **Meça:** agendamentos gerados pelo proativo e receita reativada (via
   `interactions.cadencia` + agendamentos com `canal='ia'`). É o número que vende.

## Por que é melhor que o GPTMaker (e que o SimplesVet)

- **Regra de vet de verdade** (protocolo/espécie/retorno/emergência) — só na infra própria.
- **Proativo, não só reativo** — pós-op e retorno ninguém no mercado faz.
- **Mensagem barata** — lembrete = Utilidade R$0,034 (15x mais barato que o SimplesVet).
- **Um sistema só** — o que a Bia faz já entra no CRM (zero double-entry).
- **Sem mensalidade de plataforma de terceiro** no meio da margem.

## Status honesto

- `essencial-vet` e `reativacao-vacina-vet`: já **valid:true** no n8n (não publicados).
- `cerebro-bia-vet` e `cadencias-proativas-vet`: **rascunho** — seguem o padrão do
  repo mas precisam ser importados no n8n e ter a fiação validada (principalmente as
  subconexões de IA do AI Agent node). Nada foi publicado.
