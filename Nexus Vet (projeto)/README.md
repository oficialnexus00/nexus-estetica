# NEXUS VET

Braço veterinário da **NEXUS INTELIGÊNCIA ARTIFICIAL** — sistema de gestão para
clínicas veterinárias com a Bia (IA) nativa: atende no WhatsApp, agenda sozinha e
traz o pet de volta pela recorrência de vacina.

> **Comece por [`CLAUDE.md`](./CLAUDE.md)** (contexto-mestre) e depois pelo
> documento de visão em [`produto/sistema-veterinario.md`](./produto/sistema-veterinario.md).
>
> Repositório-mãe (empresa, Bia, stack): [`nexus-estetica`](https://github.com/oficialnexus00/nexus-estetica)

## Por que existe

Nenhum sistema veterinário do Brasil (SimplesVet, LoopVet, Vetus, Vetsys) libera
**API aberta**. Sem isso a IA não escreve na agenda nem lê o histórico do pet — e a
clínica teria que redigitar tudo. Conclusão: a NEXUS precisa **ser o sistema**.

É a mesma motivação que originou o sistema odontológico da NEXUS, à qual a pesquisa
do vet chegou de forma independente.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `produto/` | Documento de visão, persona da Bia Vet, base de conhecimento, modelo de dados, plano de teste |
| `comercial/` | Pesquisa de concorrentes, templates de mensagem |
| `stack/` | Workflows n8n validados, dados de vacina e custos de WhatsApp |
| `pmo/` | Pendências e decisões abertas |

## Estado

- ✅ Ferramentas da IA (tool-server) — **validado no n8n**
- ✅ Motor de reativação de vacina — **validado no n8n**
- ✅ Persona, base de conhecimento, modelo de dados, plano de teste, pesquisa
- ⏳ Aguardando decisões do Kaian — ver [`pmo/pendencias.md`](./pmo/pendencias.md)

> Nada foi publicado em produção. Nenhum workflow de cliente foi alterado.
