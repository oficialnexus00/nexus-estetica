-- ============================================================
-- NEXUS Odonto — schema inicial (Supabase / Postgres)
-- Multi-tenant por organização → clínicas. RLS desde o dia 1.
-- Rodar no SQL Editor do Supabase (uma vez).
-- ============================================================

-- Extensões
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ORGANIZAÇÃO (o dono — ex: Rodrigo) e CLÍNICAS (as 2 dele)
-- ------------------------------------------------------------
create table if not exists organizations (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists clinics (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  nome        text not null,
  cidade      text,
  telefone    text,
  cnpj        text,
  created_at  timestamptz not null default now()
);

-- Vínculo usuário ↔ organização (papel de acesso)
create table if not exists memberships (
  user_id     uuid not null references auth.users(id) on delete cascade,
  org_id      uuid not null references organizations(id) on delete cascade,
  papel       text not null default 'dono' check (papel in ('dono','dentista','recepcao','financeiro')),
  primary key (user_id, org_id)
);

-- ------------------------------------------------------------
-- EQUIPE, PACIENTES, AGENDA, ORÇAMENTOS, ODONTOGRAMA
-- ------------------------------------------------------------
create table if not exists professionals (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references clinics(id) on delete cascade,
  nome          text not null,
  especialidade text,
  ativo         boolean not null default true
);

create table if not exists patients (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references clinics(id) on delete cascade,
  nome          text not null,
  nascimento    date,
  telefone      text,
  origem        text,               -- Instagram Ads, Indicação, Google...
  alerta_saude  text,               -- hipertenso, alergia, diabético...
  saldo         numeric(12,2) not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists appointments (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references clinics(id) on delete cascade,
  professional_id uuid references professionals(id) on delete set null,
  patient_id    uuid references patients(id) on delete set null,
  inicio        timestamptz not null,
  duracao_min   int not null default 30,
  procedimento  text,
  status        text not null default 'pendente'
                check (status in ('pendente','confirmada','atendida','falta','cancelada')),
  created_at    timestamptz not null default now()
);

create table if not exists budgets (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null references clinics(id) on delete cascade,
  patient_id    uuid references patients(id) on delete set null,
  procedimento  text not null,
  valor         numeric(12,2) not null default 0,
  status        text not null default 'aguardando'
                check (status in ('aguardando','follow-up','aprovado','recusado')),
  follow_ups    int not null default 0,
  ultima_acao   text,
  created_at    timestamptz not null default now()
);

-- Odontograma / procedimentos por dente
create table if not exists procedures (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid not null references patients(id) on delete cascade,
  nome          text not null,
  dente         text,               -- ex: '44 V', '35 O, M'
  estado        text not null default 'realizar'
                check (estado in ('realizar','realizado','pre')),
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Helper: organizações que o usuário logado enxerga
-- ------------------------------------------------------------
create or replace function user_org_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select org_id from memberships where user_id = auth.uid()
$$;

create or replace function user_clinic_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select c.id from clinics c where c.org_id in (select user_org_ids())
$$;

-- ------------------------------------------------------------
-- RLS — cada usuário só enxerga os dados da(s) sua(s) clínica(s)
-- ------------------------------------------------------------
alter table organizations enable row level security;
alter table clinics       enable row level security;
alter table memberships   enable row level security;
alter table professionals enable row level security;
alter table patients      enable row level security;
alter table appointments  enable row level security;
alter table budgets       enable row level security;
alter table procedures    enable row level security;

-- Organizações e clínicas
create policy org_read   on organizations for select using (id in (select user_org_ids()));
create policy clinic_all on clinics for all
  using (org_id in (select user_org_ids()))
  with check (org_id in (select user_org_ids()));
create policy mem_read   on memberships for select using (user_id = auth.uid());

-- Entidades por clínica (SELECT/INSERT/UPDATE/DELETE do próprio tenant)
create policy prof_all  on professionals for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));
create policy pat_all   on patients for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));
create policy appt_all  on appointments for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));
create policy bud_all   on budgets for all
  using (clinic_id in (select user_clinic_ids())) with check (clinic_id in (select user_clinic_ids()));
create policy proc_all  on procedures for all
  using (patient_id in (select id from patients where clinic_id in (select user_clinic_ids())))
  with check (patient_id in (select id from patients where clinic_id in (select user_clinic_ids())));

-- Índices úteis
create index if not exists idx_patients_clinic on patients(clinic_id);
create index if not exists idx_appt_clinic_inicio on appointments(clinic_id, inicio);
create index if not exists idx_budgets_clinic on budgets(clinic_id);
create index if not exists idx_proc_patient on procedures(patient_id);

-- ------------------------------------------------------------
-- FINANCEIRO — lançamentos (entradas/saídas) por clínica
-- ------------------------------------------------------------
create table if not exists transactions (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references clinics(id) on delete cascade,
  data        date not null default current_date,
  descricao   text not null,
  categoria   text,
  valor       numeric(12,2) not null default 0,
  tipo        text not null check (tipo in ('entrada','saida')),
  forma       text,
  created_at  timestamptz not null default now()
);
alter table transactions enable row level security;
create policy tx_all on transactions for all
  using (clinic_id in (select user_clinic_ids()))
  with check (clinic_id in (select user_clinic_ids()));
create index if not exists idx_tx_clinic_data on transactions(clinic_id, data desc);
