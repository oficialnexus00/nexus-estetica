import { supabase } from './supabase'

export type ProfessionalRow = {
  id: string
  clinic_id: string
  nome: string
  especialidade: string | null
  ativo: boolean
}

export type AppointmentRow = {
  id: string
  clinic_id: string
  professional_id: string | null
  patient_id: string | null
  inicio: string // timestamptz ISO
  duracao_min: number
  procedimento: string | null
  status: 'pendente' | 'confirmada' | 'atendida' | 'falta' | 'cancelada'
  created_at: string
  patients?: { nome: string } | null
}

export async function listProfessionals(clinicId: string): Promise<ProfessionalRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('ativo', true)
    .order('nome')
  if (error) throw error
  return data ?? []
}

export async function listAppointments(clinicId: string): Promise<AppointmentRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(nome)')
    .eq('clinic_id', clinicId)
    .order('inicio')
  if (error) throw error
  return (data as unknown as AppointmentRow[]) ?? []
}

export type NovoAgendamento = {
  clinic_id: string
  professional_id?: string | null
  paciente_nome?: string
  data: string // YYYY-MM-DD
  hora: string // HH:MM
  duracao_min: number
  procedimento?: string
}

// Cria o paciente rápido (se veio só o nome) e o agendamento.
export async function createAppointment(a: NovoAgendamento): Promise<AppointmentRow> {
  if (!supabase) throw new Error('Supabase não configurado')

  let patientId: string | null = null
  if (a.paciente_nome && a.paciente_nome.trim()) {
    // tenta achar paciente existente pelo nome; senão cria um enxuto
    const { data: achado } = await supabase
      .from('patients')
      .select('id')
      .eq('clinic_id', a.clinic_id)
      .ilike('nome', a.paciente_nome.trim())
      .limit(1)
      .maybeSingle()
    if (achado?.id) {
      patientId = achado.id
    } else {
      const { data: novo, error: e1 } = await supabase
        .from('patients')
        .insert({ clinic_id: a.clinic_id, nome: a.paciente_nome.trim() })
        .select('id')
        .single()
      if (e1) throw e1
      patientId = novo.id
    }
  }

  const inicio = `${a.data}T${a.hora}:00` // wall-clock; lido de volta por string
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      clinic_id: a.clinic_id,
      professional_id: a.professional_id || null,
      patient_id: patientId,
      inicio,
      duracao_min: a.duracao_min,
      procedimento: a.procedimento || null,
      status: 'pendente',
    })
    .select('*, patients(nome)')
    .single()
  if (error) throw error
  return data as unknown as AppointmentRow
}
