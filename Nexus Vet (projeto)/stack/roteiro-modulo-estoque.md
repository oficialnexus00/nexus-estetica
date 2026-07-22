# Roteiro — Módulo de Estoque

> Especificação completa do sistema de estoque.
> Prazo: 3 semanas (1 sprint por layer).
> Data: 20/jul/2026

---

## 📋 Escopo

### O que é Estoque no Vet?

Medicamentos, vacinas, materiais de limpeza, alimentos que a clínica compra e usa nos atendimentos.

**Operação típica:**
1. Clínica compra 100 caixas de Amoxicilina → Lança no estoque
2. Veterinário usa 5 caixas em atendimentos → Estoque reduz pra 95
3. Quando chega 20 caixas → Alerta "reposição urgente"
4. Quando vence → Alerta "medicamento vencido"

### Diferenciais vs SimplesVet
- ✅ API aberta (deixa integrar com fornecedor)
- ✅ Alertas customizáveis (cada clínica decide seus limites)
- ❌ PDV integrado (fora de escopo deste sprint)

---

## 🗄️ Data Model (SQL)

### Nova Table: `inventory`

```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- Identificação
  nome TEXT NOT NULL,                          -- "Amoxicilina 500mg"
  codigo TEXT,                                 -- Código do fornecedor (opcional)
  categoria TEXT NOT NULL,                     -- "medicamento", "vacina", "material", "alimento"
  
  -- Quantidade
  quantidade_estoque INT NOT NULL DEFAULT 0,   -- Unidades em estoque agora
  quantidade_minima INT NOT NULL DEFAULT 5,    -- Reposição automática quando chega
  quantidade_maxima INT NOT NULL DEFAULT 100,  -- Limite máximo que cabe no almoxarifado
  
  -- Validade
  data_validade DATE,                          -- Quando vence
  lote TEXT,                                   -- Lote do fabricante (opcional)
  
  -- Fornecedor
  fornecedor_nome TEXT,                        -- "Fornecedor XYZ"
  fornecedor_contato TEXT,                     -- Telefone/email (opcional)
  
  -- Financeiro
  preco_custo DECIMAL(10,2),                   -- Quanto custou
  preco_venda DECIMAL(10,2),                   -- Preço de venda (opcional)
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(clinic_id, nome, lote)                -- Não deixa duplicar mesmo medicamento
);

-- Index pra performance
CREATE INDEX idx_inventory_clinic ON inventory(clinic_id);
CREATE INDEX idx_inventory_validade ON inventory(data_validade);
CREATE INDEX idx_inventory_quantidade ON inventory(quantidade_estoque);
```

### Nova Table: `inventory_movements` (Auditoria)

```sql
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  
  -- Movimento
  tipo TEXT NOT NULL,  -- "entrada", "saida", "ajuste", "perda", "vencimento"
  quantidade INT NOT NULL,
  motivo TEXT,         -- "compra", "uso_em_atendimento", "perda", "vencido"
  
  -- Referência cruzada
  atendimento_id UUID REFERENCES consultations(id),  -- Se foi usada em atendimento
  
  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_movements_inventory ON inventory_movements(inventory_id);
CREATE INDEX idx_movements_clinic ON inventory_movements(clinic_id);
```

### Views úteis

```sql
-- Produtos vencidos
CREATE VIEW v_inventory_vencidos AS
SELECT * FROM inventory
WHERE data_validade < NOW()::DATE AND ativo = true;

-- Produtos pra reposição
CREATE VIEW v_inventory_reposicao AS
SELECT * FROM inventory
WHERE quantidade_estoque <= quantidade_minima AND ativo = true;

-- Produtos perto de vencer (30 dias)
CREATE VIEW v_inventory_vencimento_proximo AS
SELECT * FROM inventory
WHERE data_validade BETWEEN NOW()::DATE AND (NOW() + INTERVAL '30 days')::DATE
  AND ativo = true;
```

---

## 🎨 UI — Telas Necessárias

### 1. **Estoque — List View** (Nova aba)

```
┌─────────────────────────────────────────────────────┐
│ Estoque                                  + Novo Item│
├─────────────────────────────────────────────────────┤
│ Filtrar: [Todos ▼] [Vencidos ▼] [Reposição ▼]     │
│                                                     │
│ ┌──────────────────────────────────────────────────┐
│ │ Amoxicilina 500mg              Editar | Deletar  │
│ │ Medicamento • Lote: 123456                       │
│ │ Estoque: 45 / Min: 10 / Max: 100  ⚠️ OK         │
│ │ Vence: 31/12/2026  •  Fornecedor: FarmaXYZ      │
│ │ Preço: R$ 2,50 (custo) | R$ 8,90 (venda)        │
│ └──────────────────────────────────────────────────┘
│
│ ┌──────────────────────────────────────────────────┐
│ │ Vacina V10                     Editar | Deletar   │
│ │ Vacina • Lote: 987654                            │
│ │ Estoque: 5 / Min: 10 / Max: 50  🔴 REPOSIÇÃO    │
│ │ Vence: 15/08/2026  •  Fornecedor: LaborXYZ      │
│ │ Preço: R$ 45,00 (custo) | R$ 90,00 (venda)      │
│ └──────────────────────────────────────────────────┘
│
│ ┌──────────────────────────────────────────────────┐
│ │ Álcool 70% (VENCIDO)           Editar | Deletar  │
│ │ Material • Lote: 555666                          │
│ │ Estoque: 20 / Min: 5 / Max: 30  ❌ VENCIDO      │
│ │ Vence: 01/06/2026  •  Fornecedor: -             │
│ │ Preço: R$ 0,50 (custo) | R$ 1,20 (venda)        │
│ └──────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────┘
```

