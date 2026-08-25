# Playbook — Low Ticket "Secretária IA em 40 Minutos" (R$97)

> Produto de entrada (tripwire) da NEXUS. Vende a R$97, entrega uma Secretária IA
> funcionando em 40 minutos, e existe pra alimentar o backend NEXUS.
> Frameworks: Hormozi (oferta), Brunson (tripwire/value ladder), Suby (LP/criativo),
> Cavalcante (escala perpétua Brasil).

**Status:** rascunho v1 — premissas marcadas com ⚠️ precisam de decisão do Kaian.
**Dono:** Kaian (oferta, ads) · Cayan (WhatsApp/fechamento) · Marco (entrega/infra)

---

## 0. Premissas deste documento

Escrito com o que foi definido: **preço R$97** e **"entrega uma Secretária IA em
40 minutos"**. O resto abaixo é assunção minha — corrige o que estiver errado que eu
refaço em cima.

| # | Premissa assumida | Confiança |
|---|---|---|
| 1 | Formato = **implementação guiada** (o dono monta a dele em 40 min, passo a passo), não done-for-you | Média — ver §1.2 |
| 2 | Backend = **NEXUS completo** (agente + automação + CRM + tráfego), ~R$300–600/mês + ativação | Alta (base: `produto/novo-braco-pesquisa.md`) |
| 3 | Público = dono de clínica de saúde/estética, 1–5 profissionais, já anuncia ou já tem WhatsApp movimentado | Alta |
| 4 | Tráfego = Meta Ads Click-to-WhatsApp → Bia (mesma máquina que já roda) | Alta |
| 5 | Pagamento = PagTrust, pagamento único | Alta |

### ⚠️ Decisões que travam o lançamento

| P | Decisão | Por que trava |
|---|---|---|
| **P0** | **Em qual plataforma o comprador monta a IA dele?** Se for GPTMaker, ele precisa assinar algo — e aí "sem ferramenta cara" cai por terra | Muda a promessa, a LP inteira e a taxa de reembolso |
| **P0** | **Preço oficial do backend NEXUS** (mensalidade + ativação) | É a ancoragem e o alvo do upsell |
| **P1** | Formato da entrega: vídeo gravado, live semanal, ou template + call de 40 min? | Muda custo marginal e escalabilidade |
| **P1** | Onde hospeda a área de membros / entrega | Marco precisa provisionar |
| **P2** | Nome final do produto | Testável em criativo |

---

## 1. O produto

### 1.1 Promessa central

> **"Monte a sua Secretária IA em 40 minutos. Sem código, sem contratar ninguém."**

A promessa é **um resultado com prazo**, não um curso. O cara não compra aula — ele
compra a secretária dele funcionando antes do fim do expediente.

**Equação de valor (Hormozi) aplicada:**

| Variável | Nosso movimento |
|---|---|
| ↑ Resultado sonhado | "Nenhum paciente sem resposta, 24h" |
| ↑ Probabilidade | 50+ clínicas na NEXUS, passo a passo, kit pronto, garantia |
| ↓ Tempo | **40 minutos** (não "em algumas semanas") |
| ↓ Esforço | Sem código, kit pronto pra colar, só seguir |

### 1.2 O que exatamente é entregue

```
NÚCLEO — Implementação guiada "40 Minutos"
  Passo a passo, do zero à IA respondendo no WhatsApp da clínica.
  Dividido em blocos curtos, cada um = uma parte da IA de pé.

KIT PRONTO
  Prompt-base da secretária (saúde/estética), pronto pra colar
  Fluxo de agendamento
  Fluxo de "quanto custa?" sem queimar o preço
  Fluxo de confirmação e lembrete
  Regras de transbordo pra humano

BÔNUS 1 — Pack de Respostas que Agendam
  As 20 mensagens que mais chegam numa clínica, com a resposta que converte

BÔNUS 2 — Checklist de Ativação em 7 Dias
  O que olhar todo dia na 1ª semana pra IA não fazer besteira
```

