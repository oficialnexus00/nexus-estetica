# Stack técnico

## Visão geral

| Camada | Ferramenta | Uso |
|---|---|---|
| Frontend / CRM | **Lovable.dev** | Interface do `app.nexushealth.com.br` |
| Backend | **Supabase** | Edge Functions + Postgres |
| Agentes de IA | **GPTMaker** | Bia (comercial) e Aurora (canal cliente) |
| Automação | **n8n** | Orquestração de fluxos (conta do Kaian) |
| Scraping | **Apify** | Coleta na Meta Ad Library |
| Voz | **ElevenLabs** | Tier Creator, modelos Flash/Turbo |
| Vídeo | **Remotion** | Criativos em React → MP4 (pasta `video/`) |
| Ads | **Meta Ads Manager** | Objetivo Click-to-WhatsApp |
| Gestão | **ClickUp** | Tarefas, PMO |
| Pagamento | **PagTrust** | Cobrança |
| Linguagem | **React/TypeScript** + Supabase Edge Functions | Base de código |

## Detalhamento

### Frontend / CRM — Lovable.dev
- Constrói e edita a interface do CRM `app.nexushealth.com.br`.
- **Fluxo de trabalho:** Kaian manda print → Claude devolve um **prompt preciso** pro
  Lovable → Lovable gera/edita.

### Backend — Supabase
- **Edge Functions** para lógica de servidor.
- **Postgres** como banco.
- Responsável técnico: **Marco**.

### Agentes de IA — GPTMaker
- **Bia** — agente comercial (funil de venda no WhatsApp).
- **Aurora** — agente no canal do cliente já ativo.
- Ver [`../produto/agentes-ia.md`](../produto/agentes-ia.md).

### Automação — n8n
- Orquestra automações e integrações.
- Roda na **conta do Kaian**.

### Scraping — Apify
- Coleta dados da **Meta Ad Library** (inteligência de anúncios/concorrência).

### Voz — ElevenLabs
- Tier **Creator**.
- Modelos **Flash / Turbo** (baixa latência para experiências com voz).

### Vídeo — Remotion
- Renderiza criativos de Reels/Stories programaticamente: o roteiro é código React,
  a saída é MP4 1080x1920 na identidade da marca.
- Vive em [`../video/`](../video/README.md). Roteiros em `video/src/lib/roteiros.ts`,
  espelhando [`../comercial/reels-conteudo.md`](../comercial/reels-conteudo.md).
- Serve pra gerar as **N variações de gancho** do mesmo Reel sem reeditar à mão.
- ⚠️ **Licença:** grátis só até 3 funcionários. A NEXUS tem 4 → uso comercial exige
  Company License (US$ 25/assento/mês no plano Creators). Ver README da pasta.

### Ads — Meta Ads Manager
- Campanhas com objetivo **Click-to-WhatsApp** — topo do funil.

### Gestão — ClickUp
- Ferramenta de PMO e tarefas.
- ⚠️ **Escrita no ClickUp exige aprovar o "Permitir" na UI.** O Claude deve **avisar
  antes** de responder quando uma ação for escrever no ClickUp.

### Pagamento — PagTrust
- Processamento de cobrança.

## Linguagem e código

- **React / TypeScript** no frontend.
- **Supabase Edge Functions** no backend.
