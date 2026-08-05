# Proatividade — o motor de autonomia

Este é o diferencial que o Kaian quer vender: um agente que **não só responde, mas
inicia**. Puxa o cliente que sumiu, lembra do reforço, avisa do retorno, sugere o
combo, traz a informação certa na hora certa. O bot de GPTMaker é reativo; o agente
NEXUS é proativo. É o que justifica cobrar mais.

## O princípio: proatividade é DECISÃO, não disparo

Muita gente confunde "agente proativo" com "manda mensagem em massa". Não é isso.
Spam derruba chip, irrita cliente e queima a clínica. Proatividade de verdade é
**escolher a próxima melhor ação pra cada cliente** e agir com parcimônia. O motor
tem três perguntas, sempre nesta ordem:

```
1. QUEM  → quem, agora, tem uma ação que vale a pena?   (a fila, vinda do banco)
2. O QUÊ → qual a próxima-melhor-ação pra essa pessoa?   (a regra de prioridade)
3. VALE? → é hora boa, não é spam, tem consentimento?    (os guardrails de cadência)
```

Só depois disso é que dispara. Um agente que responde "sim" às três é proativo; um
que pula direto pro disparo é um spammer.

## Os três tipos de gatilho proativo

### 1. Baseado em tempo (schedule) — o mais comum