⚠️ **Se o formato for done-for-you (a NEXUS monta em 40 min), este playbook muda
bastante**: R$97 com trabalho humano por venda não escala em perpétuo. Nesse caso o
low ticket vira "diagnóstico + setup express" com limite de vagas/semana, e a
estratégia de mídia é outra. Me fala qual dos dois e eu refaço a §1 e a §4.

### 1.3 Empilhamento de valor

Ancoragem **real de mercado** (fonte: `produto/novo-braco-pesquisa.md`) — mais crível
em B2B que valor inventado:

| Item | Valor de referência |
|---|---|
| Implantação de chatbot no mercado | **R$2.000 – R$4.000** |
| Mensalidade de agente/chatbot | R$150 – R$300/mês |
| Secretária CLT (custo real com encargos) | R$2.500+/mês |
| **Implementação guiada Secretária IA** | R$497 |
| Kit Pronto (prompts + fluxos) | R$297 |
| Bônus 1 — Pack de Respostas que Agendam | R$197 |
| Bônus 2 — Checklist de Ativação 7 Dias | R$97 |
| **Total percebido** | **R$1.088** |
| **Preço** | **R$97 — pagamento único** |

**Frase de ancoragem para copy e para a Bia:**
> "Clínica paga de R$2.000 a R$4.000 pra alguém implantar isso. Aqui você monta a sua
> por R$97, em 40 minutos."

### 1.4 Garantia

**7 dias, incondicional, sem perguntas.**
Coerente com o trial de 7 dias que a NEXUS já pratica no CRM.

> "Monta a sua. Se em 7 dias você achar que não valeu, devolvo os R$97. Sem perguntas."

⚠️ **Atenção:** a regra validada "agente de IA fica fora do trial de 7 dias" é sobre
**a IA da NEXUS operando na clínica** durante avaliação. Aqui é garantia de reembolso
de um produto digital — não é trial de serviço. **Não conflita.** Mas registre: se o
volume de reembolso passar de 8%, o problema é a promessa, não a garantia.

---

## 2. Como isso NÃO fere "ativação assistida, nunca desconto"

Esse é o ponto que precisa estar claro pro time inteiro, senão vira confusão comercial.

| | Secretária IA R$97 | NEXUS (backend) |
|---|---|---|
| O que é | Produto digital, o dono monta sozinho | Serviço, a NEXUS monta e opera |
| Entrega | Ele mesmo, em 40 min | Ativação assistida pela NEXUS |
| Escopo | **Atendimento e agendamento** | Atendimento + **captação (tráfego) + CRM + recuperação de orçamento + Aurora** |
| Risco operacional | Do cliente | Da NEXUS |
| Modelo | Pagamento único | Recorrente |

**O R$97 não é a NEXUS mais barata. É outra coisa.**
Ninguém desce de preço: a NEXUS continua entrando por ativação assistida. O low ticket
é uma **porta lateral** que existe pra três coisas:

1. **Comprar lead qualificado com lucro** — o comprador se paga, o CAC do backend cai.
2. **Provar valor antes de vender recorrência** — quem viu a IA responder às 22h já
   acredita. A venda do NEXUS deixa de ser promessa e vira upgrade.
3. **Segmentar por ação, não por interesse** — quem paga R$97 é dono resolvido. Vira
   a melhor base de LAL 1% que a NEXUS pode ter.

### O risco real (e como tratar)

**Risco:** ensinar o cara a montar a própria IA canibaliza o backend.

**Por que não canibaliza, se bem posicionado:**
- O R$97 resolve **atender**. O NEXUS resolve **encher a agenda e não perder venda**.
  São dores diferentes; quem resolve a primeira sente a segunda mais forte.
- Manter uma IA sozinho dá trabalho: prompt desatualiza, IA erra, ninguém monitora.
  A dor de manutenção é o gatilho natural do upsell no dia 5–7.
- Quem quer fazer sozinho **já não ia comprar o NEXUS mesmo**. Melhor faturar R$97 e
  ficar com o contato do que perder o lead pro concorrente.

**Regra de posicionamento (obrigatória em toda peça):**
Nunca vender o R$97 como "a solução completa". Sempre como **"a primeira peça"**.

---

## 3. Value Ladder

