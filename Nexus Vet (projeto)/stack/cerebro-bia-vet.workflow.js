// ===========================================================================
// Cérebro da Bia Vet — AI Agent node no n8n   (SAI do GPTMaker)
//
// Este é o PLANO REATIVO do agente (carcaça NEXUS): o cérebro que responde,
// rodando na NOSSA infra em vez do GPTMaker. Ele:
//   WhatsApp → Evolution (webhook) → extrai/filtra → dedup (Redis) →
//   AI Agent node (system prompt Bia Vet + memória + tools) → responde →
//   loga a interação no banco (fecha o circuito).
//
// O AI Agent consome as ferramentas do tool-server que JÁ existe
// (`essencial-vet.workflow.js`) via MCP Client Tool — não reescreve as tools.
//
// ⚠️ STATUS: RASCUNHO — precisa ser importado no n8n e ter as subconexões do
// AI Agent (model / memory / tool) confirmadas no canvas. Os tipos de node e o
// encadeamento seguem o padrão do repo, mas a fiação de subnodes de IA depende
// da versão instalada dos nodes langchain — validar antes de publicar.
//
// PENDÊNCIAS p/ deploy (Kaian):
//   - Rodar `schema-vet.sql` (+ `schema-vet-proativo.sql`) no Supabase.
//   - Publicar o `essencial-vet` (MCP Server) e pegar a URL do MCP.
//   - Criar credenciais: "Anthropic NEXUS", "Postgres NEXUS Vet" (memória),
//     "Redis NEXUS", "Evolution API", "Supabase NEXUS Vet".
//   - Definir CLINIC_ID real, a instância Evolution e a URL do MCP Server.
//   - Colar o system prompt de `prompt-bia-vet.md` no AI Agent node.
//   - Detalhes do encanamento de entrada (buffer/dedup/memória): skill
//     `agente-virtual-expert`. MCP client (SSE x Streamable): `n8n-mcp-expert`.
// ===========================================================================

import { workflow, trigger, node, newCredential } from '@n8n/workflow-sdk';

// --- Config por INSTALAÇÃO (uma clínica). Constantes, nunca vêm da IA. --------
const CLINIC_ID       = 'UUID-DA-CLINICA';
const EVOLUTION_URL   = 'https://vet-evolution.nexushealth.com.br';
const EVOLUTION_INST  = 'bia-vet';                          // instância do WhatsApp
const MCP_SERVER_URL  = 'https://vet-n8n.nexushealth.com.br/mcp/essencial-vet/sse';

const evoCred = { httpHeaderAuth: newCredential('Evolution API') };
const sb      = { supabaseApi: newCredential('Supabase NEXUS Vet') };

// --- 1. Entrada: webhook da Evolution ----------------------------------------
const webhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2,
  config: {
    name: 'Evolution — Mensagem Recebida',
    parameters: { httpMethod: 'POST', path: 'bia-vet-in', responseMode: 'lastNode' },
    position: [0, 200],
  },
});

// --- 2. Extrair e filtrar o payload (padrão agente-virtual-expert) ------------
const extrair = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Extrair Mensagem',
    parameters: {
      mode: 'runOnceForEachItem',
      jsCode: `const body = $input.item.json.body || $input.item.json;
const remoteJid = body.data?.key?.remoteJid || "";
const fromMe    = body.data?.key?.fromMe || false;
const messageId = body.data?.key?.id || "";
const type      = body.data?.messageType || "";
const pushName  = body.data?.pushName || "Tutor";
const phone     = remoteJid.replace(/@s\\.whatsapp\\.net|@g\\.us/, "");
const isGroup   = remoteJid.includes("@g.us");

const map = {
  conversation:        () => body.data.message?.conversation,
  extendedTextMessage: () => body.data.message?.extendedTextMessage?.text,
  imageMessage:        () => body.data.message?.imageMessage?.caption || "[IMAGEM]",
  audioMessage:        () => "[ÁUDIO]",           // transcrever com Whisper à parte
  buttonsResponseMessage: () => body.data.message?.buttonsResponseMessage?.selectedDisplayText,
  listResponseMessage:    () => body.data.message?.listResponseMessage?.title,
};
const text = map[type]?.() || null;

// Filtros de entrada: ignora o que não é mensagem de texto de um humano
if (fromMe || isGroup || !text) return { json: { _skip: true } };

return { json: { phone, jid: remoteJid, nome: pushName, message: text, messageId } };`,
    },
    position: [220, 200],
  },
});

const filtro = node({
  type: 'n8n-nodes-base.filter',
  version: 2,
  config: {
    name: 'Descartar inválidas',
    parameters: { conditions: { conditions: [
      { leftValue: '={{ $json._skip }}', rightValue: true, operator: { type: 'boolean', operation: 'notEqual' } },
    ] } },
    position: [440, 200],
  },
});

