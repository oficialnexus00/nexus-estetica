# Ferramentas — o tool-server do agente

As ferramentas são o que o agente PODE fazer. Sem elas, o agente é um papagaio que
alucina; com elas, ele age no sistema real. Este é o padrão validado da NEXUS
(`Nexus Vet (projeto)/stack/essencial-vet.workflow.js`, 13 nós, valid: true).

## Anatomia do tool-server

Um workflow por cliente. Header + constantes + tools + `mcpTrigger`.

```js
import { workflow, trigger, tool, fromAi, newCredential } from '@n8n/workflow-sdk';

const sb = { supabaseApi: newCredential('Supabase <cliente>') };
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';

// Tenant fixo na instalação. NUNCA fromAi() — a IA não sabe UUID e não pode
// escolher em qual cliente escreve. Regra de ouro nº 1.
const CLINIC_ID = 'UUID-DO-CLIENTE';

// ... tools ...

const mcpServer = trigger({
  type: '@n8n/n8n-nodes-langchain.mcpTrigger',
  version: 1.1,
  config: {
    name: '<Agente> — MCP Server',
    parameters: { path: '<cliente>-<agente>' },   // path único por tenant
    subnodes: { tools: [ /* todas as tools */ ] },
  },
});
```

## Os dois tipos de ferramenta

### Tipo A — leitura/escrita direta: `supabaseTool`

Pra ação que é só CRUD numa tabela. Ex.: buscar tutor, criar pet, cancelar agenda.

```js
const buscarTutor = tool({
  type: 'n8n-nodes-base.supabaseTool',
  version: 1,
  config: {
    name: 'tutor_buscar_por_telefone',
    parameters: {
      toolDescription: 'Busca o tutor pelo telefone (apenas dígitos com DDD). Retorna os dados e o id. Use SEMPRE no início do atendimento pra identificar quem fala, antes de qualquer agendamento.',
      resource: 'row',
      operation: 'getAll',      // getAll | create | update
      tableId: 'tutors',
      returnAll: false, limit: 5,
      filterType: 'manual', matchType: 'allFilters',
      filters: { conditions: [
        { keyName: 'telefone', condition: 'eq',
          keyValue: fromAi('telefone', 'Telefone do tutor com DDD, só dígitos') },
      ] },
    },
    credentials: sb,
  },
});
```

Na **escrita**, o `clinic_id` sai da constante, não da IA:

```js
fieldsUi: { fieldValues: [
  { fieldId: 'clinic_id', fieldValue: CLINIC_ID },              // ← constante
  { fieldId: 'nome',      fieldValue: fromAi('nome', 'Nome do tutor') },
  { fieldId: 'telefone',  fieldValue: fromAi('telefone', 'DDD + número, só dígitos') },
] }
```

### Tipo B — regra calculada: `toolHttpRequest` → RPC do Supabase

Quando a resposta exige CÁLCULO (horário livre, elegibilidade, próxima dose), a
regra **não vai no workflow** — vira função no banco e a tool só chama (regra de
ouro nº 2). Assim reativo e proativo usam a MESMA regra.

```js
const buscarHorarios = tool({
  type: '@n8n/n8n-nodes-langchain.toolHttpRequest',
  version: 1.1,
  config: {
    name: 'agenda_buscar_horarios_disponiveis',
    parameters: {
      toolDescription: 'Retorna horários livres pra um serviço numa data. Use ANTES de agendar, pra oferecer opções reais. Data em AAAA-MM-DD.',
      method: 'POST',
      url: `${SUPABASE_URL}/rest/v1/rpc/buscar_horarios_disponiveis`,
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendBody: true, specifyBody: 'json',
      jsonBody: `={"p_clinic_id":"${CLINIC_ID}","p_service_id":"{{ $fromAI("service_id","ID do servico","string") }}","p_data":"{{ $fromAI("data","Data AAAA-MM-DD","string") }}"}`,
    },
    credentials: { httpHeaderAuth: newCredential('Supabase REST (apikey)') },
  },
});
```

## Como escrever uma boa `toolDescription`

A `toolDescription` é o que o LLM lê pra decidir usar a tool. É prompt, não
comentário. Ela deve ensinar três coisas:

1. **O que a tool faz** e o que retorna (inclusive "retorna o id, necessário pra…").
2. **Quando usar** — o gatilho ("Use SEMPRE no início", "Use quando o tutor perguntar
   valores").
3. **Quando NÃO usar / a trava** — ("nunca estime nem invente preço", "confirme com
   o tutor ANTES de cancelar").

**Exemplo bom (do valores):**
> "Consulta o preço de um serviço pelo nome. Use SEMPRE que o tutor perguntar valores
> — nunca estime nem invente preço."

Isso mata a alucinação de preço na origem: a única forma do agente falar valor é
chamando a tool.

## Sequenciamento: ferramentas que dependem de outras

O agente precisa dos ids na ordem certa. Deixe isso explícito nas descrições, porque
é assim que o LLM encadeia:

```
tutor_buscar_por_telefone → (id do tutor)
   ├─ se não existe → tutor_incluir → (id do tutor)
   pet_listar_por_tutor → (id do pet)   [ou pet_incluir]
   servico_listar → (service_id)
   agenda_buscar_horarios_disponiveis → (horários reais)
   agendamento_incluir  ← só depois de confirmar pet + serviço + horário com o tutor
```

Cada descrição de tool deve dizer qual id ela devolve e qual id ela consome. É o que
faz o agente andar sozinho sem pedir UUID pro humano.

## Catálogo mínimo de um agente de atendimento/venda

Genérico — troque "tutor/pet" pelo sujeito do nicho:

| Tool | Tipo | Papel |
|---|---|---|
| `<cliente>_buscar_por_telefone` | A (read) | Identificar quem fala |
| `<cliente>_incluir` | A (write) | Cadastrar novo |
| `<item>_listar` | A (read) | Listar o que o cliente tem (pets, contratos…) |
| `servico_listar` / `valores_consultar` | A (read) | Catálogo e preço (nunca inventar) |
| `agenda_buscar_horarios_disponiveis` | B (RPC) | Horário real, calculado no banco |
| `agendamento_incluir` / `_listar` / `_desmarcar` | A (write/read) | Ciclo da agenda |
| `<regra>_status` (ex.: próximas vacinas, saldo, plano) | A/B | Dado de estado do cliente |

Ferramentas específicas do vet (protocolos de vacina, próxima dose) em
`references/vet.md`.

## Guardrails na camada de ferramenta

- **Escrita sempre carimba `clinic_id` da constante** (isolamento).
- **Ação destrutiva/irreversível** (cancelar, cobrar) → a descrição exige "confirme
  com o cliente ANTES". A confirmação é comportamento do prompt; a tool só executa.
- **Nada de preço/horário/protocolo hardcoded** na tool — sempre lê do banco, que é
  o que a clínica configurou.
- **Limite os `returnAll`** (use `limit`) pra não estourar contexto do agente.
