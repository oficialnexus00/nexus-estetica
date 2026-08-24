# NEXUS Odonto — Documentação Técnica & Guia de Adaptação (Handoff)

> **Para quem:** dev que vai construir a versão **exclusiva para veterinária** usando este sistema como base.
> **O que é isto:** documentação completa do sistema odontológico da NEXUS (arquitetura, modelo
> de dados, telas, setup do zero) **+ um mapa de como adaptar para veterinária**.
> **Status do base:** piloto REAL rodando (Supabase + deploy Vercel), design partner Dr. Rodrigo Couto.

---

## 1. Visão geral

Sistema de **gestão para clínica odontológica** com um diferencial: uma **IA comercial (Patrícia)**
que opera o WhatsApp — confirma consultas, faz follow-up de orçamento e reativa paciente sozinha.

O sistema em si é o "cérebro/dado" (agenda, prontuário, orçamento, financeiro). A Patrícia é o
"braço no WhatsApp", construída **por fora** (GPTMaker → n8n) e integrada por webhook.

**Princípios de arquitetura:**
- **Multi-tenant**: uma organização (o dono) tem N clínicas isoladas. Cada usuário só enxerga as suas.
- **RLS desde o dia 1** (segurança no banco, não só no front) — crítico p/ dado de saúde (LGPD).
- **Modo demo → real automático**: sem chaves = dados fictícios; com chaves = sistema real.
- **Desktop-first, dark-mode**, estética minimalista (Apple/Linear). Cor #00BFA5 (teal), fonte Inter.

---

## 2. Stack técnico

| Camada | Tecnologia |
|---|---|
| Frontend | **React 18 + TypeScript + Vite 5** |
| Estilo | **Tailwind CSS v4** (plugin `@tailwindcss/vite`) |
| Backend | **Supabase** (Postgres + Auth + Row Level Security) |
| Cliente DB | `@supabase/supabase-js` v2 |
| Deploy | **Vercel** (SPA estático) |
| IA (externa) | Patrícia = agente WhatsApp no **GPTMaker** (migra p/ **n8n**), integra por webhook |

Sem router (troca de tela por estado no `App.tsx`), sem lib de UI pesada, sem Recharts (gráficos são
SVG feito à mão). Ícones são glifos unicode. **Stack enxuta de propósito.**

---

## 3. Estrutura do repositório

```
app/
  index.html
  package.json          # deps: react, react-dom, @supabase/supabase-js
  vite.config.ts        # plugins: react + tailwindcss
  .env                  # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (NÃO commitar)
  .env.example
  supabase/
    schema.sql          # tabelas + RLS + funções helper (rodar 1x)
    seed.sql            # cria org + clínicas + profissionais do dono
  src/
    main.tsx            # gate de auth: mostra Login OU App conforme sessão
    App.tsx             # shell (sidebar, header, roteamento de telas, carrega dados reais)
    index.css           # tema Tailwind v4 (tokens de cor no @theme)
    data.ts             # DADOS DEMO (fake) + fmt() de moeda
    lib/
      supabase.ts       # cria o client; define MODO_DEMO
      clinics.ts        # listClinics()
      patients.ts       # listPatients(), createPatient()
      budgets.ts        # listBudgets(), createBudget()
      agenda.ts         # listProfessionals(), listAppointments(), createAppointment()
    views/
      Login.tsx         # login real (signInWithPassword)
      Dashboard.tsx     # KPIs, gráfico SVG, feed da Patrícia, produção por dentista
      Agenda.tsx        # grade por profissional, navegação de dia, REAL
      Pacientes.tsx     # lista + painel lateral + abre a ficha clínica, REAL
      FichaClinica.tsx  # 8 abas + odontograma + filtros + "+ Orçar"
      Orcamentos.tsx    # KPIs + tabela + "+ Novo orçamento", REAL
      Financeiro.tsx    # entradas/saídas + "+ Novo lançamento" (demo)
      Bia.tsx           # painel da Patrícia
    components/
      Modal.tsx         # shell de modal + SucessoPanel + inputCls/labelCls (reutilizáveis)
      ModalAgendar.tsx  # grava agendamento real (cria paciente se for nome novo)
      ModalPaciente.tsx # grava paciente real
      ModalOrcamento.tsx# grava orçamento real (com seleção de paciente)
      ModalBuscar.tsx   # busca (pacientes/orçamentos/agenda)
      ModalLancamento.tsx # novo lançamento financeiro (demo)
      ModalWhatsApp.tsx # simula a conversa da Patrícia no WhatsApp (pra demo)
      Toast.tsx         # feedback leve
      Odontograma.tsx   # componente do odontograma (dentição)
```

