# Implementação de referência — o agente de veterinária

O vet é o caso de referência: muita regra de negócio (o motivo de sair do GPTMaker) e
proatividade de alto valor (vacina, retorno, pós-op). Meta do Kaian: **o melhor
agente de atendimento veterinário do mundo**. Este arquivo é o playbook completo —
copie e adapte pra outros nichos.

Base real no repo: `Nexus Vet (projeto)/stack/essencial-vet.workflow.js` (tool-server,
13 nós), `reativacao-vacina-vet.workflow.js` (motor proativo), `schema-vet.sql`,
`dados-vacina-e-whatsapp.md` (protocolos).

## Regras de negócio do vet (o que o banco precisa saber)

| Domínio | Regra | Onde mora |
|---|---|---|
| **Espécie** | cao / gato / outro — muda protocolo e vacinas | constraint + coluna `especie` |
| **Idade/porte** | filhote vs adulto muda esquema vacinal | calculado da `nascimento` |
| **Vacina** | esquema de filhote (doses + intervalo) vs reforço anual | RPC `pet_proximas_vacinas` |
| **Retorno** | consulta finalizada gera retorno previsto | evento pós-consulta |
| **Plano** | serviço pode estar incluso no plano ativo do pet | RPC de preço com plano |
| **Emergência** | linha vermelha — escala na hora, nunca é da IA | prompt (as duas camadas) |

## Protocolos vacinais (pra `vaccine_protocols` e o motor de reativação)

> Referência de mercado BR (VGG/WSAVA). O protocolo real é do **veterinário de cada
> clínica** — confirmar na implantação. Serve pra alimentar `vacina_listar_protocolos`
> e o cálculo de `pet_proximas_vacinas`.

**Cães**
- **V8/V10** (polivalente): filhote 3 doses, início 6–8 sem, intervalo 21–30 dias
  (~45d → 1ª, ~75d → 2ª, ~105d → 3ª, última ≥16 sem). **Reforço anual** pra vida.
- **Antirrábica**: 1ª ~120d (≥12 sem). **Reforço anual**.

**Gatos**
- **Polivalente** V3/V4/V5: filhote 2–3 doses, início 6–8 sem (1ª 6–8 sem, 2ª +30d,
  3ª +30d quando indicada). **Reforço anual**. V5/FeLV só em gato testado NEGATIVO.
- **Antirrábica**: 1ª a partir de 3 meses. **Reforço anual**.

**Regra de cálculo da próxima dose** (a RPC):
- Guardar por pet: espécie, nascimento, cada dose aplicada (tipo + data).
- Filhote → intervalo do esquema. Adulto → **reforço anual** (última dose + 12 meses).
- Fila de lembrete: X dias antes do vencimento + alerta de atrasadas.

## Catálogo de ferramentas do vet (tool-server)

Do workflow real. Cada uma no padrão de `references/ferramentas.md`:

| Tool | Papel |
|---|---|
| `tutor_buscar_por_telefone` | Identificar quem fala (sempre primeiro) |
| `tutor_incluir` | Cadastrar tutor novo (retorna id) |
| `pet_incluir` | Cadastrar pet no tutor (espécie: cao/gato/outro) |
| `pet_listar_por_tutor` | Confirmar de qual pet o tutor fala |
| `servico_listar` | Serviços da clínica (consulta, vacina, banho&tosa, exame, cirurgia) |
| `valores_consultar` | Preço por nome — **nunca inventar** |
| `agenda_buscar_horarios_disponiveis` | RPC: horários reais livres |
| `agendamento_incluir` / `_listar_por_tutor` / `_desmarcar` | Ciclo da agenda (canal='ia') |
| `vacina_listar_protocolos` | Orientação geral por espécie |
| `pet_proximas_vacinas` | Doses aplicadas + próxima (reforço/atraso) → oferecer agendamento |

Padrão de deploy (do arquivo real): `CLINIC_ID` fixo, `SUPABASE_URL` do projeto,
credenciais "Supabase NEXUS Vet" + "Supabase REST (apikey)", `mcpTrigger` path
`essencial-vet`, ligado no AI Agent node da Bia Vet.

## Motor proativo do vet (as cadências que geram receita)

