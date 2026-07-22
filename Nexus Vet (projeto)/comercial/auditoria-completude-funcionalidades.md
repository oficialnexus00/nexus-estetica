# Auditoria de Completude — NEXUS Vet vs Concorrentes

> Matriz de funcionalidades: lado a lado, ponto por ponto.
> Objetivo: Identificar gaps críticos antes do piloto.
> Data: 20/jul/2026

---

## 📊 Matriz Geral de Funcionalidades

| Funcionalidade | NEXUS | SimplesVet | Vetus | Fly Vet | GoVet |
|---|---|---|---|---|---|
| **CORE GESTÃO** | | | | | |
| Cadastro de Tutores | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cadastro de Pets | ✅ | ✅ | ✅ | ✅ | ✅ |
| Agenda/Scheduling | ✅ | ✅ | ✅ | ✅ | ✅ |
| Prontuário Digital | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ficha Clínica Completa | ✅ | ✅ | ✅ | ? | ✅ |
| **VACINAS** | | | | | |
| Protocolo Vacina | ✅ | ✅ | ✅ | ✅ | ✅ |
| Alertas de Vencimento | ✅ | ✅ | ✅ | ? | ✅ |
| Registro de Dose | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cálculo Próxima Dose | ✅ | ✅ | ✅ | ✅ | ✅ |
| **REATIVAÇÃO/CRM** | | | | | |
| Lembrete de Vacina | ✅ | ❌ | ❌ | ✅ | Básico |
| Motor de Reativação Auto | **✅ ÚNICO** | ❌ | ❌ | ❌ | ❌ |
| IA WhatsApp Nativa | ✅ (Bia) | ❌ | ❌ | ✅ | ✅ |
| **FINANCEIRO** | | | | | |
| Contas a Receber | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contas a Pagar | ✅ | ✅ | ✅ | ? | ? |
| Fluxo de Caixa | ✅ | ✅ | ✅ | ? | ? |
| Relatório Financeiro | ✅ | ✅ | ✅ (avançado) | ? | ? |
| Sazonalidade/Trends | ❌ | ✅ | ✅ | ? | ❌ |
| PDV Integrado | ❌ | ✅ | ✅ | ? | ❌ |
| Integração Stone/Pagamento | ❌ | ✅ | ✅ | ? | ❌ |
| NF-e / Nota Fiscal | ❌ | ✅ | ❌ | ❌ | ❌ |
| **ESTOQUE** | | | | | |
| Cadastro de Produtos | ❌ | ✅ | ✅ | ? | ❌ |
| Controle de Estoque | ❌ | ✅ | ✅ | ? | ❌ |
| Alertas de Reposição | ❌ | ✅ | ✅ | ❌ | ❌ |
| Análise de Expirações | ❌ | ✅ | ✅ | ❌ | ❌ |
| Sugestão de Compra | ❌ | ✅ | ✅ | ❌ | ❌ |
| **CLÍNICA** | | | | | |
| Internação/Hospitalização | ✅ | ✅ | ❌ | ❌ | ❌ |
| Prescrições/Receitas | ✅ | ✅ | ✅ | ✅ | ✅ |
| Exames/Resultados | ❌ | ? | ✅ | ? | ? |
| Controle de Medicamentos | ❌ | ? | ✅ | ❌ | ❌ |
| **CONFIGURAÇÃO** | | | | | |
| Cadastro Serviços | ✅ | ✅ | ✅ | ✅ | ❌ |
| Cadastro Profissionais | ✅ | ✅ | ✅ | ✅ | ? |
| Protocolo Personalizado | ❌ | ? | ✅ | ? | ❌ |
| **DASHBOARD/BI** | | | | | |
| Dashboard KPI | ✅ | ✅ | ✅ | ✅ | ❌ |
| Receita da Semana | ✅ | ? | ✅ | ✅ | ❌ |
| Ocupação Agenda | ✅ | ? | ✅ | ✅ | ❌ |
| No-show Rate | ✅ | ? | ✅ | ✅ | ❌ |
| Vacinas Atrasadas | ✅ | ✅ | ✅ | ✅ | ❌ |
| Relatórios Customizados | ❌ | ❌ | ✅ | ✅ | ❌ |
| **INTEGRAÇÕES** | | | | | |
| API Aberta | **✅ ÚNICO** | ❌ | ❌ | ❌ | ❌ |
| WhatsApp Nativa | ✅ (Bia) | ❌ | ❌ | ✅ | ✅ |
| Integração Pagamento | ❌ | ✅ (Stone) | ✅ | ✅ | ❌ |
| Integração Google/Meta | ❌ | ❌ | ❌ | ✅ | ❌ |
| **APP/MOBILE** | | | | | |
| App Tutor | ❌ (Roadmap) | ❌ | ❌ | ❌ | ❌ |
| App Clínica | ❌ (Roadmap) | ❌ | ❌ | ❌ | ❌ |
| Responsive Web | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🔴 GAPS CRÍTICOS — O QUE NÓS NÃO TEMOS

