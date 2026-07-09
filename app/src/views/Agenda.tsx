import { db } from '../data'

type Data = (typeof db)['c1'] | (typeof db)['c2']

const STATUS = {
  confirmada: { label: 'Confirmada', cls: 'bg-ok/12 text-ok border-ok/30' },
  pendente: { label: 'Aguardando confirmação', cls: 'bg-warn/12 text-warn border-warn/30' },
  falta: { label: 'Faltou', cls: 'bg-bad/12 text-bad border-bad/30' },
  atendida: { label: 'Atendida', cls: 'bg-surface-3 text-ink-3 border-line' },
} as const

const HORAS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

export default function Agenda({ data }: { data: Data }) {
  const toMin = (h: string) => parseInt(h.slice(0, 2)) * 60 + parseInt(h.slice(3))
  const start = toMin('08:00')
  const pxPorMin = 1.35

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[13px] text-ink-2 hover:text-ink">←</button>
          <span className="text-[14px] font-semibold">Quinta, 2 de julho</span>
          <button className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[13px] text-ink-2 hover:text-ink">→</button>
          <button className="ml-2 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[13px] text-ink-2 hover:text-ink">Hoje</button>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-ink-2">
          {Object.entries(STATUS).map(([k, s]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={`inline-block h-2.5 w-2.5 rounded-sm border ${s.cls}`} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
        <div className="flex min-w-[900px]">
          {/* Réguas de hora */}
          <div className="w-16 shrink-0 border-r border-line">
            <div className="h-11 border-b border-line" />
            <div className="relative" style={{ height: 600 * pxPorMin * 0.833 }}>
              {HORAS.map(h => (
                <div key={h} className="absolute w-full pr-2 text-right text-[11px] tabular-nums text-ink-3"
                  style={{ top: (toMin(h) - start) * pxPorMin - 6 }}>{h}</div>
              ))}
            </div>
          </div>

          {/* Colunas por dentista */}
          {data.dentistas.map(d => {
            const consultas = data.consultas.filter(c => c.dentistaId === d.id)
            return (
              <div key={d.id} className="min-w-[150px] flex-1 border-r border-line last:border-r-0">
                <div className="flex h-11 flex-col justify-center border-b border-line px-3">
                  <div className="truncate text-[12.5px] font-semibold">{d.nome}</div>
                  <div className="truncate text-[10.5px] text-ink-3">{d.especialidade}</div>
                </div>
                <div className="relative" style={{ height: 600 * pxPorMin * 0.833 }}>
                  {HORAS.map(h => (
                    <div key={h} className="absolute w-full border-t border-line/50"
                      style={{ top: (toMin(h) - start) * pxPorMin }} />
                  ))}
                  {consultas.map(c => {
                    const s = STATUS[c.status]
                    return (
                      <div key={c.id}
                        className={`absolute inset-x-1 cursor-pointer overflow-hidden rounded-md border px-2 py-1 transition hover:brightness-125 ${s.cls}`}
                        style={{ top: (toMin(c.hora) - start) * pxPorMin + 1, height: c.dur * pxPorMin - 3 }}
                        title={`${c.hora} · ${c.paciente} · ${c.procedimento} — ${s.label}`}>
                        <div className="truncate text-[11px] font-semibold leading-tight">{c.paciente}</div>
                        <div className="truncate text-[10.5px] leading-tight opacity-80">{c.hora} · {c.procedimento}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-lg border border-brand/25 bg-brand/8 px-4 py-3 text-[13px] text-ink-2">
        🤖 <span className="font-semibold text-brand">Patrícia:</span> confirmei 8 de 12 consultas de amanhã. 2 aguardando resposta, 2 sem WhatsApp válido (recepção notificada).
      </div>
    </div>
  )
}
