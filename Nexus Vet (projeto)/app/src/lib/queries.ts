import { supabase } from './supabase'
import type { DB, Tutor, Pet, Vacina, SituacaoVacina, Agendamento, Servico, Especie, StatusAgenda, Atendimento, Lancamento, FormaPagamento, InventoryItem, Exame } from '../data'

// Camada de acesso a dados. Devolve exatamente o mesmo formato `DB` que o modo
// demo usa — assim as telas não sabem (nem precisam saber) de onde vêm os dados.
// A segurança é do RLS: a anon key só enxerga a clínica do usuário logado.

const DIAS_ALERTA = 30 // "vence em breve" quando falta <= 30 dias

export function situacaoDa(proximaDose: string | null): SituacaoVacina {
  if (!proximaDose) return 'em_dia'
  const dias = Math.round((new Date(proximaDose).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)
  if (dias < 0) return 'atrasada'
  if (dias <= DIAS_ALERTA) return 'proxima'
  return 'em_dia'
}

type LinhaVacina = { pet_id: string; vacina: string; data_aplicacao: string; proxima_dose: string | null }
type LinhaPet = {
  id: string; tutor_id: string; nome: string; especie: Especie; raca: string | null
  nascimento: string | null; peso_kg: number | null; castrado: boolean | null; alerta_saude: string | null
}
type LinhaTutor = { id: string; nome: string; telefone: string | null; origem: string | null; etapa_funil: Tutor['etapa']; created_at: string }
type LinhaServico = { id: string; nome: string; categoria: string; preco: number; duracao_min: number }
type LinhaProfissional = { id: string; nome: string; especialidade: string | null; telefone: string | null }
type LinhaConsulta = {
  id: string; pet_id: string; data: string; motivo: string
  anamnese: string | null; exame_fisico: string | null; peso_kg: number | null
  temperatura: number | null; diagnostico: string | null; conduta: string | null
  prescricao: string | null; professionals: { nome: string } | null
}
type LinhaAgendamento = {
  id: string; inicio: string; status: StatusAgenda; canal: 'ia' | 'recepcao'
  pets: { nome: string } | null
  tutors: { nome: string } | null
  services: { nome: string } | null
  professionals: { nome: string } | null
}
type LinhaLancamento = {
  id: string; tipo: 'receber' | 'pagar'; descricao: string; categoria: string | null
  valor: number; vencimento: string; pago_em: string | null; forma_pagamento: FormaPagamento | null
  tutors: { nome: string } | null
  pets: { nome: string } | null
}

/** Carrega tudo que o app precisa de uma clínica. */
export async function carregarClinica(clinicId: string): Promise<DB> {
  if (!supabase) throw new Error('Supabase não configurado')

  const [tutoresRes, petsRes, vacinasRes, servicosRes, profissionaisRes, agendaRes, consultasRes, financaRes, estoqueRes, examesRes] = await Promise.all([
    supabase.from('tutors').select('id,nome,telefone,origem,etapa_funil,created_at')
      .eq('clinic_id', clinicId).order('nome'),
    supabase.from('pets').select('id,tutor_id,nome,especie,raca,nascimento,peso_kg,castrado,alerta_saude')
      .eq('clinic_id', clinicId).eq('status', 'ativo'),
    supabase.from('vaccinations').select('pet_id,vacina,data_aplicacao,proxima_dose')
      .eq('clinic_id', clinicId).order('data_aplicacao', { ascending: false }),
    supabase.from('services').select('id,nome,categoria,preco,duracao_min')
      .eq('clinic_id', clinicId).eq('ativo', true).order('nome'),
    supabase.from('professionals').select('id,nome,especialidade,telefone')
      .eq('clinic_id', clinicId).eq('ativo', true).order('nome'),
    supabase.from('appointments')
      .select('id,inicio,status,canal,pets(nome),tutors(nome),services(nome),professionals(nome)')
      .eq('clinic_id', clinicId).order('inicio'),
    supabase.from('consultations')
      .select('id,pet_id,data,motivo,anamnese,exame_fisico,peso_kg,temperatura,diagnostico,conduta,prescricao,professionals(nome)')
      .eq('clinic_id', clinicId).order('data', { ascending: false }),
    supabase.from('finance_entries')
      .select('id,tipo,descricao,categoria,valor,vencimento,pago_em,forma_pagamento,tutors(nome),pets(nome)')
      .eq('clinic_id', clinicId).order('vencimento', { ascending: false }),
    supabase.from('inventory').select('*')
      .eq('clinic_id', clinicId).eq('ativo', true).order('nome'),
    supabase.from('exams').select('*')
      .eq('clinic_id', clinicId).order('data_solicitacao', { ascending: false }),
  ])

  const erro = tutoresRes.error || petsRes.error || vacinasRes.error || servicosRes.error || profissionaisRes.error
    || agendaRes.error || consultasRes.error || financaRes.error || estoqueRes.error || examesRes.error
  if (erro) throw erro

  const lancamentos: Lancamento[] = ((financaRes.data ?? []) as unknown as LinhaLancamento[]).map(f => ({
    id: f.id,
    tipo: f.tipo,
    descricao: f.descricao,
    categoria: f.categoria ?? undefined,
    valor: Number(f.valor),
    vencimento: f.vencimento,
    pagoEm: f.pago_em ?? undefined,
    formaPagamento: f.forma_pagamento ?? undefined,
    tutorNome: f.tutors?.nome,
    petNome: f.pets?.nome,
  }))

  const consultasPorPet = new Map<string, Atendimento[]>()
  for (const c of (consultasRes.data ?? []) as unknown as LinhaConsulta[]) {
    const lista = consultasPorPet.get(c.pet_id) ?? []
    lista.push({
      id: c.id,
      data: c.data,
      profissional: c.professionals?.nome ?? '—',
      motivo: c.motivo,
      anamnese: c.anamnese ?? undefined,
      exameFisico: c.exame_fisico ?? undefined,
      peso: c.peso_kg ?? undefined,
      temperatura: c.temperatura ?? undefined,
      diagnostico: c.diagnostico ?? undefined,
      conduta: c.conduta ?? undefined,
      prescricao: c.prescricao ?? undefined,
    })
    consultasPorPet.set(c.pet_id, lista)
  }

  const vacinasPorPet = new Map<string, Vacina[]>()
  for (const v of (vacinasRes.data ?? []) as LinhaVacina[]) {
    const lista = vacinasPorPet.get(v.pet_id) ?? []
    lista.push({
      vacina: v.vacina,
      aplicacao: v.data_aplicacao,
      proximaDose: v.proxima_dose ?? v.data_aplicacao,
      situacao: situacaoDa(v.proxima_dose),
    })
    vacinasPorPet.set(v.pet_id, lista)
  }

  const petsPorTutor = new Map<string, Pet[]>()
  for (const p of (petsRes.data ?? []) as LinhaPet[]) {
    const lista = petsPorTutor.get(p.tutor_id) ?? []
    lista.push({
      id: p.id,
      nome: p.nome,
      especie: p.especie,
      raca: p.raca ?? '—',
      nascimento: p.nascimento ?? new Date().toISOString().slice(0, 10),
      peso: Number(p.peso_kg ?? 0),
      castrado: !!p.castrado,
      alerta: p.alerta_saude ?? undefined,
      vacinas: vacinasPorPet.get(p.id) ?? [],
      atendimentos: consultasPorPet.get(p.id) ?? [],
    })
    petsPorTutor.set(p.tutor_id, lista)
  }

  const tutores: Tutor[] = ((tutoresRes.data ?? []) as LinhaTutor[]).map(t => ({
    id: t.id,
    nome: t.nome,
    telefone: t.telefone ?? '—',
    origem: t.origem ?? '—',
    etapa: t.etapa_funil,
    desde: t.created_at.slice(0, 10),
    pets: petsPorTutor.get(t.id) ?? [],
  }))

  const servicos: Servico[] = ((servicosRes.data ?? []) as LinhaServico[]).map(s => ({
    id: s.id, nome: s.nome, categoria: s.categoria, preco: Number(s.preco), duracao: s.duracao_min,
  }))

  const profissionais = ((profissionaisRes.data ?? []) as LinhaProfissional[]).map(p => ({
    id: p.id, nome: p.nome, especialidade: p.especialidade ?? undefined, telefone: p.telefone ?? undefined,
  }))

  const linhasAgenda = (agendaRes.data ?? []) as unknown as LinhaAgendamento[]
  const hoje = new Date().toISOString().slice(0, 10)
  const agenda: Agendamento[] = linhasAgenda
    .filter(a => a.inicio.slice(0, 10) === hoje)
    .map(a => ({
      id: a.id,
      hora: new Date(a.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      pet: a.pets?.nome ?? '—',
      tutor: a.tutors?.nome ?? '—',
      servico: a.services?.nome ?? '—',
      profissional: a.professionals?.nome ?? '—',
      status: a.status,
      canal: a.canal,
    }))

  const estoque = ((estoqueRes.data ?? []) as InventoryItem[])
  const exames = ((examesRes.data ?? []) as Exame[])

  return {
    tutores,
    agenda,
    servicos,
    profissionais,
    estoque,
    exames,
    protocolos: [], // TODO: ler de uma tabela vaccine_protocols quando o Supabase entrar
    tiposAtendimento: [], // TODO: ler de uma tabela appointment_types quando o Supabase entrar
    modelos: [], // TODO: ler de uma tabela document_templates quando o Supabase entrar
    vendas: [], // TODO: ler de uma tabela sales quando o Supabase entrar
    orcamentos: [], // TODO: ler de uma tabela quotes quando o Supabase entrar
    caixa: null, // TODO: ler de uma tabela cash_register quando o Supabase entrar
    lancamentos,
    kpis: calcularKpis(linhasAgenda, tutores, servicos),
    receitaSemana: calcularReceitaSemana(linhasAgenda, servicos),
  }
}

/** KPIs derivados dos dados reais — nada inventado. */
function calcularKpis(agenda: LinhaAgendamento[], tutores: Tutor[], servicos: Servico[]): DB['kpis'] {
  const preco = new Map(servicos.map(s => [s.nome, s.preco]))
  const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0)

  const doMes = agenda.filter(a => new Date(a.inicio) >= inicioMes)
  const atendidas = doMes.filter(a => a.status === 'atendida')
  const faturamentoMes = atendidas.reduce((s, a) => s + (preco.get(a.services?.nome ?? '') ?? 0), 0)

  const finalizadas = doMes.filter(a => a.status === 'atendida' || a.status === 'falta')
  const faltas = doMes.filter(a => a.status === 'falta').length
  const noShowPct = finalizadas.length ? Math.round((faltas / finalizadas.length) * 100) : 0

  const hoje = new Date().toISOString().slice(0, 10)
  const deHoje = agenda.filter(a => a.inicio.slice(0, 10) === hoje && a.status !== 'cancelada')
  const CAPACIDADE_DIA = 16 // slots de 30min entre 8h e 18h — ajustar por clínica
  const ocupacaoPct = Math.min(100, Math.round((deHoje.length / CAPACIDADE_DIA) * 100))

  const vacinasAtrasadas = tutores.reduce(
    (s, t) => s + t.pets.reduce((n, p) => n + p.vacinas.filter(v => v.situacao === 'atrasada').length, 0), 0)

  return {
    faturamentoMes,
    noShowPct,
    ocupacaoPct,
    vacinasAtrasadas,
    agendadosPelaIA: deHoje.filter(a => a.canal === 'ia').length,
    ticketMedio: atendidas.length ? Math.round(faturamentoMes / atendidas.length) : 0,
  }
}

function calcularReceitaSemana(agenda: LinhaAgendamento[], servicos: Servico[]): DB['receitaSemana'] {
  const preco = new Map(servicos.map(s => [s.nome, s.preco]))
  const rotulos = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const inicioSemana = new Date()
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
  inicioSemana.setHours(0, 0, 0, 0)

  const total = new Array(7).fill(0)
  for (const a of agenda) {
    if (a.status !== 'atendida') continue
    const d = new Date(a.inicio)
    if (d < inicioSemana) continue
    total[d.getDay()] += preco.get(a.services?.nome ?? '') ?? 0
  }
  // Seg..Sáb (o domingo raramente abre)
  return [1, 2, 3, 4, 5, 6].map(i => ({ dia: rotulos[i], valor: total[i] }))
}

/** Clínicas que o usuário logado enxerga (o RLS já filtra). */
export async function carregarClinicas() {
  if (!supabase) throw new Error('Supabase não configurado')
  const { data, error } = await supabase.from('clinics').select('id,nome,cidade').order('nome')
  if (error) throw error
  return (data ?? []) as { id: string; nome: string; cidade: string | null }[]
}

/** Carrega estoque com alertas de vencimento e reposição. */
export async function carregarEstoque(clinicId: string): Promise<{
  itens: InventoryItem[]
  alertas: {
    vencidos: InventoryItem[]
    reposicao: InventoryItem[]
    vencimento_proximo: InventoryItem[]
  }
  resumo: { total_itens: number; total_valor_estoque: number; itens_reposicao: number; itens_vencidos: number }
}> {
  if (!supabase) throw new Error('Supabase não configurado')

  const hoje = new Date().toISOString().slice(0, 10)
  const proximoMes = new Date(); proximoMes.setDate(proximoMes.getDate() + 30)
  const proximoMesStr = proximoMes.toISOString().slice(0, 10)

  const { data: itens, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('ativo', true)
    .order('nome')

  if (error) throw error

  const items = (itens ?? []) as InventoryItem[]

  const vencidos = items.filter(i => i.data_validade && i.data_validade < hoje)
  const reposicao = items.filter(i => i.quantidade_estoque <= i.quantidade_minima)
  const vencimento_proximo = items.filter(i => i.data_validade && i.data_validade >= hoje && i.data_validade <= proximoMesStr && !vencidos.includes(i))

  const total_valor_estoque = items.reduce((s, i) => s + ((i.preco_custo ?? 0) * i.quantidade_estoque), 0)

  return {
    itens: items,
    alertas: { vencidos, reposicao, vencimento_proximo },
    resumo: {
      total_itens: items.length,
      total_valor_estoque,
      itens_reposicao: reposicao.length,
      itens_vencidos: vencidos.length,
    },
  }
}