Cron lê uma **fila** (view no banco) e age. Padrão real da NEXUS (reativação de
vacina): a view `v_fila_lembrete_vacina` já aplica a regra ("vence em ≤7 dias OU
atrasada, e não lembrado nos últimos 20 dias"). O workflow só lê, monta e dispara.

```
scheduleTrigger (0 10 * * 1-6)  → view (fila já filtrada) → montar msg (tom Bia)
   → splitInBatches(20) → delay 40–100s → Evolution → marca "lembrado" no banco
   → onError: continueRegularOutput
```

**A regra mora na view, nunca no cron.** Isso é o que impede dessincronizar e o que
deixa a mesma regra ser usada pelo reativo (quando o tutor pergunta) e pelo proativo
(quando o agente lembra).

### 2. Baseado em evento (mudança de estado)

Algo mudou no banco → o agente reage. Ex.: consulta marcada como "finalizada" →
agenda o retorno; plano ficou "atrasado" → entra na régua de cobrança; pet fez
cirurgia → check-in pós-op no dia seguinte. Dispara por webhook do Supabase
(Database Webhook) ou por um schedule curto que varre estados novos.

### 3. Baseado em contexto de conversa (proatividade dentro do atendimento)

O tipo mais "inteligente" e o que o Kaian descreveu ("traz uma informação, dá uma
ideia"). Enquanto atende, o agente **percebe uma oportunidade** e age sem ser pedido:

- Tutor agenda banho → "Aproveitando, vi que a antirrábica do Rex vence esse mês.
  Quer que eu já deixe a vacina no mesmo dia?" (economiza uma viagem, aumenta ticket)
- Tutor pergunta preço de consulta → agente nota que ele tem plano ativo → "No seu
  plano essa consulta já tá inclusa, viu? 😊"
- Tutor some no meio do agendamento → follow-up 20 min depois.

Isso vem de dar ao agente **tools de leitura de estado** (próximas vacinas, plano,
histórico) + instruir no prompt a **oferecer a próxima-melhor-ação quando fizer
sentido**, sem empurrar. Ver `references/persona-e-prompt.md`.

## Next-best-action: a régua de prioridade

Quando um cliente é elegível a mais de uma ação proativa, o agente escolhe UMA. Peso
por valor + urgência + momento. Modelo de referência (ajuste por nicho):

```
Prioridade (mais alto primeiro):
  1. URGENTE/RETENÇÃO   → vacina atrasada, plano vencendo, pós-op, cliente sumindo
  2. RECEITA DIRETA     → retorno previsto, reforço a vencer, cross-sell óbvio
  3. RELACIONAMENTO     → aniversário do pet, check-in, dica de cuidado sazonal
```

Regra prática: **uma ação proativa por cliente por vez**. Se o pet tem vacina
atrasada E aniversário na mesma semana, manda a vacina (retenção/receita), segura o
aniversário. Empilhar mensagens é o que vira spam.

## Guardrails de cadência (o "VALE?")

Sem estes, autonomia vira passivo. Todos moram no banco (na view da fila) pra serem
uma fonte de verdade só:

- **Frequência-teto:** no máximo X mensagens proativas por cliente por semana
  (padrão: 1–2). A view exclui quem já recebeu.
- **Cool-down por tema:** não lembrar a mesma coisa em menos de N dias (vacina: 20
  dias, como no motor real).
- **Janela de horário:** só disparar em horário civil (ex.: 9h–19h, seg–sáb). Cron
  já cravado nisso.
- **Consentimento / opt-out:** respeitar quem pediu pra não receber. Flag no banco.
- **Silêncio se em conversa ativa:** se o cliente está falando com a clínica agora,
  não atropele com um disparo automático — segura pro próximo ciclo.

## Economia de WhatsApp (o proativo tem custo — projete pra margem)

Desde jan/2026 o WhatsApp cobra **por mensagem**. Isso muda o desenho do motor:

| Tipo de template | Custo | Quando usar no proativo |
|---|---|---|
| **Utilidade** (transacional) | **R$ 0,034** | Lembrete de vacina, retorno, confirmação, cobrança de plano — **estruture o lembrete como Utilidade** |
| Marketing | R$ 0,3125 (~10x) | Campanha/blast de reativação em massa — usar com critério |
| Serviço (dentro da janela 24h) | Grátis* | Resposta em conversa (*passa a ser cobrado em out/2026) |

**Dois canais, arquitetura híbrida (a NEXUS tem os dois):**

| Canal | Custo | Limite | Uso |
|---|---|---|---|
| **Chip via n8n (não-oficial)** | grátis | ~100 disparos/dia por chip | transacional do dia a dia de UM cliente |
| **Cloud API oficial** | R$0,034 (Utilidade) | escalável | volume alto, confiabilidade, blast grande |

**Leitura estratégica:** uma clínica sozinha raramente passa de 100 disparos/dia
(20–40 lembretes D-1 + algumas vacinas) → o **chip grátis cobre a operação diária**
e o custo marginal do motor fica ~zero. Isso sustenta a promessa "mensagens
inclusas". Caia pro Cloud API quando: (a) volume alto, (b) precisa de confiabilidade,
(c) blast de reativação grande. O chip é frágil (cap 100/dia, risco de ban — por isso
existe o "Monitor de Chips"); campanha de massa estoura o cap num pico.

**Regra de margem:** todo lembrete recorrente é **Utilidade (R$0,034)** — 15x mais
barato que o SimplesVet (R$0,50). Blast de Marketing (R$0,3125) só com objetivo claro
de receita. Nunca desenhe o motor mandando Marketing pro que podia ser Utilidade.

## Padrão de disparo em lote (copie sempre)

```js
// scheduleTrigger → busca fila (view) → montar mensagem (Code, tom Bia)
// → splitInBatches(20) → Wait(delay aleatório 40–100s) → Evolution API
// → update no banco: marca "lembrado_em = now()" (não repetir)
// onError: continueRegularOutput  (nunca falha silenciosa)
```

- **Lote 20 + delay 40–100s aleatório:** parece humano, poupa o chip.
- **Marca no banco após enviar:** a próxima leitura da view já exclui quem recebeu.
- **`onError: continueRegularOutput`:** um número inválido não derruba o lote inteiro.

## Playbook: transformar um reativo em proativo

Se o agente já responde bem e o Kaian quer "deixar mais inteligente", faça nesta
ordem:

1. **Mapeie os momentos de valor** do nicho (o que, se lembrado, dá receita ou
   retenção). No vet: reforço de vacina, retorno pós-consulta, plano vencendo,
   cliente sumido 60+ dias, pós-cirúrgico.
2. **Crie a view da fila** de cada momento (a regra no banco).
3. **Monte um workflow de cadência** por momento (ou um genérico que roda várias
   filas), no padrão lote+delay.
4. **Ligue a proatividade-em-conversa** no prompt (oferecer next-best-action quando
   surgir no atendimento).
5. **Ponha os guardrails de cadência** na view (frequência-teto, cool-down, opt-out).
6. **Meça:** taxa de resposta ao proativo, agendamentos gerados, receita atribuída.
   É esse número que vende o upgrade pro cliente.
