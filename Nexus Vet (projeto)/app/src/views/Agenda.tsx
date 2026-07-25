import { useState, useEffect } from 'react'
import type { DB, StatusAgenda, Agendamento, Internacao } from '../data'
import { brl } from '../data'
import type { Acoes } from '../App'

const STATUS: Record<StatusAgenda, { label: string; classe: string; cor: string }> = {
  pendente:   { label: 'A confirmar', classe: 'border-warn/40 bg-warn/10 text-warn', cor: '#e0a63a' },
  confirmada: { label: 'Confirmada',  classe: 'border-ok/40 bg-ok/10 text-ok',       cor: '#2fbf71' },
  atendida:   { label: 'Atendida',    classe: 'border-line bg-surface-2 text-ink-2', cor: '#7d8aa3' },
  falta:      { label: 'Faltou',      classe: 'border-bad/40 bg-bad/10 text-bad',    cor: '#e66767' },
  cancelada:  { label: 'Cancelada',   classe: 'border-line bg-surface-2 text-ink-3', cor: '#8792a6' },
}

type Modo = 'dia' | 'semana' | 'mes'

const ymd = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const inicioSemana = (d: Date) => addDays(d, -((d.getDay() + 6) % 7)) // segunda
const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const pad = (n: number) => String(n).padStart(2, '0')
const minToHora = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
const horaToMin = (h: string) => { const [a, b] = h.split(':').map(Number); return a * 60 + (b || 0) }

// Evento posicionável na grade (com faixa de minutos e faixa/coluna para sobreposição)
type Evento = Agendamento & { ini: number; fim: number; lane: number; cols: number }

/** Layout de sobreposição: eventos que se cruzam ficam lado a lado (estilo Google Calendar). */
function distribuir(ags: Agendamento[], dur: Map<string, number>): Evento[] {
  const base = ags
    .map(a => { const ini = horaToMin(a.hora); return { ...a, ini, fim: ini + (dur.get(a.servico) ?? 30) } })
    .sort((a, b) => a.ini - b.ini || a.fim - b.fim)
  const fimLanes: number[] = []
  const comLane = base.map(ev => {
    let lane = fimLanes.findIndex(f => f <= ev.ini)
    if (lane === -1) { lane = fimLanes.length; fimLanes.push(ev.fim) } else fimLanes[lane] = ev.fim
    return { ...ev, lane }
  })
  return comLane.map(ev => {
    const cruzam = comLane.filter(o => o.ini < ev.fim && o.fim > ev.ini)
    const cols = Math.max(...cruzam.map(o => o.lane)) + 1
    return { ...ev, cols }
  })
}

/** Faixa de horas visível: 08–19 por padrão, expandida para caber tudo. */
function faixaHoras(evs: Evento[]) {
  let minH = 8, maxH = 19
  for (const e of evs) { minH = Math.min(minH, Math.floor(e.ini / 60)); maxH = Math.max(maxH, Math.ceil(e.fim / 60)) }
  return { minH: Math.max(6, minH), maxH: Math.min(23, Math.max(maxH, minH + 4)) }
}
const listaHoras = (minH: number, maxH: number) => Array.from({ length: maxH - minH }, (_, i) => minH + i)

