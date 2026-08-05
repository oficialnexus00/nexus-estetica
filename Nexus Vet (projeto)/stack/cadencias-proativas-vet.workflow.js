// ===========================================================================
// Cadências Proativas — Vet   (o PLANO PROATIVO da carcaça NEXUS)
//
// É o que faz a Bia "levar informação e dar ideia sozinha" — o diferencial
// que o Kaian quer vender além do mercado. Complementa o motor de vacina
// (`reativacao-vacina-vet.workflow.js`) com as demais cadências:
//   pós-op (D+1) → retorno pós-consulta → cliente sumido → aniversário.
//
// Cada fila é uma VIEW do banco (schema-vet-proativo.sql) — a regra mora lá,
// não aqui. O motor lê as filas na ORDEM DE PRIORIDADE (next-best-action),
// deduplica por telefone no dia (uma cadência por cliente por ciclo) e dispara
// no padrão NEXUS: lote, delay 40–100s, onError continueRegularOutput, e grava
// a interação no banco (idempotência + fecha o circuito).
//
// ⚠️ STATUS: RASCUNHO — importar no n8n e validar. Segue o mesmo padrão do
// `reativacao-vacina-vet.workflow.js` (esse já é valid:true no n8n).
//
// PENDÊNCIAS p/ deploy (Kaian):
//   - Rodar `schema-vet-proativo.sql` no Supabase.
//   - Credenciais "Supabase NEXUS Vet" e "Evolution API"; instância = bia-vet.
//   - Ajustar o horário do schedule e as cadências ativas por cliente.
// ===========================================================================

import { workflow, trigger, node, splitInBatches, nextBatch, newCredential } from '@n8n/workflow-sdk';

const sb      = { supabaseApi: newCredential('Supabase NEXUS Vet') };
const evoCred = { httpHeaderAuth: newCredential('Evolution API') };
const EVOLUTION_URL  = 'https://evolution.nexushealth.com.br';
const EVOLUTION_INST = 'bia-vet';

// Roda 1x/dia, 9h30 (seg-sáb) — antes do motor de vacina (10h) não colidir horário.
const schedule = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.3,
  config: {
    name: 'Todo dia 9h30 (Seg-Sáb)',
    parameters: { rule: { interval: [{ field: 'cronExpression', expression: '30 9 * * 1-6' }] } },
    position: [0, 200],
  },
});

// Lê a FILA ÚNICA `v_fila_proativa`: o banco já uniu as 4 cadências, aplicou a
// prioridade (next-best-action) e entregou 1 linha por telefone. Uma fila vazia
// não quebra nada — a regra ficou no banco (schema-vet-proativo.sql), não aqui.
const fila = node({
  type: 'n8n-nodes-base.supabase', version: 1,
  config: { name: 'Fila Proativa (view)', parameters: {
    resource: 'row', operation: 'getAll', tableId: 'v_fila_proativa',
    returnAll: false, limit: 200, filterType: 'none' }, credentials: sb, position: [240, 200] },
});

