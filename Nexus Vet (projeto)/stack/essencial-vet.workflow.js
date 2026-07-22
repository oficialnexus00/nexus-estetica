// ===========================================================================
// Essencial Vet — Tool Server (MCP)  · v2: ligado no Supabase
// Validado no n8n (valid: true, 13 nós). NÃO publicado.
//
// MUDANÇA vs v1: as ferramentas falam com o BANCO DO PRODUTO (Supabase) em vez
// de uma API de clínica de terceiro. Fecha o circuito:
//     banco -> IA agenda -> WhatsApp -> volta pro banco
// Isso elimina o problema de double-entry: o que a Bia faz JÁ está no sistema.
//
// 11 ferramentas são leitura/escrita direta de tabela (supabaseTool).
// 1 (buscar horários) precisa de cálculo -> função SQL `buscar_horarios_disponiveis`
// no schema, chamada via PostgREST RPC. A regra fica no banco, não no workflow.
//
// PENDÊNCIAS p/ deploy (Kaian):
//   - Rodar `schema-vet.sql` no Supabase e trocar SUPABASE_URL.
//   - Criar credenciais: "Supabase NEXUS Vet" e "Supabase REST (apikey)".
//   - Conectar este MCP Server ao agente da Bia Vet (GPTMaker).
// ===========================================================================

import { workflow, trigger, tool, fromAi, newCredential } from '@n8n/workflow-sdk';

const sb = { supabaseApi: newCredential('Supabase NEXUS Vet') };
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
// Um tool-server POR CLÍNICA (padrão Nexus). O clinic_id é fixo na instalação —
// NUNCA pedir pra IA, que não tem como saber um UUID.
const CLINIC_ID = 'UUID-DA-CLINICA-PILOTO';

const buscarTutor = tool({
  type: 'n8n-nodes-base.supabaseTool',
  version: 1,
  config: {
    name: 'tutor_buscar_por_telefone',
    parameters: {
      toolDescription: 'Busca o tutor (dono do pet) pelo telefone/WhatsApp, apenas dígitos com DDD. Retorna os dados do tutor, incluindo o id. Use SEMPRE no início do atendimento para identificar quem está falando, antes de qualquer agendamento.',
      resource: 'row',
      operation: 'getAll',
      tableId: 'tutors',
      returnAll: false,
      limit: 5,
      filterType: 'manual',
      matchType: 'allFilters',
      filters: { conditions: [
        { keyName: 'telefone', condition: 'eq', keyValue: fromAi('telefone', 'Telefone do tutor com DDD, apenas dígitos') },
      ] },
    },
    credentials: sb,
    position: [300, -180],
  },
});

const incluirTutor = tool({
  type: 'n8n-nodes-base.supabaseTool',
  version: 1,
  config: {
    name: 'tutor_incluir',
    parameters: {
      toolDescription: 'Cria um novo tutor quando ele ainda não existe no sistema. Retorna o id do tutor criado, necessário para cadastrar o pet e agendar.',
      resource: 'row',
      operation: 'create',
      tableId: 'tutors',
      dataToSend: 'defineBelow',
      fieldsUi: { fieldValues: [
        { fieldId: 'clinic_id', fieldValue: CLINIC_ID },
        { fieldId: 'nome', fieldValue: fromAi('nome', 'Nome completo do tutor') },
        { fieldId: 'telefone', fieldValue: fromAi('telefone', 'Telefone com DDD, apenas dígitos') },
        { fieldId: 'cpf', fieldValue: fromAi('cpf', 'CPF do tutor, 11 dígitos (opcional)') },
      ] },
    },
    credentials: sb,
    position: [300, -20],
  },
});

const incluirPet = tool({
  type: 'n8n-nodes-base.supabaseTool',
  version: 1,
  config: {
    name: 'pet_incluir',
    parameters: {
      toolDescription: 'Cadastra um novo pet vinculado a um tutor existente. Espécie deve ser cao, gato ou outro. Retorna o id do pet, usado no agendamento e no controle de vacinas.',
      resource: 'row',
      operation: 'create',
      tableId: 'pets',
      dataToSend: 'defineBelow',
      fieldsUi: { fieldValues: [
        { fieldId: 'clinic_id', fieldValue: CLINIC_ID },
        { fieldId: 'tutor_id', fieldValue: fromAi('tutor_id', 'ID do tutor dono do pet') },
        { fieldId: 'nome', fieldValue: fromAi('nome_pet', 'Nome do pet') },
        { fieldId: 'especie', fieldValue: fromAi('especie', 'Espécie: cao, gato ou outro') },
        { fieldId: 'raca', fieldValue: fromAi('raca', 'Raça do pet (opcional)') },
        { fieldId: 'nascimento', fieldValue: fromAi('nascimento', 'Data de nascimento AAAA-MM-DD (opcional)') },
      ] },
    },
    credentials: sb,
    position: [300, 140],
  },
});