export default function Agenda({ data, acoes, onAgendar }: {
  data: DB; acoes: Acoes; onAgendar: (dataISO: string, hora?: string) => void
}) {
  const [modo, setModo] = useState<Modo>('dia')
  const [ref, setRef] = useState(() => new Date())
  const [confirmando, setConfirmando] = useState(false)
  const [filtroProf, setFiltroProf] = useState('todos')
  const [mesMini, setMesMini] = useState(() => new Date())
  const hoje = new Date()

  // o mini-calendário acompanha o mês do dia selecionado
  useEffect(() => { setMesMini(new Date(ref.getFullYear(), ref.getMonth(), 1)) }, [ref])

  const dur = new Map(data.servicos.map(s => [s.nome, s.duracao]))
  const preco = new Map(data.servicos.map(s => [s.nome, s.preco]))

  const porDia = new Map<string, Agendamento[]>()
  for (const a of data.agenda) { const arr = porDia.get(a.data) ?? []; arr.push(a); porDia.set(a.data, arr) }
  const filtrar = (l: Agendamento[]) => filtroProf === 'todos' ? l : l.filter(a => a.profissional === filtroProf)
  const doDia = (d: Date) => filtrar((porDia.get(ymd(d)) ?? []).slice().sort((a, b) => a.hora.localeCompare(b.hora)))

  const hojeY = ymd(hoje)
  const boxNome = new Map((data.boxes ?? []).map(b => [b.id, b.nome]))
  const internadosNoDia = (d: Date): Internacao[] => {
    const dd = ymd(d)
    return (data.internacoes ?? []).filter(i => {
      if (dd < i.entrada) return false
      const fim = i.saida ?? (i.previsaoAlta && i.previsaoAlta > hojeY ? i.previsaoAlta : hojeY)
      return dd <= fim
    })
  }

  const diasVisiveis = (): Date[] => {
    if (modo === 'dia') return [ref]
    if (modo === 'semana') return Array.from({ length: 7 }, (_, i) => addDays(inicioSemana(ref), i))
    const dias = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate()
    return Array.from({ length: dias }, (_, i) => new Date(ref.getFullYear(), ref.getMonth(), i + 1))
  }
  const pendentesVisiveisList = diasVisiveis().flatMap(d => doDia(d)).filter(a => a.status === 'pendente')
  const pendentesVisiveis = pendentesVisiveisList.length

  // Receita agendada do período visível (exclui cancelados) — ideia do NEXUS Health
  const agsPeriodo = diasVisiveis().flatMap(d => doDia(d)).filter(a => a.status !== 'cancelada')
  const receita = agsPeriodo.reduce((s, a) => s + (preco.get(a.servico) ?? 0), 0)
  const qtdAgendados = agsPeriodo.length

  async function confirmarTodos() {
    setConfirmando(true)
    try { await acoes.confirmarPendentes(pendentesVisiveisList.map(a => a.id)) } finally { setConfirmando(false) }
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

  const btnNav = 'rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[13px] text-ink-2 transition hover:border-brand/50 hover:text-ink'
  const temEvento = (d: Date) => (porDia.get(ymd(d))?.length ?? 0) > 0 || internadosNoDia(d).length > 0

  return (
    <div className="space-y-4">
      {/* barra superior: Hoje ‹ › data  ·  Dia/Semana/Mês + Agendar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setRef(new Date())}
            className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">Hoje</button>
          <button onClick={() => navegar(-1)} aria-label="Anterior" className={btnNav}>‹</button>
          <button onClick={() => navegar(1)} aria-label="Próximo" className={btnNav}>›</button>
          <h2 className="text-[15px] font-semibold capitalize tracking-tight md:text-[16px]">{titulo}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-line bg-surface-2 p-0.5">
            {([['dia', 'Dia'], ['semana', 'Semana'], ['mes', 'Mês']] as const).map(([m, r]) => (
              <button key={m} onClick={() => setModo(m)}
                className={`rounded-md px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                  modo === m ? 'bg-brand/12 text-brand' : 'text-ink-2 hover:text-ink'}`}>
                {r}
              </button>
            ))}
          </div>
          <button onClick={() => onAgendar(ymd(modo === 'dia' ? ref : new Date()))}
            className="whitespace-nowrap rounded-lg bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-surface-0 transition hover:bg-brand-dim">
            + Agendar
          </button>
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

      {/* corpo: coluna lateral (mini-calendário · filtros · legenda · receita) + grade */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 space-y-3 lg:w-64">
          <MiniMes mes={mesMini} ref_={ref} hoje={hoje} temEvento={temEvento}
            onPick={setRef} onMes={dir => setMesMini(m => new Date(m.getFullYear(), m.getMonth() + dir, 1))} />

          <div className="rounded-xl border border-line bg-surface-1 p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">Filtros</div>
            <label className="mb-1 block text-[11px] text-ink-3">Profissional</label>
            <select value={filtroProf} onChange={e => setFiltroProf(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12.5px] font-medium text-ink-2 outline-none transition hover:border-brand/50 focus:border-brand/60">
              <option value="todos">Todos os profissionais</option>
              {data.profissionais.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
            </select>
          </div>

          <div className="rounded-xl border border-line bg-surface-1 p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">Legenda</div>
            <Legenda />
          </div>

          <div className="rounded-xl border border-brand/30 bg-brand/[0.06] p-3">
            <div className="flex items-center gap-2.5">
              <span className="text-[18px]">💰</span>
              <div className="min-w-0">
                <div className="text-[10.5px] uppercase tracking-wider text-ink-3">Receita agendada</div>
                <div className="text-[18px] font-semibold tabular-nums text-ink">{brl(receita)}</div>
                <div className="text-[11px] text-ink-3">{qtdAgendados} {qtdAgendados === 1 ? 'agendamento' : 'agendamentos'} no período</div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {modo === 'dia' && (
            <GradeDia dia={ref} eventos={distribuir(doDia(ref), dur)} internados={internadosNoDia(ref)}
              boxNome={boxNome} ehHoje={ymd(ref) === hojeY} onAgendar={onAgendar} />
          )}
          {modo === 'semana' && (
            <GradeSemana dias={Array.from({ length: 7 }, (_, i) => addDays(inicioSemana(ref), i))}
              doDia={doDia} dur={dur} internadosNoDia={internadosNoDia} hojeY={hojeY} onAgendar={onAgendar}
              irParaDia={d => { setRef(d); setModo('dia') }} />
          )}
          {modo === 'mes' && (
            <VistaMes base={ref} doDia={doDia} internadosNoDia={internadosNoDia} hoje={hoje}
              irParaDia={d => { setRef(d); setModo('dia') }} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------- legenda de status */

function Legenda() {
  const itens: StatusAgenda[] = ['pendente', 'confirmada', 'atendida', 'falta', 'cancelada']
  return (
    <div className="flex flex-col gap-1.5">
      {itens.map(k => (
        <span key={k} className="flex items-center gap-2 text-[11.5px] text-ink-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: STATUS[k].cor }} />
          {STATUS[k].label}
        </span>
      ))}
    </div>
  )
}

/* ------------------------------------------------------- mini-calendário */

// Mini-calendário do mês na coluna lateral (formato NEXUS Health): clique navega
// o dia; ‹ › trocam só o mês exibido; ponto marca dias com agenda/internação.
function MiniMes({ mes, ref_, hoje, temEvento, onPick, onMes }: {
  mes: Date; ref_: Date; hoje: Date; temEvento: (d: Date) => boolean
  onPick: (d: Date) => void; onMes: (dir: 1 | -1) => void
}) {
  const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1)
  const inicioGrade = addDays(primeiro, -((primeiro.getDay() + 6) % 7))
  const celulas = Array.from({ length: 42 }, (_, i) => addDays(inicioGrade, i))
  const INI = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
  const btn = 'flex h-6 w-6 items-center justify-center rounded-md border border-line bg-surface-2 text-[13px] leading-none text-ink-2 transition hover:border-brand/50 hover:text-ink'

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-semibold capitalize tracking-tight">
          {mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </span>
        <div className="flex gap-1">
          <button onClick={() => onMes(-1)} aria-label="Mês anterior" className={btn}>‹</button>
          <button onClick={() => onMes(1)} aria-label="Próximo mês" className={btn}>›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {INI.map((d, i) => <div key={i} className="pb-1 text-center text-[9.5px] font-medium text-ink-3">{d}</div>)}
        {celulas.map((d, i) => {
          const doMes = d.getMonth() === mes.getMonth()
          const sel = ymd(d) === ymd(ref_)
          const eHoje = ymd(d) === ymd(hoje)
          return (
            <button key={i} onClick={() => onPick(d)}
              className={`relative flex h-7 items-center justify-center rounded-md text-[11.5px] tabular-nums transition ${
                sel ? 'bg-brand font-semibold text-surface-0'
                : eHoje ? 'font-semibold text-brand ring-1 ring-brand/50'
                : doMes ? 'text-ink-2 hover:bg-surface-2' : 'text-ink-3/50 hover:bg-surface-2'}`}>
              {d.getDate()}
              {!sel && temEvento(d) && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-brand" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------- peças da grade */

function Gutter({ horas, hourH }: { horas: number[]; hourH: number }) {
  return (
    <div className="w-14 shrink-0">
      {horas.map(h => (
        <div key={h} style={{ height: hourH }} className="relative">
          <span className="absolute right-2 -top-2 text-[10px] tabular-nums text-ink-3">{pad(h)}:00</span>
        </div>
      ))}
    </div>
  )
}

function LinhasHora({ horas, hourH }: { horas: number[]; hourH: number }) {
  return (
    <>
      {horas.map((h, i) => (
        <div key={h} className="pointer-events-none absolute inset-x-0 border-t border-line/50" style={{ top: i * hourH }} />
      ))}
    </>
  )
}

function LinhaAgora({ minH, maxH, hourH }: { minH: number; maxH: number; hourH: number }) {
  const agora = new Date()
  const m = agora.getHours() * 60 + agora.getMinutes()
  if (m < minH * 60 || m > maxH * 60) return null
  const top = ((m - minH * 60) / 60) * hourH
  return (
    <div className="pointer-events-none absolute inset-x-0 z-20" style={{ top }}>
      <div className="h-px bg-bad" />
      <div className="absolute -left-1 -top-[3px] h-1.5 w-1.5 rounded-full bg-bad" />
    </div>
  )
}

function Bloco({ ev, minH, hourH }: { ev: Evento; minH: number; hourH: number }) {
  const st = STATUS[ev.status]
  const top = ((ev.ini - minH * 60) / 60) * hourH
  const altura = Math.max(20, ((ev.fim - ev.ini) / 60) * hourH - 2)
  const left = (ev.lane / ev.cols) * 100
  const width = (1 / ev.cols) * 100
  const compacto = altura < 40
  return (
    <div className="absolute overflow-hidden rounded-md border px-1.5 py-1"
      style={{
        top, height: altura,
        left: `calc(${left}% + 2px)`, width: `calc(${width}% - 4px)`,
        background: st.cor + '22', borderColor: st.cor + '55', borderLeft: `3px solid ${st.cor}`,
      }}
      title={`${ev.hora} · ${ev.pet} · ${ev.servico} · ${ev.profissional} — ${st.label}`}>
      <div className="flex items-center gap-1 truncate text-[10.5px] font-semibold leading-tight text-ink">
        <span className="tabular-nums">{ev.hora}</span>
        <span className="truncate">{ev.pet}</span>
        {ev.canal === 'ia' && <span className="shrink-0 text-brand">✦</span>}
      </div>
      {!compacto && <div className="truncate text-[10px] leading-tight text-ink-2">{ev.servico}</div>}
      {altura > 58 && <div className="truncate text-[9.5px] leading-tight text-ink-3">{ev.profissional}</div>}
    </div>
  )
}

function AllDayInternados({ internados, boxNome }: { internados: Internacao[]; boxNome: Map<string, string> }) {
  if (internados.length === 0) return null
  return (
    <div className="flex items-start gap-2 border-b border-line bg-s2/[0.05] px-3 py-2">
      <span className="mt-0.5 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-s2">🏥 Internados</span>
      <div className="flex flex-wrap gap-1.5">
        {internados.map(i => (
          <span key={i.id} className="rounded-md border border-s2/40 bg-s2/10 px-2 py-0.5 text-[11px] font-medium text-s2"
            title={`${i.tutorNome} · ${i.motivo}`}>
            {i.petNome}{i.box ? ` · ${boxNome.get(i.box) ?? ''}` : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

// converte a posição do clique numa hora (snap de 15 min) e dispara o agendar
function cliqueParaHora(e: React.MouseEvent<HTMLDivElement>, minH: number, hourH: number): string {
  const rect = e.currentTarget.getBoundingClientRect()
  const y = e.clientY - rect.top
  const min = minH * 60 + Math.round((y / hourH) * 60 / 15) * 15
  return minToHora(Math.max(0, Math.min(23 * 60 + 45, min)))
}

function GradeDia({ dia, eventos, internados, boxNome, ehHoje, onAgendar }: {
  dia: Date; eventos: Evento[]; internados: Internacao[]; boxNome: Map<string, string>
  ehHoje: boolean; onAgendar: (dataISO: string, hora?: string) => void
}) {
  const hourH = 56
  const { minH, maxH } = faixaHoras(eventos)
  const horas = listaHoras(minH, maxH)
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface-1">
      {/* cabeçalho do dia (número em círculo, estilo NEXUS Health) */}
      <div className="flex border-b border-line">
        <div className="w-14 shrink-0" />
        <div className="flex-1 py-2 text-center">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-3">
            {dia.toLocaleDateString('pt-BR', { weekday: 'long' })}
          </div>
          <div className={`mx-auto mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-[15px] font-semibold tabular-nums ${
            ehHoje ? 'bg-brand text-surface-0' : 'text-ink'}`}>
            {dia.getDate()}
          </div>
        </div>
      </div>
      <AllDayInternados internados={internados} boxNome={boxNome} />
      <div className="max-h-[64vh] overflow-y-auto pt-3">
        <div className="flex">
          <Gutter horas={horas} hourH={hourH} />
          <div className="relative flex-1 cursor-pointer border-l border-line" style={{ height: (maxH - minH) * hourH }}
            title="Clique num horário para agendar"
            onClick={e => onAgendar(ymd(dia), cliqueParaHora(e, minH, hourH))}>
            <LinhasHora horas={horas} hourH={hourH} />
            {ehHoje && <LinhaAgora minH={minH} maxH={maxH} hourH={hourH} />}
            {eventos.map(ev => (
              <div key={ev.id} onClick={e => e.stopPropagation()} className="cursor-default">
                <Bloco ev={ev} minH={minH} hourH={hourH} />
              </div>
            ))}
            {eventos.length === 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] text-ink-3">
                Nenhum agendamento — clique num horário para marcar.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function GradeSemana({ dias, doDia, dur, internadosNoDia, hojeY, onAgendar, irParaDia }: {
  dias: Date[]; doDia: (d: Date) => Agendamento[]; dur: Map<string, number>
  internadosNoDia: (d: Date) => Internacao[]; hojeY: string
  onAgendar: (dataISO: string, hora?: string) => void; irParaDia: (d: Date) => void
}) {
  const hourH = 48
  const eventosPorDia = dias.map(d => distribuir(doDia(d), dur))
  const { minH, maxH } = faixaHoras(eventosPorDia.flat())
  const horas = listaHoras(minH, maxH)
  const temInternado = dias.some(d => internadosNoDia(d).length > 0)

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface-1">
      {/* cabeçalho dos dias */}
      <div className="flex border-b border-line">
        <div className="w-14 shrink-0" />
        {dias.map((d, i) => {
          const eHoje = ymd(d) === hojeY
          return (
            <button key={i} onClick={() => irParaDia(d)}
              className={`flex-1 border-l border-line px-1 py-2 text-center transition hover:bg-surface-2/60 ${eHoje ? 'bg-brand/[0.06]' : ''}`}>
              <div className={`text-[11px] font-semibold uppercase tracking-wide ${eHoje ? 'text-brand' : 'text-ink-3'}`}>{DIAS_SEMANA[i]}</div>
              <div className={`text-[15px] font-semibold tabular-nums ${eHoje ? 'text-brand' : 'text-ink'}`}>{d.getDate()}</div>
            </button>
          )
        })}
      </div>

      {/* faixa de internados (all-day) */}
      {temInternado && (
        <div className="flex border-b border-line bg-s2/[0.05]">
          <div className="flex w-14 shrink-0 items-center justify-center py-1 text-[9px] font-semibold uppercase tracking-wider text-s2">🏥</div>
          {dias.map((d, i) => {
            const ints = internadosNoDia(d)
            return (
              <button key={i} onClick={() => irParaDia(d)} className="flex-1 border-l border-line px-1 py-1 text-center">
                {ints.length > 0 && (
                  <span className="inline-block rounded-md border border-s2/40 bg-s2/10 px-1.5 py-0.5 text-[10px] font-medium text-s2">
                    {ints.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* grade de horas */}
      <div className="max-h-[60vh] overflow-y-auto pt-3">
        <div className="flex" style={{ height: (maxH - minH) * hourH }}>
          <Gutter horas={horas} hourH={hourH} />
          {dias.map((d, i) => {
            const eHoje = ymd(d) === hojeY
            return (
              <div key={i} className="relative flex-1 cursor-pointer border-l border-line"
                title="Clique para agendar"
                onClick={e => onAgendar(ymd(d), cliqueParaHora(e, minH, hourH))}>
                <LinhasHora horas={horas} hourH={hourH} />
                {eHoje && <LinhaAgora minH={minH} maxH={maxH} hourH={hourH} />}
                {eventosPorDia[i].map(ev => (
                  <div key={ev.id} onClick={e => e.stopPropagation()} className="cursor-default">
                    <Bloco ev={ev} minH={minH} hourH={hourH} />
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function VistaMes({ base, doDia, internadosNoDia, hoje, irParaDia }: {
  base: Date; doDia: (d: Date) => Agendamento[]; internadosNoDia: (d: Date) => Internacao[]; hoje: Date; irParaDia: (d: Date) => void
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
          const internados = internadosNoDia(d)
          return (
            <button key={i} onClick={() => irParaDia(d)}
              className={`min-h-[64px] rounded-lg border p-1.5 text-left align-top transition hover:border-brand/50 ${
                eHoje ? 'border-brand/50 bg-brand/5' : 'border-line bg-surface-2'} ${doMes ? '' : 'opacity-40'}`}>
              <div className={`text-[11.5px] font-medium tabular-nums ${eHoje ? 'text-brand' : 'text-ink-2'}`}>{d.getDate()}</div>
              <div className="mt-1 space-y-0.5">
                {internados.length > 0 && (
                  <div className="flex items-center gap-1 truncate text-[10px] font-medium text-s2">
                    🏥 <span className="truncate">{internados.length} intern.</span>
                  </div>
                )}
                {ags.slice(0, 2).map(a => (
                  <div key={a.id} className="flex items-center gap-1 truncate text-[10px] text-ink-3">
                    <span className="h-1 w-1 shrink-0 rounded-full" style={{ background: STATUS[a.status].cor }} />
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
