// ===========================================================================
// Reativação de Vacina — Vet   (v2: ligado no Supabase)
// Validado no n8n (valid: true, 10 nós). NÃO publicado.
//
// MUDANÇA vs v1: lê a view `v_fila_lembrete_vacina` do Supabase em vez de uma
// Data Table paralela no n8n. O BANCO faz a regra (vence em <=7 dias OU
// atrasada, e não lembrado nos últimos 20 dias) -> **uma fonte de verdade só**,
// e o workflow fica mais simples e mais difícil de dessincronizar.
//
// MANTIDO do padrão do Kaian: lote 20, delay aleatório 40-100s,
// onError: continueRegularOutput (sem falha silenciosa), canal Evolution.
//
// TOM: regras oficiais da Bia (repo-mãe `comercial/fluxo-bia.md`) —
// coloquial, humanizado e UMA pergunta por vez.
//
// PENDÊNCIAS p/ deploy (Kaian): rodar `schema-vet.sql` no Supabase,
// criar as credenciais "Supabase NEXUS Vet" e "Evolution API",
// e definir a instância Evolution do vet (placeholder: bia-vet).
// ===========================================================================

import { workflow, trigger, node, splitInBatches, nextBatch, newCredential } from '@n8n/workflow-sdk';

const sb = { supabaseApi: newCredential('Supabase NEXUS Vet') };
const evoCred = { httpHeaderAuth: newCredential('Evolution API') };

const schedule = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.3,
  config: {
    name: 'Todo dia 10h (Seg-Sáb)',
    parameters: { rule: { interval: [{ field: 'cronExpression', expression: '0 10 * * 1-6' }] } },
    position: [0, 200],
  },
});

const buscarFila = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Fila de Vacinas (view)',
    parameters: {
      resource: 'row',
      operation: 'getAll',
      tableId: 'v_fila_lembrete_vacina',
      returnAll: false,
      limit: 200,
      filterType: 'none',
    },
    credentials: sb,
    position: [230, 200],
  },
});

const montarMensagem = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Montar Mensagem',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `const NL = String.fromCharCode(10);
const out = [];
for (const it of $input.all()) {
  const r = it.json || {};
  if (!r.telefone || !r.vaccination_id) continue;
  const primeiro = String(r.tutor_nome || '').trim().split(' ')[0] || '';
  const ola = primeiro.length >= 2 ? ('Oi, ' + primeiro + '!') : 'Oi!';
  const pet = r.pet_nome || 'seu pet';
  const vac = r.vacina || 'vacina';
  let dataFmt = '';
  if (r.proxima_dose) {
    const d = new Date(r.proxima_dose);
    dataFmt = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2);
  }
  const atrasada = String(r.situacao || '') === 'atrasada';
  let msg;
  if (atrasada) {
    msg = ola + ' Vi aqui que a ' + vac + ' do ' + pet + ' ficou um pouquinho atrasada (era pra ' + dataFmt + ').'
        + NL + 'Sem stress, a gente coloca em dia rapidinho. Quer que eu veja um horario essa semana?';
  } else {
    msg = ola + ' Chegando a epoca da vacina do ' + pet + ': a ' + vac + ' esta prevista pra ' + dataFmt + '.'
        + NL + 'Quer que eu ja separe um horario pra ele?';
  }
  out.push({ json: { vaccination_id: r.vaccination_id, phone: String(r.telefone), message: msg } });
}
return out;`,
    },
    position: [460, 200],
  },
});

const limitar = node({
  type: 'n8n-nodes-base.limit',
  version: 1,
  config: {
    name: 'Limitar Lote (20)',
    parameters: { maxItems: 20, keep: 'firstItems' },
    position: [690, 200],
  },
});

const loop = splitInBatches({
  version: 3,
  config: { name: 'Loop Over Items', parameters: { batchSize: 1 }, position: [910, 200] },
});

const disparo = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Disparo Vacina (Evolution)',
    parameters: {
      method: 'POST',
      url: 'https://evolution.nexushealth.com.br/message/sendText/bia-vet',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      bodyParameters: { parameters: [
        { name: 'number', value: '={{ $json.phone }}' },
        { name: 'text', value: '={{ $json.message }}' },
      ] },
    },
    credentials: evoCred,
    onError: 'continueRegularOutput',
    position: [1140, 120],
  },
});

const marcar = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Marcar ultimo_lembrete',
    parameters: {
      resource: 'row',
      operation: 'update',
      tableId: 'vaccinations',
      filterType: 'manual',
      matchType: 'allFilters',
      filters: { conditions: [
        { keyName: 'id', condition: 'eq', keyValue: '={{ $("Loop Over Items").item.json.vaccination_id }}' },
      ] },
      dataToSend: 'defineBelow',
      fieldsUi: { fieldValues: [
        { fieldId: 'ultimo_lembrete', fieldValue: "={{ $now.toFormat('yyyy-LL-dd') }}" },
      ] },
    },
    credentials: sb,
    onError: 'continueRegularOutput',
    position: [1370, 120],
  },
});

const gerarDelay = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Gerar Delay 40-100s',
    parameters: {
      mode: 'runOnceForEachItem',
      jsCode: `const d = Math.floor(Math.random() * 60) + 40;
return { json: { ...$input.item.json, delay_segundos: d } };`,
    },
    position: [1600, 120],
  },
});

const wait = node({
  type: 'n8n-nodes-base.wait',
  version: 1.1,
  config: {
    name: 'Wait (anti-ban)',
    parameters: { resume: 'timeInterval', amount: '={{ $json.delay_segundos }}', unit: 'seconds' },
    position: [1830, 120],
  },
});

const resumo = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Fim do ciclo',
    parameters: {
      mode: 'manual',
      assignments: { assignments: [{ id: 'r1', name: 'status', value: 'Lembretes de vacina processados', type: 'string' }] },
    },
    position: [1140, 330],
  },
});

export default workflow('reativacao-vacina-vet', 'Reativação de Vacina — Vet')
  .add(schedule)
  .to(buscarFila)
  .to(montarMensagem)
  .to(limitar)
  .to(loop
    .onDone(resumo)
    .onEachBatch(disparo.to(marcar.to(gerarDelay.to(wait.to(nextBatch(loop))))))
  );
