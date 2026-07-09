import { useState } from 'react'

// Notação FDI, igual ao padrão que a clínica usa hoje (Capim)
const SUP = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
const INF = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

export type EstadoDente = 'realizar' | 'realizado' | 'pre' | null

const COR: Record<string, { fill: string; stroke: string }> = {
  realizar: { fill: '#eab30833', stroke: '#eab308' },
  realizado: { fill: '#00bfa533', stroke: '#00bfa5' },
  pre: { fill: '#3b82f633', stroke: '#3b82f6' },
  default: { fill: 'transparent', stroke: '#5d6b84' },
}

function Tooth({ n, estado, ativo, onClick }: { n: number; estado: EstadoDente; ativo: boolean; onClick: () => void }) {
  const c = COR[estado ?? 'default']
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 outline-none" title={`Dente ${n}`}>
      <span className={`text-[10px] tabular-nums ${estado ? 'font-semibold text-ink' : 'text-ink-3'}`}>{n}</span>
      <svg viewBox="0 0 24 28" className="h-7 w-6 transition-transform hover:scale-110"
        style={{ filter: ativo ? 'drop-shadow(0 0 4px #00bfa5)' : 'none' }}>
        <path
          d="M12 1.5C7 1.5 3.2 3.5 3.2 9c0 4 1 7 1.9 10.8.5 2.2 1.1 5.7 2.5 5.7 1.1 0 1.1-2.9 1.8-4.8.5-1.2 1-1.2 1.5 0 .7 1.9.7 4.8 1.8 4.8 1.4 0 2-3.5 2.5-5.7C18.8 16 19.8 13 19.8 9c0-5.5-3.8-7.5-8.8-7.5z"
          fill={c.fill} stroke={c.stroke} strokeWidth="1.4"
        />
      </svg>
    </button>
  )
}

export default function Odontograma({ estados }: { estados: Record<number, EstadoDente> }) {
  const [ativo, setAtivo] = useState<number | null>(null)
  const [arcada, setArcada] = useState<'permanente' | 'decidua'>('permanente')

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold">Odontograma</h3>
        <div className="flex rounded-lg border border-line bg-surface-2 p-0.5 text-[12px]">
          {(['permanente', 'decidua'] as const).map(a => (
            <button key={a} onClick={() => setArcada(a)}
              className={`rounded-md px-3 py-1 font-medium capitalize transition ${arcada === a ? 'bg-brand text-surface-0' : 'text-ink-2'}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 overflow-x-auto">
        <div className="flex min-w-[560px] justify-center gap-1">
          {SUP.map(n => <Tooth key={n} n={n} estado={estados[n] ?? null} ativo={ativo === n} onClick={() => setAtivo(ativo === n ? null : n)} />)}
        </div>
        <div className="flex min-w-[560px] justify-center gap-1">
          {INF.map(n => <Tooth key={n} n={n} estado={estados[n] ?? null} ativo={ativo === n} onClick={() => setAtivo(ativo === n ? null : n)} />)}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-3 text-[11.5px]">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: '#eab308' }} /> A realizar</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: '#00bfa5' }} /> Realizado</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: '#3b82f6' }} /> Pré-existente</span>
      </div>
    </div>
  )
}