```
NÍVEL 0  Conteúdo Instagram / Reels                      R$ 0
              ↓
NÍVEL 1  Secretária IA em 40 Minutos                     R$ 97   ← este playbook
              ↓  (order bump +R$27 · upsell na obrigado)
NÍVEL 2  NEXUS Health — ativação assistida               ⚠️ R$300–600/mês + ativação
              ↓
NÍVEL 3  NEXUS completo (agente + CRM + tráfego gerido)  ⚠️ definir
```

**Meta de negócio:** o low ticket paga a mídia. O lucro vem do Nível 2+.
Se o R$97 empatar o tráfego e converter 10% pro backend, a máquina está de pé.

---

## 4. Funil

### 4.1 Rota principal — WhatsApp (recomendada)

Usa a máquina que já roda hoje. Menos coisa nova pra quebrar.

```
Meta Ads (Click-to-WhatsApp)
        ↓
   Bia qualifica  →  não é dono de clínica? encerra educado
        ↓
   Bia oferta (a partir da 4ª msg)
        ↓
   Link de checkout PagTrust (R$97 + order bump)
        ↓
   Entrega imediata
        ↓
   Nutrição 7 dias  →  upsell NEXUS
```

**Por que WhatsApp primeiro:** conversão de 15–25% contra 1–3% de página fria, a Bia
já existe, e toda conversa vira dado — mesmo quem não compra vira lead do backend.

### 4.2 Rota secundária — LP direta

Testar **depois** que a rota WhatsApp validar a oferta. Escala melhor, mas queima
mais dinheiro pra aprender e não deixa lead pra trás.

### 4.3 Não rodar as duas de cara

Princípio da casa: **valida em um canal antes de escalar pra todos.**
Rota WhatsApp primeiro. LP só depois de 4+ vendas validadas.

---

## 5. Landing Page (rota secundária)

Estrutura Suby, mobile first, sem menu, CTA 4x+.

| # | Bloco | Conteúdo |
|---|---|---|
| 1 | Chamada do público | "Dono de clínica, dentista, biomédica — isso é pra você." |
| 2 | Headline | **"Monte a Sua Secretária IA em 40 Minutos"** |
| 3 | Sub + ancoragem | "Clínica paga R$2.000 a R$4.000 pra implantar isso. Você faz por R$97." |
| 4 | Fascination bullets | ver abaixo |
| 5 | Dor | 3 cenas reais (ver abaixo) |
| 6 | Epiphany bridge | "Eu montava isso pra 50+ clínicas cobrando caro. Um dia pensei: e se o próprio dono montasse?" |
| 7 | Prova | 50+ clínicas · print da IA respondendo · depoimento real em vídeo |
| 8 | Value stack | cards da §1.3 → R$1.088 por R$97 |
| 9 | Preço + CTA | "QUERO MONTAR MINHA IA — R$97" |
| 10 | Garantia | selo 7 dias incondicional |
| 11 | FAQ | 6–8 objeções (§7.3) |
| 12 | CTA final | botão + selos de segurança |

### Fascination bullets

- O erro de atendimento que faz clínica perder 3 pacientes por dia — e ninguém percebe
- Como responder toda mensagem em 5 segundos, às 22h, no domingo, sem contratar ninguém
- O prompt de 4 linhas que transforma o WhatsApp da clínica em máquina de agendamento
- Por que chatbot de menu ("digite 1") afasta paciente — e o que usar no lugar
- A resposta exata pra "quanto custa?" que agenda em vez de queimar o preço
- O que fazer quando a IA não sabe responder (o transbordo que salva a venda)

### Blocos de dor (usar em LP e criativo)

1. Paciente manda mensagem às 22h. Ninguém responde. Amanhã ele já agendou com outro.
2. Secretária de folga no feriado. 14 mensagens paradas. Você descobre na segunda.
3. Você no meio do procedimento. Celular vibrando. Você sabe que é lead — e não pode parar.

### Regras de copy

Parágrafo de 1 frase · frase curta · zero jargão · "você" sempre, nunca "nós" ·
benefício > característica · específico ("40 minutos", "R$2.000–4.000") > genérico.