// Só monta a mensagem no tom da Bia conforme a cadência (prioridade e dedup já
// vieram prontos do banco).
const montar = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Montar Mensagem (tom Bia)',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `const NL = String.fromCharCode(10);
const out = [];
for (const it of $input.all()) {
  const r = it.json || {};
  const tel = String(r.telefone || '').replace(/\\D/g, '');
  if (!tel || !r.cadencia) continue;

  const primeiro = String(r.tutor_nome || '').trim().split(' ')[0] || '';
  const ola = primeiro.length >= 2 ? ('Oi, ' + primeiro + '!') : 'Oi!';
  const pet = r.pet_nome || 'seu pet';
  let msg;

  if (r.cadencia === 'pos_op') {
    msg = ola + ' Passando pra saber como o ' + pet + ' tá se recuperando da cirurgia 🐾'
        + NL + 'Tá comendo, descansando bem? Qualquer coisa fora do normal me chama que a gente vê na hora.';
  } else if (r.cadencia === 'retorno') {
    msg = ola + ' Como o ' + pet + ' ficou depois da consulta?'
        + NL + 'O veterinário sugeriu um acompanhamento — quer que eu já veja um horário pra ele?';
  } else if (r.cadencia === 'reativacao') {
    msg = ola + ' Faz um tempinho que não vejo o ' + pet + ' por aqui 🐶'
        + NL + 'Tá tudo bem com ele? Se quiser, dou uma olhada num horário pra um check-up.';
  } else if (r.cadencia === 'aniversario') {
    msg = ola + ' Hoje é dia de festa: o ' + pet + ' tá fazendo aniversário! 🎉🐾'
        + NL + 'Manda um agrado da nossa parte. Se quiser aproveitar pra um check-up de saúde, é só falar 😊';
  } else { continue; }

  out.push({ json: { pet_id: r.pet_id, tutor_id: r.tutor_id, clinic_id: r.clinic_id,
                     cadencia: r.cadencia, phone: tel, message: msg } });
}
return out;`,
    },
    position: [480, 200],
  },
});

const limitar = node({
  type: 'n8n-nodes-base.limit', version: 1,
  config: { name: 'Limitar Lote (20)', parameters: { maxItems: 20, keep: 'firstItems' }, position: [700, 200] },
});

const loop = splitInBatches({
  version: 3,
  config: { name: 'Loop Over Items', parameters: { batchSize: 1 }, position: [920, 200] },
});

const disparo = node({
  type: 'n8n-nodes-base.httpRequest', version: 4.4,
  config: {
    name: 'Disparo (Evolution)',
    parameters: {
      method: 'POST', url: `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INST}`,
      authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      bodyParameters: { parameters: [
        { name: 'number', value: '={{ $json.phone }}' },
        { name: 'text',   value: '={{ $json.message }}' },
      ] },
    },
    credentials: evoCred, onError: 'continueRegularOutput', position: [1150, 120],
  },
});

// Fecha o circuito: grava a interação (idempotência via view no próximo ciclo).
const logar = node({
  type: 'n8n-nodes-base.supabase', version: 1,
  config: {
    name: 'Log da Cadência',
    parameters: {
      resource: 'row', operation: 'create', tableId: 'interactions',
      dataToSend: 'defineBelow',
      fieldsUi: { fieldValues: [
        { fieldId: 'clinic_id', fieldValue: '={{ $("Loop Over Items").item.json.clinic_id }}' },
        { fieldId: 'tutor_id',  fieldValue: '={{ $("Loop Over Items").item.json.tutor_id }}' },
        { fieldId: 'pet_id',    fieldValue: '={{ $("Loop Over Items").item.json.pet_id }}' },
        { fieldId: 'tipo',      fieldValue: 'reativacao' },
        { fieldId: 'cadencia',  fieldValue: '={{ $("Loop Over Items").item.json.cadencia }}' },
        { fieldId: 'resumo',    fieldValue: '={{ $("Loop Over Items").item.json.message }}' },
      ] },
    },
    credentials: sb, onError: 'continueRegularOutput', position: [1370, 120],
  },
});

const gerarDelay = node({
  type: 'n8n-nodes-base.code', version: 2,
  config: {
    name: 'Gerar Delay 40-100s',
    parameters: { mode: 'runOnceForEachItem',
      jsCode: `const d = Math.floor(Math.random() * 60) + 40;
return { json: { ...$input.item.json, delay_segundos: d } };` },
    position: [1600, 120],
  },
});

const wait = node({
  type: 'n8n-nodes-base.wait', version: 1.1,
  config: { name: 'Wait (anti-ban)', parameters: { resume: 'timeInterval', amount: '={{ $json.delay_segundos }}', unit: 'seconds' }, position: [1830, 120] },
});

const resumo = node({
  type: 'n8n-nodes-base.set', version: 3.4,
  config: { name: 'Fim do ciclo', parameters: { mode: 'manual',
    assignments: { assignments: [{ id: 'r1', name: 'status', value: 'Cadências proativas processadas', type: 'string' }] } },
    position: [1150, 330] },
});

export default workflow('cadencias-proativas-vet', 'Cadências Proativas — Vet')
  .add(schedule)
  .to(fila)
  .to(montar)
  .to(limitar)
  .to(loop
    .onDone(resumo)
    .onEachBatch(disparo.to(logar.to(gerarDelay.to(wait.to(nextBatch(loop))))))
  );
