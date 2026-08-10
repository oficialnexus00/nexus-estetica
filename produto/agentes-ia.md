# Agentes de IA

A NEXUS opera hoje **um agente de IA ativo** — a **Bia**, no comercial —, construído no
**GPTMaker**. A **Aurora**, que atuava no canal do cliente ativo, está **desligada**
desde 10/08/2026.

## Bia — agente comercial

- **Onde atua:** topo e meio do funil, no WhatsApp.
- **Função:** atender o lead, qualificar e conduzir à venda.
- **Objetivo:** transformar o clique do anúncio (Click-to-WhatsApp) em oportunidade
  fechável, sem depender do time humano no primeiro contato.

### Regras do fluxo da Bia (validadas)

- **Preço só a partir da 4ª mensagem** no fluxo — não jogar valor de cara.
- **Sem perguntas empilhadas** — uma coisa de cada vez, conversa natural.
- **✅ no lugar de bullet** no WhatsApp — formatação que respeita o canal.
- Detalhes completos em [`../comercial/fluxo-bia.md`](../comercial/fluxo-bia.md).

## Aurora — DESLIGADA (10/08/2026)

> **Status: desligada.** Decisão do Kaian. O agente não responde mais no canal do
> cliente ativo — o pós-venda volta a ser **100% humano** até nova decisão.

Para referência, o que a Aurora fazia enquanto esteve no ar:

- **Onde atuava:** no canal do **cliente já ativo**.
- **Função:** relacionamento e suporte no pós-venda / operação do cliente.
- **Objetivo:** sustentar a experiência depois que a clínica virava cliente.

### O que precisa acontecer fora do repo

O desligamento de fato é no painel do **GPTMaker** (não há chave/config da Aurora
neste repositório). Checklist:

- [ ] Desativar/pausar o agente Aurora no GPTMaker.
- [ ] Desconectar o canal de WhatsApp que estava plugado nela.
- [ ] Revisar os fluxos do **n8n** que chamavam a Aurora — desativar ou redirecionar
      pro atendimento humano, pra não sobrar disparo órfão.
- [ ] Definir **quem** assume o pós-venda que era da Aurora (hoje sem dono nomeado).

## Plataforma e voz

- **Construção dos agentes:** GPTMaker.
- **Voz:** ElevenLabs (tier Creator, modelos **Flash/Turbo**) — para áudios e
  experiências com voz.

## Princípio operacional crítico

> O **agente de IA fica fora do trial de 7 dias**. Colocar a IA no trial é risco
> operacional — se ela falha com um lead durante a avaliação, queima a chance. A IA
> entra depois da ativação assistida, não antes.

## Diretriz de tom

- Humanizado e coloquial vence locução engessada.
- Português do Brasil, direto, natural no WhatsApp.
