import { db, fmt } from '../data'

type Data = (typeof db)['c1'] | (typeof db)['c2']

const STATUS = {
  aprovado: { label: 'Aprovado', cls: 'bg-ok/12 text-ok' },
  aguardando: { label: 'Aguardando', cls: 'bg-surface-3 text-ink-2' },
  'follow-up': { label: 'Bia em follow-up', cls: 'bg-brand/12 text-brand' },
  recusado: { label: 'Recusado', cls: 'bg-bad/12 text-bad' },
} as const

export default function Orcamentos({ data }: { data: Data }) {
  const abertos = data.orcamentos.filter(o => o.status === 'aguardando' || o.status === 'follow-up')
  const totalAberto = abertos.reduce((s, o) => s + o.valor, 0)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="text-[12px] font-medium text-ink-2">Dinheiro na mesa (em aberto)</div>
          <div className="mt-1.5 text-[26px] font-semibold tracking-tight text-warn">{fmt(totalAberto)}</div>
          <div className="mt-1 text-[12px] text-ink-3">{abertos.length} propostas ativas</div>
        </div>
        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="text-[12px] font-medium text-ink-2">Taxa de aprovação (90d)</div>
          <div className="mt-1.5 text-[26px] font-semibold tracking-tight text-s1">{data.kpis.taxaAprovacao}%</div>
          <div className="mt-1 text-[12px] text-ok">▲ subiu 9 pts com follow-up automático</div>
        </div>
        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="text-[12px] font-medium text-ink-2">Recuperado pela Bia (30d)</div>
          <div className="mt-1.5 text-[26px] font-semibold tracking-tight text-brand">{fmt(4800)}</div>
          <div className="mt-1 text-[12px] text-ink-3">orçamentos que voltaram após follow-up</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
        <table className="w-full min-w-[720px] text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-[11.5px] uppercase tracking-wider text-ink-3">
              <th className="px-4 py-3 font-medium">Paciente</th>
              <th className="px-4 py-3 font-medium">Plano de tratamento</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Criado</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Última ação</th>
            </tr>
          </thead>
          <tbody>
            {data.orcamentos.map(o => {
              const s = STATUS[o.status]
              return (
                <tr key={o.id} className="border-b border-line/50 transition last:border-b-0 hover:bg-surface-2">
                  <td className="px-4 py-3.5 font-medium">{o.paciente}</td>
                  <td className="px-4 py-3.5 text-ink-2">{o.procedimento}</td>
                  <td className="px-4 py-3.5 text-right font-semibold tabular-nums">{fmt(o.valor)}</td>
                  <td className="px-4 py-3.5 tabular-nums text-ink-3">{o.criado}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-md px-2 py-1 text-[11.5px] font-semibold ${s.cls}`}>{s.label}</span>
                    {o.followUps > 0 && <span className="ml-2 text-[11px] text-ink-3">{o.followUps}× follow-up</span>}
                  </td>
                  <td className="max-w-64 px-4 py-3.5 text-[12.5px] leading-snug text-ink-3">{o.ultimaAcao}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-brand/25 bg-brand/8 px-4 py-3 text-[13px] text-ink-2">
        🤖 <span className="font-semibold text-brand">Como funciona:</span> orçamento sem resposta em 48h entra automaticamente
        no fluxo de follow-up da Bia — ela retoma a conversa no WhatsApp, responde objeções e avisa o time quando o paciente esquenta.
      </div>
    </div>
  )
}
