# Princípios de negócio já validados

Estes não são hipóteses — já foram testados na operação e viraram regra. Mudar
qualquer um exige nova validação (um canal antes de escalar pra todos).

## Aquisição e entrada

- **Porta de entrada é "ativação assistida", nunca "desconto".**
  Não competimos por preço na entrada; entregamos ativação assistida. Ver
  [`ativacao-assistida.md`](./ativacao-assistida.md).

## Preço

- **Preço de IA por faixa de volume, nunca por mensagem.**
  A IA tem COGS real por conversa (GPTMaker + ElevenLabs), então o preço acompanha o
  volume — mas em **faixas**, não em cobrança por mensagem. Cobrar por mensagem é o
  que CoDental e afins fazem, e é justamente o que a NEXUS ataca na venda.
  Faixas em [`pricing/README.md`](./pricing/README.md). *(Validado 12/08/2026.)*
- **Nunca desconto no mensal.** Se precisar ceder, cede em ativação, prazo ou
  escopo. Desconto no recorrente é margem perdida pra sempre e comunica commodity.

## Produto e risco

- **Agente de IA fica FORA do trial de 7 dias.**
  Colocar a IA no trial é risco operacional. A IA entra depois da ativação.

## Criativos e mídia

- **Criativo humanizado/coloquial > locução engessada.**
  Anúncio que soa humano converte mais que locução robótica e profissional demais.
- **Depoimento real de cliente > narração do fundador.**
  Prova social autêntica bate discurso do dono.

## Fluxo de conversa (Bia / WhatsApp)

- **Preço só a partir da 4ª mensagem** no fluxo da Bia.
- **Sem perguntas empilhadas** — uma pergunta de cada vez.
- **✅ no lugar de bullet** no WhatsApp.
- Detalhes em [`fluxo-bia.md`](./fluxo-bia.md).

---

> Regra-mãe por trás de tudo: **prova antes de escalar.** Cada princípio acima passou
> por validação em um canal antes de virar padrão.
