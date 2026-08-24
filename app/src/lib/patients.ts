import { supabase } from './supabase'

// Pacientes reais — leitura e gravação no Supabase (RLS por clínica).
export type PatientRow = {
  id: string
  clinic_id: string
  nome: string
  nascimento: string | null
  telefone: string | null
  origem: string | null
  alerta_saude: string | null
  saldo: number | string
  created_at: string
}

export async function listPatients(clinicId: string): Promise<PatientRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('nome')
  if (error) throw error
  return data ?? []
}

export type NovoPaciente = {
  clinic_id: string
  nome: string
  telefone?: string
  nascimento?: string
  origem?: string
  alerta_saude?: string
}

export async function createPatient(p: NovoPaciente): Promise<PatientRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const { data, error } = await supabase
    .from('patients')
    .insert({
      clinic_id: p.clinic_id,
      nome: p.nome,
      telefone: p.telefone || null,
      nascimento: p.nascimento || null,
      origem: p.origem || null,
      alerta_saude: p.alerta_saude || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}
