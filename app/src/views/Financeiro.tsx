import { db, fmt } from '../data'

type Data = (typeof db)['c1'] | (typeof db)['c2']

export default function Financeiro({ data }: { data: Data }) {
  const entradas = data.financeiro.filter(l => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0)
  const saidas = data.financeiro.filter(l => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="text-[12px] font-medium text-ink-2">Entradas (últimos 7 dias)</div>
          <div className="mt-1.5 text-[26px] font-semibold tracking-tight text-ok">{fmt(entradas)}</div>
        </div>
        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="text-[12px] font-medium text-ink-2">Saídas (últimos 7 dias)</div>
          <div className="mt-1.5 text-[26px] font-semibold tracking-tight text-bad">{fmt(saidas)}</div>
        </div>
        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="text-[12px] font-medium text-ink-2">Resultado</div>
          <div className={`mt-1.5 text-[26px] font-semibold tracking-tight ${entradas - saidas >= 0 ? 'text-ok' : 'text-bad'}`}>
            {fmt(entradas - saidas)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['Tudo', 'Entradas', 'Saídas'].map((f, i) => (
            <button key={f} className={`rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition
              ${i === 0 ? 'bg-brand/12 text-brand' : 'border border-line bg-surface-2 text-ink-2 hover:text-ink'}`}>
              {f}
            </button>
          ))}
        </div>
        <button className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 hover:bg-brand-dim">
          + Novo lançamento
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
        <table className="w-full min-w-[640px] text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-[11.5px] uppercase tracking-wider text-ink-3">
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Forma</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            {data.financeiro.map(l => (
              <tr key={l.id} className="border-b border-line/50 transition last:border-b-0 hover:bg-surface-2">
                <td className="px-4 py-3.5 tabular-nums text-ink-3">{l.data}</td>
                <td className="px-4 py-3.5 font-medium">{l.desc}</td>
                <td className="px-4 py-3.5"><span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11.5px] text-ink-2">{l.categoria}</span></td>
                <td className="px-4 py-3.5 text-ink-2">{l.forma}</td>
                <td className={`px-4 py-3.5 text-right font-semibold tabular-nums ${l.tipo === 'entrada' ? 'text-ok' : 'text-bad'}`}>
                  {l.tipo === 'entrada' ? '+' : '−'} {fmt(l.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[12px] text-ink-3">
        Repasse por dentista, contas recorrentes e conciliação entram na v1 completa — este é o recorte da casca navegável.
      </div>
    </div>
  )
}