O mais valioso — é onde o agente vira "além do mercado". Cada um é uma view (fila) +
um workflow de disparo em lote (`references/proatividade.md`).

| Cadência | Gatilho | Mensagem (tom Bia) | Valor |
|---|---|---|---|
| **Reforço de vacina** | `v_fila_lembrete_vacina` (≤7d ou atrasada, cool-down 20d) | "Chegando a época da vacina do {pet}: a {vacina} tá prevista pra {data}. Quer que eu já separe um horário?" | recorrência barata (Utilidade R$0,034) |
| **Vacina atrasada** | mesma view, `situacao='atrasada'` | "Vi que a {vacina} do {pet} ficou um pouquinho atrasada (era pra {data}). Sem stress, a gente coloca em dia. Quer um horário essa semana?" | retenção |
| **Retorno pós-consulta** | consulta finalizada com retorno previsto | "Como o {pet} tá depois da consulta? O Dr. sugeriu um retorno — quer que eu agende?" | receita + cuidado |
| **Pós-operatório** | cirurgia D+1 | "Passando pra saber como o {pet} tá no pós-cirúrgico 🐾 Qualquer coisa fora do normal, me chama que a gente vê na hora." | segurança + relacionamento |
| **Cliente sumido** | sem visita 60–90d | "Faz um tempinho que não vejo o {pet} por aqui! Tá tudo bem com ele? 😊" | reativação |
| **Plano vencendo/atrasado** | fila de cobrança | (régua de dunning — ver Central da Bia) | MRR |

**Mensagem real do motor de reativação** (do `reativacao-vacina-vet.workflow.js`,
tom já validado): uma pergunta por vez, sem textão, ✅/emoji com parcimônia, oferece
agendar (fecha o loop banco→IA→WhatsApp→banco).

## Proatividade dentro do atendimento (o "traga uma informação, dê uma ideia")

Isto é o que faz o vet ser excelente e não só funcional. Com as tools de estado
(`pet_proximas_vacinas`, plano, histórico) + o bloco "Seja proativo" do prompt, o
agente age no contexto:

- Tutor agenda **banho** → agente checa `pet_proximas_vacinas` → "Aproveitando, a
  antirrábica do {pet} vence esse mês. Quer que eu deixe a vacina no mesmo dia? Só
  uma viagem." → **+ticket, +cuidado**.
- Tutor pergunta **preço da consulta** → agente vê plano ativo → "No plano do {pet}
  essa consulta já tá inclusa 😊" → **retenção, confiança**.
- Tutor **some no meio do agendamento** → follow-up 20 min: "Ó, deixei o horário de
  {data} quase separado pro {pet} — quer que eu confirme?" → **recupera venda**.

A trava: **uma sugestão por vez, sem insistir**. Se recusar, segue o que ele pediu.

## Emergência — a linha vermelha (teste isto sempre)

O erro mais grave do vet é a IA tratar emergência como atendimento comum. Cobrir nas
duas camadas:

- **Prompt:** "Se o tutor descrever o pet passando mal, convulsão, sangramento,
  intoxicação, dificuldade de respirar, ingeriu algo tóxico — PARE o fluxo normal,
  oriente procurar atendimento AGORA e transfira pro time na hora, com prioridade.
  Não tente agendar como consulta comum."
- **Escalonamento:** transferência prioritária + alerta imediato pra equipe.
- **Teste de aceite:** mandar "socorro meu cachorro comeu chocolate e tá tremendo" →
  o agente TEM que escalar, não oferecer horário pra semana que vem.

## Entregáveis de um agente vet novo

1. `schema-vet.sql`: tabelas (tutors, pets, services, appointments, vaccinations,
   vaccine_protocols, planos) + views (`v_fila_lembrete_vacina`, filas das outras
   cadências) + RPC (`buscar_horarios_disponiveis`, próxima dose, preço com plano) +
   RLS por `clinic_id`.
2. `essencial-vet.workflow.js`: tool-server MCP (o catálogo acima).
3. `reativacao-*.workflow.js`: um motor por cadência (ou um genérico multi-fila).
4. System prompt da Bia Vet (`references/persona-e-prompt.md`, com a linha vermelha).
5. Cabeçalho com **pendências de deploy** do Kaian (SQL, credenciais, clinic_id,
   instância Evolution, ligar no AI Agent).
