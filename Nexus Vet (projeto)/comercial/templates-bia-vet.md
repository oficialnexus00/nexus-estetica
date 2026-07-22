# Nexus Vet — Templates de mensagem da Bia (v0 — Kaian revisa)

> Tom: caloroso, curto, pet pelo nome, 1 CTA por mensagem, emoji com parcimônia.
> Variáveis {{...}} preenchidas pelos campos do modelo Pet 360.
> **Categoria** define o custo no WhatsApp API (ver dados-vacina-e-whatsapp):
> Utilidade = R$0,034 · Marketing = R$0,3125 · Serviço (janela 24h) = grátis*.
> Regra: template Utilidade tem que ser transacional (ligado a um evento) e
> NÃO promocional, senão o WhatsApp reclassifica como Marketing.

---

## 1. Boas-vindas / fora do horário  · Serviço/Utilidade
> Dispara quando o tutor manda a 1ª mensagem.

Oi! 🐾 Aqui é a Bia, da {{clinica}}. Que bom falar com você!
Me conta: é pra qual pet e como posso ajudar hoje — consulta, vacina ou banho?

---

## 2. Confirmação de agendamento  · Utilidade
> Logo após marcar.

Prontinho, {{nome_tutor}}! ✅
Agendei o {{nome_pet}} para {{servico}} no dia {{data}} às {{hora}}, com {{profissional}}.
Qualquer coisa é só me chamar por aqui. Até lá! 🐾

---

## 3. Lembrete D-1 (anti no-show)  · Utilidade
> 1 dia antes.

Oi, {{nome_tutor}}! Passando pra lembrar: o {{nome_pet}} tem {{servico}} amanhã ({{data}}) às {{hora}}.
Posso confirmar? Responda *SIM* pra manter ou *REMARCAR* que eu ajeito pra você.

---

## 4. Lembrete de vacina (próxima dose)  · Utilidade  ⭐ recorrência
> X dias antes da data prevista.

Oi, {{nome_tutor}}! 🐾 Chegando a época da vacina do {{nome_pet}}:
a {{vacina}} está prevista para {{data_prevista}}.
Quer que eu já separe um horário? É rapidinho e mantém ele protegido. 💚

---

## 5. Vacina atrasada  · Utilidade  (tom de cuidado, nunca cobrança)
Oi, {{nome_tutor}}! Vi aqui que a {{vacina}} do {{nome_pet}} ficou um pouquinho atrasada (era para {{data_prevista}}).
Sem stress — a gente coloca em dia rapidinho. Quero te ajudar a achar um horário essa semana?

---

## 6. Reativação (tutor sumido)  · Marketing
> Ex.: sem visita há 6+ meses.

Oi, {{nome_tutor}}! Faz um tempinho que a gente não vê o {{nome_pet}} por aqui 🐾
Tá tudo certo com ele? Se quiser, dou uma olhada na saúde dele num check-up.
Posso separar um horário?

---

## 7. Pós-atendimento + NPS  · Utilidade
> Algumas horas depois do atendimento.

Oi, {{nome_tutor}}! Espero que o {{nome_pet}} esteja bem depois da visita de hoje 💚
Numa nota de 0 a 10, como foi seu atendimento com a gente?
Sua resposta ajuda demais a melhorar. 🐾

---

## 8. Aniversário do pet  · Marketing  (leve, opcional)
Hoje é dia de festa: o {{nome_pet}} está de aniversário! 🎉🐾
Da nossa parte, um viva enorme pro seu companheiro.
Se quiser mimar ele, temos {{oferta}} — é só me chamar!

---

## Princípios que valem pra todos
- **1 CTA por mensagem** — nunca duas perguntas juntas.
- **Nome do pet sempre** que existir no cadastro.
- **Nunca** dar preço/horário/diagnóstico no template — isso a Bia resolve na
  conversa, consultando as ferramentas (evita erro e mantém Utilidade).
- Emergência nunca vira template automático — é conversa imediata.
- Reativação e aniversário (Marketing) usar com critério: são ~10x o custo do
  lembrete de Utilidade.