### Design

Mobile first · #00BFA5 só nos CTAs · Inter · dark mode · carrega < 3s · sem menu,
sem saída, só CTA.

---

## 6. Criativos

Regra validada da casa: **humanizado/coloquial > locução engessada** e
**depoimento real de cliente > narração do fundador.**
Logo: pelo menos 1 dos 5 criativos iniciais tem que ser depoimento de cliente real.

### Estrutura (20–30s, 9:16, legenda obrigatória, sem preço no vídeo)

```
HOOK      0–3s   para o scroll
AGITAÇÃO  3–10s  amplia a dor
SOLUÇÃO  10–20s  apresenta o produto
CTA      20–25s  uma ação só
```

### Os 5 criativos do teste inicial

**C1 — Autoridade (Kaian)**
> Hook: "Clínica paga de 2 a 4 mil pra implantar uma IA no WhatsApp. Eu vou te mostrar como montar a sua em 40 minutos."
> Agitação: "Enquanto isso, o paciente que te chamou às 22h já agendou com outro."
> Solução: "Uma secretária de IA que responde em 5 segundos, 24h, sem código e sem contratar ninguém."
> CTA: "Me chama no WhatsApp que eu te mostro."

**C2 — Pattern interrupt**
> Hook: "Eu parei de contratar secretária." (pausa 1s)
> Agitação: "Não porque não gosto. Porque secretária dorme, folga e adoece. Lead não."
> Solução: "Montei uma IA que atende 24h. Levou 40 minutos."
> CTA: "Chama no WhatsApp."

**C3 — Pergunta de dor**
> Hook: "Quantas mensagens ficaram sem resposta no WhatsApp da sua clínica essa semana?"
> Agitação: "Cada uma dessas era um paciente. Que agora é paciente de outro."
> Solução: "Dá pra resolver hoje. Em 40 minutos, sem código."
> CTA: "Chama no WhatsApp."

**C4 — Depoimento real** ⚠️ precisa gravar com cliente
> Cliente na própria clínica, celular na mão, mostrando a IA respondendo.
> "Antes eu respondia de madrugada. Agora ela responde por mim."
> Sem roteiro decorado. Quanto mais cru, melhor.

**C5 — Screen recording**
> Tela do WhatsApp: paciente pergunta → IA responde → agenda marcada. Tempo real.
> Voz por cima, coloquial, sem locução.

### Produção

Vertical 9:16 · selfie olhando pra câmera · corte a cada 2–3s · fundo de clínica ou
escritório · tom de quem sabe, não de quem vende · gravar 3 takes · **sem preço**.

### Teste A/B

Uma variável por vez. Mesmo roteiro + hooks diferentes primeiro. Depois CTA
(WhatsApp vs link). Nunca mudar tudo junto.

---

## 7. Meta Ads

### 7.1 Estrutura ABO 1-1-1

| Campanha | Público | Budget |
|---|---|---|
| CP01 | LAL 1% da base de clientes NEXUS | R$30/dia |
| CP02 | Interesse: dentista + estética + dono de clínica | R$30/dia |
| CP03 | Aberto (broad) — o criativo filtra | R$30/dia |

Objetivo **Mensagens** (Click-to-WhatsApp) · subir 23:59 · **não mexer por 48h**.
Investimento de validação: **R$90/dia × 4 dias = R$360**.

### 7.2 Rotina de otimização

| Dia | Ação |
|---|---|
| 1–2 | Não mexe. Nada. |
| 3 | Pausa o pior público. Mantém os 2 melhores. |
| 5 | Escala o vencedor +20–30%. Entra criativo novo no melhor público. |
| 7+ | Duplica a campanha vencedora com budget maior. |

### 7.3 Escala

Vertical: +20–30% a cada 48h · Horizontal: duplica com público novo ·
Recuo: CPA sobe 30%+ por 2 dias → volta ao budget anterior · **nunca dobrar de uma vez.**

---

## 8. Fechamento no WhatsApp (Bia)

