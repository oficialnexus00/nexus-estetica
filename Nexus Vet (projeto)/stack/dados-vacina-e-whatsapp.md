# Nexus Vet — Dados de referência para construção

> ⚠️ Os protocolos abaixo são referência de mercado (fontes BR) para **alimentar
> a ferramenta `vacina_listar_protocolos` e o motor de Reativação**. O protocolo
> real é definido pelo **veterinário de cada clínica** (segue diretrizes VGG/WSAVA
> e realidade local) — na implantação, confirmar com o vet da clínica-piloto.

## 1. Protocolo vacinal — CÃES

**Polivalente V8 / V10** (V10 = V8 + 2 sorovares de leptospira)
- Filhote: 3 doses, início 6–8 semanas, intervalo 21–30 dias
  - ~45 dias → 1ª dose
  - ~75 dias → 2ª dose
  - ~105 dias → 3ª dose (última dose deve ser ≥ 16 semanas)
- **Reforço: anual**, por toda a vida

**Antirrábica**
- 1ª dose: ~120 dias (≥ 12 semanas / 4 meses)
- **Reforço: anual**, por toda a vida

## 2. Protocolo vacinal — GATOS

**Polivalente** — V3 (tríplice: panleucopenia, rinotraqueíte, calicivirose) /
V4 (+clamidiose) / V5 (+FeLV/leucemia felina)
- Filhote: 2–3 doses, início 6–8 semanas
  - 1ª dose: 6–8 semanas
  - 2ª dose: +30 dias (~12 semanas)
  - 3ª dose: +30 dias (quando recomendada)
- **Reforço: anual**, por toda a vida
- V5/FeLV: só em gatos testados NEGATIVO para FeLV

**Antirrábica**
- 1ª dose: a partir de 3 meses (12 semanas)
- **Reforço: anual**

## 3. Regra de negócio p/ o motor de Reativação
- Guardar por pet: espécie, data de nascimento, cada dose aplicada (tipo + data).
- Calcular próxima dose: filhote = intervalo do esquema; adulto = **reforço anual**
  (data última dose + 12 meses).
- Disparar lembrete: X dias antes do vencimento + alerta de **atrasadas**.
- É esse cálculo que a ferramenta `pet_proximas_vacinas` expõe pra Bia.

## 4. WhatsApp Business API — custos 2026 (encanamento do lembrete)

Desde **jan/2026**: cobrança **por mensagem** (não mais por conversa 24h).
Categorias (Brasil):

| Categoria template | Custo | Uso na Nexus Vet |
|---|---|---|
| **Utilidade** (transacional) | **R$ 0,0340** | Lembrete de vacina, confirmação, retorno |
| Autenticação | R$ 0,0340 | (código/verificação) |
| Marketing | R$ 0,3125 | Campanha/promoção |
| Serviço (resposta dentro da janela 24h) | Grátis* | Conversa em andamento |

\* A partir de **1º/out/2026**, mensagens de Serviço passam a ser cobradas. Billing em BRL previsto p/ 2º semestre/2026.

### 💰 Implicação estratégica (margem)
- Lembrete de vacina = template **Utilidade = R$ 0,034** (3,4 centavos).
- O **SimplesVet cobra R$ 0,50** por mensagem automática → **~15x mais caro**.
- A promessa "mensagens inclusas/ilimitadas" da Nexus é **barata de honrar** para
  lembretes (utilidade). Estruturar lembretes como **Utilidade**, não Marketing.
- Campanhas de reativação em massa (Marketing, R$0,3125) são ~10x mais caras —
  usar com critério; o lembrete transacional é o que dá recorrência barata.

### Dois canais de disparo (a Nexus tem os dois)
| Canal | Custo | Limite | Risco |
|---|---|---|---|
| **Chip via n8n (não-oficial)** | **grátis** | ~**100 disparos/dia** por chip | chip pode cair/ser banido (já existe o workflow "Monitor de Chips") |
| **WhatsApp Cloud API (oficial)** | R$0,034 (Utilidade) | escalável | estável, sem ban |

**Leitura:** uma clínica sozinha raramente passa de 100 disparos/dia (ex.: 20–40
lembretes D-1 + algumas vacinas) — então o **canal grátis cobre a operação diária**
de um cliente, e o custo marginal do motor de recorrência fica ~zero. Isso reforça
ainda mais a promessa "mensagens inclusas".

**Ressalva honesta:** o canal grátis é frágil — cap de 100/dia e risco de ban
(por isso o Monitor de Chips existe). Campanhas de reativação em massa estouram
os 100/dia num pico. Recomendação: **arquitetura híbrida** — chip grátis para o
transacional do dia a dia; **cair pro Cloud API oficial** quando (a) a clínica
tem volume alto, (b) precisa de confiabilidade, ou (c) blast de reativação grande.
Não amarrar o produto só ao chip.

## Fontes
- Cães: univetrp.com.br, cobasi, petlove (vacina V8)
- Gatos: clinivet.com.br, petlove, catslondrina
- WhatsApp API: socialhub.pro/blog/preco-whatsapp-api-2026-brasil, helpboot.com.br, centralizepro.com.br
