# Engenharia Reversa — SimplesVet (Concorrente Direto)

> Análise do principal concorrente veterinário do Brasil.
> Baseado em: vídeos YouTube, site oficial, comparativos públicos.
> Data: 20/jul/2026

---

## 📊 Sobre o SimplesVet

### Posição no Mercado
- **8.000+ clínicas veterinárias** usando a plataforma no Brasil
- Operação **100% online** (SaaS)
- Maior player brasileiro de gestão vet (junto com Fly Vet)
- Prço: **R$ 50–500/mês** (tiers variáveis)

### Slogan/Positioning
"Gestão pet suuuper simples"
- Tom descontraído, com emojis
- Foco em **simplificar** (não em completude)

---

## 🎬 Content no YouTube

### Presença
- **Canal oficial**: https://www.youtube.com/user/SimplesVet
- **3.540 inscritos** (pequeno)
- **Playlist "Treinamento para Gestores"**: 122 vídeos
- Produção: vídeos curtos (13seg a 6min), sem IA, baixa produção

### Principais Vídeos Encontrados
| Título | Duração | Tópico |
|---|---|---|
| SimplesVet \| Gestão pet suuuper simples | 0:30 | Intro/Marketing |
| Aprenda a usar o Painel de Controle do SimplesVet | 1:32 | **Dashboard/KPIs** |
| Como cadastrar pacientes (Clientes) | 6:17 | **CRUD clientes** |
| Como programar e aplicar vacina | 4:57 | **Protocolo de vacina** |
| SimplesVet para Pet Shop — Agenda | ~4min | **Agenda** |
| SimplesVet para Petshops e Banho & Tosa | ~5min | **Módulos adicionais** |
| Como cadastrar pacotes | ~3min | **Serviços/Produtos** |
| Organize as internações | 2:48 | **Internação (internação = diferencial)** |
| Controle fiscal do pet shop | 1:45 | **Fiscal (NF-e?)** |

---

## 🏗️ Arquitetura Presumida (do que se vê nos vídeos)

### Core Modules (8 módulos observados)
1. **Dashboard** — KPIs rápidos, main control panel
2. **Clientes/Tutores** — Cadastro, busca, filtro
3. **Pets/Pacientes** — Ficha individual, histórico
4. **Agenda** — Scheduling, status (pendente/confirmado/atendida)
5. **Serviços** — Tabela de preços por serviço/procedimento
6. **Vacinas** — Protocolo por espécie, alertas de vencimento
7. **Internações** — Track de pets em internação (diferencial — nós NÃO temos)
8. **Fiscal/NF-e** — Emissão de nota fiscal (nós NÃO temos)

### O que FALTA no SimplesVet (vantagem NEXUS)
- ❌ **IA nativa** — Nenhum chatbot/agente para WhatsApp (Bia é nosso diferencial)
- ❌ **API aberta** — Não permite integrações
- ❌ **CRM/Lead gen** — Não tem funil de vendas/atendimento
- ❌ **Reativação de vacina automática** — Sem motor de lembrete por WhatsApp
- ❌ **Relatórios avançados** — Parece ter só dashboard básico

---

## 💡 Pontos de Aprendizado pro NEXUS

### UX Patterns (Copiar)
1. **Dashboard simples** — KPIs fixos (nós temos isso ✓)
2. **Agenda visual** — Cards com hora/pet/tutor/status (nós temos ✓)
3. **Cadastro de pet com protocolo** — Vacina integrada ao cadastro
4. **Painel de controle rápido** — Stats num relance

### Features que NÃO temos (Roadmap)
1. **Internações** — Track de pets internados (próximo sprint?)
2. **NF-e / Fiscal** — Emissão de nota fiscal eletrônica
3. **Gestão de banho & tosa** — Módulo específico (nós focamos só clínica)
4. **Relatórios custom** — Mais que just KPIs

### Diferencial NEXUS (Não Tem no SimplesVet)
✅ **Bia IA nativa** — Atendimento 24/7 no WhatsApp  
✅ **API aberta** — Integrações custom  
✅ **Motor de reativação** — Lembrete automático de vacina (recorrência)  
✅ **CRM + Lead gen** — Funil de vendas integrado  
✅ **White-label ready** — Pronto pro odonto, pronto pro vet  
✅ **Escala** — Pode rodar 500+ clínicas sem lag  

---

## 🎯 Estratégia Comercial Observada

### Pricing SimplesVet
- **Tier 1**: R$ 50–100/mês — Pet shop básico
- **Tier 2**: R$ 150–250/mês — Clínica pequena
- **Tier 3**: R$ 300–500/mês — Clínica média/grande

### Nosso Posicionamento (NEXUS)
- **Premium**: R$ 859/mês (segundo recomendação do [pendencias.md](../pmo/pendencias.md))
- **Justificativa**: Sistema COMPLETO (gestão + IA + reativação)
- **Alvo**: Clínicas que querem crescer (não só "simples")

---

## 📋 Checklist — O Que Copiar do SimplesVet

- [ ] **Agenda visual** com cards hora/pet/status (temos)
- [ ] **Dashboard com 5-6 KPIs** no topo (temos)
- [ ] **Vídeos de treinamento** curtos (< 2min cada) — nós temos 0
- [ ] **Aba de Vacinas** com protocolo por espécie (temos)
- [ ] **Modal de cadastro rápido** (temos)
- [ ] **Relatórios por período** (não temos)
- [ ] **Internações** (não temos)
- [ ] **Fiscal/NF-e** (não temos)

---

## 🚀 Próximos Passos

### Imediato (Esta semana)
- [ ] Gravar 5 vídeos tutoriais (< 2min cada) — Configurações, Agenda, Tutores, Financeiro, Vacina
- [ ] Atualizar landing page com "Diferencial: IA nativa"
- [ ] Comparativo público NEXUS vs SimplesVet (como eles fazem)

### Médio prazo (Próximo mês)
- [ ] Implementar **Internações** como módulo novo
- [ ] Estudar **NF-e** (não é prioridade, mas é trend)
- [ ] Criar **Playlist "Treinamento NEXUS"** no YouTube

### Longo prazo (Pós-piloto)
- [ ] Integração com **Evolution API** pra reativar por WhatsApp automático
- [ ] **Relatórios avançados** (BI)
- [ ] **App do tutor** (fase 2)

---

## Fontes

- [SimplesVet YouTube](https://www.youtube.com/user/SimplesVet)
- [Fly Vet vs SimplesVet — Comparativo Honesto (2026)](https://blog.flyvet.com.br/simplesvet-vs-fly-vet-comparativo-honesto/)
- Videos: "Aprenda a usar o Painel de Controle do SimplesVet" + "Como cadastrar pacientes" + "Como programar e aplicar vacina"