Segue as regras validadas em `fluxo-bia.md`, sem exceção:
**preço só a partir da 4ª mensagem · uma pergunta por vez · ✅ no lugar de bullet.**

### 8.1 Fluxo

```
MSG 1 — Abre e qualifica
"Oi! Aqui é a Bia da NEXUS 😊
Você tem clínica ou consultório?"

MSG 2 — Escuta a dor (uma pergunta só)
"Boa! E hoje, quem responde o WhatsApp da clínica?"

MSG 3 — Diagnostica e agita
"Entendi. Isso é o que mais vejo por aqui —
mensagem que chega fora do horário quase sempre vira paciente do concorrente.
Posso te mostrar como as clínicas daqui resolveram isso?"

MSG 4 — Oferta + ancoragem + preço (só agora)
"Então: montei um passo a passo onde você monta a sua Secretária IA em 40 minutos.

✅ Ela responde em segundos, 24h
✅ Agenda sozinha
✅ Sem código e sem contratar ninguém

Clínica paga de R$2.000 a R$4.000 pra implantar isso.
Aqui é R$97, pagamento único, com 7 dias de garantia.

Quer montar a sua?"

MSG 5 — Só depois do SIM: link e silêncio
"Massa! Aqui o acesso 👇
[LINK]
Qualquer coisa na montagem, é só me chamar."
```

**Regra dura: depois do link, a Bia cala a boca.** Continuar vendendo depois do SIM
derruba conversão.

### 8.2 Objeções — EMPATIA → REFRAME → PROVA → PERGUNTA

| Objeção | Resposta |
|---|---|
| "Tá caro" | "Entendo! Mas pensa: um paciente que você perde vale mais que R$97. Ela se paga no primeiro agendamento. Quer montar a sua?" |
| "Não sou de tecnologia" | "É exatamente pra quem não é 😄 É passo a passo, você só segue e vai colando o que já vem pronto. Se travar, me chama. Bora?" |
| "Não tenho tempo" | "São 40 minutos. Menos que um procedimento. E depois ela trabalha 24h por você. Quer começar hoje?" |
| "Já tenho secretária" | "Ótimo — a IA não substitui ela, tira o WhatsApp das costas dela. Fora do horário quem responde é a IA. Faz sentido?" |
| "IA é fria com paciente" | "Concordo com chatbot de 'digite 1'. Por isso a nossa conversa como gente. Te mando um print de uma conversa real?" |
| "Vou pensar" | "Fechado! Só uma coisa: hoje, quantas mensagens ficam sem resposta por dia aí?" |
| "Já tentei e não funcionou" | "Entendo, a maioria monta errado — deixa a IA falando preço cedo demais. É justamente o que o passo a passo corrige. Quer ver?" |

### 8.3 Follow-up

| Momento | Mensagem |
|---|---|
| 30 min | "Conseguiu ver o link?" |
| 24 h | "Passando aqui rapidinho — ficou alguma dúvida?" |
| 48 h | "Última vez que te chamo 😄 Se quiser montar depois, é só me chamar." |

Três toques. Depois disso, para — e o contato vai pra base de remarketing do backend.

---

## 9. Monetização por venda

| Peça | Preço | Taxa esperada |
|---|---|---|
| Produto principal | R$97 | — |
| **Order bump:** Pack de 10 Scripts Prontos | +R$27 | 15–30% |
| **Upsell (obrigado):** ativação NEXUS, 1º mês com condição | ⚠️ definir | 5–10% |

**AOV estimado:** R$97 + (R$27 × 20%) ≈ **R$102** por venda, antes do upsell.

---

## 10. Pós-venda e ponte pro backend

É aqui que o dinheiro de verdade acontece. O R$97 é pedágio; o NEXUS é o destino.

| Dia | Ação | Objetivo |
|---|---|---|
| 0 | Entrega imediata + boas-vindas no WhatsApp | Zerar ansiedade de compra |
| 1 | "Conseguiu acessar?" | Destravar quem não começou |
| 3 | "Sua IA já tá respondendo? Manda print" | **Gerar o momento aha** |
| 5 | Conteúdo: "o que a IA sozinha NÃO resolve" | Abrir a ferida do backend |
| 7 | Oferta NEXUS com condição de aluno | Upsell |
| 10 | Convite pra demo de 15 min (Cayan) | Fechar |
| 14 | Pedido de depoimento em vídeo | **Alimenta o criativo C4** |

