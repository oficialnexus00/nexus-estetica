# Do que temos até o primeiro cliente pagando

> Balanço honesto — atualizado após configurações da clínica (16 commits).
> Serve pra não confundir "fundação pronta" com "produto entregável".
>
> 📌 **Este é o documento de retomada.** Se você está começando uma sessão
> nova, leia este primeiro — ele diz onde paramos e o que fazer a seguir.

---

## ✅ PRONTO E VERIFICADO

| Item | Prova |
|---|---|
| Pesquisa de mercado e concorrentes | Incumbentes, rivais diretos, preços dos planos **pagos**, custo real de WhatsApp |
| Tese estratégica | Nenhum sistema vet tem API aberta → a NEXUS precisa ser o sistema |
| Schema do banco | `stack/schema-vet.sql` — multi-tenant, RLS, views, RPC, prontuário, financeiro |
| Tool-server da Bia (12 ferramentas) | Validado no n8n (13 nós) |
| Motor de reativação de vacina | Validado no n8n (10 nós), lê da view `v_fila_lembrete_vacina` |
| **App web (6 telas) — LÊ E ESCREVE** | Tudo testado no navegador, não só compilado |
| **Prontuário do pet** | Timeline, receita imprimível, alerta de saúde, peso sincroniza via trigger |
| **Financeiro** | A pagar/receber, inadimplência, dar baixa |
| **Configurações da clínica** | Serviços e profissionais: criar, editar, remover |
| Camada de dados | `queries.ts` (leitura) + `mutations.ts` (escrita); mesmo formato em demo e real |
| Persona, templates, base de conhecimento | Alinhados às regras oficiais da Bia |
| Auditoria de consistência | 8 inconsistências corrigidas |

## ⚠️ PRONTO NO PAPEL — NUNCA EXECUTADO EM PRODUÇÃO

- O **schema nunca rodou** em nenhum Supabase real.
- Os **dois workflows nunca foram publicados** no n8n.
- O app **nunca leu/escreveu um banco real** — só modo demo.
- **Zero conversa real** testada com a Bia Vet.
- O **plano de teste nunca foi executado**.

## ❌ AINDA NÃO EXISTE

### 1. A Bia Vet não existe como agente
Temos prompt e ferramentas, mas nada conectado a um modelo. Falta criar o
agente no **GPTMaker** e plugar tool-server + base de conhecimento.

### 2. Infraestrutura nunca provisionada
Supabase, rodar o schema, credenciais, instância Evolution, número de
WhatsApp, e **hospedagem do app** (roda só local).

### 3. Módulos de produto que faltam
**Estoque** (roteiro técnico pronto em `stack/roteiro-modulo-estoque.md`,
aguardando decisão do Kaian) · nota fiscal · relatórios/BI ·
**importador de dados** (barreira nº1 pra clínica trocar de sistema) ·
protocolos de vacina configuráveis pela tela (hoje a lista é fixa no código).

### 4. Operação de negócio
Onboarding, migração, treinamento, suporte, contrato, **cobrança/billing**,
política de LGPD para dado de saúde.

---

## 🎯 Caminho mínimo até o primeiro cliente

1. **Kaian decide** os itens de `pendencias.md` (piloto, Supabase, Evolution, preço)
   e a requisição de estoque (`pmo/requisicao-estoque-para-kaian.md`).
2. **Provisionar**: criar o Supabase, rodar o schema, cadastrar a clínica-piloto.
3. **Publicar os 2 workflows** no n8n e criar a **Bia Vet no GPTMaker**.
4. **Hospedar o app** e testar login real.
5. **Rodar o plano de teste** (mecânica → cliente oculto → piloto).
6. **Importar os dados** da clínica-piloto e treinar a equipe.
7. **Piloto acompanhado**, 2 semanas, com placar.

## Onde estamos, sem maquiagem

O app **opera de ponta a ponta**: cadastra, agenda, registra vacina, atende,
cobra e configura. Estimativa até um cliente operando: **~80%**.

**O gargalo agora não é mais código nosso** — é provisionar infraestrutura,
subir a Bia como agente e montar a operação comercial. Tudo isso depende de
decisões e acessos do Kaian.

Se for pra continuar construindo enquanto ele não responde, o próximo item
de maior valor é o **importador de dados** (destrava a migração de qualquer
clínica) ou o **estoque** (mais citado na auditoria competitiva) — mas o
estoque tem uma requisição formal aguardando o "sim" dele.
