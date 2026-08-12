# Pricing NEXUS — Deal Desk

> **O que é esta pasta.** É o "deal desk" da NEXUS: o lugar onde mora a tabela de
> preços, as regras de combinação de produtos e o histórico de cada caso real de
> precificação. Quando o Kaian perguntar *"quanto eu cobro do fulano?"*, a resposta
> sai daqui — e volta pra cá como caso registrado em [`casos/`](./casos/).
>
> **Nomenclatura da função:** no mercado isso chama **Deal Desk** (o time que aprova
> e desenha preço de negócio específico), dentro do guarda-chuva de **Pricing /
> Revenue Operations (RevOps)**. Em empresa brasileira menor costuma aparecer como
> "Analista de Pricing" ou "Controller comercial". A NEXUS tem 4 pessoas — então o
> deal desk é este arquivo.

---

## 1. Tabela de referência (avulso, por clínica/mês)

| Módulo | Avulso/mês | Status |
|---|---|---|
| **Disparo** (campanha + reativação no WhatsApp) | **R$ 397** | ✅ confirmado (praticado hoje) |
| **Sistema completo** (CRM `app.nexushealth.com.br`) | R$ 497 | 🟡 a validar com Kaian |
| **Agente de IA** (Bia comercial / Aurora pós-venda) | R$ 697 | 🟡 a validar com Kaian |
| **Gestão de tráfego pago** (Meta Ads, Click-to-WhatsApp) | R$ 997 + verba do cliente | 🟡 a validar com Kaian |

Só o disparo (R$ 397) é preço praticado hoje. Os outros três são a estrutura
proposta pra sustentar os combos abaixo — Kaian confirma ou ajusta, e aí vira regra.

### Ativação (uma vez, não recorrente)

| Item | Valor |
|---|---|
| Ativação assistida do **sistema** | inclusa |
| Ativação assistida da **IA** (treino da base, fluxo, testes) | **R$ 997** (à vista ou 2× 499) |

A ativação da IA é cobrada porque é trabalho humano real (Marco + Cayan) e porque a
IA fica **fora do trial de 7 dias** — ela entra só depois de ativada. Ver
[`../ativacao-assistida.md`](../ativacao-assistida.md).

---

## 2. Combos (é isso que a gente vende)

| Combo | O que tem | Soma avulsa | **Preço do combo** | Economia |
|---|---|---|---|---|
| **Essencial** | Disparo + Sistema | R$ 894 | **R$ 797/mês** | R$ 97 |
| **Completo** | Disparo + Sistema + IA | R$ 1.591 | **R$ 1.297/mês** | R$ 294 |
| **Full** | Completo + Tráfego | R$ 2.588 | **R$ 2.097/mês** + verba | R$ 491 |

O combo não é desconto — é **pacote**. A diferença de preço existe porque o custo de
servir cai quando os módulos rodam juntos (uma ativação, um onboarding, um canal de
suporte). Isso pode e deve ser dito ao cliente com essas palavras.

### Faixas de volume (todo combo com IA) — ✅ **aprovado pelo Kaian em 12/08/2026**

A IA tem **COGS real por conversa** (GPTMaker + ElevenLabs). Preço de combo é sempre
**por faixa de volume**, nunca por mensagem — cobrar por mensagem é exatamente o que
os concorrentes fazem e o que a gente ataca na venda.

| Faixa | Conversas/mês | Completo | Full |
|---|---|---|---|
| **1** | até 800 | R$ 1.297 | R$ 2.097 |
| **2** | 801 – 2.000 | **R$ 1.497** | R$ 2.397 |
| **3** | 2.001 – 4.000 | R$ 1.797 | R$ 2.797 |
| **4** | acima de 4.000 | sob consulta | sob consulta |

- A faixa é **perguntada na venda** e **revisada a cada 3 meses** no CRM. Se o
  cliente subir de faixa, comunicar com 30 dias e subir junto com o resultado.
