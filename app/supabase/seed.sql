-- ============================================================
-- SEED — setup inicial das clínicas do Rodrigo
-- Rodar DEPOIS que o Rodrigo criar a conta (e-mail/senha) no app.
-- Troque o e-mail abaixo pelo que ele usou pra cadastrar.
-- ============================================================

do $$
declare
  v_owner   uuid;
  v_org     uuid;
  v_clin1   uuid;
  v_clin2   uuid;
begin
  -- 1) acha o usuário do Rodrigo pelo e-mail de cadastro
  select id into v_owner from auth.users where email = 'rodrigo@exemplo.com' limit 1;
  if v_owner is null then
    raise exception 'Usuário não encontrado. Rodrigo precisa criar a conta no app primeiro.';
  end if;

  -- 2) organização + vínculo de dono
  insert into organizations (nome, owner_id) values ('Grupo Rodrigo Couto', v_owner) returning id into v_org;
  insert into memberships (user_id, org_id, papel) values (v_owner, v_org, 'dono');

  -- 3) as duas clínicas (a dele e a da esposa)
  insert into clinics (org_id, nome, cidade) values (v_org, 'Instituto Rodrigo Couto', 'Recife/PE') returning id into v_clin1;
  insert into clinics (org_id, nome, cidade) values (v_org, 'Clínica da Esposa', 'Recife/PE') returning id into v_clin2;

  -- 4) equipe da clínica principal (ajustar nomes reais)
  insert into professionals (clinic_id, nome, especialidade) values
    (v_clin1, 'Dr. Rodrigo', 'Implantodontia'),
    (v_clin1, 'Dra. Camila', 'Ortodontia'),
    (v_clin1, 'Dr. Felipe',  'Endodontia'),
    (v_clin1, 'Dra. Luana',  'Clínico geral'),
    (v_clin1, 'Dr. Marcos',  'Cirurgia'),
    (v_clin1, 'Dra. Paula',  'Odontopediatria');

  raise notice 'Setup concluído. Org %, clínicas % e %.', v_org, v_clin1, v_clin2;
end $$;
