# Roteiro de Paridade — SimplesVet → NEXUS Vet

> Objetivo: reproduzir, no nosso sistema, as funcionalidades **funcionais** do
> SimplesVet — eles têm 10+ anos validando o que a clínica veterinária precisa.
> Reproduzimos **funcionalidade e fluxo**; visual e código são nossos (sem cópia
> literal de texto/arte).
>
> **Base:** varredura completa da conta trial (usuário "kaian"), todos os 19 módulos
> e submenus mapeados em jul/2026. Este arquivo é a **checklist viva**.

**Legenda:** ✅ pronto · ⚠️ parcial · ❌ novo

---

## 🏁 Placar de paridade (atualizado jul/2026)

**Já empatamos ou ganhamos:** Painel (temos lente Clínica extra) · Atendimento
clínico/Pet 360 · Clientes · Financeiro (base + DRE) · Reativação com IA
(diferencial nosso, sem paralelo lá) · PDV básico.

**Falta pra igualar — módulos inteiros:**
1. ✅ ~~Comissionamento~~ (comissões + extratos) — **concluído**
2. ✅ ~~Internação~~ (internados, boxes, aprazamento, parâmetros, alta→lançamento) — **concluído**
3. ✅ ~~Inteligência/BI~~ (produtividade, vendas, clientes, sazonalidade, export CSV) — **concluído**
4. ❌ **Portal do tutor**
5. ❌ **Pesquisa de satisfação / NPS**
6. ❌ **Fiscal/NF-e** e **Site** (decisão do Rodrigo — regulado / fora da tese)

**Falta pra igualar — pedaços de módulos que já temos:**
- **Vendas:** conta-corrente do cliente · movimentos de caixa · ranking · pacotes · orçamentos · lista de preços
- **Estoque:** compras/pedido de compra · inventário · grupos · marcas · produtos recomendados
- **Financeiro:** múltiplas contas/cartões · conciliação de cartões · fornecedores
- **Agenda:** escala de plantão · visão semanal
- **Cadastros:** pelagens · atributos/referências de exames · origem dos clientes
- **Mensagens:** telas de config (automáticas de aniversário/retorno, histórico)
- **Consultas:** aniversários · log de auditoria

**Ordem de ataque:** fechar Vendas → Comissionamento → Internação → BI →
completar Estoque/Financeiro → menores (Aniversários, NPS, Portal) → Fiscal/Site (decisão).

---

## Método (o "passo a passo")

Por fase: **1) Mapear** (abrir o módulo no SimplesVet, capturar campos/telas) →
**2) Especificar** (registrar aqui) → **3) Construir** (nosso padrão, modo demo) →
**4) Testar** (preview, sem erro) → **5) Publicar** (Vercel + commit).
Uma fase por vez, fechada de ponta a ponta.

---

## Inventário completo do SimplesVet (19 módulos)

| Módulo | Submenus (funcionalidades reais) | Nós |
|---|---|---|
| **Painel de controle** | Dashboard gerencial | ✅ |
| **Atendimento clínico** | Pet 360: abas Histórico · Protocolos · Linha do tempo · Agenda · Vendas. Registros: Atendimento, Peso, Patologia, Documento, Exame, Fotos, Vacina, Receita, Observações, Vídeo, Internação. Painel Venda/Orçamentos lateral | ⚠️ |
| **Clientes** | Cadastro tutor + animais | ✅ |
| **Agenda** | Agenda · Escala (plantão) · Configuração | ⚠️ |
| **Vendas (PDV)** | Ponto de venda · Minhas vendas · Movimentos de caixa · Consulta vendas · Pacotes vendidos · Recebimentos · Lista de preços · Ranking de clientes · Saldo dos clientes · Formas de recebimento · Modelo de orçamento · Modelo de demonstrativo · Configuração | ❌ |
| **Comissionamento** | Comissões em aberto · Extratos | ❌ |
| **Inteligência (BI)** | Produtividade · Vendas | ✅ |
| **Consultas** | Vacinação · Aniversários · Log | ⚠️ |
| **Cadastros** | Espécies · Raças · Pelagens · Patologias · Tipos de atendimento · Vacinas · Exames · Atributos de exames · Referências de exames · Modelo de receita · Origem dos clientes · Modelo de documento | ⚠️ |
| **Internação** | Animais internados · Mapa de Execução (aprazamento) · Histórico · Parâmetros clínicos · Modelos de prescrição · Boxes (leitos) | ✅ |
| **Estoque e serviços** | Produtos e Serviços · Compras · Outras saídas · Análise de estoque · Inventário · Pedido de compra · Grupos de Produtos · Marcas · Produtos recomendados | ⚠️ |
| **Financeiro** | Lançamentos · Conciliação de cartões · Contas a pagar · Demonstrativo · Fluxo de caixa · Contas e cartões · Categorias · Fornecedores · Formas de pagamento | ✅/⚠️ |
| **Beta** | Recursos novos deles | — |
| **Configuração** | Dados da clínica, usuários, logotipo, etc. | ⚠️ |
| **Fiscal** | Emissão de NF-e/NFS-e | ❌ (avaliar) |
| **Site** | Construtor de site | ❌ (avaliar) |
| **Portal SimplesPet** | Portal do tutor (autoatendimento) | ❌ |
| **Mensagens** | Histórico · Créditos e consumo · **Mensagens automáticas** · Campanha SMS · E-mails inválidos | ✅ (nosso via Bia é superior) |
| **Pesquisa de satisfação** | NPS pós-atendimento | ❌ |

