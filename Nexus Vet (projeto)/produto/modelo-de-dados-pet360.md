# Nexus Vet — Modelo de Dados (Pet 360) · visão conceitual

> ⚠️ **A fonte de verdade é [`stack/schema-vet.sql`](../stack/schema-vet.sql).**
> Este documento é o **mapa conceitual** (o "porquê" de cada entidade e como
> alimenta os 5 módulos). Os nomes reais de tabela e coluna estão no schema —
> em `snake_case` (`tutor_id`, `proxima_dose`), não no `CamelCase` usado aqui.
> Se os dois divergirem, **o schema vence**.
>
> Histórico: este doc foi escrito antes de decidirmos que a NEXUS seria o
> sistema (Supabase). A decisão está tomada — não há mais "Modo A/B".
>
> Legenda de fase: sem marca = MVP · (F2) = fase 2.

---

## Tabela 1 — TUTORES (o dono)
| Campo | Tipo | Nota |
|---|---|---|
| id_tutor | número (PK) | |
| nome | texto | |
| cpf | texto | 11 dígitos |
| telefone | texto | **chave de identificação no WhatsApp** |
| email | texto | opcional |
| endereco | texto | (F2) |
| data_cadastro | data | |
| origem_lead | opções | indicação, Google, Instagram, tráfego... (CRM) |
| etapa_funil | opções | lead / agendado / cliente / inativo (CRM) |
| tags | texto | VIP, inadimplente... (F2) |
| observacoes | texto | |

## Tabela 2 — PETS
| Campo | Tipo | Nota |
|---|---|---|
| id_pet | número (PK) | |
| id_tutor | número (FK → Tutores) | |
| nome | texto | |
| especie | opções | cão, gato, outro |
| raca | texto | |
| sexo | opções | M / F |
| data_nascimento | data | base do cálculo de vacina |
| peso | número | último peso (F2: histórico) |
| castrado | booleano | (F2) |
| microchip | texto | (F2) |
| obs_clinicas | texto | alergias, condições |
| foto_url | texto | carteirinha digital |
| status | opções | ativo / inativo / óbito |

## Tabela 3 — VACINAS_APLICADAS (motor de recorrência)
| Campo | Tipo | Nota |
|---|---|---|
| id_vacina | número (PK) | |
| id_pet | número (FK → Pets) | |
| tipo | opções | V10, antirrábica, tríplice felina... |
| data_aplicacao | data | |
| proxima_dose | data | **calculada** (ver dados-vacina) |
| status | opções | em dia / próxima / atrasada |
| lote | texto | (F2) |
| veterinario | texto | (F2) |

## Tabela 4 — PROFISSIONAIS / AGENDA
| Campo | Tipo | Nota |
|---|---|---|
| id_agenda | número (PK) | = agenda do profissional (bate com IdAgenda da tool) |
| id_profissional | número | |
| nome | texto | |
| especialidade | texto | clínico, banho&tosa... |
| ativo | booleano | |

## Tabela 5 — SERVICOS (catálogo + preços)
| Campo | Tipo | Nota |
|---|---|---|
| id_servico | número (PK) | |
| nome | texto | |
| categoria | opções | consulta, vacina, banho&tosa, exame, cirurgia |
| preco | número | usado por `valores_consultar` |
| duracao_min | número | ajuda a montar horários |
| ativo | booleano | |

## Tabela 6 — AGENDAMENTOS (proteção de receita)
| Campo | Tipo | Nota |
|---|---|---|
| id_agendamento | número (PK) | |
| id_tutor | número (FK) | |
| id_pet | número (FK) | |
| id_servico | número (FK) | |
| id_agenda | número (FK) | profissional |
| data | data | |
| hora | texto | HH:mm |
| status | opções | agendado / confirmado / realizado / faltou / cancelado |
| canal | opções | IA / recepção |
| lembrete_enviado | data-hora | anti no-show |
| observacoes | texto | |

## Tabela 7 — INTERACOES (timeline do Pet 360 + CRM)
| Campo | Tipo | Nota |
|---|---|---|
| id_interacao | número (PK) | |
| id_tutor | número (FK) | |
| id_pet | número (FK, opcional) | |
| data_hora | data-hora | |
| tipo | opções | recebida / enviada / lembrete / reativação |
| resumo | texto | |
| resultado | opções | agendou / sem resposta / dúvida / reclamação |

## Tabela 8 (F2) — PRONTUÁRIO / ATENDIMENTOS
Registro clínico da consulta (queixa, conduta, anexos). Entra na fase 2 —
é o "coração amado pelo vet", mas mais pesado. MVP foca em atender + agendar +
recorrência.

---

## Relacionamentos (mapa)
```
TUTORES 1 ──< PETS 1 ──< VACINAS_APLICADAS
   │            │
   │            └──< AGENDAMENTOS >── SERVICOS
   │                     │
   │                     └── PROFISSIONAIS/AGENDA
   └──< INTERACOES
```

## Como cada tabela alimenta os 5 módulos
| Módulo | Usa |
|---|---|
| **Atendimento IA** | Tutores + Pets (identificação) + Interações (contexto) |
| **Agenda** | Agendamentos + Profissionais + Serviços |
| **Reativação** | Vacinas_aplicadas (vencimentos) + Agendamentos (faltas) + etapa_funil |
| **CRM** | Tutores (funil, origem) + Interações + Agendamentos (ticket) |
| **Pet 360** | **visão consolidada**: junta tudo por pet (dados + próximas vacinas + próximo/último agendamento + histórico) |

## Pet 360 — a "tela" consolidada (o que a equipe vê)
Dado um pet: dados do tutor · dados do pet · **próximas vacinas / atrasadas** ·
próximo agendamento · último atendimento · etapa no funil · total gasto (F2) ·
timeline de interações. É a visão que a equipe abre e "vê tudo de uma vez".
