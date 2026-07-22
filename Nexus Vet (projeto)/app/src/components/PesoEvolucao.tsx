import type { Pet } from '../data'

// Evolução de peso — inspirado no registro de "Peso" do SimplesVet, que mostra a
// curva ao longo do tempo. Aqui derivamos os pontos dos atendimentos que já
// registram peso (sem novo schema). Gráfico de linha em SVG, sem dependência.

const fmtCurto = (d: string) => {
  const dt = new Date(d + 'T00:00:00')
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`
}

export default function PesoEvolucao({ pet }: { pet: Pet }) {
  // pontos (data + peso) a partir dos atendimentos, em ordem cronológica
  const pontos = pet.atendimentos
    .filter(a => a.peso != null)
    .map(a => ({ data: a.data, peso: a.peso as number }))
    .sort((a, b) => a.data.localeCompare(b.data))

  const atual = pontos.length ? pontos[pontos.length - 1].peso : pet.peso || 0
  const delta = pontos.length >= 2 ? atual - pontos[0].peso : 0

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[14px] font-semibold">Evolução de peso</h3>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold tabular-nums">{atual ? `${atual} kg` : '—'}</span>
          {pontos.length >= 2 && delta !== 0 && (
            <span className={`rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${
              delta > 0 ? 'border-warn/40 bg-warn/10 text-warn' : 'border-s2/40 bg-s2/10 text-s2'}`}>
              {delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)} kg
            </span>
          )}
        </div>
      </div>

      {pontos.length === 0 ? (
        <p className="py-4 text-center text-[13px] text-ink-3">Peso ainda não registrado nos atendimentos.</p>
      ) : pontos.length === 1 ? (
        <p className="py-2 text-[12.5px] text-ink-3">
          Único registro: <span className="font-medium text-ink-2">{pontos[0].peso} kg</span> em {fmtCurto(pontos[0].data)}.
          Registre em mais atendimentos para ver a curva.
        </p>
      ) : (
        <Grafico pontos={pontos} />
      )}
    </div>
  )
}

function Grafico({ pontos }: { pontos: { data: string; peso: number }[] }) {
  const W = 320, H = 120
  const padX = 12, padTop = 16, padBottom = 22
  const pesos = pontos.map(p => p.peso)
  const min = Math.min(...pesos), max = Math.max(...pesos)
  const span = max - min || 1
  const innerW = W - padX * 2
  const innerH = H - padTop - padBottom

  const xy = pontos.map((p, i) => {
    const x = padX + (pontos.length === 1 ? innerW / 2 : (i / (pontos.length - 1)) * innerW)
    const y = padTop + innerH - ((p.peso - min) / span) * innerH
    return { x, y, ...p }
  })

  const linha = xy.map(p => `${p.x},${p.y}`).join(' ')
  const area = `${padX},${padTop + innerH} ${linha} ${padX + innerW},${padTop + innerH}`

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[280px]" preserveAspectRatio="xMidYMid meet">
        {/* área sob a linha */}
        <polygon points={area} className="fill-brand/10" />
        {/* linha */}
        <polyline points={linha} fill="none" className="stroke-brand" strokeWidth={2}
          strokeLinejoin="round" strokeLinecap="round" />
        {xy.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3.2} className="fill-brand" />
            <text x={p.x} y={p.y - 7} textAnchor="middle" className="fill-ink-2 text-[9px]"
              style={{ fontSize: 9 }}>{p.peso}</text>
            <text x={p.x} y={H - 7} textAnchor="middle" className="fill-ink-3"
              style={{ fontSize: 8.5 }}>{fmtCurto(p.data)}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}
