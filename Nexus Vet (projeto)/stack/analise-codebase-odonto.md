# Análise do codebase NEXUS Odonto — o que dá pra reaproveitar no Vet

> Responde a pendência P1: *"reaproveitar o codebase do sistema odonto, ou projeto separado?"*
> Fonte: `oficialnexus00/nexus-estetica` → `app/` (1.631 linhas).

## Veredito: **reaproveitar. ~75% serve direto.**

O sistema odonto não é um protótipo descartável — é uma base sólida:
multi-tenant, **RLS desde o dia 1**, índices, mobile-first, e o agente de IA já é
**white-label** (na demo aparece como "Patrícia", não "Bia" — ou seja, o nome do
agente já é por cliente).

## Stack (herda 100%)
React 18 · Vite 5 · TypeScript 5 · Tailwind 4 · Supabase JS · flag `MODO_DEMO`
(demo com dados fictícios ↔ Supabase real). Nada a mudar.

## Mapa de reaproveitamento

| Peça do odonto | No vet | Esforço |
|---|---|---|
| `organizations`, `clinics`, `memberships` | Igual (só troca `dentista`→`veterinario` no papel) | ⬤ copiar |
| `professionals` | Igual | ⬤ copiar |
| `appointments` (status pendente/confirmada/atendida/**falta**/cancelada) | Igual — o enum já serve pro anti no-show | ⬤ copiar |
| `budgets` (orçamento + follow-up) | Igual — vet tem cirurgia/tratamento | ⬤ copiar |
| Helpers `user_org_ids`/`user_clinic_ids` + policies RLS | Igual | ⬤ copiar |
| Shell do app (sidebar, nav, drawer mobile, header, seletor de clínica) | Igual | ⬤ copiar |
| Views Dashboard / Agenda / Financeiro / Orçamentos | Estrutura igual, rótulos mudam | ◐ ajustar |
| `patients` | **Divide em `tutors` + `pets`** (cliente ≠ paciente) | ◑ adaptar |
| `procedures` (odontograma por dente) | **Vira `vaccinations`** (carteira de vacina) | ◑ adaptar |
| `Odontograma.tsx` | **Vira `CarteiraVacina.tsx`** | ◑ reescrever |
| `FichaClinica.tsx` | Vira ficha do pet | ◐ ajustar |

## O que a nossa pesquisa ACRESCENTA (melhorias sobre o odonto)

1. **`services` com preço estruturado** — o odonto guarda `procedimento` como texto
   livre. A IA precisa de tabela real de preço pra **nunca inventar valor**.
2. **`vaccine_protocols` + `vaccinations.proxima_dose`** — o motor de recorrência do
   vet, que o odonto não tem equivalente.
3. **`v_fila_lembrete_vacina`** — view que entrega a fila pronta pro workflow de
   Reativação. **Uma fonte de verdade só**, em vez de Data Table paralela no n8n.
4. **`v_pet_360`** — a visão consolidada (último atendimento, próxima vacina, atrasos).
5. **Campos de atendimento na `clinics`** — horários, se tem 24h e pra onde encaminhar
   emergência: a IA precisa disso pra responder e pro protocolo de urgência.
6. **`interactions`** — timeline de contato (CRM + Pet 360).
7. **`etapa_funil` no tutor** — CRM nativo, no lugar de só `origem`.

Tudo isso está em [`schema-vet.sql`](./schema-vet.sql), já escrito no padrão deles.

## Impacto prático

- **Não começamos do zero.** A camada mais chata (auth, multi-tenant, RLS, shell,
  agenda, financeiro) já existe e está testada.
- **O que é realmente novo é pequeno:** tutor+pet, carteira de vacina e a fila de
  lembrete. É aí que mora o valor do nicho.
- **Risco técnico cai muito** — e a preocupação do roadmap odonto
  ("Marco sozinho no backend") pesa menos, porque o vet herda em vez de duplicar.

## Recomendação ao Kaian

Reaproveitar como **fork do mesmo produto**, não projeto separado — mesma base,
duas verticais (odonto e vet). Se um dia virar produto único multi-nicho, melhor
ainda: o que muda por vertical é só o módulo clínico
(odontograma ↔ carteira de vacina) e o vocabulário.
