import { useEffect, useState } from 'react'
import { db } from '../data'
import { listProfessionals, listAppointments, type ProfessionalRow, type AppointmentRow } from '../lib/agenda'

type Data = (typeof db)['c1'] | (typeof db)['c2']

const STATUS = {
  confirmada: { label: 'Confirmada', cls: 'bg-ok/12 text-ok border-ok/30' },
  pendente: { label: 'Aguardando confirmação', cls: 'bg-warn/12 text-warn border-warn/30' },
  falta: { label: 'Faltou', cls: 'bg-bad/12 text-bad border-bad/30' },
  atendida: { label: 'Atendida', cls: 'bg-surface-3 text-ink-3 border-line' },
  cancelada: { label: 'Cancelada', cls: 'bg-surface-3 text-ink-3 border-line' },
} as const

const HORAS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const AGORA = '14:20'
const PALETTE = ['#199e70', '#3987e5', '#c98500', '#9085e9', '#199e70', '#3987e5']

type Coluna = { id: string; nome: string; especialidade: string; cor: string }
type Evento = { id: string; hora: string; dur: number; paciente: string; procedimento: string; colId: string; status: keyof typeof STATUS }

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']

export default function Agenda({ data, realClinicId, refreshKey }: { data: Data; realClinicId?: string; refreshKey?: number }) {
  const real = !!realClinicId
  const [profs, setProfs] = useState<ProfessionalRow[]>([])
  const [appts, setAppts] = useState<AppointmentRow[]>([])
  const [carregando, setCarregando] = useState(real)
  const [offset, setOffset] = useState(0) // dias a partir da base

  useEffect(() => {
    if (!real) return
    let vivo = true
    setCarregando(true)
    Promise.all([listProfessionals(realClinicId!), listAppointments(realClinicId!)])
      .then(([p, a]) => {
        if (!vivo) return
        setProfs(p)
        setAppts(a)
      })
      .catch(() => {})
      .finally(() => vivo && setCarregando(false))
    return () => {
      vivo = false
    }
  }, [real, realClinicId, refreshKey])

  // Data selecionada: demo ancora em 2 jul 2026; real ancora em hoje
  const base = real ? new Date() : new Date(2026, 6, 2)
  const dia = new Date(base)
  dia.setDate(base.getDate() + offset)
  const diaISO = `${dia.getFullYear()}-${String(dia.getMonth() + 1).padStart(2, '0')}-${String(dia.getDate()).padStart(2, '0')}`
  const labelDia = `${cap(DIAS[dia.getDay()])}, ${dia.getDate()} de ${MESES[dia.getMonth()]}`
  const ehBase = offset === 0

  const colunas: Coluna[] = real
    ? profs.map((p, i) => ({ id: p.id, nome: p.nome, especialidade: p.especialidade ?? '', cor: PALETTE[i % PALETTE.length] }))
    : data.dentistas.map(d => ({ id: d.id, nome: d.nome, especialidade: d.especialidade, cor: d.cor }))

  const eventos: Evento[] = real
    ? appts
        .filter(a => a.inicio.slice(0, 10) === diaISO)
        .map(a => ({
          id: a.id,
          hora: a.inicio.slice(11, 16),
          dur: a.duracao_min,
          paciente: a.patients?.nome ?? 'Paciente',
          procedimento: a.procedimento ?? '',
          colId: a.professional_id ?? '',
          status: a.status,
        }))
    : ehBase
    ? data.consultas.map(c => ({ id: c.id, hora: c.hora, dur: c.dur, paciente: c.paciente, procedimento: c.procedimento, colId: c.dentistaId, status: c.status }))
    : []

  const toMin = (h: string) => parseInt(h.slice(0, 2)) * 60 + parseInt(h.slice(3))
  const start = toMin('08:00')
  const pxPorMin = 1.35
  const alturaGrid = 600 * pxPorMin * 0.833
  const mostrarAgora = ehBase
  const agoraTop = (toMin(AGORA) - start) * pxPorMin

  const total = eventos.length
  const confirmadas = eventos.filter(e => e.status === 'confirmada').length
  const faltas = eventos.filter(e => e.status === 'falta').length
  const ocupacao = colunas.length ? Math.min(100, Math.round((total / (colunas.length * 10)) * 100)) : 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setOffset(o => o - 1)} className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[13px] text-ink-2 hover:text-ink">←</button>
          <span className="min-w-[168px] text-center text-[14px] font-semibold">{labelDia}</span>
          <button onClick={() => setOffset(o => o + 1)} className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[13px] text-ink-2 hover:text-ink">→</button>
          <button onClick={() => setOffset(0)} className="ml-2 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[13px] text-ink-2 hover:text-ink">Hoje</button>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-ink-2">
          {(['confirmada', 'pendente', 'falta', 'atendida'] as const).map(k => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={`inline-block h-2.5 w-2.5 rounded-sm border ${STATUS[k].cls}`} />
              {STATUS[k].label}
            </span>
          ))}
        </div>
      </div>

      {/* Resumo do dia */}
      <div className="flex flex-wrap gap-3">
        {[
          ['Consultas no dia', String(total), 'text-ink'],
          ['Confirmadas', `${confirmadas}/${total}`, 'text-ok'],
          ['Faltas', String(faltas), faltas ? 'text-bad' : 'text-ink'],
          ['Ocupação', `${ocupacao}%`, 'text-brand'],
        ].map(([l, v, c]) => (
          <div key={l} className="flex-1 rounded-lg border border-line bg-surface-1 px-4 py-2.5">
            <div className="text-[11.5px] text-ink-3">{l}</div>
            <div className={`text-[18px] font-semibold tabular-nums ${c}`}>{v}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
        <div className="flex min-w-[900px]">
          {/* Réguas de hora */}
          <div className="w-16 shrink-0 border-r border-line">
            <div className="h-11 border-b border-line" />
            <div className="relative" style={{ height: alturaGrid }}>
              {HORAS.map(h => (
                <div key={h} className="absolute w-full pr-2 text-right text-[11px] tabular-nums text-ink-3" style={{ top: (toMin(h) - start) * pxPorMin - 6 }}>{h}</div>
              ))}
              {mostrarAgora && (
                <div className="absolute right-1 flex items-center gap-1" style={{ top: agoraTop - 7 }}>
                  <span className="rounded bg-bad px-1 py-0.5 text-[9.5px] font-bold text-white tabular-nums">{AGORA}</span>
                </div>
              )}
            </div>
          </div>

          {/* Colunas por profissional */}
          {colunas.length === 0 && (
            <div className="flex flex-1 items-center justify-center py-16 text-[13px] text-ink-3">
              {carregando ? 'Carregando agenda…' : 'Nenhum profissional cadastrado nesta clínica.'}
            </div>
          )}
          {colunas.map(col => {
            const evs = eventos.filter(e => e.colId === col.id)
            return (
              <div key={col.id} className="min-w-[150px] flex-1 border-r border-line last:border-r-0">
                <div className="flex h-11 flex-col justify-center border-b border-line px-3">
                  <div className="truncate text-[12.5px] font-semibold">{col.nome}</div>
                  <div className="truncate text-[10.5px] text-ink-3">{col.especialidade}</div>
                </div>
                <div className="relative" style={{ height: alturaGrid }}>
                  {HORAS.map(h => (
                    <div key={h} className="absolute w-full border-t border-line/50" style={{ top: (toMin(h) - start) * pxPorMin }} />
                  ))}
                  {mostrarAgora && (
                    <div className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-bad" style={{ top: agoraTop }}>
                      <span className="absolute -left-0.5 -top-[3px] h-1.5 w-1.5 rounded-full bg-bad" />
                    </div>
                  )}
                  {evs.map(e => {
                    const s = STATUS[e.status]
                    return (
                      <div key={e.id}
                        className={`absolute inset-x-1 cursor-pointer overflow-hidden rounded-md border px-2 py-1 transition hover:brightness-125 ${s.cls}`}
                        style={{ top: (toMin(e.hora) - start) * pxPorMin + 1, height: e.dur * pxPorMin - 3 }}
                        title={`${e.hora} · ${e.paciente} · ${e.procedimento} — ${s.label}`}>
                        <div className="truncate text-[11px] font-semibold leading-tight">{e.paciente}</div>
                        <div className="truncate text-[10.5px] leading-tight opacity-80">{e.hora} · {e.procedimento}</div>
                      </div>
                    )
                  })}
                  {evs.length === 0 && colunas.length > 0 && (
                    <div className="pointer-events-none absolute inset-x-2 top-2 text-center text-[10.5px] text-ink-3/60" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-lg border border-brand/25 bg-brand/8 px-4 py-3 text-[13px] text-ink-2">
        🤖 <span className="font-semibold text-brand">Patrícia:</span> confirma automaticamente as consultas no WhatsApp e reencaixa faltas — sem ninguém do time digitar.
      </div>
    </div>
  )
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