// --- 3. Dedup por messageId (Redis SET NX) — não processar 2x -----------------
// Ver agente-virtual-expert p/ o buffer "smart" (acumular msgs enquanto digita).
const dedup = node({
  type: 'n8n-nodes-base.redis',
  version: 1,
  config: {
    name: 'Dedup (Redis SETNX)',
    parameters: {
      operation: 'set', key: '={{ "seen:" + $json.messageId }}', value: '1',
      keyType: 'string', expire: true, ttl: 600,
    },
    credentials: { redis: newCredential('Redis NEXUS') },
    onError: 'continueRegularOutput',
    position: [660, 200],
  },
});

// --- 4. Contexto da clínica (injeta variáveis do system prompt) ---------------
const clinica = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Contexto da Clínica',
    parameters: {
      resource: 'row', operation: 'get', tableId: 'clinics',
      filterType: 'manual',
      filters: { conditions: [{ keyName: 'id', condition: 'eq', keyValue: CLINIC_ID }] },
    },
    credentials: sb,
    position: [880, 200],
  },
});

// --- 5. O CÉREBRO: AI Agent node ---------------------------------------------
// Subnodes: model (Claude), memory (Postgres por telefone), tool (MCP → essencial-vet).
// System Message = conteúdo de prompt-bia-vet.md (com as variáveis {{clinica_*}}).
const modelo = node({
  type: '@n8n/n8n-nodes-langchain.lmChatAnthropic',
  version: 1.3,
  config: {
    name: 'Claude (Sonnet 5)',
    parameters: { model: 'claude-sonnet-5', options: { temperature: 0.5, maxTokensToSample: 1024 } },
    credentials: { anthropicApi: newCredential('Anthropic NEXUS') },
    position: [1100, 400],
  },
});

const memoria = node({
  type: '@n8n/n8n-nodes-langchain.memoryPostgresChat',
  version: 1.3,
  config: {
    name: 'Memória (por telefone)',
    parameters: { sessionIdType: 'customKey', sessionKey: '={{ $json.phone }}', contextWindowLength: 20, tableName: 'chat_memory' },
    credentials: { postgres: newCredential('Postgres NEXUS Vet') },
    position: [1300, 400],
  },
});

const ferramentas = node({
  type: '@n8n/n8n-nodes-langchain.mcpClientTool',
  version: 1,
  config: {
    name: 'Ferramentas (essencial-vet)',
    parameters: { sseEndpoint: MCP_SERVER_URL, authentication: 'none' },
    position: [1500, 400],
  },
});

const agente = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 2,
  config: {
    name: 'Bia Vet — AI Agent',
    parameters: {
      promptType: 'define',
      text: '={{ $json.message }}',
      options: {
        // Cole aqui o conteúdo de prompt-bia-vet.md. As variáveis {{clinica_*}}
        // vêm do node "Contexto da Clínica" (nome, cidade, horarios, emergência).
        systemMessage: '={{ $json.__SYSTEM_PROMPT_BIA_VET__ }}',
      },
    },
    subnodes: {
      ai_languageModel: [modelo],
      ai_memory: [memoria],
      ai_tool: [ferramentas],
    },
    position: [1320, 200],
  },
});

// --- 6. Responder no WhatsApp -------------------------------------------------
const responder = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Responder (Evolution)',
    parameters: {
      method: 'POST',
      url: `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INST}`,
      authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
      sendBody: true,
      bodyParameters: { parameters: [
        { name: 'number', value: '={{ $("Extrair Mensagem").item.json.phone }}' },
        { name: 'text',   value: '={{ $json.output }}' },
      ] },
    },
    credentials: evoCred,
    onError: 'continueRegularOutput',
    position: [1540, 200],
  },
});

// --- 7. Fecha o circuito: loga a interação no banco --------------------------
const logar = node({
  type: 'n8n-nodes-base.supabase',
  version: 1,
  config: {
    name: 'Log da Interação',
    parameters: {
      resource: 'row', operation: 'create', tableId: 'interactions',
      dataToSend: 'defineBelow',
      fieldsUi: { fieldValues: [
        { fieldId: 'clinic_id', fieldValue: CLINIC_ID },
        { fieldId: 'tipo',      fieldValue: 'recebida' },
        { fieldId: 'resumo',    fieldValue: '={{ $("Extrair Mensagem").item.json.message }}' },
      ] },
    },
    credentials: sb,
    onError: 'continueRegularOutput',
    position: [1760, 200],
  },
});

export default workflow('cerebro-bia-vet', 'Cérebro da Bia Vet — AI Agent')
  .add(webhook)
  .to(extrair)
  .to(filtro)
  .to(dedup)
  .to(clinica)
  .to(agente)
  .to(responder)
  .to(logar);
