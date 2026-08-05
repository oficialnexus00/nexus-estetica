# Produtização — instalar, precificar e migrar do GPTMaker

Um agente NEXUS não é um projeto, é um **produto vendável e instalável**. Este arquivo
é como transformar a carcaça em algo que a equipe (Jennifer, Cayan) vende e o Marco
instala em escala — e como tirar um cliente do GPTMaker sem trauma.

## O modelo de instalação (multi-tenant)

Um template, N instalações. O que muda por cliente é **config**, não código.

**Constantes que mudam por cliente (a "config de instalação"):**
- `CLINIC_ID` (UUID do tenant)
- `SUPABASE_URL` / credenciais do projeto
- Instância Evolution (ex.: `bia-vet-clinica-x`) + credencial
- Catálogo de serviços/preços (já vive no banco do cliente)
- Cadências ativas (quais motores proativos ligar)
- Variáveis do prompt (nome do agente, nome/cidade/expediente da clínica, linha
  vermelha do nicho)

**Roteiro de instalação de um cliente novo:**
1. Rodar o `schema-*.sql` no Supabase do cliente (tabelas + views + RPC + RLS).
2. Popular o catálogo (serviços, preços, protocolos) — o que a clínica configura.
3. Criar credenciais no n8n: "Supabase <cliente>", "Supabase REST (apikey)",
   "Evolution API <cliente>".
4. Clonar o tool-server, trocar `CLINIC_ID`/`SUPABASE_URL`/`path`.
5. Clonar os motores proativos das cadências escolhidas.
6. Configurar o AI Agent node (system prompt com as variáveis do cliente) e ligar no
   tool-server (MCP Client Tool).
7. Ligar a instância Evolution e testar ponta a ponta (inclusive o teste de
   emergência/escalonamento).

> Mantenha os workflows **validados mas não publicados** até o Kaian rodar o SQL e
> criar as credenciais — como os arquivos atuais já fazem no cabeçalho de pendências.

## Ativação assistida, não IA no trial

Princípio validado da NEXUS: **a IA fica FORA do trial de 7 dias**. Se ela falha com
um lead durante a avaliação, queima a chance. O agente entra **depois da ativação
assistida**, quando a clínica já é cliente e o dado do banco está povoado. Vender o
agente = vender o pós-ativação, não a porta de entrada.

## Migrar um cliente do GPTMaker (sem trauma)

O cliente já tem um agente no GPTMaker. A migração é ganho, mas tem que ser suave:

1. **Espelhe o comportamento atual primeiro.** Replique no n8n o que o agente do
   GPTMaker já faz (as tarefas reativas), pra o cliente não sentir regressão.
2. **Rode em paralelo / sombra** por alguns dias se der — compare respostas antes de
   virar a chave.
3. **Vire o número.** Aponte a instância Evolution do cliente pro fluxo do n8n.
   Desligue o GPTMaker só quando o n8n estiver estável.
4. **Aí sim, entregue o upgrade:** ligue as cadências proativas (o que o GPTMaker não
   fazia). É o "a mais" que justifica a migração e um ticket maior.
5. **Meça e mostre:** agendamentos gerados pelo proativo, receita reativada. O número
   é o que segura o cliente e vende pro próximo.

## Posicionamento: por que é melhor que o GPTMaker (e que o SimplesVet)

O que vende o agente NEXUS na infra própria:

- **Regra de negócio de verdade.** No vet, protocolo/porte/retorno/emergência não
  cabem numa config genérica de plataforma. Só na infra própria.
- **Proativo, não só reativo.** Lembra, sugere, reativa, faz pós-op. O concorrente
  espera a mensagem chegar.
- **Mensagens baratas de honrar.** Lembrete = Utilidade R$0,034 (15x mais barato que
  o R$0,50 do SimplesVet). A promessa "mensagens inclusas" é barata pra NEXUS
  (ver economia em `references/proatividade.md`).
- **Um sistema só, sem double-entry.** O que o agente faz já entra no CRM da NEXUS —
  o cliente não digita duas vezes.
- **Sem mensalidade de plataforma de terceiro** (GPTMaker) no meio da margem.

## Precificação (linhas de raciocínio, não tabela fechada)

Confirme os números com o Kaian — aqui é a lógica:

- **Reativo (paridade com GPTMaker):** substitui o que ele já vende. Preço-âncora no
  que a clínica já paga hoje, com a vantagem "tá dentro do sistema".
- **Proativo (o upsell):** cobrado como valor gerado — cada cadência (reativação de
  vacina, retorno, pós-op, dunning de plano) traz receita mensurável. É o degrau de
  ticket, e o que sustenta "mensagens inclusas" (custo marginal ~zero no chip grátis
  pra a operação diária de um cliente).
- **Setup/instalação:** cobra a implantação (rodar schema, povoar catálogo, ligar
  cadências, migrar do GPTMaker) — é trabalho do Marco, tem custo.
- **Margem de mensagem:** desenhe as cadências como **Utilidade**, não Marketing. Um
  blast de Marketing mal calibrado come a margem (10x mais caro).

## Escala operacional (o que não pode virar espaguete)

- **Um template versionado**, instâncias derivam dele. Melhorou o template → propaga
  pras instalações (com cuidado e teste).
- **Monitor de chips** ligado (o chip grátis é frágil, cap 100/dia, risco de ban).
- **Observabilidade:** logar execuções, medir taxa de resposta ao proativo e
  escalonamentos por cliente — é o painel que prova valor e pega agente quebrado.
- **Gestão no ClickUp** (padrão NEXUS): cada instalação/migração como tarefa com dono
  (Marco backend, Cayan/Jennifer comercial) e KPI.