**A virada do dia 5** é o coração do funil. A mensagem tem que dizer, sem soberba:
a IA que você montou atende quem chega — ela não faz chegar mais gente, não organiza
o pipeline e não recupera orçamento parado. Isso é NEXUS.

---

## 11. Métricas

### Benchmarks (low ticket R$97, rota WhatsApp)

| Métrica | Alvo |
|---|---|
| CPL (conversa iniciada) | R$10–20 |
| Conversa → venda | 15–25% |
| CPA | < R$60 |
| Order bump | 15–30% |
| Upsell obrigado | 5–10% |
| Reembolso | < 8% |
| **Compradores → backend NEXUS** | **10–15%** |

### Critérios de decisão

| Situação | Ação |
|---|---|
| ROI > 1,5x por 3 dias | Escala +30% |
| ROI 0,8–1,5x | Mexe em criativo ou público, não na oferta |
| ROI < 0,8x por 3 dias | Pausa e revisa a oferta |
| 4+ vendas com R$360 investido | **Produto validado** → libera LP e escala |
| 0 vendas em 7 dias | Revisa tudo: oferta, criativo, script da Bia |

### KPI-mãe

> **CAC do backend NEXUS.** Se o low ticket empatar a mídia e ainda entregar
> compradores que viram cliente recorrente, o CAC do NEXUS vai a zero.
> É esse o número que decide se a máquina fica de pé.

---

## 12. Checklist de lançamento

**Antes de subir mídia**

- [ ] ⚠️ Definir a plataforma onde o comprador monta a IA (P0 — Kaian + Marco)
- [ ] ⚠️ Definir preço oficial do backend NEXUS (P0 — Kaian)
- [ ] Gravar a implementação guiada de 40 min (Kaian)
- [ ] Montar o Kit Pronto: prompt-base + 4 fluxos (Kaian + Marco)
- [ ] Escrever Bônus 1 e 2
- [ ] Subir entrega e testar acesso ponta a ponta (Marco)
- [ ] Checkout PagTrust com order bump de R$27 (Marco)
- [ ] Página de obrigado com upsell NEXUS (Marco)
- [ ] Script novo da Bia carregado no GPTMaker e testado em 5 conversas (Cayan)
- [ ] Gravar C1, C2, C3, C5 (Kaian) + C4 com cliente real (Jennifer agenda)

**Subida**

- [ ] 3 campanhas ABO, R$30/dia cada, objetivo Mensagens, 23:59
- [ ] Não mexer 48h

**Depois**

- [ ] Dia 3: pausa o pior público
- [ ] Dia 5: escala o vencedor, entra criativo novo
- [ ] Dia 7: decide pelos critérios da §11
- [ ] Nutrição de 7 dias ativa e testada
- [ ] Ao validar: registrar aprendizados em `principios-validados.md`

---

## 13. Regras que este playbook não pode quebrar

Herdadas de `principios-validados.md`. Se algo aqui conflitar, o princípio vence.

- ✅ **Ativação assistida, nunca desconto** — o R$97 é produto separado, não NEXUS mais
  barata. Ver §2.
- ✅ **Criativo humanizado > locução engessada** — nenhum criativo com locução.
- ✅ **Depoimento real > narração do fundador** — C4 é obrigatório na primeira rodada.
- ✅ **Preço só a partir da 4ª mensagem** — respeitado na §8.1.
- ✅ **Sem perguntas empilhadas · ✅ no lugar de bullet** — respeitado na §8.1.
- ✅ **Valida em um canal antes de escalar** — WhatsApp primeiro, LP depois.

---

## Ver também

- [`principios-validados.md`](./principios-validados.md)
- [`ativacao-assistida.md`](./ativacao-assistida.md)
- [`fluxo-bia.md`](./fluxo-bia.md)
- [`../produto/visao-geral.md`](../produto/visao-geral.md)
