import { useState } from 'react'
import type { DB, StatusAgenda } from '../data'
import type { Acoes } from '../App'

const STATUS: Record<StatusAgenda, { label: string; classe: string }> = {
  pendente:   { label: 'A confirmar', classe: 'border-warn/40 bg-warn/10 text-warn' },
  confirmada: { label: 'Confirmada',  classe: 'border-ok/40 bg-ok/10 text-ok' },
  atendida:   { label: 'Atendida',    classe: 'border-line bg-surface-2 text-ink-2' },
  falta:      { label: 'Faltou',      classe: 'border-bad/40 bg-bad/10 text-bad' },
  cancelada:  { label: 'Cancelada',   classe: 'border-line bg-surface-2 text-ink-3' },
}

export default function Agenda({ data, acoes }: { data: DB; acoes: Acoes }) {
  const [confirmando, setConfirmando] = useState(false)
  const pendentes = data.agenda.filter(a => a.status === 'pendente').length

  async function confirmarTodos() {
    setConfirmando(true)
    try { await acoes.confirmarPendentes() } finally { setConfirmando(false) }
  }

  return (
    <div className="space-y-4">
      {pendentes > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warn/40 bg-warn/10 px-4 py-3">
          <span className="text-[13px] text-warn">
            {pendentes} {pendentes === 1 ? 'agendamento aguarda' : 'agendamentos aguardam'} confirmação
          </span>
          <button onClick={confirmarTodos} disabled={confirmando}
            className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-60">
            {confirmando ? 'Confirmando…' : 'Bia confirma todos'}
          </button>
        </div>
      )}

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
            {data.agenda.map(a => (
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
                  <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${STATUS[a.status].classe}`}>
                    {STATUS[a.status].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