const listarPets = tool({
  type: 'n8n-nodes-base.supabaseTool',
  version: 1,
  config: {
    name: 'pet_listar_por_tutor',
    parameters: {
      toolDescription: 'Lista os pets de um tutor. Use para confirmar de qual pet o tutor está falando quando ele tem mais de um.',
      resource: 'row',
      operation: 'getAll',
      tableId: 'pets',
      returnAll: false,
      limit: 20,
      filterType: 'manual',
      matchType: 'allFilters',
      filters: { conditions: [
        { keyName: 'tutor_id', condition: 'eq', keyValue: fromAi('tutor_id', 'ID do tutor') },
        { keyName: 'status', condition: 'eq', keyValue: 'ativo' },
      ] },
    },
    credentials: sb,
    position: [300, 300],
  },
});

const listarServicos = tool({
  type: 'n8n-nodes-base.supabaseTool',
  version: 1,
  config: {
    name: 'servico_listar',
    parameters: {
      toolDescription: 'Lista os serviços oferecidos pela clínica (consulta, vacina, banho e tosa, exame, cirurgia) com id, preço e duração. Use para achar o service_id correto antes de buscar horários ou agendar.',
      resource: 'row',
      operation: 'getAll',
      tableId: 'services',
      returnAll: false,
      limit: 50,
      filterType: 'manual',
      matchType: 'allFilters',
      filters: { conditions: [
        { keyName: 'clinic_id', condition: 'eq', keyValue: CLINIC_ID },
        { keyName: 'ativo', condition: 'eq', keyValue: 'true' },
      ] },
    },
    credentials: sb,
    position: [540, -180],
  },
});

const consultarValores = tool({
  type: 'n8n-nodes-base.supabaseTool',
  version: 1,
  config: {
    name: 'valores_consultar',
    parameters: {
      toolDescription: 'Consulta o preço de um serviço pelo nome. Use SEMPRE que o tutor perguntar valores — nunca estime nem invente preço.',
      resource: 'row',
      operation: 'getAll',
      tableId: 'services',
      returnAll: false,
      limit: 10,
      filterType: 'manual',
      matchType: 'allFilters',
      filters: { conditions: [
        { keyName: 'clinic_id', condition: 'eq', keyValue: CLINIC_ID },
        { keyName: 'nome', condition: 'ilike', keyValue: fromAi('servico', 'Nome do serviço a consultar o preço') },
      ] },
    },
    credentials: sb,
    position: [540, -20],
  },
});

const buscarHorarios = tool({
  type: '@n8n/n8n-nodes-langchain.toolHttpRequest',
  version: 1.1,
  config: {
    name: 'agenda_buscar_horarios_disponiveis',
    parameters: {
      toolDescription: 'Retorna os horários livres para um serviço numa data. Use ANTES de agendar, para oferecer opções reais ao tutor. A data deve ir no formato AAAA-MM-DD.',
      method: 'POST',
      url: `${SUPABASE_URL}/rest/v1/rpc/buscar_horarios_disponiveis`,
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      specifyBody: 'json',
      jsonBody: `={"p_clinic_id":"${CLINIC_ID}","p_service_id":"{{ $fromAI("service_id","ID do servico","string") }}","p_data":"{{ $fromAI("data","Data desejada no formato AAAA-MM-DD","string") }}"}`,
    },
    credentials: { httpHeaderAuth: newCredential('Supabase REST (apikey)') },
    position: [540, 140],
  },
});

const incluirAgendamento = tool({
  type: 'n8n-nodes-base.supabaseTool',
  version: 1,
  config: {
    name: 'agendamento_incluir',
    parameters: {
      toolDescription: 'Cria o agendamento. Só chame depois de confirmar com o tutor o horário disponível, o pet e o serviço. O campo inicio deve ser data e hora ISO (AAAA-MM-DDTHH:MM:SS).',
      resource: 'row',
      operation: 'create',
      tableId: 'appointments',
      dataToSend: 'defineBelow',
      fieldsUi: { fieldValues: [
        { fieldId: 'clinic_id', fieldValue: CLINIC_ID },
        { fieldId: 'tutor_id', fieldValue: fromAi('tutor_id', 'ID do tutor') },
        { fieldId: 'pet_id', fieldValue: fromAi('pet_id', 'ID do pet que será atendido') },
        { fieldId: 'service_id', fieldValue: fromAi('service_id', 'ID do serviço') },
        { fieldId: 'professional_id', fieldValue: fromAi('professional_id', 'ID do profissional') },
        { fieldId: 'inicio', fieldValue: fromAi('inicio', 'Data e hora ISO do atendimento') },
        { fieldId: 'canal', fieldValue: 'ia' },
      ] },
    },
    credentials: sb,
    position: [780, -180],
  },
});

