# Plano — Time de Agentes NEXUS (Operação + Low Ticket + E-commerce)

> Criado em 25/07/2026. Dono geral: **Kaian**. Revisão: mensal ou a cada gate batido.
> Princípio: **zero ferramenta nova**. O time de agentes roda no stack que já pagamos
> (Claude Max 5x, VPS Hostinger, n8n, GPTMaker, Apify, Kiwify). OpenClaw fica de fora
> da operação (risco de ban WhatsApp + LGPD) — no máximo experimento pessoal isolado.

---

## Visão geral — 3 frentes, 1 esqueleto

```
FRENTE 1 (agora)          FRENTE 2 (30-60 dias)         FRENTE 3 (gate)
Operação NEXUS      →     Low ticket Secretária IA  →   E-commerce
sustenta o caixa          alimenta o funil B2B          só depois da F2 validada
```

O mesmo esqueleto técnico serve as três frentes: **n8n (VPS) = músculo 24/7**,
**Claude (Max 5x) = cérebro sob demanda**, **GPTMaker = boca no WhatsApp**,
**Apify = olhos no mercado**.

---

## Frente 1 — Operação NEXUS (P0, começa já)

| Agente | O que faz | Infra | Dono | KPI |
|---|---|---|---|---|
| **Reporte (standup diária)** | Consolida às 8h: leads da Bia, tickets da Aurora, execuções/erros do n8n, CPL do Meta Ads, vendas Kiwify. Posta no WhatsApp do Kaian | n8n + Claude API | Marco/op | Kaian abre 0 dashboards/dia |
| **Mídia** | Lê métricas diárias das campanhas, sinaliza pausa/escala com justificativa | n8n + Claude API | Kaian | Reação a campanha ruim < 24h |
| **Espião** | Monitora Meta Ad Library dos concorrentes, resume novidades 1x/semana | Apify + Claude | Kaian | 1 relatório/semana |
| **Retenção (novo)** | Alerta cliente esfriando: clínica sem uso do CRM/agente há X dias | n8n + Supabase | Jennifer | Churn early-warning |

**Por que Retenção entra como agente:** caímos de 30 pra 13 clientes. Antes de
expandir pra frente nova, o agente mais barato da empresa é o que segura cliente
que já pagou CAC.

## Frente 2 — Low ticket: Secretária IA R$97 (P1, 30-60 dias)

A Secretária IA **já existe como tripwire**. A frente 2 não é criar produto — é
colocar o time de agentes pra escalar o ciclo de teste dele.

| Agente | O que faz | Ferramenta | Cadência |
|---|---|---|---|
| **Oferta** | Itera oferta/preço/bônus/ancoragem (Hormozi) | Skill `low-ticket-offer-builder` | Por ciclo |
| **Copy/Página** | Página de vendas, headline, FAQ | Skill `low-ticket-sales-page` | Por ciclo |
| **Criativos** | 10-20 roteiros/semana, variações de hook | Skill `low-ticket-ad-creatives` | Semanal |
| **Mídia** | Estrutura ABO, análise, escala | Skill `low-ticket-meta-ads` | Diária |
| **Closer WhatsApp** | Fecha venda + responde objeção | Skill `low-ticket-whatsapp-closer` + GPTMaker | 24/7 |
| **Recuperação** | Checkout abandonado Kiwify → sequência WhatsApp | n8n (webhook Kiwify) | 24/7 |
| **Upsell B2B** | Comprador do R$97 → call de demo do serviço NEXUS | Fluxo Bia adaptado | 24/7 |

**KPIs da frente:** CPA ≤ R$97 (funil self-liquidating) · taxa de recuperação de
checkout ≥ 10% · **% de compradores que viram call B2B** (este é o KPI que importa —
o low ticket existe pra alimentar a value ladder, não pra ser o negócio).

**Ciclo de validação:** 1 oferta → página → 10 criativos → R$50/dia por 7 dias →
decisão (matar/iterar/escalar). Com agentes, cabem 2-3 ciclos/mês sem contratar.

## Frente 3 — E-commerce (P3, travada por gate)

**Gate de entrada:** frente 2 rodando 60 dias com CPA ≤ R$97 e reporte automático
funcionando sem intervenção. Antes disso, e-commerce é distração — somos 4 pessoas
e o caixa vem do B2B.

Quando abrir: o esqueleto se reaproveita inteiro. Troca oferta/copy por
**catálogo + carrinho abandonado + pós-venda/rastreio**. Experiência de
dropshipping do Kaian encurta a curva. Custo incremental estimado: plataforma
(Shopify ~R$150/mês ou Yampi) + mesma infra de agentes.

---

## Custo consolidado (mensal)

| Item | Situação | Custo |
|---|---|---|
| Claude Max 5x | ✅ já pago | R$ 500 |
| VPS Hostinger | ✅ já paga | — (conferir se ≥ 4 GB RAM; upgrade ~R$ 40) |
| GPTMaker / Apify / Kiwify | ✅ já pagos | — (Kiwify cobra % por venda) |
| **API Claude p/ workflows n8n** | 🆕 | **R$ 50–150** |
| **Instância closer no GPTMaker** | 🆕 | conforme plano atual |
| **Verba de mídia (validação F2)** | 🆕 investimento | **R$ 1.500–3.000** |
| **Total fixo novo** | | **< R$ 250/mês** |
| **Total com mídia de teste** | | **~R$ 2.000–3.300/mês** |

Regra de ouro do custo: **trabalho interativo = Max (já pago); automação 24/7 =
API por uso**. Nunca plugar agente contínuo na cota do Max 5x (come a cota de
trabalho do Kaian). Nunca OpenClaw em número comercial.

## Sequência de execução

| # | Entrega | Prioridade | Dono | Prazo |
|---|---|---|---|---|
| 1 | Standup diária no n8n (WhatsApp do Kaian) | P0 | Marco + Claude | Semana 1 |
| 2 | Agente de retenção (alerta cliente frio) | P0 | Marco + Jennifer | Semana 2 |
| 3 | Ciclo 1 low ticket: oferta + página + criativos | P1 | Kaian + Claude | Semana 2-3 |
| 4 | Recuperação de checkout Kiwify via n8n | P1 | Marco | Semana 3 |
| 5 | Campanha validação R$50/dia | P1 | Kaian | Semana 4 |
| 6 | Fluxo upsell comprador → call B2B | P1 | Cayan | Semana 4-5 |
| 7 | Análise 60 dias → decisão gate e-commerce | P2 | Kaian | Dia 60 |
