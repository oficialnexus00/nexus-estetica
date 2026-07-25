import { supabase } from './supabase'
import type { Especie, StatusAgenda, InventoryItem, InventoryMovement, Exame } from '../data'

// Operações de ESCRITA. O RLS garante que só dá pra gravar na própria clínica.
// Em modo demo nada é persistido — a UI atualiza o estado local e avisa.

export class SemBancoError extends Error {
  constructor() { super('Modo demonstração: as alterações não são salvas.') }
}

function cliente() {
  if (!supabase) throw new SemBancoError()
  return supabase
}

/** Remove chaves indefinidas — evita sobrescrever campo com undefined no update. */
function limpar<T extends object>(o: T) {
  return Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined && v !== '')
  )
}

/* ------------------------------------------------------------------ tutores */

export async function criarTutor(clinicId: string, dados: {
  nome: string; telefone: string; cpf?: string; email?: string; origem?: string
}) {
  const { data, error } = await cliente()
    .from('tutors')
    .insert({ clinic_id: clinicId, etapa_funil: 'lead', ...dados })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function atualizarTutor(id: string, dados: {
  nome?: string; telefone?: string; cpf?: string; email?: string
  origem?: string; etapa_funil?: string
}) {
  const { error } = await cliente().from('tutors').update(limpar(dados)).eq('id', id)
  if (error) throw error
}

/* ---------------------------------------------------------------------- pets */

export async function criarPet(clinicId: string, dados: {
  tutorId: string; nome: string; especie: Especie; raca?: string
  nascimento?: string; pesoKg?: number; alertaSaude?: string
}) {
  const { data, error } = await cliente()
    .from('pets')
    .insert({
      clinic_id: clinicId,
      tutor_id: dados.tutorId,
      nome: dados.nome,
      especie: dados.especie,
      raca: dados.raca || null,
      nascimento: dados.nascimento || null,
      peso_kg: dados.pesoKg ?? null,
      alerta_saude: dados.alertaSaude || null,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function atualizarPet(id: string, dados: {
  nome?: string; especie?: Especie; raca?: string; nascimento?: string
  pesoKg?: number; castrado?: boolean; alertaSaude?: string
}) {
  const campos: Record<string, unknown> = {}
  if (dados.nome !== undefined) campos.nome = dados.nome
  if (dados.especie !== undefined) campos.especie = dados.especie
  if (dados.raca !== undefined) campos.raca = dados.raca || null
  if (dados.nascimento !== undefined) campos.nascimento = dados.nascimento || null
  if (dados.pesoKg !== undefined) campos.peso_kg = dados.pesoKg || null
  if (dados.castrado !== undefined) campos.castrado = dados.castrado
  if (dados.alertaSaude !== undefined) campos.alerta_saude = dados.alertaSaude || null

  const { error } = await cliente().from('pets').update(campos).eq('id', id)
  if (error) throw error
}

/** Não apaga: marca como inativo. Histórico clínico não se joga fora. */
export async function inativarPet(id: string) {
  const { error } = await cliente().from('pets').update({ status: 'inativo' }).eq('id', id)
  if (error) throw error
}

/* ------------------------------------------------------------------- vacinas */

/**
 * Registra uma dose aplicada e já calcula a próxima.
 * É a operação mais importante do produto: é ela que alimenta a recorrência
 * (a view v_fila_lembrete_vacina lê `proxima_dose`, e o motor dispara o lembrete).
 */
export async function registrarDose(clinicId: string, dados: {
  petId: string; vacina: string; dataAplicacao: string
  reforcoMeses?: number      // padrão 12 (anual) — filhote usa intervalo em dias
  intervaloDias?: number     // quando informado, tem prioridade (esquema de filhote)
  lote?: string; professionalId?: string
}) {
  const proxima = calcularProximaDose(dados.dataAplicacao, {
    reforcoMeses: dados.reforcoMeses,
    intervaloDias: dados.intervaloDias,
  })

  const { data, error } = await cliente()
    .from('vaccinations')
    .insert({
      clinic_id: clinicId,
      pet_id: dados.petId,
      vacina: dados.vacina,
      data_aplicacao: dados.dataAplicacao,
      proxima_dose: proxima,
      lote: dados.lote || null,
      professional_id: dados.professionalId || null,
    })
    .select('id')
    .single()
  if (error) throw error
  return { id: data.id as string, proximaDose: proxima }
}

/** Regra única de cálculo — a mesma do protocolo em stack/dados-vacina-e-whatsapp.md */
export function calcularProximaDose(
  aplicacao: string,
  opcoes: { reforcoMeses?: number; intervaloDias?: number } = {}
): string {
  const d = new Date(aplicacao + 'T00:00:00')
  if (opcoes.intervaloDias && opcoes.intervaloDias > 0) {
    d.setDate(d.getDate() + opcoes.intervaloDias)
  } else {
    d.setMonth(d.getMonth() + (opcoes.reforcoMeses ?? 12))
  }
  return d.toISOString().slice(0, 10)
}

/* --------------------------------------------------------------- prontuário */

/**
 * Registra o atendimento clínico. Escrito por humano — a IA nunca preenche isto.
 * O trigger no banco sincroniza o peso do dia com o cadastro do pet.
 */
export async function criarAtendimento(clinicId: string, petId: string, dados: {
  data: string; profissional?: string; motivo: string
  anamnese?: string; exameFisico?: string; peso?: number; temperatura?: number
  diagnostico?: string; conduta?: string; prescricao?: string
}) {
  const { data, error } = await cliente()
    .from('consultations')
    .insert({
      clinic_id: clinicId,
      pet_id: petId,
      data: dados.data,
      motivo: dados.motivo,
      anamnese: dados.anamnese || null,
      exame_fisico: dados.exameFisico || null,
      peso_kg: dados.peso ?? null,
      temperatura: dados.temperatura ?? null,
      diagnostico: dados.diagnostico || null,
      conduta: dados.conduta || null,
      prescricao: dados.prescricao || null,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

/* ---------------------------------------------------------------- financeiro */

export async function criarLancamento(clinicId: string, dados: {
  tipo: 'receber' | 'pagar'; descricao: string; categoria?: string
  valor: number; vencimento: string; tutorId?: string; petId?: string
}) {
  const { data, error } = await cliente()
    .from('finance_entries')
    .insert({
      clinic_id: clinicId,
      tipo: dados.tipo,
      descricao: dados.descricao,
      categoria: dados.categoria || null,
      valor: dados.valor,
      vencimento: dados.vencimento,
      tutor_id: dados.tutorId || null,
      pet_id: dados.petId || null,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

/** Dá baixa: marca a data de pagamento. Não apaga o lançamento. */
export async function baixarLancamento(id: string, forma: string = 'outro', quando?: string) {
  const { error } = await cliente()
    .from('finance_entries')
    .update({ pago_em: quando ?? new Date().toISOString().slice(0, 10), forma_pagamento: forma })
    .eq('id', id)
  if (error) throw error
}

/* ---------------------------------------------------------------- fornecedores */

type DadosFornecedor = {
  razaoSocial: string; nomeFantasia?: string; cnpj?: string; inscricaoEstadual?: string
  contato?: string; telefone?: string; email?: string; endereco?: string
  categoria?: string; observacoes?: string
}

export async function criarFornecedor(clinicId: string, dados: DadosFornecedor) {
  const { data, error } = await cliente()
    .from('suppliers')
    .insert({
      clinic_id: clinicId,
      razao_social: dados.razaoSocial,
      nome_fantasia: dados.nomeFantasia || null,
      cnpj: dados.cnpj || null,
      inscricao_estadual: dados.inscricaoEstadual || null,
      contato: dados.contato || null,
      telefone: dados.telefone || null,
      email: dados.email || null,
      endereco: dados.endereco || null,
      categoria: dados.categoria || null,
      observacoes: dados.observacoes || null,
      ativo: true,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function atualizarFornecedor(id: string, dados: DadosFornecedor) {
  const { error } = await cliente().from('suppliers').update(limpar({
    razao_social: dados.razaoSocial,
    nome_fantasia: dados.nomeFantasia,
    cnpj: dados.cnpj,
    inscricao_estadual: dados.inscricaoEstadual,
    contato: dados.contato,
    telefone: dados.telefone,
    email: dados.email,
    endereco: dados.endereco,
    categoria: dados.categoria,
    observacoes: dados.observacoes,
  })).eq('id', id)
  if (error) throw error
}

export async function deletarFornecedor(id: string) {
  const { error } = await cliente().from('suppliers').update({ ativo: false }).eq('id', id)
  if (error) throw error
}

/* ---------------------------------------------------------- boxes / leitos */

type DadosBox = {
  nome: string; especie: 'cao' | 'gato' | 'ambos'
  finalidade: 'comum' | 'uti' | 'isolamento' | 'semi'; observacao?: string
}

export async function criarBox(clinicId: string, dados: DadosBox) {
  const { data, error } = await cliente()
    .from('boarding_boxes')
    .insert({ clinic_id: clinicId, nome: dados.nome, especie: dados.especie, finalidade: dados.finalidade, observacao: dados.observacao || null })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function atualizarBox(id: string, dados: DadosBox) {
  const { error } = await cliente().from('boarding_boxes')
    .update({ nome: dados.nome, especie: dados.especie, finalidade: dados.finalidade, observacao: dados.observacao || null })
    .eq('id', id)
  if (error) throw error
}

export async function deletarBox(id: string) {
  const { error } = await cliente().from('boarding_boxes').delete().eq('id', id)
  if (error) throw error
}

/* --------------------------------------------------------------- agendamento */

export async function criarAgendamento(clinicId: string, dados: {
  tutorId: string; petId: string; serviceId: string; professionalId?: string
  inicio: string; duracaoMin?: number; procedimento?: string
}) {
  const { data, error } = await cliente()
    .from('appointments')
    .insert({
      clinic_id: clinicId,
      tutor_id: dados.tutorId,
      pet_id: dados.petId,
      service_id: dados.serviceId,
      professional_id: dados.professionalId || null,
      inicio: dados.inicio,
      duracao_min: dados.duracaoMin ?? 30,
      procedimento: dados.procedimento || null,
      status: 'pendente',
      canal: 'recepcao',
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function mudarStatusAgendamento(id: string, status: StatusAgenda) {
  const { error } = await cliente().from('appointments').update({ status }).eq('id', id)
  if (error) throw error
}

/** Confirma em lote os agendamentos pendentes (o botão "Bia confirma todos"). */
export async function confirmarPendentes(clinicId: string, dia: string, ids?: string[]) {
  let q = cliente()
    .from('appointments')
    .update({ status: 'confirmada', lembrete_enviado_em: new Date().toISOString() })
    .eq('clinic_id', clinicId)
    .eq('status', 'pendente')
  // se vier lista de ids (período/filtro visível), confirma só esses; senão, o dia todo
  if (ids && ids.length) {
    q = q.in('id', ids)
  } else {
    q = q.gte('inicio', `${dia}T00:00:00`).lte('inicio', `${dia}T23:59:59`)
  }
  const { data, error } = await q.select('id')
  if (error) throw error
  return (data ?? []).length
}

/* ---------------------------------------------------------------- serviços */

export async function criarServico(clinicId: string, dados: {
  nome: string; categoria: string; preco: number; duracao: number; descricao?: string; observacao?: string
}) {
  const { data, error } = await cliente()
    .from('services')
    .insert({
      clinic_id: clinicId,
      nome: dados.nome,
      categoria: dados.categoria,
      preco: dados.preco,
      duracao_min: dados.duracao,
      descricao: dados.descricao ?? null,
      observacao: dados.observacao ?? null,
      ativo: true,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function atualizarServico(id: string, dados: {
  nome?: string; categoria?: string; preco?: number; duracao?: number; descricao?: string; observacao?: string
}) {
  const campos: Record<string, unknown> = {}
  if (dados.nome !== undefined) campos.nome = dados.nome
  if (dados.categoria !== undefined) campos.categoria = dados.categoria
  if (dados.preco !== undefined) campos.preco = dados.preco
  if (dados.duracao !== undefined) campos.duracao_min = dados.duracao
  if (dados.descricao !== undefined) campos.descricao = dados.descricao
  if (dados.observacao !== undefined) campos.observacao = dados.observacao

  const { error } = await cliente().from('services').update(campos).eq('id', id)
  if (error) throw error
}

export async function inativarServico(id: string) {
  const { error } = await cliente().from('services').update({ ativo: false }).eq('id', id)
  if (error) throw error
}

/* ---------------------------------------------------------------- profissionais */

export async function criarProfissional(clinicId: string, dados: {
  nome: string; especialidade?: string; telefone?: string
}) {
  const { data, error } = await cliente()
    .from('professionals')
    .insert({
      clinic_id: clinicId,
      nome: dados.nome,
      especialidade: dados.especialidade || null,
      telefone: dados.telefone || null,
      ativo: true,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function atualizarProfissional(id: string, dados: {
  nome?: string; especialidade?: string; telefone?: string
}) {
  const campos: Record<string, unknown> = {}
  if (dados.nome !== undefined) campos.nome = dados.nome
  if (dados.especialidade !== undefined) campos.especialidade = dados.especialidade || null
  if (dados.telefone !== undefined) campos.telefone = dados.telefone || null

  const { error } = await cliente().from('professionals').update(campos).eq('id', id)
  if (error) throw error
}

export async function inativarProfissional(id: string) {
  const { error } = await cliente().from('professionals').update({ ativo: false }).eq('id', id)
  if (error) throw error
}

/* ---------------------------------------------------------------- estoque */

export async function criarItemEstoque(clinicId: string, dados: {
  nome: string; categoria: 'medicamento' | 'vacina' | 'material' | 'alimento'
  codigo?: string; lote?: string; data_validade?: string
  quantidade_estoque: number; quantidade_minima: number; quantidade_maxima: number
  fornecedor_nome?: string; fornecedor_contato?: string
  preco_custo?: number; preco_venda?: number
}) {
  const { data, error } = await cliente()
    .from('inventory')
    .insert({
      clinic_id: clinicId,
      nome: dados.nome,
      categoria: dados.categoria,
      codigo: dados.codigo || null,
      lote: dados.lote || null,
      data_validade: dados.data_validade || null,
      quantidade_estoque: dados.quantidade_estoque,
      quantidade_minima: dados.quantidade_minima,
      quantidade_maxima: dados.quantidade_maxima,
      fornecedor_nome: dados.fornecedor_nome || null,
      fornecedor_contato: dados.fornecedor_contato || null,
      preco_custo: dados.preco_custo ?? null,
      preco_venda: dados.preco_venda ?? null,
      ativo: true,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function atualizarItemEstoque(id: string, dados: Partial<InventoryItem>) {
  const campos: Record<string, unknown> = {}
  if (dados.nome !== undefined) campos.nome = dados.nome
  if (dados.categoria !== undefined) campos.categoria = dados.categoria
  if (dados.codigo !== undefined) campos.codigo = dados.codigo || null
  if (dados.lote !== undefined) campos.lote = dados.lote || null
  if (dados.data_validade !== undefined) campos.data_validade = dados.data_validade || null
  if (dados.quantidade_estoque !== undefined) campos.quantidade_estoque = dados.quantidade_estoque
  if (dados.quantidade_minima !== undefined) campos.quantidade_minima = dados.quantidade_minima
  if (dados.quantidade_maxima !== undefined) campos.quantidade_maxima = dados.quantidade_maxima
  if (dados.fornecedor_nome !== undefined) campos.fornecedor_nome = dados.fornecedor_nome || null
  if (dados.fornecedor_contato !== undefined) campos.fornecedor_contato = dados.fornecedor_contato || null
  if (dados.preco_custo !== undefined) campos.preco_custo = dados.preco_custo ?? null
  if (dados.preco_venda !== undefined) campos.preco_venda = dados.preco_venda ?? null

  const { error } = await cliente().from('inventory').update(campos).eq('id', id)
  if (error) throw error
}

export async function inativarItemEstoque(id: string) {
  const { error } = await cliente().from('inventory').update({ ativo: false }).eq('id', id)
  if (error) throw error
}

export async function registrarMovimentoEstoque(clinicId: string, dados: {
  inventory_id: string
  tipo: 'entrada' | 'saida' | 'ajuste' | 'perda' | 'vencimento'
  quantidade: number
  motivo?: string
  atendimento_id?: string
}) {
  const { data, error } = await cliente()
    .from('inventory_movements')
    .insert({
      clinic_id: clinicId,
      inventory_id: dados.inventory_id,
      tipo: dados.tipo,
      quantidade: dados.quantidade,
      motivo: dados.motivo || null,
      atendimento_id: dados.atendimento_id || null,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function usarMedicamentoEmAtendimento(atendimentoId: string, medicamentos: {
  inventory_id: string; quantidade: number
}[]) {
  const { error: consultaError } = await cliente()
    .from('consultations')
    .select('clinic_id')
    .eq('id', atendimentoId)
    .single()
  if (consultaError) throw consultaError

  for (const med of medicamentos) {
    const { data: item, error: itemError } = await cliente()
      .from('inventory')
      .select('quantidade_estoque,clinic_id')
      .eq('id', med.inventory_id)
      .single()
    if (itemError) throw itemError

    const novaQtd = item.quantidade_estoque - med.quantidade
    const { error: updateError } = await cliente()
      .from('inventory')
      .update({ quantidade_estoque: Math.max(0, novaQtd) })
      .eq('id', med.inventory_id)
    if (updateError) throw updateError

    const { error: movError } = await cliente()
      .from('inventory_movements')
      .insert({
        clinic_id: item.clinic_id,
        inventory_id: med.inventory_id,
        tipo: 'saida',
        quantidade: med.quantidade,
        motivo: 'uso_em_atendimento',
        atendimento_id: atendimentoId,
      })
    if (movError) throw movError
  }
}

/* ------------------------------------------------------------------ exames */

export async function criarExame(clinicId: string, dados: {
  petId: string; tipo: string; atendimentoId?: string
}) {
  const { data, error } = await cliente()
    .from('exams')
    .insert({
      clinic_id: clinicId,
      pet_id: dados.petId,
      tipo: dados.tipo,
      atendimento_id: dados.atendimentoId || null,
      data_solicitacao: new Date().toISOString().slice(0, 10),
      status: 'solicitado',
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function atualizarExame(id: string, dados: Partial<Exame>) {
  const campos: Record<string, unknown> = {}
  if (dados.tipo !== undefined) campos.tipo = dados.tipo
  if (dados.data_resultado !== undefined) campos.data_resultado = dados.data_resultado || null
  if (dados.resultado !== undefined) campos.resultado = dados.resultado || null
  if (dados.observacoes !== undefined) campos.observacoes = dados.observacoes || null
  if (dados.status !== undefined) campos.status = dados.status

  const { error } = await cliente().from('exams').update(campos).eq('id', id)
  if (error) throw error
}

export async function deletarExame(id: string) {
  const { error } = await cliente().from('exams').delete().eq('id', id)
  if (error) throw error
}