---

## Fase 0 — Baseline (o que já temos) ✅

Dashboard (Gerencial+Clínico) · Agenda (dia) · Tutores & Pets (Pet 360 simples,
prontuário, carteira de vacina) · Financeiro (Resumo, DRE, Análise, receber/pagar/
atraso) · Estoque · Exames · Reativação (Bia) · Configurações (serviços,
profissionais, protocolo de vacinas) · Recibos/comprovantes PDF · Bia (placeholder).

---

## Fase 1 — Atendimento clínico completo (Pet 360 nível SimplesVet) ✅ CONCLUÍDA (jul/2026)

> O coração do sistema. Elevamos nosso Pet 360 ao nível do deles.

- [x] Registros no histórico (cada um com data/autor):
  - [x] **Atendimento** (tipo configurável ✅ + anamnese, exame físico, sinais vitais — já era mais completo que o deles)
  - [x] **Peso** (com gráfico de evolução) ✅
  - [x] **Patologia** (diagnóstico, sugestões via datalist) ✅
  - [x] **Documento/Receita** (a partir de modelos, com marcadores preenchidos) ✅
  - [x] **Exame** (módulo próprio, integrado à linha do tempo) ✅
  - [x] **Vacina** (aplicação integrada à linha do tempo) ✅
  - [x] **Observações** (nota livre) ✅
- [x] **Protocolos** (protocolos vacinais aplicáveis ao pet + adesão) ✅
- [x] **Linha do tempo** (visão cronológica de tudo) ✅
- [x] Impressão de documentos (via `lib/imprimir`) ✅
- ⏭️ **Fotos/Vídeo** (mídia do paciente) — adiado (precisa de storage; sem valor no modo demo)

## Fase 2 — Vendas / PDV ✅ CONCLUÍDA (jul/2026)

- [x] **Ponto de venda**: comanda com produtos (estoque) + serviços, cliente/pet, desconto, quantidade ✅
- [x] **Formas de recebimento**; baixa automática no estoque ✅
- [x] Gera lançamento no Financeiro; cupom de venda (PDF) ✅
- [x] **Vendas realizadas** (histórico + reimpressão de cupom) ✅
- [x] **Ranking de clientes** (quem mais compra) ✅
- [x] **Lista de preços** (serviços + produtos) ✅
- [x] **Saldo/conta-corrente do cliente** (a receber por cliente + dar baixa) ✅
- [x] **Movimentos de caixa** (abrir/fechar, suprimento/sangria, saldo) ✅
- [x] **Orçamentos** (salvar do PDV, PDF, converter em venda, recusar) ✅
- ⏭️ **Pacotes** (combo de serviços) — adiado (menor prioridade; fazer junto de Cadastros)

## Fase 3 — Comissionamento ✅ CONCLUÍDA (jul/2026)