- Faixa nunca desce sem revisão de escopo — cliente que caiu de volume tem problema
  de tráfego, e isso é conversa de tráfego, não de desconto.
- **Antes de fechar faixa 3+, conferir o custo real de GPTMaker/ElevenLabs naquele
  volume.** Margem-alvo mínima: 70%.

### Fee de tráfego pago (vinculado à verba)

| Verba de mídia do cliente | Fee de gestão |
|---|---|
| até R$ 5.000/mês | R$ 997 |
| R$ 5.001 – 15.000/mês | **15% da verba** (mín. R$ 1.200) |
| acima de R$ 15.000/mês | negociado, piso 10% |

Verba nunca entra no fee e nunca passa pela NEXUS misturada com mensalidade.

---

## 3. Âncoras de valor (usar na conversa, não a tabela)

- **Recepcionista CLT**: ~R$ 1.600 de salário vira ~R$ 2.400–2.800/mês com encargos,
  e ela dorme, folga e sai de férias. O Completo custa **metade disso** e atende
  24/7. Esta é a âncora principal.
- **Lead perdido**: numa clínica de estética com ticket de R$ 1.500–3.000, **um**
  agendamento a mais no mês já paga o combo Completo inteiro.
- **Custo por mensagem dos concorrentes**: CoDental e afins cobram por mensagem
  (~R$ 0,07 WhatsApp). A NEXUS não cobra. Ver
  [`../benchmark-odonto.md`](../benchmark-odonto.md).

---

## 4. Regras do deal desk (não negociáveis)

1. **Nunca desconto no mensal.** Se precisar ceder, cede em **ativação, prazo de
   pagamento ou escopo** — nunca no recorrente. Recorrente descontado é margem
   perdida pra sempre e sinaliza commodity.
2. **Piso absoluto por combo:** Essencial R$ 697 · Completo R$ 997 · Full R$ 1.797.
   Abaixo do piso, não fecha — recusar é mais barato que carregar cliente ruim.
3. **Upgrade de cliente ativo:** o que ele já paga **vira crédito integral** no
   combo. Nunca cobrar duas linhas do mesmo cliente. A conversa é sempre *"você já
   paga X, o combo é Y, a diferença é Y−X"*.
4. **Multi-unidade:** 1ª unidade preço cheio; unidades adicionais **50%** em
   disparo + sistema, e **+R$ 297/unidade** na IA (cada unidade é uma base e um
   número de WhatsApp). Franquia com 3+ unidades é conversa de contrato, não de
   tabela.
5. **Tráfego pago nunca entra no combo com desconto.** Verba de mídia é do cliente,
   separada e visível — não misturar com fee de gestão.
6. **Preço só depois de entender o volume.** Mesma regra da Bia (preço só a partir
   da 4ª mensagem) vale pro humano: antes de falar valor, saber quantos leads/mês,
   quantas unidades, quantos atendentes hoje.
7. **Toda proposta tem validade de 7 dias** e reajuste anual por IPCA em contrato.
8. **Aumento em cliente da base** entra com **30 dias de aviso** e sempre com o
   ganho novo junto (nunca aumentar sem entregar módulo novo no mesmo mês).
9. **Upgrade no meio do ciclo:** se o cliente já pagou o mês, **não cobra
   mensalidade de novo**. Cobra só a **ativação** na hora, usa o resto do ciclo
   como janela de implantação e o valor novo entra no **vencimento seguinte**,
   na mesma data de sempre. Nunca estornar o que já foi pago (converte, não
   devolve) e nunca criar um segundo vencimento.

---

## 5. Como pedir uma precificação (formato de entrada)

Pra resposta sair calibrada, mandar:

- Cliente e nicho · quantas unidades
- O que já paga hoje (módulo e valor)
- O que está pedindo agora
- Volume de leads/mês (ou faturamento aproximado)
- Quantas pessoas atendem WhatsApp hoje
- Se tem alguma dor citada por ela ("perco lead à noite", "minha menina saiu")

Cada caso resolvido vira um arquivo em [`casos/`](./casos/).
