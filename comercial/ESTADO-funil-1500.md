# Estado do funil da oferta R$1.500 — LEIA ISTO ANTES DE MEXER

> Atualizado em 29/08/2026. Qualquer sessão do Claude que for mexer nesse funil
> deve ler este arquivo primeiro. Ele é a fonte de verdade, não a memória de nenhuma conversa.

## No ar agora

- **LP:** https://oferta.nexushealth.com.br (DNS propagado, HTTPS ok)
- **Código:** `lp/index.html` deste repo, branch `claude/opa-voltamos-41hunv`
  - `comercial/lp-oferta-1500.html` é a mesma página sem o wrapper `<head>/<body>`.
    **Os dois precisam ser editados juntos** ou saem de sincronia.
- **Deploy:** projeto Vercel `nexus-estetica`, Root Directory = `lp`, **git-conectado**.
  Push na branch = deploy de produção em ~40s. Não existe `.vercel/` local; não rode `vercel deploy` na mão.

## Placar

| Peça | Status |
|---|---|
| LP no ar + DNS | ✅ |
| Pixel Meta `1093351271972124` | ✅ PageView e Lead disparando (validado por request real) |
| VSL tocando | ✅ remuxada com faststart, servida de `/vsl.mp4` |
| Lead → CRM Nexus | ⚠️ **falta selecionar a credencial** (ver abaixo) |
| Alerta do lead no WhatsApp | ✅ testado, Evolution devolveu 201 |
| Webhook n8n | ✅ publicado |

## agentId — RESOLVIDO (29/08/2026)

`AGENT_ID = 3E8B93D20002507338962EAD8ED8E66C`

Não é nome nenhum: é o **ID do canal GPTMaker "Bia - Nexus"**, vinculado ao cliente
"Kaian | Nexus". Testado ponta a ponta: o CRM devolveu
`{"success":true,"action":"created","stage":"new_lead"}`.

**A regra geral do `agentId`** (vale pra qualquer LP nova):
é o **identificador do canal** na aba Integrações do painel admin, e o formato muda
por tipo de canal:
- canal **GPTMAKER** → hex de 32 caracteres (ex: `3F3CDDDC70A4A0E7A36C46AE96AA06B5` da Ultramédica)
- canal **EVOLUTION** → o nome da instância (ex: `Karol zein` da Karoline)

Por isso a da Karoline é um nome e a da NEXUS é um hex. Não tente adivinhar.

**Nomes já testados e REJEITADOS** (404), não repita:
`Bia`, `Bia - Nexus`, `Kaian | Nexus`, `NEXUS Health`, `Nexus`, `Bia Nexus`, `bia-nexus`.

**Onde achar o ID de um canal GPTMaker:** o painel admin nem sempre renderiza o hex.
Se o card não mostrar, o valor está no estado do React — abre o cadastro do cliente e roda
no console do navegador uma varredura de `[0-9A-F]{28,36}` nas props do fiber do elemento
do canal.

## Contratos

**CRM Nexus (serve pra qualquer LP):**
`POST https://zqzqoyazazdxyfzpkilw.supabase.co/functions/v1/n8n-lead-webhook`
body `{agentId, name, phone, source, notes, metadata}`, auth httpHeaderAuth.
`agentId` é o NOME do agente em string — **"Bia"** para leads da própria NEXUS.
Sem credencial devolve `401 Unauthorized - Invalid API key`.

**Aviso no WhatsApp:** `POST https://webhook.nexushealth.com.br/webhook/bia-report-ajuste`
body `{number, mensagem}` (campo opcional `instancia`). Sem auth. Sai pelo chip `bIA NEXUS - FINAL 5152`.

**Ajustes do fluxo** ficam nas 2 primeiras linhas do nó "Normalizar lead da LP":
`AGENT_ID` e `AVISAR_NUMERO`.

## Armadilhas já queimadas aqui — não repita

1. **mp4 sem faststart** trava o player: com o átomo `moov` no fim do arquivo o navegador precisa
   baixar o vídeo inteiro pra ter metadata. Sempre `ffmpeg -i in.mp4 -c copy -movflags +faststart out.mp4`.
2. **Rede de segurança de vídeo não pode disparar evento de conversão.** O fallback "vídeo não
   carregou → libera o formulário" estava mandando `VSL_Concluida` para 100% das visitas e
   contaminando o público de remarketing. Revelar o form e registrar "assistiu" são coisas separadas.
3. **Satoshi não tem peso 600.** O Fontshare serve 300/400/500/700/900. CSS pedindo 600 sobe pra 700 calado.
4. **`neverError` do n8n não cobre credencial faltando**, só status HTTP ruim. Para o fluxo seguir
   mesmo com falha, use `onError: continueRegularOutput`.
5. **Aba oculta do Chrome não carrega mídia** (`readyState` fica 0 para sempre). Não dá pra validar
   player por automação de browser em background — precisa de olho humano.
6. **Não redesenhe a marca na mão.** O "N" da NEXUS são 3 peças: barra 1010x285 a 42°, dois quadrados
   de 345 (1,21× a largura da barra). O SVG correto está em `lp/index.html`, classe `.logomark`.

## Coisas que a gente já descobriu do jeito difícil

- **Atualizar o workflow pela API do n8n PRESERVA a credencial** — desde que o
  `newCredential('...')` use o **nome exato** da credencial que já existe
  (`Nexus Webhook Secret`). Com um nome diferente, o vínculo se perde e o nó
  passa a dar "Credentials not found".
- **O n8n roda em Docker Swarm** na VPS Hostinger (`srv1535865.hstgr.cloud`,
  82.25.77.137), com 4 containers: `n8n_n8n_editor`, `_worker`, `_webhook`, `_redis`.
  Comando de manutenção vai **sempre no editor**. Reset do login do dono:
  `docker exec $(docker ps --format '{{.Names}}' | grep n8n_n8n_editor | head -1) n8n user-management:reset`
- **O n8n não tem SMTP configurado** — "Forgot my password" nunca envia email.
  Configurar isso é dívida técnica aberta.
- **Webhooks e Evolution moram no mesmo servidor** do n8n.

## Regra de convivência

Só UMA sessão do Claude deve mexer na branch `claude/opa-voltamos-41hunv` por vez.
Duas sessões empurrando pra mesma branch dá conflito e uma sobrescreve o trabalho da outra.