- [x] Config de **% por profissional** (editável na tela) ✅
- [x] **Cálculo** a partir das vendas atribuídas ao profissional (select no PDV) ✅
- [x] Apuração por período + resumo (total a pagar / base) ✅
- [x] **Extrato** por profissional/período (PDF) ✅
- ⏭️ % por serviço/produto específico — adiado (v1 usa % por profissional; suficiente)

## Fase 4 — Internação ✅ CONCLUÍDA (jul/2026)

- [x] **Animais internados** (painel dos internados no momento, com dias, box, últimos sinais e alerta de medicação pendente) ✅
- [x] **Boxes** (leitos/baias) e **ocupação** (mapa com livre/ocupado, taxa) ✅
- [x] Ficha de internação + **Parâmetros clínicos** (aferições periódicas: T/FC/FR/mucosas/obs, em linha do tempo) ✅
- [x] **Mapa de Execução** (aprazamento de medicação por horário — gera horários das próximas 24h pelo intervalo, marca aplicado) ✅
- [x] Alta → **gera lançamento no Financeiro** (diárias × valor da diária, a receber) ✅
- ⏭️ **Modelos de prescrição** — adiado (fazer junto de Cadastros/modelos)
- ⏭️ **Histórico de internações** detalhado — v1 mostra encerradas na aba Histórico; aprofundar depois

## Fase 5 — Inteligência / Relatórios ✅ CONCLUÍDA (jul/2026)

- [x] **Produtividade** (faturamento + atendimentos + ticket médio por profissional, ranking + tabela) ✅
- [x] **Vendas** (por serviço/produto, ranking de rentabilidade, % do total, descontos) ✅
- [x] **Clientes** — novos × recorrentes, base ativa/inativa, **sazonalidade** (a receber por mês, 6 meses), origem ✅
- [x] **Exportação CSV** (produtividade, vendas por item, base de clientes — abre no Excel pt-BR) ✅
- ⏭️ Comparativo entre clínicas / drill-down por período custom — adiado (v1 usa a clínica selecionada)

## Fase 6 — Cadastros de apoio + Consultas ⚠️

- [ ] Cadastros: Espécies, Raças, Pelagens, Patologias, Tipos de atendimento,
      Vacinas, Exames (+Atributos/Referências), Origem dos clientes
- [ ] Modelos: Receita, Documento, Orçamento, Demonstrativo
- [ ] Consultas: **Vacinação** (já ≈ Reativação), **Aniversários** (parabéns via Bia), **Log** (auditoria)

## Fase 7 — Estoque avançado ⚠️→❌

> Nosso estoque é bom, mas o deles é mais fundo. Complementar.

- [ ] **Compras** e **Pedido de compra** (entrada por nota do fornecedor)
- [ ] **Inventário** (contagem/ajuste em lote)
- [ ] **Análise de estoque** · **Grupos de Produtos** · **Marcas** · **Produtos recomendados**

## Fase 8 — Financeiro (complementos) ⚠️

- [ ] **Contas e cartões** (múltiplas contas) · **Conciliação de cartões**
- [ ] **Categorias** (plano de contas) · **Fornecedores**
- [ ] **Fluxo de caixa** projetado (temos base na Análise)

## Fase 9 — Relacionamento ❌

- [ ] **Mensagens automáticas** (aniversário, retorno, pós-consulta) — via Bia
- [ ] **Portal do tutor** (carteira, histórico, agendamento self-service)
- [ ] **Pesquisa de satisfação / NPS** pós-atendimento

## Fase 10 — Avaliar (decisão estratégica antes de investir) ⚠️

- [ ] **Fiscal / NF-e** — regulado (SEFAZ). Avaliar parceiro/integração, não do zero.
- [ ] **Site builder** — provável fora da tese (NEXUS entrega presença via Bia).

---

## Ordem sugerida

1. Atendimento clínico → 2. Vendas/PDV → 3. Comissionamento → 4. Internação →
5. Inteligência → 6. Cadastros+Consultas → 7. Estoque avançado → 8. Financeiro+ →
9. Relacionamento → 10. Fiscal/Site (decisão).

> **Próximo passo:** Fase 1 — abrir "Atendimento clínico" no SimplesVet, detalhar os
> campos de cada registro (Atendimento, Peso, Patologia…) e começar a construir.
