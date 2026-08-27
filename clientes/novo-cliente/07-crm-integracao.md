# 07 — Integração técnica

> Stack de referência: `stack/stack-tecnico.md`.

## CRM (app.nexushealth.com.br)

- Organização: `{{ORG_ID}}`
- Clínica(s) cadastrada(s): `{{}}`
- Usuários criados: `{{}}`
- RLS validado (usuário só enxerga a própria clínica): ⬜
- Profissionais + agenda configurados: ⬜
- Procedimentos + preços cadastrados: ⬜

## Integrações

| Integração | Onde | Status |
|---|---|---|
| WhatsApp → agente | GPTMaker / Evolution | ⬜ |
| Agente → CRM (agendamento) | webhook n8n | ⬜ |
| CRM → confirmação D-1 | n8n | ⬜ |
| Meta CAPI (evento de agendamento) | n8n | ⬜ |

## Webhooks

| Evento | Origem → Destino | URL (sem token) | Status |
|---|---|---|---|
| lead.novo | Agente → n8n | | ⬜ |
| agendamento.criado | n8n → CRM | | ⬜ |
| agendamento.confirmado | CRM → n8n | | ⬜ |

## Checklist de go-live

- [ ] Número de WhatsApp aquecido
- [ ] Agente respondendo em produção
- [ ] Agendamento de teste ponta a ponta (lead fake → agenda no CRM)
- [ ] Confirmação D-1 disparou
- [ ] Evento chegou no Meta (Events Manager)
- [ ] Clínica treinada pra usar o CRM (30 min de call gravada)
