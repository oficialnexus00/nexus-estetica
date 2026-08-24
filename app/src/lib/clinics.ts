import { supabase } from './supabase'

// Clínicas reais do usuário logado (o RLS já filtra pra org dele).
export type ClinicRow = { id: string; nome: string; cidade: string | null }

export async function listClinics(): Promise<ClinicRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('clinics').select('id, nome, cidade').order('created_at')
  if (error) throw error
  return data ?? []
}
