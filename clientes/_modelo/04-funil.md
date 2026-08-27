# 04 — Arquitetura do funil

## Desenho padrão NEXUS

```
Meta Ads (Click-to-WhatsApp)
        │
        ▼
WhatsApp da clínica  ──►  Agente de IA (05-agente-ia.md)
        │                        │
        │                        ├─ qualifica (procedimento, cidade, urgência)
        │                        ├─ responde preço só a partir da 4ª mensagem
        │                        ├─ oferece 2 horários fechados
        │                        └─ escala pra humano quando: {{gatilhos}}
        ▼
Agenda no CRM (app.nexushealth.com.br)
        │
        ├─ confirmação D-1 automática
        ├─ no-show → follow-up
        ▼
Comparecimento ──► Fechamento ──► Reativação (recorrência)
```

## Definições deste cliente

| Etapa | Ferramenta | Responsável | Observação |
|---|---|---|---|
| Anúncio | Meta Ads | | |
| Destino | ( ) WhatsApp direto ( ) LP → WhatsApp | | |
| Atendimento 1º contato | Agente de IA | | |
| Agendamento | CRM NEXUS | | |
| Confirmação | Automação D-1 | | |
| Handoff humano | | | |

## Métricas por etapa (preencher meta antes de subir)

| Etapa | Métrica | Meta | Real |
|---|---|---|---|
| Anúncio | CPM / CTR | | |
| Lead | CPL (conversa iniciada) | R$ | |
| Qualificação | % lead qualificado | | |
| Agendamento | CPA agendamento | R$ | |
| Comparecimento | % show | | |
| Fechamento | % fechamento | | |
| Receita | ROAS | | |

## Pontos de vazamento a vigiar

- Lead responde e ninguém volta → agente offline / fila
- Agenda sem horário disponível → oferta trava
- No-show alto → confirmação fraca ou lead desqualificado
- Fechamento baixo → oferta não bate com quem chegou
