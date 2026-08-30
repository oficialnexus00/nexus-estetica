# 04 — Arquitetura do funil | Dr. Eder Guimarães

> **Decisão em aberto:** Google ou Meta.
> Resposta curta: **Google**, com uma exceção que pode inverter tudo (§3).

---

## 1. Por que ultrassom não é estética

Os dois canais fazem trabalhos diferentes, e ultrassom cai claramente de um lado:

| | Geração de demanda | **Captura de demanda** |
|---|---|---|
| Canal | Meta / Instagram | **Google (Busca + Maps)** |
| O que faz | Cria o desejo em quem não pensava nisso | Pega quem **já** está procurando |
| Serve pra | Harmonização, botox, lentes — decisão emocional | **Exame com pedido médico na mão** |

Ninguém rola o Instagram e decide fazer um ultrassom de abdome. A pessoa faz
ultrassom porque **um médico pediu**. O gatilho já aconteceu antes do anúncio.
Ela sai do consultório com o papel na mão e faz uma coisa só: **procura onde fazer,
por quanto e pra quando.**

Isso é uma busca. Não é um feed.

No Meta, a gente pagaria pra criar um desejo que já existe — e ainda por cima
falando com 95% de gente que não tem pedido nenhum. No Google, a gente aparece
exatamente no minuto em que a pessoa digita *"ultrassom transvaginal [cidade]"*.

---

## 2. Onde o dinheiro vai render mais

| Ordem | Alavanca | Custo | Por quê |
|---|---|---|---|
| **1º** | **Perfil da Empresa no Google (Maps)** | **R$ 0** | "Ultrassom perto de mim" é resolvido no Maps. Perfil completo + avaliações ganha de campanha paga |
| **2º** | **Rede de encaminhamento médico** | R$ 0 | Quem gera o pedido é outro médico. 10 médicos encaminhando > R$ 1.000 de mídia |
| 3º | Google Busca | R$ 1.000 | Captura quem já procura e não conhece a clínica |
| 4º | Meta | — | Só faz sentido no cenário do §3 |

**Isso precisa ser dito pro Eder antes de ele gastar o primeiro real:** o Perfil do
Google é de graça e, pra exame local, costuma entregar mais agendamento do que
R$ 1.000 de anúncio. Se ele ainda não tem perfil verificado com foto, horário e
avaliação, é ali que a gente começa — não na campanha.

E a alavanca nº 2 é a que mais pesa pra recém-formado: **cada paciente dele chegou
com um pedido assinado por alguém.** Esse alguém é o canal. Ads não substitui isso,
só acelera enquanto a rede não existe.

---

## 3. A exceção que inverte a resposta

**Se o forte dele for ultrassom obstétrico — e principalmente 3D/4D/5D — a resposta
vira Meta.**

| Tipo de exame | Quem decide | Canal |
|---|---|---|
| Abdome, tireoide, rins, mama, transvaginal | Pedido médico → busca onde fazer | **Google** |
| Obstétrico de rotina | Gestante escolhe onde fazer | Google + Meta |
| **Morfológico / 3D / 4D / 5D** | **Desejo puro da gestante e da família** | **Meta** |
| Musculoesquelético, Doppler | Encaminhamento de ortopedista/reumato | **Rede médica**, não ads |

Ultrassom emocional de gestante é o único ultrassom que se vende como estética:
tem imagem que para o feed, tem carga emocional, tem público perfeitamente
segmentável no Meta (gestante, faixa de semanas, interesses de maternidade),
compartilha sozinho e tem ticket 2 a 3× maior que exame comum.

**Por isso a primeira pergunta não é "Google ou Meta". É: que ultrassom ele faz?**

---

## 4. Contas, lado a lado (R$ 1.000)

Premissas de mercado local em saúde — ajustar com dado real depois do primeiro mês:

| | Google Busca | Meta (ultrassom geral) |
|---|---|---|
| Custo por clique | R$ 2,00 – 4,00 | — |
| Cliques / conversas | ~330 cliques | ~40 conversas |
| Intenção | **Alta** (tem pedido na mão) | Baixa (viu no feed) |
| Vira contato | 10% → 33 contatos | 100% → 40 conversas |
| **Vira exame agendado** | **~45% → 15 exames** | ~12% → 5 exames |
| Custo por exame | **R$ 67** | R$ 200 |

O número que importa não é o custo do contato — é **quantos têm pedido médico**.
No Google, quase todos. No Meta, quase nenhum. É isso que separa R$ 67 de R$ 200.

Com ticket particular de ~R$ 180, Google fecha com folga. Meta, no ultrassom geral,
fica no limite — e paciente de exame **volta** (repete, traz a família), então o
valor real por paciente é maior que o primeiro exame.

---

## 5. Recomendação

**Cenário A — ultrassom geral / diagnóstico (mais provável):**

```
Perfil no Google (Maps)  ← primeiro, de graça
        +
Google Busca — R$ 1.000/mês
   termos de exame + "perto de mim" + "[exame] [cidade]" + "preço"
        │
        ▼
Liga ou chama no WhatsApp  ──►  Agente de IA
        │                            ├─ confirma qual exame (lê o pedido)
        │                            ├─ preço e preparo do exame
        │                            ├─ convênio ou particular
        │                            └─ oferece 2 horários
        ▼
Agenda no CRM  ──►  Lembrete D-1 com o preparo  ──►  Exame
                                                        │
                                                        ▼
                                          Laudo + pedido de avaliação no Google
```

O último passo fecha o ciclo: **cada exame vira uma avaliação no Google**, que
melhora a alavanca nº 1, que é de graça. Em 6 meses isso reduz a dependência de mídia.

**Cenário B — obstétrico / 3D-4D:** Meta, e aí quase tudo que eu montei na LP e no
plano de campanha se aproveita, só troca a copy.

---

## 6. Detalhe operacional que mata campanha de exame

**O preparo.** Ultrassom de abdome exige jejum; pélvico exige bexiga cheia. Paciente
que chega sem preparo perde o exame e o horário — e vira reclamação.
O lembrete D-1 tem que mandar **o preparo específico daquele exame**, não um
lembrete genérico. Isso entra no `05-agente-ia.md` como regra dura.

---

## 7. O que falta pra fechar a arquitetura

| # | Pergunta | Por que trava |
|---|---|---|
| 1 | Que exames ele faz? Qual o carro-chefe? | Decide Google vs Meta (§3) |
| 2 | Estrutura própria ou horário alugado? | Sem endereço fixo não tem Perfil no Google |
| 3 | Cidade | Define volume de busca e custo do clique |
| 4 | Particular, convênio ou os dois? | Muda a copy inteira e a qualificação |
| 5 | Ticket dos principais exames | Fecha a conta do §4 |
| 6 | Quantos exames/dia ele consegue absorver? | Não adiantar lotar o que não cabe |
