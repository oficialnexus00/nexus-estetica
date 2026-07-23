import { useState } from 'react'
import type { DB, StatusAgenda, Agendamento } from '../data'
import type { Acoes } from '../App'

const STATUS: Record<StatusAgenda, { label: string; classe: string; dot: string }> = {
  pendente:   { label: 'A confirmar', classe: 'border-warn/40 bg-warn/10 text-warn', dot: '#e0a63a' },
  confirmada: { label: 'Confirmada',  classe: 'border-ok/40 bg-ok/10 text-ok',       dot: '#2fbf71' },
  atendida:   { label: 'Atendida',    classe: 'border-line bg-surface-2 text-ink-2', dot: '#9aa7bd' },
  falta:      { label: 'Faltou',      classe: 'border-bad/40 bg-bad/10 text-bad',    dot: '#e66767' },
  cancelada:  { label: 'Cancelada',   classe: 'border-line bg-surface-2 text-ink-3', dot: '#5d6b84' },
}

type Modo = 'dia' | 'semana' | 'mes'

const ymd = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const inicioSemana = (d: Date) => addDays(d, -((d.getDay() + 6) % 7)) // segunda
const mesmoDia = (a: Date, b: Date) => ymd(a) === ymd(b)
const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function Agenda({ data, acoes }: { data: DB; acoes: Acoes }) {
  const [modo, setModo] = useState<Modo>('dia')
  const [ref, setRef] = useState(() => new Date())
  const [confirmando, setConfirmando] = useState(false)

  const hoje = new Date()

  const porDia = new Map<string, Agendamento[]>()
  for (const a of data.agenda) {
    const arr = porDia.get(a.data) ?? []; arr.push(a); porDia.set(a.data, arr)
  }
  const doDia = (d: Date) => (porDia.get(ymd(d)) ?? []).slice().sort((a, b) => a.hora.localeCompare(b.hora))

  // dias do período visível (para contar pendentes)
  const diasVisiveis = (): Date[] => {
    if (modo === 'dia') return [ref]
    if (modo === 'semana') return Array.from({ length: 7 }, (_, i) => addDays(inicioSemana(ref), i))
    const first = new Date(ref.getFullYear(), ref.getMonth(), 1)
    const dias = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate()
    return Array.from({ length: dias }, (_, i) => new Date(ref.getFullYear(), ref.getMonth(), i + 1))
  }
  const pendentesVisiveis = diasVisiveis().reduce((n, d) => n + doDia(d).filter(a => a.status === 'pendente').length, 0)

  async function confirmarTodos() {
    setConfirmando(true)
    try { await acoes.confirmarPendentes() } finally { setConfirmando(false) }
  }

  const navegar = (dir: 1 | -1) => setRef(r => {
    if (modo === 'dia') return addDays(r, dir)
    if (modo === 'semana') return addDays(r, 7 * dir)
    const x = new Date(r); x.setMonth(x.getMonth() + dir); return x
  })

  const titulo =
    modo === 'dia' ? cap(ref.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }))
    : modo === 'semana' ? (() => {
        const ini = inicioSemana(ref); const fim = addDays(ini, 6)
        return `${ini.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${fim.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
      })()
    : cap(ref.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }))

  return (
    <div className="space-y-4">
      {/* Barra de controle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-line bg-surface-2 p-0.5">
          {([['dia', 'Dia'], ['semana', 'Semana'], ['mes', 'Mês']] as const).map(([m, r]) => (
            <button key={m} onClick={() => setModo(m)}
              className={`rounded-md px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                modo === m ? 'bg-brand/12 text-brand' : 'text-ink-2 hover:text-ink'}`}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navegar(-1)} aria-label="Anterior"
            className="rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[13px] text-ink-2 transition hover:text-ink">‹</button>
          <span className="min-w-[150px] text-center text-[13px] font-medium capitalize">{titulo}</span>
          <button onClick={() => navegar(1)} aria-label="Próximo"
            className="rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[13px] text-ink-2 transition hover:text-ink">›</button>
          <button onClick={() => setRef(new Date())}
            className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">Hoje</button>
        </div>
      </div>

      {pendentesVisiveis > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warn/40 bg-warn/10 px-4 py-3">
          <span className="text-[13px] text-warn">
            {pendentesVisiveis} {pendentesVisiveis === 1 ? 'agendamento aguarda' : 'agendamentos aguardam'} confirmação no período
          </span>
          <button onClick={confirmarTodos} disabled={confirmando}
            className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-60">
            {confirmando ? 'Confirmando…' : 'Bia confirma todos'}
          </button>
        </div>
      )}

      {modo === 'dia' && <VistaDia agendamentos={doDia(ref)} />}
      {modo === 'semana' && (
        <VistaSemana dias={Array.from({ length: 7 }, (_, i) => addDays(inicioSemana(ref), i))} doDia={doDia} hoje={hoje}
          irParaDia={d => { setRef(d); setModo('dia') }} />
      )}
      {modo === 'mes' && (
        <VistaMes base={ref} doDia={doDia} hoje={hoje}
          irParaDia={d => { setRef(d); setModo('dia') }} />
      )}
    </div>
  )
}

function VistaDia({ agendamentos }: { agendamentos: Agendamento[] }) {
  if (agendamentos.length === 0) {
    return <p className="rounded-xl border border-line bg-surface-1 py-12 text-center text-[13.5px] text-ink-3">Nenhum agendamento neste dia.</p>
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
      <table className="w-full min-w-[680px] text-left">
        <thead>
          <tr className="border-b border-line text-[11.5px] uppercase tracking-wider text-ink-3">
            <th className="px-4 py-3 font-medium">Hora</th>
            <th className="px-4 py-3 font-medium">Pet</th>
            <th className="px-4 py-3 font-medium">Tutor</th>
            <th className="px-4 py-3 font-medium">Serviço</th>
            <th className="px-4 py-3 font-medium">Profissional</th>
            <th className="px-4 py-3 font-medium">Canal</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="text-[13.5px]">
          {agendamentos.map(a => (
            <tr key={a.id} className="border-b border-line/60 transition last:border-0 hover:bg-surface-2/60">
              <td className="px-4 py-3 tabular-nums font-medium">{a.hora}</td>
              <td className="px-4 py-3 font-medium">{a.pet}</td>
              <td className="px-4 py-3 text-ink-2">{a.tutor}</td>
              <td className="px-4 py-3 text-ink-2">{a.servico}</td>
              <td className="px-4 py-3 text-ink-2">{a.profissional}</td>
              <td className="px-4 py-3">
                {a.canal === 'ia'
                  ? <span className="rounded-md bg-brand/15 px-2 py-0.5 text-[11px] font-medium text-brand">Bia</span>
                  : <span className="text-[11.5px] text-ink-3">Recepção</span>}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${STATUS[a.status].classe}`}>{STATUS[a.status].label}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function VistaSemana({ dias, doDia, hoje, irParaDia }: {
  dias: Date[]; doDia: (d: Date) => Agendamento[]; hoje: Date; irParaDia: (d: Date) => void
}) {
  return (
    <div className="grid gap-2 md:grid-cols-7">
      {dias.map((d, i) => {
        const ags = doDia(d)
        const eHoje = ymd(d) === ymd(hoje)
        return (
          <div key={i} className={`rounded-xl border bg-surface-1 p-2.5 ${eHoje ? 'border-brand/50' : 'border-line'}`}>
            <button onClick={() => irParaDia(d)} className="mb-2 flex w-full items-baseline justify-between gap-1 text-left">
              <span className={`text-[12px] font-semibold ${eHoje ? 'text-brand' : 'text-ink-2'}`}>{DIAS_SEMANA[i]}</span>
              <span className={`text-[13px] tabular-nums ${eHoje ? 'text-brand' : 'text-ink-3'}`}>{d.getDate()}</span>
            </button>
            <div className="space-y-1.5">
              {ags.length === 0
                ? <p className="py-2 text-center text-[11px] text-ink-3">—</p>
                : ags.map(a => (
                    <button key={a.id} onClick={() => irParaDia(d)}
                      className="flex w-full items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-left transition hover:border-brand/50">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: STATUS[a.status].dot }} />
                      <div className="min-w-0">
                        <div className="text-[11.5px] font-medium tabular-nums">{a.hora} <span className="font-normal text-ink-2">{a.pet}</span></div>
                        <div className="truncate text-[10.5px] text-ink-3">{a.servico}</div>
                      </div>
                    </button>
                  ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function VistaMes({ base, doDia, hoje, irParaDia }: {
  base: Date; doDia: (d: Date) => Agendamento[]; hoje: Date; irParaDia: (d: Date) => void
}) {
  const primeiro = new Date(base.getFullYear(), base.getMonth(), 1)
  const inicioGrade = addDays(primeiro, -((primeiro.getDay() + 6) % 7))
  const celulas = Array.from({ length: 42 }, (_, i) => addDays(inicioGrade, i))

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-3">
      <div className="mb-1 grid grid-cols-7 gap-1">
        {DIAS_SEMANA.map(d => <div key={d} className="px-1 py-1 text-center text-[11px] font-medium uppercase tracking-wider text-ink-3">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {celulas.map((d, i) => {
          const doMes = d.getMonth() === base.getMonth()
          const eHoje = ymd(d) === ymd(hoje)
          const ags = doDia(d)
          return (
            <button key={i} onClick={() => irParaDia(d)}
              className={`min-h-[64px] rounded-lg border p-1.5 text-left align-top transition hover:border-brand/50 ${
                eHoje ? 'border-brand/50 bg-brand/5' : 'border-line bg-surface-2'} ${doMes ? '' : 'opacity-40'}`}>
              <div className={`text-[11.5px] font-medium tabular-nums ${eHoje ? 'text-brand' : 'text-ink-2'}`}>{d.getDate()}</div>
              <div className="mt-1 space-y-0.5">
                {ags.slice(0, 2).map(a => (
                  <div key={a.id} className="flex items-center gap-1 truncate text-[10px] text-ink-3">
                    <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: STATUS[a.status].dot }} />
                    <span className="truncate tabular-nums">{a.hora} {a.pet}</span>
                  </div>
                ))}
                {ags.length > 2 && <div className="text-[10px] text-brand">+{ags.length - 2} mais</div>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