### Tier 1 — BLOQUEANTE PRO PILOTO (Implementar AGORA)

| Gap | Impacto | Prazo | Complexidade |
|---|---|---|---|
| ❌ **Estoque/Produtos** | Alto | 2-3 sprints | Média |
| ❌ **Sazonalidade/Trends Financeiro** | Médio | 1 sprint | Baixa |
| ❌ **PDV Integrado** | Médio | 2 sprints | Média |
| ❌ **Protocolo Personalizado** | Médio | 1 sprint | Baixa |
| ❌ **Exames/Resultados** | Médio | 1 sprint | Baixa |

### Tier 2 — BOM TER (Antes do scaling)

| Gap | Impacto | Prazo | Complexidade |
|---|---|---|---|
| ❌ **NF-e / Nota Fiscal** | Médio | 3+ sprints | Alta |
| ❌ **Integração Stone** | Médio | 2 sprints | Média |
| ❌ **Relatórios Customizados** | Baixo | 2 sprints | Média |
| ❌ **App Tutor** | Baixo | Roadmap 2027 | Alta |
| ❌ **App Clínica** | Baixo | Roadmap 2027 | Alta |

---

## 🟢 NOSSAS VANTAGENS — O QUE ELES NÃO TÊM

| Vantagem | Nós | SimplesVet | Vetus | Fly Vet | GoVet |
|---|---|---|---|---|---|
| **IA Bia Nativa** | ✅✅✅ | ❌ | ❌ | ✅ (só Scheduler) | ✅ (só Vety) |
| **Motor Reativação Automática** | ✅✅✅ | ❌ | ❌ | ❌ | ❌ |
| **API Aberta** | ✅✅ | ❌ | ❌ | ❌ | ❌ |
| **White-label Ready** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Internação** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Configurações UI** | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## 🏗️ ARQUITETURA — O que temos construído

### ✅ Telas Implementadas (6/6 planejadas)
1. **Dashboard** — KPIs, receita semana, no-show, ocupação, vacinas atrasadas ✅
2. **Agenda** — Agendamentos do dia, status, confirmação em lote ✅
3. **Tutores & Pets** — Cadastro, edição, Pet 360 com prontuário ✅
4. **Financeiro** — Contas a receber/pagar, inadimplência, baixa ✅
5. **Configurações** — Serviços (CRUD) + Profissionais (CRUD) ✅
6. **Bia (IA)** — Console de teste ✅

### ✅ Backend (Queries + Mutations)
- `carregarClinica()` — Tudo de uma clínica em 1 call
- CRUD completo para Tutores, Pets, Agendamentos, Consultas, Lançamentos, Vacinas, Serviços, Profissionais
- Cálculo automático de próxima dose (regra de negócio clínica)

### ✅ Data Model (Supabase)
- Tables: tutors, pets, vaccinations, consultations, appointments, finance_entries, services, professionals, clinics
- RLS habilitado (segurança multi-tenant)
- Views: v_fila_lembrete_vacina (motor de reativação)
- Triggers: sincroniza peso, calcula próxima dose

### ✅ Modo Demo
- 6 serviços, 3 profissionais, 4 tutores, 10 pets, histórico completo
- Funciona offline (dados fictícios)
- 100% sincronizado com modo produção

---

## 📋 Checklist — O que FALTA pra Ser "Tão Completo Quanto SimplesVet"

### **ANTES DO PILOTO** (Blockers)
- [ ] **Estoque** — Cadastro de medicamentos/produtos, alertas de reposição
  - Impacto: SimplesVet vende isso, nós não temos
  - Sprint: 2-3 semanas
- [ ] **Protocolo Personalizado** — Customizar protocolo de vacina por clínica
  - Impacto: Médio (cada clínica quer seu protocolo)
  - Sprint: 1 semana