---

## 4. Modelo de dados (Supabase / Postgres)

Arquivo: `app/supabase/schema.sql`. Multi-tenant: **organization → clinics**, e o usuário se liga à
organização por `memberships`.

| Tabela | Campos principais | Observação |
|---|---|---|
| `organizations` | id, nome, owner_id→auth.users | o "dono" (ex: Rodrigo) |
| `clinics` | id, org_id, nome, cidade, telefone, cnpj | as clínicas da org |
| `memberships` | user_id, org_id, papel | papel: dono/dentista/recepcao/financeiro |
| `professionals` | id, clinic_id, nome, especialidade, ativo | a equipe (dentistas) |
| `patients` | id, clinic_id, nome, nascimento, telefone, origem, alerta_saude, saldo | pacientes |
| `appointments` | id, clinic_id, professional_id, patient_id, inicio (timestamptz), duracao_min, procedimento, status | agenda |
| `budgets` | id, clinic_id, patient_id, procedimento, valor, status, follow_ups, ultima_acao | orçamentos |
| `procedures` | id, patient_id, nome, dente, estado | odontograma / procedimentos por dente |

**Status:** appointments = `pendente/confirmada/atendida/falta/cancelada`;
budgets = `aguardando/follow-up/aprovado/recusado`.

**RLS (o coração da segurança):** duas funções `security definer` resolvem o isolamento:
- `user_org_ids()` → orgs do usuário logado (via memberships)
- `user_clinic_ids()` → clínicas dessas orgs

Todas as tabelas têm RLS ligado e políticas que restringem tudo a `clinic_id in (select user_clinic_ids())`.
Ou seja: **um usuário nunca enxerga dado de outra clínica** — garantido pelo banco.

---

## 5. Autenticação e o modo demo → real

- **Auth:** Supabase Auth (e-mail + senha). Não há tela de cadastro — usuários são criados no dashboard
  do Supabase (Authentication → Add user) e ligados à org pelo `seed.sql`.
- **`lib/supabase.ts`:** lê `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` do `.env`.
  `MODO_DEMO = !url || !anon`. Sem chaves → app roda com dados fake (`data.ts`). Com chaves → real.
- **`main.tsx`:** checa a sessão; sem sessão mostra `Login`, com sessão mostra `App`.

---

## 6. Padrão da camada de dados real (IMPORTANTE p/ reaproveitar)

Cada entidade tem um arquivo em `lib/` com `listX()` e `createX()` usando o client do Supabase.
As telas são **"real-aware"**: recebem a prop `realClinicId`. Se ela existe → busca/grava no banco;
senão → usa `data.ts` (demo). Exemplo (Pacientes):

```
App.tsx  → carrega clínicas reais (listClinics) e profissionais (listProfessionals)
         → passa realClinicId + clinicNome pra <Pacientes/>
Pacientes.tsx → se realClinicId: listPatients() no mount; "+ Novo paciente" → createPatient() → recarrega
              → senão: usa data.pacientes (demo)
```

Esse mesmo padrão vale pra **Pacientes, Orçamentos e Agenda** (já reais). **Dashboard e Financeiro
ainda em demo** (Financeiro precisa de uma tabela nova — não existe no schema ainda).

