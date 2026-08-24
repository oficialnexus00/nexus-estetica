import { supabase } from './supabase'

// Orçamentos reais — leitura/gravação no Supabase (RLS por clínica).
export type BudgetRow = {
  id: string
  clinic_id: string
  patient_id: string | null
  procedimento: string
  valor: number | string
  status: 'aguardando' | 'follow-up' | 'aprovado' | 'recusado'
  follow_ups: number
  ultima_acao: string | null
  created_at: string
  patients?: { nome: string } | null
}

export async function listBudgets(clinicId: string): Promise<BudgetRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('budgets')
    .select('*, patients(nome)')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as unknown as BudgetRow[]) ?? []
}

export type NovoOrcamento = {
  clinic_id: string
  patient_id?: string | null
  procedimento: string
  valor: number
}

export async function createBudget(o: NovoOrcamento): Promise<BudgetRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const { data, error } = await supabase
    .from('budgets')
    .insert({
      clinic_id: o.clinic_id,
      patient_id: o.patient_id || null,
      procedimento: o.procedimento,
      valor: o.valor,
      status: 'aguardando',
      ultima_acao: 'Orçamento criado — Patrícia inicia follow-up em 48h',
    })
    .select('*, patients(nome)')
    .single()
  if (error) throw error
  return data as unknown as BudgetRow
}