### 2. **Novo Item** (Modal)

```
┌──────────────────────────────┐
│ Adicionar Item ao Estoque    │
├──────────────────────────────┤
│ Nome do Produto              │
│ [Amoxicilina 500mg_______]   │
│                              │
│ Categoria                    │
│ [Medicamento ▼]              │
│                              │
│ Código (opcional)            │
│ [123456____________]         │
│                              │
│ Lote                         │
│ [LOTE123___________]         │
│                              │
│ Data de Validade             │
│ [31/12/2026_______]          │
│                              │
│ Quantidade (unidades)        │
│ Atual: [45]  Mín: [10] Máx: [100] │
│                              │
│ Fornecedor                   │
│ [FarmaXYZ_________]          │
│ [11 99999-0000___] (opcional)│
│                              │
│ Preço de Custo (R$)          │
│ [2.50_____________]          │
│                              │
│ Preço de Venda (R$)          │
│ [8.90_____________]          │
│                              │
│  [Cancelar]  [Salvar Produto]│
└──────────────────────────────┘
```

### 3. **Editar Item** (Modal, pré-preenchido)

Mesmo que "Novo", mas com todos os campos já populados.

### 4. **Registrar Movimento** (Quick modal)

```
┌──────────────────────────────┐
│ Ajustar Estoque              │
│ Amoxicilina 500mg            │
├──────────────────────────────┤
│ Tipo de Movimento            │
│ [Entrada ▼] [Saída] [Ajuste] │
│                              │
│ Quantidade                   │
│ [5]                          │
│                              │
│ Motivo                       │
│ [Compra ▼]                   │
│                              │
│ Observação                   │
│ [____________________]       │
│                              │
│  [Cancelar]  [Registrar]     │
└──────────────────────────────┘
```

### 5. **Dashboard — Mini Widget** (Na Home)

```
┌─────────────────────────────────────┐
│ ⚠️ ALERTAS DE ESTOQUE              │
├─────────────────────────────────────┤
│ 🔴 Reposição Urgente: 3 itens     │
│   - Vacina V10 (5 un)               │
│   - Amoxicilina (8 un)              │
│   - Bandagem (2 un)                 │
│                                     │
│ ❌ Vencidos: 1 item                │
│   - Álcool 70% (01/06/2026)        │
│                                     │
│ ⏰ Vence em 30 dias: 2 itens       │
│   - Anestésico (15/08/2026)        │
│   - Antibiótico (20/08/2026)       │
│                                     │
│ [Ver Estoque Completo →]            │
└─────────────────────────────────────┘
```

---

## 🔧 Backend — Mutations + Queries

### Mutations

```typescript
// Criar item
export async function criarItemEstoque(clinicId: string, dados: {
  nome: string; categoria: string; lote?: string; data_validade?: string
  quantidade_estoque: number; quantidade_minima: number; quantidade_maxima: number
  fornecedor_nome?: string; fornecedor_contato?: string
  preco_custo?: number; preco_venda?: number
}) { ... }

// Editar item
export async function atualizarItemEstoque(id: string, dados: Partial<InventoryItem>) { ... }

// Deletar (soft-delete — marca como inativo)
export async function inativarItemEstoque(id: string) { ... }

// Registrar movimento (compra, uso, perda, etc)
export async function registrarMovimentoEstoque(clinicId: string, dados: {
  inventory_id: string; tipo: 'entrada' | 'saida' | 'ajuste' | 'perda' | 'vencimento'
  quantidade: number; motivo: string; atendimento_id?: string
}) { ... }

// Usar medicamento em atendimento (sai automaticamente do estoque)
export async function usarMedicamentoEmAtendimento(atendimentoId: string, medicamentos: {
  inventory_id: string; quantidade: number
}[]) { ... }
```

### Queries

