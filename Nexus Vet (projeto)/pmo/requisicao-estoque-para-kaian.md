# Requisição — Módulo de Estoque

> Para: **Kaian**
> De: Claude + Rodrigo
> Data: 20/jul/2026
> Prioridade: **🔴 BLOQUEANTE PRO PILOTO**

---

## 🎯 O Que É

Sistema de gestão de estoque: medicamentos, vacinas, materiais que a clínica compra e usa nos atendimentos.

**Por que é crítico?** SimplesVet, Vetus — TODOS têm estoque. Sem ele, perdemos pra concorrência direto no piloto.

---

## 📊 Status Atual vs Necessário

| Aspecto | Agora | Necessário | Gap |
|---|---|---|---|
| Completude vs SimplesVet | 80% | 100% | ⬅️ ESTOQUE |
| Completude vs Vetus | 70% | 100% | ⬅️ ESTOQUE + NF-e |
| Diferencial (IA + Reativação) | ✅ 100% | ✅ 100% | ✅ PRONTO |

---

## ✨ Funcionalidades (Priorizadas)

### **Tier 0 — Must-Have (Sprint 1-2, 2 semanas)**
- ✅ Cadastrar medicamento (nome, categoria, lote, validade, estoque, preço)
- ✅ Ver estoque completo (lista com filtros: vencidos, reposição, ok)
- ✅ Editar/deletar item
- ✅ Registrar movimento (entrada, saída, ajuste, perda, vencimento)
- ✅ Alertas: vencidos + reposição + vence em 30 dias
- ✅ Dashboard: widget com alertas
- ✅ Integração com atendimento: usar medicamento reduz estoque automaticamente

### **Tier 1 — Nice-to-Have (Sprint 3+, opcional)**
- Sugestão de compra automática
- Histórico de movimentos por item
- Relatório de estoque por fornecedor
- Sync com fornecedor (API aberta)

---

## 📋 Escopo Técnico

### Data Model
- `inventory` table (50 linhas SQL)
- `inventory_movements` table (auditoria)
- 3 views (vencidos, reposição, vencimento próximo)

### Backend
- 6 mutations (criar, editar, deletar, registrar movimento, usar em atendimento, sugerir compra)
- 3 queries (carregar estoque com alertas, histórico, sugestão)

### Frontend
- 1 nova aba "Estoque"
- 4 modals (novo item, editar, registrar movimento, sugestão de compra)
- 1 widget no Dashboard
- Integração em FormAtendimento

---

## ⏱️ Timeline

| Sprint | Foco | Semanas | Entrega |
|---|---|---|---|
| **Sprint 1** | Database + Mutations | 1 | Backend pronto |
| **Sprint 2** | Queries + UI | 1 | Telas funcionando (modo demo) |
| **Sprint 3** | Integração + Dashboard | 1 | Estoque pronto pro piloto |
| **TOTAL** | | **3 semanas** | **MVP completo** |

**Timeline realista:**
- Se: 1 dev = 3 semanas
- Se: 3 devs em paralelo = 1 semana
- Se: Você quer AGORA = começa segunda-feira

---

## 💰 ROI — Por Que Vale a Pena

| Cenário | Sem Estoque | Com Estoque |
|---|---|---|
| Piloto com SimplesVet | ❌ Perdemos | ✅ Paridade |
| Competir em completude | ❌ 80% | ✅ 100% |
| Vender premium (R$ 859) | ❌ Fraco argumento | ✅ "Temos tudo" |
| Crescer pra tier 2 | ❌ Bloqueado | ✅ Desbloqueado |

**Sem Estoque**: Kaian perde piloto pra SimplesVet.
**Com Estoque**: Piloto é nosso (+ Bia + reativação = diferenciais).

---

## 🚀 Decisão Necessária

**Opção A: Implementar Agora (Recomendado)**
- Começa segunda-feira
- Sprint 1-3 = 3 semanas
- Piloto começa **15/agosto** com Estoque + IA + Reativação
- Vendemos premium (R$ 859) sem "mas não temos estoque"

**Opção B: Pular e Voltar Depois**
- Piloto sem estoque
- Competidor diz "SimplesVet tem estoque, NEXUS não"
- Refazer isso depois = custo 2x

---

## ✅ Recomendação

**🎯 Implementar AGORA.** É a peça que falta pra ser "tão completo quanto SimplesVet" + nossos diferenciais (Bia + reativação).

---

## 📎 Documentação Completa

Roteiro técnico pronto: [`stack/roteiro-modulo-estoque.md`](../stack/roteiro-modulo-estoque.md)

Contém:
- SQL completo (schema + views)
- UI mockups (5 telas)
- Backend (mutations + queries)
- Sprint by sprint breakdown
- Demo data
- Checklist final

---

## 🎬 Próximo Passo

Você fala "go", a gente começa segunda-feira com Sprint 1 (database + mutations).

