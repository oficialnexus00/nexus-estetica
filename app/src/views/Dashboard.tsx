import { useState } from 'react'
import { db, fmt } from '../data'

type Data = (typeof db)['c1'] | (typeof db)['c2']

function Tile({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'ok' | 'warn' }) {
  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5">
      <div className="text-[12px] font-medium text-ink-2">{label}</div>
      <div className="mt-1.5 text-[26px] font-semibold tracking-tight">{value}</div>
      {hint && (
        <div className={`mt-1 text-[12px] ${tone === 'ok' ? 'text-ok' : tone === 'warn' ? 'text-warn' : 'text-ink-3'}`}>
          {hint}
        </div>
      )}
    </div>
  )
}

function BarrasProducao({ producao }: { producao: readonly { nome: string; valor: number }[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...producao.map(p => p.valor))
  return (
    <div className="space-y-2.5">
      {producao.map((p, i) => (
        <div key={p.nome} className="group relative flex items-center gap-3"
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
          <div className="w-24 shrink-0 truncate text-[12px] text-ink-2">{p.nome}</div>
          <div className="h-5 flex-1 overflow-hidden rounded-r">
            <div
              className="flex h-full items-center rounded-r bg-s1 transition-all"
              style={{ width: `${(p.valor / max) * 100}%`, opacity: hover === null || hover === i ? 1 : 0.45 }}
            />
          </div>
          <div className="w-16 shrink-0 text-right text-[12px] tabular-nums text-ink-2">
            {(p.valor / 1000).toFixed(1)}k
          </div>
          {hover === i && (
            <div className="pointer-events-none absolute -top-8 left-24 z-10 rounded-md border border-line bg-surface-3 px-2.5 py-1 text-[12px] shadow-lg">
              {p.nome}: <span className="font-semibold">{fmt(p.valor)}</span> no mês
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function LinhaRecebimentos({ serie }: { serie: readonly number[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 560, H = 150, PAD = 8
  const max = Math.max(...serie) * 1.15
  const min = Math.min(...serie) * 0.85
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (serie.length - 1)
  const y = (v: number) => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2)
  const path = serie.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ')
  const area = `${path} L${x(serie.length - 1)},${H - PAD} L${x(0)},${H - PAD} Z`
  const labels = ['S-7', 'S-6', 'S-5', 'S-4', 'S-3', 'S-2', 'S-1', 'Atual']
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full"
        onMouseLeave={() => setHover(null)}
        onMouseMove={e => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
          const px = ((e.clientX - r.left) / r.width) * W
          setHover(Math.max(0, Math.min(serie.length - 1, Math.round((px - PAD) / ((W - PAD * 2) / (serie.length - 1))))))
        }}>
        {[0.25, 0.5, 0.75].map(t => (
          <line key={t} x1={PAD} x2={W - PAD} y1={H * t} y2={H * t} stroke="#1e2a41" strokeWidth="1" />
        ))}
        <path d={area} fill="#199e70" opacity="0.12" />
        <path d={path} fill="none" stroke="#199e70" strokeWidth="2" strokeLinecap="round" />
        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={PAD} y2={H - PAD} stroke="#5d6b84" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(serie[hover])} r="4.5" fill="#199e70" stroke="#0b1220" strokeWidth="2" />
          </>
        )}
        <circle cx={x(serie.length - 1)} cy={y(serie[serie.length - 1])} r="4" fill="#199e70" stroke="#0b1220" strokeWidth="2" />
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[11px] text-ink-3">
        {labels.map(l => <span key={l}>{l}</span>)}
      </div>
      {hover !== null && (
        <div className="pointer-events-none absolute -top-1 rounded-md border border-line bg-surface-3 px-2.5 py-1 text-[12px] shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%`, transform: 'translateX(-50%)' }}>
          {labels[hover]}: <span className="font-semibold">{fmt(serie[hover])}</span>
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ data }: { data: Data }) {
  const k = data.kpis
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Tile label="Recebido no mês" value={fmt(k.recebidoMes)} hint="▲ 12% vs mês anterior" tone="ok" />
        <Tile label="Consultas hoje" value={String(k.consultasHoje)} hint="agenda 84% ocupada" />
        <Tile label="No-show (30 dias)" value={`${k.noShow30d}%`} hint="▼ caiu 3,1 pts com a Patrícia" tone="ok" />
        <Tile label="Orçamentos em aberto" value={fmt(k.orcAberto)} hint={`${k.orcAbertoQtd} propostas — Patrícia acompanhando`} tone="warn" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Recebimentos */}
        <div className="rounded-xl border border-line bg-surface-1 p-5 lg:col-span-3">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[14px] font-semibold">Recebimentos por semana</h2>
            <span className="text-[12px] text-ink-3">últimas 8 semanas</span>
          </div>
          <LinhaRecebimentos serie={data.recebimentos} />
        </div>

        {/* Patrícia feed */}
        <div className="rounded-xl border border-line bg-surface-1 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
            <h2 className="text-[14px] font-semibold">Patrícia em ação agora</h2>
          </div>
          <div className="space-y-3">
            {data.biaFeed.map((f, i) => (
              <div key={i} className="flex gap-3 text-[13px]">
                <span className="shrink-0 tabular-nums text-ink-3">{f.hora}</span>
                <span className="text-ink-2">{f.texto}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Produção */}
        <div className="rounded-xl border border-line bg-surface-1 p-5 lg:col-span-3">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[14px] font-semibold">Produção do mês por dentista</h2>
            <span className="text-[12px] text-ink-3">R$ mil</span>
          </div>
          <BarrasProducao producao={data.producao} />
        </div>

        {/* Taxa de aprovação */}
        <div className="rounded-xl border border-line bg-surface-1 p-5 lg:col-span-2">
          <h2 className="text-[14px] font-semibold">Aprovação de orçamentos</h2>
          <div className="mt-4 text-[40px] font-semibold tracking-tight text-s1">{data.kpis.taxaAprovacao}%</div>
          <div className="mt-1 text-[12px] text-ink-3">dos orçamentos dos últimos 90 dias</div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-s1" style={{ width: `${data.kpis.taxaAprovacao}%` }} />
          </div>
          <div className="mt-4 rounded-lg border border-brand/25 bg-brand/8 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-2">
            💡 A Patrícia recuperou <span className="font-semibold text-brand">{fmt(4800)}</span> em orçamentos parados nos últimos 30 dias.
          </div>
        </div>
      </div>
    </div>
  )
}
