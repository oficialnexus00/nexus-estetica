# Roteiro de Entrevista — Validação do Sistema Odontológico

> **Objetivo:** validar com as ~5 clínicas odonto da carteira o que dói no
> sistema atual delas e converter 3+ em beta pagante do MVP.
> **Formato:** conversa de 20–30 min (call ou presencial), com o DONO.
> **Quem aplica:** Kaian (ou Cayan, com este roteiro na mão).
> **Regra de ouro:** NÃO vender nada até o bloco final. Antes disso é só escuta.
> Não induzir resposta. Deixar o silêncio trabalhar.

---

## Preparação (antes da call)

- [ ] Saber o nome do sistema que a clínica usa hoje (se já soubermos)
- [ ] Ter esta ficha aberta pra anotar
- [ ] Gravar a conversa (pedir permissão) — vira insumo de produto

## Abertura (2 min)

> "Fala [nome]! Rapidinho: a gente tá estudando a fundo como as clínicas
> gerenciam a operação por dentro — agenda, orçamento, financeiro. Você usa a
> NEXUS pra captação, mas queria entender o resto da casa. 20 minutinhos, e sua
> resposta sincera vale mais que elogio, pode falar mal de tudo."

⚠️ Não falar que estamos construindo um sistema. Se perguntar, dizer que é
pesquisa pra melhorar a integração da NEXUS com a operação da clínica (verdade).

---

## Bloco 1 — Raio-X da operação atual (5 min)

1. Qual sistema você usa hoje pra gerenciar a clínica? Há quanto tempo?
2. Quanto paga por mês nele? (se hesitar: "faixa: menos de 150? 150–300? mais?")
3. Quem usa no dia a dia? (você, recepção, dentistas?)
4. Fora ele, o que mais roda a clínica? (planilha, papel, WhatsApp pessoal,
   agenda de papel?) ← *aqui aparece a verdade*

## Bloco 2 — Dor (8 min) — a parte mais importante

5. O que te irrita nesse sistema? Me dá um exemplo da última vez que ele te
   deixou na mão.
6. Se você pudesse apertar um botão e resolver UM problema da gestão da
   clínica hoje, qual seria?
7. Quanto tempo POR DIA sua recepção gasta confirmando consulta e respondendo
   paciente?
8. Paciente falta muito? O que vocês fazem quando falta? E quando some por
   6 meses, alguém corre atrás?
9. **Orçamento:** quando o paciente ouve o valor e diz "vou pensar"... o que
   acontece depois? Alguém faz follow-up? Quantos % você acha que voltam?
   ← *killer question — anotar TUDO*
10. Você sabe dizer quanto tem em orçamento aberto (não aprovado) hoje?
    O sistema te mostra isso fácil?

## Bloco 3 — Dinheiro e decisão (5 min)

11. O que te faria TROCAR de sistema? O que te impediria?
    ← *mapear medo de migração*
12. Já tentou trocar alguma vez? O que aconteceu?
13. Se existisse um sistema que fizesse [repetir a maior dor que ELE citou],
    quanto isso valeria a mais por mês em relação ao que paga hoje?

## Bloco 4 — Integração (3 min) — valida a tese da API

14. Seu sistema conversa com alguma outra ferramenta que você usa?
    (WhatsApp, anúncio, contabilidade?)
15. A NEXUS hoje capta o lead e agenda — mas o dado para na porta do seu
    sistema. Você sente essa quebra? Onde?

## Bloco 5 — Fechamento / conversão em beta (3 min)

*Só chegar aqui se os blocos anteriores mostraram dor real.*

> "Vou ser transparente contigo: a gente tá construindo exatamente isso — um
> sistema de gestão odonto com a nossa IA dentro: agenda, prontuário,
> orçamento... e a Bia correndo atrás de cada orçamento parado e cada paciente
> sumido, automático. Tô montando um grupo fechado de 5 clínicas fundadoras,
> com condição de fundador travada pra sempre e prioridade no que a gente
> constrói. Topas ser uma delas?"

- Se SIM → agendar próximo passo na hora (demo do conceito / onboarding beta).
- Se "depende" → perguntar "depende do quê?" e anotar (é objeção de produto).
- Se NÃO → perguntar o porquê com genuíno interesse. É dado, não derrota.

---

## Ficha de respostas (preencher 1 por clínica)

| Campo | Resposta |
|---|---|
| Clínica / dono | |
| Sistema atual / há quanto tempo | |
| Preço pago/mês | |
| O que roda fora do sistema (planilha/papel) | |
| Maior dor citada (nas palavras dele) | |
| Follow-up de orçamento hoje (faz? quem? %) | |
| R$ em orçamento aberto (sabe? quanto?) | |
| O que faria trocar / o que impede | |
| Sente a quebra NEXUS ↔ sistema? Onde? | |
| Beta: SIM / DEPENDE (do quê) / NÃO (por quê) | |

## Depois das 5 entrevistas

- Consolidar as fichas em `comercial/resultados-validacao.md`
- Rankear as dores por frequência → vira o escopo fino do MVP
- **KPI da Fase 0: 3+ SIM de beta pagante**
- Comparar preços citados com `benchmark-odonto.xlsx` (validar tabela NEXUS)
