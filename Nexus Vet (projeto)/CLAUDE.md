# CLAUDE.md — Contexto-mestre do NEXUS VET

> Cérebro deste repositório. Lido no início de cada sessão. Detalhamento nas pastas
> (`produto/`, `comercial/`, `stack/`, `pmo/`). Quando algo mudar, atualize aqui primeiro.
>
> ⚠️ **Repositório-mãe:** `github.com/oficialnexus00/nexus-estetica` — é a fonte de
> verdade sobre a empresa, a Bia, o stack e o jeito de trabalhar. **Consulte lá antes
> de supor qualquer coisa.** Este repo é só o braço veterinário.

---

## O que é este projeto

Expansão da NEXUS para o **nicho veterinário**: um sistema de gestão para clínicas
vet com a Bia (IA) nativa — atendendo, agendando e trazendo o pet de volta pela
recorrência de vacina.

**Tese:** nenhum sistema veterinário do mercado tem API aberta → a NEXUS precisa
**ser o sistema**, não um chatbot pregado por fora. (Mesma motivação que originou o
[sistema odontológico](https://github.com/oficialnexus00/nexus-estetica) — validada
de forma independente na pesquisa do vet.)

Documento central: [`produto/sistema-veterinario.md`](./produto/sistema-veterinario.md)

## Quem toca

- **Kaian** — CEO, decide direção, dono do ambiente n8n/GPTMaker
- **Rodrigo** — conduz o projeto vet (vendas/negócio)

## Herdado da NEXUS (não reinventar)

- **Regras de conversa da Bia:** preço só a partir da **4ª mensagem** · **sem
  perguntas empilhadas** (1 por vez) · **✅ no lugar de bullet** no WhatsApp ·
  tom humanizado e coloquial · qualificação pela IA, fechamento complexo com o time.
- **Princípios:** porta de entrada é **ativação assistida**, nunca desconto ·
  validar em 1 canal antes de escalar.
- **Identidade:** cor **#00BFA5**, tipografia **Inter**, dark-mode minimalista.
- **Stack:** Lovable.dev (frontend) · Supabase (Postgres/Edge Functions) ·
  GPTMaker (agentes) · n8n (automação) · Evolution API (WhatsApp/chip).

## Específico do vet

- **Recorrência = vacina.** Protocolo por espécie → próxima dose → lembrete → retorno.
  É o motor de receita previsível do nicho. Ver [`stack/dados-vacina-e-whatsapp.md`](./stack/dados-vacina-e-whatsapp.md).
- **Guardrail clínico (inegociável):** a IA **nunca** dá diagnóstico, dose ou
  prescrição — encaminha ao veterinário. Emergência = encaminhamento imediato.
  Ver [`produto/base-conhecimento-vet.md`](./produto/base-conhecimento-vet.md).
- **Padrão de disparo (jeito Kaian):** lote ~20 · delay aleatório 40–100s ·
  flag de controle · `onError: continuar` · apoiar no Monitor de Chips.

## Como o Claude deve trabalhar aqui

- Entregável pronto pra colar, não orientação conceitual. PT-BR, tom direto.
- **Nunca** publicar/deployar em produção sem aval explícito do Kaian.
- Validar workflow no n8n (`validate_workflow`) antes de propor qualquer criação.
- Pesquisar e embasar antes de afirmar; admitir o que não sabe.

## Estado atual (julho/2026 — 16 commits)

**O sistema existe e opera.** App React rodando em `app/` com 6 telas, lendo e
escrevendo: Dashboard · Agenda · Tutores & Pets (com Pet 360, prontuário e
carteira de vacina) · Financeiro · Configurações · Bia.

- ✅ Schema completo em `stack/schema-vet.sql` (multi-tenant, RLS, views, RPC)
- ✅ 2 automações validadas no n8n — **não publicadas**
- ⚠️ Roda em **MODO DEMO** (dados fictícios). Vira sistema real quando o
  `.env` receber as chaves do Supabase — ver `app/.env.example`
- ❌ Nada provisionado: Supabase, Evolution, GPTMaker, hospedagem

**Leia primeiro:** [`pmo/caminho-ate-o-cliente.md`](./pmo/caminho-ate-o-cliente.md)
— é o documento de retomada, diz onde paramos e o próximo passo.
Decisões travadas com o Kaian: [`pmo/pendencias.md`](./pmo/pendencias.md).

### Como rodar o app
```
cd app && npm install && npm run dev
```
Na tela de login, clicar em "Ver demonstração (dados fictícios)".