---

## 7. As telas (o que cada uma faz)

- **Dashboard** — KPIs (recebido no mês, consultas hoje, no-show, orçamentos em aberto), gráfico de
  recebimentos (SVG), feed "Patrícia em ação agora", produção por dentista, taxa de aprovação.
- **Agenda** — grade por profissional (colunas), linha do "agora", navegação de dia (← → Hoje),
  resumo do dia. **Real:** colunas = profissionais do banco; eventos = appointments do dia.
- **Pacientes** — busca + tabela + painel lateral (dados + "Abrir ficha clínica", "Agendar", "WhatsApp").
  **Real:** lê/grava no banco.
- **Ficha clínica** — 8 abas (Ficha/Anamnese/Evoluções/Orçamentos/Financeiro/Documentos/Arquivos/Consultas),
  **odontograma** no centro, filtros, e o **"+ Orçar"** que joga o procedimento no follow-up da Patrícia.
- **Orçamentos** — KPIs ("dinheiro na mesa", taxa de aprovação, recuperado pela Patrícia) + tabela +
  "+ Novo orçamento". **Real.** É a **killer feature**: orçamento sem resposta em 48h entra no
  follow-up automático da Patrícia.
- **Financeiro** — entradas/saídas dos últimos 7 dias + tabela + "+ Novo lançamento" (demo).
- **Patrícia (IA)** — painel da agente.

---

## 8. Componentes reutilizáveis (padrão de modal)

`Modal.tsx` exporta o shell (`<Modal>`), um `SucessoPanel` (tela de "salvo com sucesso") e os estilos
de campo (`inputCls`, `labelCls`). Os modais de criação (`ModalAgendar/Paciente/Orcamento`) seguem
o mesmo formato: formulário → se tem `clinicId`, grava de verdade no Supabase → mostra o SucessoPanel.
**Reaproveita direto** na versão veterinária (só troca os campos).

---

## 9. Setup do zero (passo a passo)

1. **Criar projeto no Supabase** (região São Paulo). Guardar a senha do Postgres.
2. **Rodar `supabase/schema.sql`** no SQL Editor (cria tabelas + RLS + funções).
3. **Criar o usuário** (Authentication → Add user → e-mail + senha, "Auto confirm").
4. **Ajustar e rodar `supabase/seed.sql`** (troca o e-mail pelo do usuário; cria org + clínicas + equipe).
5. **`.env`** em `app/`: copiar de `.env.example` e colar `VITE_SUPABASE_URL` e a **publishable key**
   (Settings → API Keys). A publishable key é pública por design — o RLS protege os dados.
6. `npm install` → `npm run dev` → abre em `localhost:5173`.
7. **Deploy (Vercel):**
   - `vercel link` (cria o projeto)
   - Setar as env vars `VITE_SUPABASE_*` no Vercel (o build lá precisa delas — o `.env` é gitignored)
   - `vercel deploy --prod`
   - **Desligar a proteção de login da Vercel** (Settings → Deployment Protection → Vercel Authentication → off),
     senão só quem tem conta Vercel acessa.

---

## 10. A Patrícia (IA) — como pensar a integração

A Patrícia **não** é construída dentro do app. É uma agente de WhatsApp feita no **GPTMaker** (migração
p/ n8n). O CRM é o painel + o gatilho. O fluxo da killer feature:

```
Orçamento sem resposta em 48h (no CRM)
   → dispara webhook → Patrícia (WhatsApp) retoma a conversa, responde objeção
   → resultado volta pro CRM (via Edge Function Supabase → banco)
```

Nunca construir lógica de bot dentro do app React — a integração é por **API/webhook**.

---

## 11. 🐾 Guia de adaptação para VETERINÁRIA

A maior parte do sistema é **reaproveitável**. O que muda é a parte específica de "paciente".

### 11.1 Mapa de conceitos