const listarAgendamentos = tool({
  type: 'n8n-nodes-base.supabaseTool',
  version: 1,
  config: {
    name: 'agendamento_listar_por_tutor',
    parameters: {
      toolDescription: 'Lista os agendamentos de um tutor. Use quando ele perguntar sobre consultas marcadas ou quiser remarcar ou cancelar.',
      resource: 'row',
      operation: 'getAll',
      tableId: 'appointments',
      returnAll: false,
      limit: 20,
      filterType: 'manual',
      matchType: 'allFilters',
      filters: { conditions: [
        { keyName: 'tutor_id', condition: 'eq', keyValue: fromAi('tutor_id', 'ID do tutor') },
      ] },
    },
    credentials: sb,
    position: [780, -20],
  },
});

const desmarcar = tool({
  type: 'n8n-nodes-base.supabaseTool',
  version: 1,
  config: {
    name: 'agendamento_desmarcar',
    parameters: {
      toolDescription: 'Cancela um agendamento (muda o status para cancelada). Confirme com o tutor ANTES de cancelar.',
      resource: 'row',
      operation: 'update',
      tableId: 'appointments',
      filterType: 'manual',
      matchType: 'allFilters',
      filters: { conditions: [
        { keyName: 'id', condition: 'eq', keyValue: fromAi('appointment_id', 'ID do agendamento a cancelar') },
      ] },
      dataToSend: 'defineBelow',
      fieldsUi: { fieldValues: [
        { fieldId: 'status', fieldValue: 'cancelada' },
      ] },
    },
    credentials: sb,
    position: [780, 140],
  },
});

const listarProtocolosVacina = tool({
  type: 'n8n-nodes-base.supabaseTool',
  version: 1,
  config: {
    name: 'vacina_listar_protocolos',
    parameters: {
      toolDescription: 'Retorna os protocolos de vacinação da clínica por espécie (cao, gato). Use para orientação GERAL sobre quais vacinas o pet precisa. O protocolo específico do animal é sempre o veterinário quem define.',
      resource: 'row',
      operation: 'getAll',
      tableId: 'vaccine_protocols',
      returnAll: false,
      limit: 20,
      filterType: 'manual',
      matchType: 'allFilters',
      filters: { conditions: [
        { keyName: 'clinic_id', condition: 'eq', keyValue: CLINIC_ID },
        { keyName: 'especie', condition: 'eq', keyValue: fromAi('especie', 'Espécie: cao, gato ou outro') },
      ] },
    },
    credentials: sb,
    position: [1020, -100],
  },
});

const proximasVacinas = tool({
  type: 'n8n-nodes-base.supabaseTool',
  version: 1,
  config: {
    name: 'pet_proximas_vacinas',
    parameters: {
      toolDescription: 'Retorna as vacinas aplicadas de um pet com a data da próxima dose. Use para avisar o tutor sobre reforços previstos ou atrasados e oferecer agendamento.',
      resource: 'row',
      operation: 'getAll',
      tableId: 'vaccinations',
      returnAll: false,
      limit: 30,
      filterType: 'manual',
      matchType: 'allFilters',
      filters: { conditions: [
        { keyName: 'pet_id', condition: 'eq', keyValue: fromAi('pet_id', 'ID do pet') },
      ] },
    },
    credentials: sb,
    position: [1020, 60],
  },
});

const mcpServer = trigger({
  type: '@n8n/n8n-nodes-langchain.mcpTrigger',
  version: 1.1,
  config: {
    name: 'Essencial Vet — MCP Server',
    parameters: { path: 'essencial-vet' },
    subnodes: {
      tools: [
        buscarTutor, incluirTutor, incluirPet, listarPets,
        listarServicos, consultarValores, buscarHorarios,
        incluirAgendamento, listarAgendamentos, desmarcar,
        listarProtocolosVacina, proximasVacinas,
      ],
    },
    position: [1320, 60],
  },
});

export default workflow('essencial-vet', 'Essencial Vet — Tool Server')
  .add(mcpServer);
