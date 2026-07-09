# Mapa do Capim — o que a clínica do Rodrigo usa hoje

> Levantado a partir de prints do Capim (sistema atual do Rodrigo), jul/2026.
> Serve pra: (a) espelhar no piloto o que ele já usa, (b) decidir o que fica
> fora do MVP, (c) municiar a venda (o que o Capim faz mal/cobra à parte).
> ⚠️ Só estrutura de telas — nenhum dado real de paciente foi copiado.

## Estrutura de navegação do Capim

- **Início** — cards de atalho (Agendar, Administrar paciente, Financiamento
  Capim, Indique & Ganhe, Maquininha Capim, Assistente Capim com I.A., Link de
  agendamento) + "Seu dia hoje" (agenda) + "Controle Financeiro" (donut)
- **Atendimento:** Agenda · Pacientes · Documentos · Simulador de vendas ·
  Meios de pagamento
- **Gestão financeira:** Controle financeiro · Conciliação · Comissões
- **Comunicação:** Campanhas · Central de relacionamento
- **Estoque:** Controle de estoque · Solicitação de prótese
- **Relatórios** (Visão geral, Agenda, Fluxo de caixa, Distribuição de receita)
- Rodapé: Sugestão de melhorias · Indicações · Configurações

## Telas-chave (o coração do uso diário)

### Ficha clínica do paciente ⭐ (a mais importante)
Abas: **Ficha clínica · Anamnese · Evoluções · Orçamentos · Financeiro ·
Documentos · Arquivos · Consultas**. Centro da tela é o **odontograma**
(Permanente/Decídua, notação FDI 18–28 / 48–38), com "1 alerta de saúde",
"Ficha geral" (Procedimento / Dente / Estado / Ações → **+ Orçar**), painel de
Anotações e botão "Nova análise" (crédito, ligado ao financiamento).
→ **Replicado no piloto** em `app/src/views/FichaClinica.tsx`.

### Agenda
Grade de horário (colunas por dia, linhas 1h), linha vermelha do "agora".
→ Próximo a evoluir no piloto (hoje temos versão simples).

### Relatórios
KPIs (Receita gerada, Comparecimentos, Orçamentos) + relatórios de Visão geral,
Agenda, Fluxo de caixa, Distribuição de receita.
→ Nosso **Dashboard** já cobre o essencial com vantagem (feed da Patrícia, ROI).

## O que o Capim tem e a gente NÃO faz no MVP (decisão do Kaian)

- ❌ Financiamento Capim / Maquininha (é o core fintech deles — não replicar)
- ❌ Solicitação de prótese (kanban laboratório) — fase 2+
- ❌ Controle de estoque / EPI — fase 2+
- ❌ Comissões avançadas, Conciliação — fase 2+
- ❌ Simulador de vendas (ligado ao BNPL deles)

## Munição de venda (o que o Capim faz mal / a favor da NEXUS)

1. **Sem IA comercial de verdade** — tem "Assistente com I.A." e "Central de
   relacionamento", mas nada que qualifique, confirme e faça follow-up de
   orçamento sozinho no WhatsApp como a Patrícia.
2. **Orçamento nasce na ficha (+ Orçar) e morre ali** — ninguém corre atrás.
   Nosso "+ Orçar" joga direto no follow-up da Patrícia.
3. **Dashboard fraco** — "Você ainda não tem lançamentos :(". O nosso já mostra
   produção, no-show, ROI de ads e a Patrícia em ação.
4. **Fechado** — o Capim é caixa preta (empurra "migre seus dados" pra dentro
   dele, mas não abre API pra fora). NEXUS nasce com API pública.

## Próximos passos de espelhamento

- [ ] Evoluir a Agenda pro formato de grade de horário do Capim
- [ ] Aba "Evoluções" na ficha (evolução clínica assinada) — v1.1
- [ ] Simulador/link de agendamento público — avaliar