| Odonto | Veterinária |
|---|---|
| Clínica odontológica | Clínica / hospital veterinário |
| Dentista (`professionals`) | **Veterinário** (mesma tabela, muda especialidade) |
| **Paciente (humano)** | **Tutor (dono) + Pet (animal)** → 2 entidades (1 tutor : N pets) |
| Ficha clínica + **Odontograma** | **Ficha do animal** (espécie, raça, peso, vacinas, vermífugo, castrado, alergias) |
| Anamnese odonto | Anamnese veterinária (comportamento, dieta, histórico) |
| Procedimentos por dente | Procedimentos vet (consulta, vacina, cirurgia, exame, internação) |
| Orçamento + follow-up Patrícia | **IGUAL** (mantém — follow-up de cirurgia/tratamento) |
| Agenda por dentista | Agenda por veterinário (+ sala/internação, opcional) |
| Financeiro / Dashboard | **IGUAL** |

### 11.2 Mudanças no schema

- **Quebrar `patients` em duas tabelas:**
  - `tutors` (nome, telefone, cpf, endereço)
  - `pets` (tutor_id → tutors, nome, **espécie**, **raça**, nascimento, sexo, **peso**, **castrado** bool,
    pelagem, microchip, alertas)
- `appointments.patient_id` → **`pet_id`** (o tutor vem via `pet.tutor_id`)
- `budgets.patient_id` → **`pet_id`**
- Trocar `procedures` (odontograma) por ficha vet: uma tabela `vaccinations` (carteira de vacinas) +
  `clinical_records` (evolução), e opcionalmente `weight_log` (curva de peso).
- `professionals.especialidade` → especialidades vet (clínico geral, cirurgia, dermato, cardio, exóticos…).
- **Manter intactos:** `organizations`, `clinics`, `memberships`, as funções `user_org_ids()`/
  `user_clinic_ids()` e **toda a lógica de RLS** (só ajustar as políticas das tabelas novas no mesmo molde).

### 11.3 Mudanças na UI

- Tela **"Pacientes" → "Tutores & Pets"** (lista de pets com o tutor; ou tutor → seus pets).
- **Ficha:** mostrar tutor + pet + dados do animal; **trocar o componente `Odontograma`** por uma
  ficha clínica veterinária (carteira de vacinas, curva de peso, vermífugo, castração).
- `ModalPaciente` → `ModalTutor` + `ModalPet` (ou um combinado "novo atendimento").
- Ajustar labels/textos (dente → n/a; "odontograma" → "ficha do animal"; procedimentos).
- Trocar branding (nome/cor) — ex: NEXUS Vet.

### 11.4 O que se reaproveita quase 100%

Auth, multi-tenant + **RLS**, padrão demo→real, padrão `lib/` de dados, **Agenda** (grade), **Orçamentos +
follow-up da Patrícia**, **Financeiro**, **Dashboard**, todos os **componentes de Modal**, o deploy Vercel
e a identidade visual (base). Estimativa: **70–80% reaproveitável.**

### 11.5 Estratégia recomendada

1. **Fork** do repo → renomear (`nexus-vet`).
2. Criar um **projeto Supabase PRÓPRIO** (⚠️ **LGPD**: nunca usar o projeto/dados do Rodrigo — dado de
   saúde é isolado por cliente).
3. Ajustar o schema (tutors + pets + ficha vet).
4. Trocar as telas **Pacientes** e **Ficha** (o resto quase não muda).
5. Ajustar labels/branding → deploy.

---

## 12. O que o dev vai precisar

- Acesso ao repo GitHub (base): `oficialnexus00/nexus-estetica` (pasta `app/`).
- Node + npm; conta **Supabase** (projeto próprio); conta **Vercel** (deploy).
- ⚠️ **Não reutilizar chaves nem dados do piloto do Rodrigo.** Ambiente novo, do zero, com este doc.

---

*Documento gerado para handoff do sistema NEXUS Odonto → base da versão veterinária. NEXUS Inteligência Artificial.*