```typescript
// Carrega estoque completo com alertas
export async function carregarEstoque(clinicId: string): Promise<{
  itens: InventoryItem[]
  alertas: {
    vencidos: InventoryItem[]
    reposicao: InventoryItem[]
    vencimento_proximo: InventoryItem[]
  }
  resumo: {
    total_itens: number
    total_valor_estoque: number
    itens_reposicao: number
    itens_vencidos: number
  }
}> { ... }

// Histórico de movimentos de um item
export async function carregarMovimentos(inventory_id: string): Promise<Movement[]> { ... }

// Sugestão de compra (itens que precisam reposição)
export async function sugestaoDECompra(clinicId: string): Promise<{
  item: InventoryItem
  quantidade_sugerida: number
  fornecedor: string
}[]> { ... }
```

---

## 📱 Integração com Atendimento

Quando um veterinário **usa medicamento em atendimento**, deve registrar na ficha:

```typescript
// Em FormAtendimento — adicionar campo "Medicamentos Usados"
<Campo label="Medicamentos Usados">
  <Select>
    - Amoxicilina 500mg (45 disponíveis)
    - Vacina V10 (5 disponíveis)
    - Álcool 70% (20 disponíveis)
  </Select>
  <Input placeholder="Quantidade" />
</Campo>

// Ao salvar o atendimento:
// 1. Cria consulta (como hoje)
// 2. Registra uso dos medicamentos no estoque
// 3. Reduz quantidade em inventory
// 4. Cria movement com referência ao atendimento
```

---

## 🎯 Roadmap — Sprint por Sprint

### **Sprint 1 (1 semana) — Foundation**
- [ ] Criar tables `inventory` e `inventory_movements`
- [ ] Criar views `v_inventory_*`
- [ ] Implementar `criarItemEstoque()` + `atualizarItemEstoque()` + `inativarItemEstoque()`
- [ ] Implementar `registrarMovimentoEstoque()`
- [ ] Testes E2E básicos

**Resultado**: Backend 100%, pronto pra consumir.

### **Sprint 2 (1 semana) — UI + Queries**
- [ ] Implementar `carregarEstoque()` (com alertas)
- [ ] Criar view "Estoque — List View" (Glob + filter)
- [ ] Criar modal "Novo Item"
- [ ] Criar modal "Editar Item"
- [ ] Criar modal "Registrar Movimento"
- [ ] Adicionar aba no App.tsx

**Resultado**: UI 100%, telas funcionando em modo demo.

### **Sprint 3 (1 semana) — Integração + Dashboard**
- [ ] Integrar uso de medicamento em `FormAtendimento`
- [ ] Implementar `usarMedicamentoEmAtendimento()`
- [ ] Criar widget de alertas no Dashboard
- [ ] Implementar `sugestaoDECompra()`
- [ ] Testes E2E completos (criar item → usar em atendimento → ver redução)

**Resultado**: Estoque totalmente integrado, pronto pro piloto.

---

## 💾 Demo Data

```typescript
// Para modo demo — inicializar com 10 itens comuns

const inventarioDemo: InventoryItem[] = [
  {
    id: 'inv1',
    nome: 'Amoxicilina 500mg',
    categoria: 'medicamento',
    quantidade_estoque: 45,
    quantidade_minima: 10,
    quantidade_maxima: 100,
    data_validade: '2026-12-31',
    lote: 'LOTE123456',
    fornecedor_nome: 'FarmaXYZ',
    preco_custo: 2.50,
    preco_venda: 8.90,
    ativo: true,
  },
  {
    id: 'inv2',
    nome: 'Vacina V10',
    categoria: 'vacina',
    quantidade_estoque: 5,
    quantidade_minima: 10,
    quantidade_maxima: 50,
    data_validade: '2026-08-15',
    lote: 'VAC987654',
    fornecedor_nome: 'LaborXYZ',
    preco_custo: 45.00,
    preco_venda: 90.00,
    ativo: true,
  },
  // ... mais 8 itens
]
```

---

## ✅ Checklist Final

Antes de passar pro Kaian:
- [ ] Schema SQL validado (sem conflitos com existing tables)
- [ ] Queries testadas (INSERT, UPDATE, DELETE, SELECT com JOINs)
- [ ] Mutations têm validação (quantidade positiva, datas válidas, fornecedor obrigatório?)
- [ ] UI responsiva (desktop + mobile)
- [ ] Modo demo funciona sem banco real
- [ ] Integração com atendimento testada
- [ ] Performance: 10.000 itens carregam em < 2s

---

## 📐 Estimativa Final

| Layer | Estimativa | Esforço |
|---|---|---|
| Database (schema + views) | 3–4h | Baixo |
| Mutations (CRUD + movement) | 6–8h | Baixo |
| Queries (com alertas + sugestão) | 4–6h | Médio |
| UI (5 modais + list) | 12–16h | Médio |
| Integração com Atendimento | 6–8h | Médio |
| Testes E2E | 6–8h | Médio |
| **TOTAL** | **37–50h** | **1 sprint** |

**Estimativa conservadora: 3 semanas de 1 dev** (ou 1 semana com 3 devs).

