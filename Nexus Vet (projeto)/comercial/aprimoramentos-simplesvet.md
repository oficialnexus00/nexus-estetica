# Aprimoramentos — o que o SimplesVet tem que o NEXUS Vet ainda não tem

> Missão: olhar analítico sobre o SimplesVet (líder com anos de estrada) para
> **paridade até o detalhe** e, onde der, **superar**. Reproduzimos funcionalidade
> e fluxo — **nunca** arte/texto/código literal (regra do HANDOFF).
> Data: 22/jul/2026.

## ⚠️ Nota de método (importante)

Este ambiente de dev **não tem acesso de rede ao site do SimplesVet** (a política
de rede recusa a saída — `403` no túnel para `simples.vet`). Então esta lista foi
montada a partir de:

1. **Estado real do nosso sistema hoje** — Fases 0–5 concluídas (conheço o código).
2. **Varredura anterior da conta trial** (o inventário dos 19 módulos no roteiro).
3. **Pesquisa pública** — páginas de funcionalidades e central de ajuda do SimplesVet.

Os itens marcados **🔍 verificar** dependem de ver a conta ao vivo (Rodrigo grava a
tela / manda prints, ou abrimos a política de rede do ambiente) para pegar o
comportamento no nível de campo. O resto está confirmado por fonte pública.

---

## ✅ Onde já EMPATAMOS ou GANHAMOS (não regredir)

- **Atendimento clínico / Pet 360** — linha do tempo, peso c/ gráfico, patologia,
  documentos por modelo, protocolos por pet. (paridade)
- **Vendas / PDV** — PDV, orçamentos, caixa, saldo, ranking, lista de preços. (paridade)
- **Comissionamento** — % por profissional, apuração, extrato PDF. (paridade)
- **Internação** — boxes/ocupação, parâmetros clínicos, aprazamento, alta→financeiro. (paridade)
- **Inteligência/BI** — produtividade, vendas por item, clientes, sazonalidade, export CSV. (paridade)
- **Motor de Reativação automático + IA Bia nativa no WhatsApp** — **diferencial nosso, sem paralelo lá.**
- **API aberta** — **único no mercado** (tese central).
- **Dashboard com lente Clínica** — visão que eles não têm.

---

## 🔴 TIER 1 — Fechar detalhes de módulos que JÁ TEMOS

> Baixo/médio esforço, alto retorno de paridade. É aqui que "passou despercebido".

### Internação
- [ ] **Modelos de prescrição** — salvar padrões de tratamento por quadro clínico e
      reaproveitar (ajustando dose/peso). Hoje aprazamos, mas sem biblioteca de modelos.
- [ ] **Prescrição por tipo**: procedimento · medicamento · **fluidoterapia**
      (hoje só medicamento). 🔍 verificar campos exatos.
- [ ] **Histórico de internações** por pet (aba dedicada, hoje é a lista "Histórico").

### Inteligência / BI (eles são fortes aqui)
- [ ] **Produtividade por turno e por dia da semana** (não só por profissional).
- [ ] **Comparativo mês a mês** do desempenho de vendas por colaborador.
- [ ] **Análise de cross-sell / oportunidade perdida** — ex.: "vendeu castração mas
      não vendeu exame complementar"; quem vende os **produtos recomendados**.
- [ ] **Descontos concedidos por dia / por colaborador** (temos o total; falta o corte).

### Estoque avançado
- [ ] **Compras / Pedido de compra** (entrada por nota do fornecedor).
- [ ] **Inventário** (contagem/ajuste em lote).
- [ ] **Grupos de produtos** · **Marcas** · **Produtos recomendados**.
- [ ] **Análise de expirações** e **itens a repor** como tela/relatório (temos alerta pontual).

### Financeiro+
- [ ] **Múltiplas contas e cartões** · **Conciliação de cartões**.
- [ ] **Fornecedores** (cadastro) · **Categorias / plano de contas**.

### Agenda
- [ ] **Visão semanal** (hoje só o dia) · **Escala de plantão**.

### Vendas
- [ ] **Pacotes** (combo de serviços) — adiado na Fase 2.

### Cadastros de apoio
- [ ] Cadastros gerenciáveis: **Espécies · Raças · Pelagens · Patologias**,
      **Atributos/Referências de exames**, **Origem dos clientes**.

---

## 🟡 TIER 2 — Módulos inteiros novos (onde dá pra SUPERAR via Bia)

### Pesquisa de satisfação / NPS
Deles: envio agendado (e-mail/SMS), coleta automática, **reaplicação em 3/6/12 meses**,
tela de acompanhamento cronológica com filtros (**promotores / passivos / detratores**).
👉 **Superar:** rodar o NPS pela **Bia no WhatsApp** (resposta muito maior que e-mail/SMS),
com o painel de promotores/detratores no nosso BI.

### Portal do tutor
Deles: app/portal com carteira de vacina, histórico, resultado de exame,
agendamento self-service, lembretes, ranking de melhores clientes.
👉 **Superar:** entregar isso como **conversa com a Bia** + link, sem forçar o tutor a
baixar app. (Decidir escopo com o Rodrigo.)

### Mensagens (tela de gestão)
Deles: config de **automáticas** (aniversário do pet e do tutor, retorno, pós-consulta),
**histórico de envios**, créditos/consumo.
👉 Nosso disparo via Bia já é superior; falta a **tela de gestão/histórico** dessas réguas.

### Consultas
- [ ] **Aniversários** (lista + parabéns automático via Bia).
- [ ] **Log de auditoria** (quem fez o quê).

---

## 🟢 TIER 3 — Avaliar (decisão estratégica antes de investir)

- [ ] **Fiscal / NF-e** — módulo adicional deles, **regulado** (SEFAZ). Avaliar
      integração com parceiro, não construir do zero.
- [ ] **Site builder** — provável **fora da tese** (nossa presença é via Bia).

---

## Ordem sugerida (próximos sprints)

1. **Estoque avançado** + **Financeiro+** (fecham dois módulos que já temos).
2. **BI turno/dia/cross-sell** (barato e impressiona na demo — eles vendem muito isso).
3. **Internação: modelos de prescrição + fluidoterapia**.
4. **Agenda semanal + escala**.
5. **NPS via Bia** (diferencial) → **Aniversários/Log**.
6. **Portal do tutor** e **Fiscal** — decisão do Rodrigo.

## Fontes públicas consultadas (22/jul/2026)
- simples.vet/funcionalidades · /funcionalidades/internacao · /funcionalidades/nps
  · /funcionalidades/produtividade-dos-colaboradores
- suporte.simples.vet — coleções de Internação, Mensagens, NPS
