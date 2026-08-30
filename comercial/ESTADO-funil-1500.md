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

## O ÚNICO passo pendente

No workflow **[NEXUS] LP Oferta 1500 -> CRM** (`fKTBr1Orn0ZyTlF5`,
https://n8n.nexushealth.com.br/workflow/fKTBr1Orn0ZyTlF5), o nó **"Criar lead no CRM Nexus"**
precisa que alguém selecione no dropdown a credencial Header Auth **que já existe** — a mesma
que o fluxo `[Karol] Quiz LP → CRM` (`K7eV9D1w1ncpoM0I`) usa. Não é pra criar credencial nova.

Enquanto isso não for feito: o lead **não entra no CRM**, mas o alerta no WhatsApp sai
do mesmo jeito (os dois nós de HTTP estão com `onError: continueRegularOutput` de propósito),
então nenhum lead se perde calado.

Depois de selecionar, testar assim:

```bash
curl -X POST https://webhook.nexushealth.com.br/webhook/lp-oferta-1500 \
  -H "Content-Type: application/json" \
  -d '{"nome":"TESTE","whatsapp":"(47) 99108-5152","especialidade":"Harmonizacao facial","faturamento":"R$ 20 mil a R$ 50 mil","variacao":"TESTE"}'
```

E apagar do CRM os leads chamados "TESTE Claude" (sobraram 2 dos testes de 29/08).

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

## Regra de convivência

Só UMA sessão do Claude deve mexer na branch `claude/opa-voltamos-41hunv` por vez.
Duas sessões empurrando pra mesma branch dá conflito e uma sobrescreve o trabalho da outra.