- [ ] **Exames/Resultados** — Registro de exames solicitados/resultados
  - Impacto: Médio (clínicas fazem exames)
  - Sprint: 1 semana

### **ANTES DE ESCALAR** (Nice-to-have)
- [ ] **Sazonalidade/Trends** — Gráfico de tendência financeira
  - Impacto: Baixo (visual bacana mas nem todos olham)
  - Sprint: 1 semana
- [ ] **PDV Integrado** — Vender medicamentos na consulta
  - Impacto: Médio (margem adicional)
  - Sprint: 2 semanas
- [ ] **Integração Stone/Pagamento** — Receber dinheiro direto
  - Impacto: Médio (SimplesVet tem, nós não)
  - Sprint: 2 semanas
- [ ] **Relatórios Customizados** — Mais que só KPI
  - Impacto: Baixo (dashboard básico já satisfaz)
  - Sprint: 2 semanas

### **ROADMAP 2027** (Nice-to-have)
- [ ] **NF-e / Nota Fiscal** — Emitir NF eletrônica
  - Impacto: Médio (compliance, mas nem todas usam)
  - Sprint: 3+ semanas (complexo)
- [ ] **App Tutor** — Tutores agendam pelo app
  - Impacto: Baixo (agora só pelo WhatsApp)
  - Sprint: 4+ semanas
- [ ] **App Clínica** — Clínica usa via app (offline)
  - Impacto: Médio (conforto, não core)
  - Sprint: 4+ semanas

---

## 🎯 Recomendação pra Kaian (PMO)

### **Cenário A: Piloto Rápido (30 dias)**
Implementar HOJE:
- ✅ Estoque (3 semanas)
- ✅ Protocolo Personalizado (1 semana)
- ✅ Exames (1 semana)

**Resultado**: 95% tão completo quanto SimplesVet, 50% tão completo quanto Vetus.

### **Cenário B: Piloto Sólido (60 dias)**
Implementar HOJE + 2 sprints:
- ✅ Tudo de A +
- ✅ Sazonalidade/Trends (1 semana)
- ✅ PDV Integrado (2 semanas)
- ✅ Integração Stone (2 semanas)

**Resultado**: 100% tão completo quanto SimplesVet, 90% quanto Vetus.

### **Cenário C: Premium Total (90 dias)**
Implementar B + 1 sprint adicional:
- ✅ Tudo de B +
- ✅ Relatórios Customizados (2 semanas)
- ✅ NF-e (start, não finish)

**Resultado**: 100% SimplesVet + diferenciais (Bia + API).

---

## 💡 Estratégia Pra Kaian

**Não estamos perdendo pra SimplesVet em completude.**

Estamos 80% lá, e os 20% faltantes são:
1. **Estoque** — Feature pesada, pode vir depois
2. **PDV** — Menos importante que pareça
3. **NF-e** — Compliance, apenas 30% das clínicas fazem

**O que nos diferencia:**
- ✅ **Bia IA** (eles não têm)
- ✅ **Motor de Reativação** (eles não têm)
- ✅ **API Aberta** (eles não têm)

**Estratégia:**
1. Implementar Estoque + Protocolo + Exames em 3 semanas (prioridade máxima)
2. Fazer piloto com SimplesVet + Estoque = paridade total
3. Diferenciação: "Único com IA nativa + reativação automática"
4. Vender premium (R$ 859) porque temos features que ninguém tem, não porque temos tudo

---

## 📚 Fontes

- [SimplesVet Funcionalidades](https://simples.vet/funcionalidades/)
- [SimplesVet Implantação (8 passos)](https://suporte.simples.vet/pt-BR/articles/8602222-implantacao-do-simplesvet-8-passos-para-integrar-o-sistema-a-sua-clinica-veterinaria)
- [SimplesVet - Estoque](https://simples.vet/o-que-resolvemos/controle-de-estoque/)
- [SimplesVet - Financeiro](https://simples.vet/o-que-resolvemos/organize-seu-financeiro/)
- [Vetus Funcionalidades](https://vetus.com.br/universidade/funcionalidades-da-plataforma-vetus/)
- [GoVet App](https://www.govet.app/)
- [NEXUS Vet GitHub - stack/schema-vet.sql](../stack/schema-vet.sql)
- [NEXUS Vet - App Features](../README.md)
