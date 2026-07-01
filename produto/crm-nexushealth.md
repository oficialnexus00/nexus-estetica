# CRM — nexushealth

CRM próprio da NEXUS, entregue às clínicas como parte do pacote.

## Acesso

- **URL:** `app.nexushealth.com.br`

## O que é

O painel onde a clínica **enxerga e gerencia seus leads e o pipeline de vendas**. É o
lugar onde tudo que a IA e a automação capturam vira visível e acionável pro dono da
clínica.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend / CRM | Lovable.dev |
| Backend | Supabase (Edge Functions, Postgres) |
| Linguagem | React / TypeScript, Supabase Edge Functions |

Detalhes de arquitetura em [`../stack/stack-tecnico.md`](../stack/stack-tecnico.md).

## Como evoluímos o CRM (fluxo de trabalho com Lovable)

O frontend é construído no **Lovable.dev**. O fluxo padrão:

1. **Kaian manda um print** da tela / do que quer mudar.
2. **Claude devolve um prompt preciso** pra colar no Lovable.
3. Lovable gera/edita a interface.

> Isso significa: pra mudança de UI, o entregável do Claude é **um prompt pronto pro
> Lovable**, não uma explicação conceitual.

## Papel no funil

O CRM é o **destino** do lead depois que a Bia qualifica e a automação processa —
onde o pipeline fica organizado e o time (Jennifer, Cayan) trabalha o fechamento.
