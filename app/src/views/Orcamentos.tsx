import { useEffect, useState } from 'react'
import { db, fmt } from '../data'
import { listBudgets, type BudgetRow } from '../lib/budgets'
import { listPatients } from '../lib/patients'
import ModalOrcamento from '../components/ModalOrcamento'

type Data = (typeof db)['c1'] | (typeof db)['c2']

const STATUS = {
  aprovado: { label: 'Aprovado', cls: 'bg-ok/12 text-ok' },
  aguardando: { label: 'Aguardando', cls: 'bg-surface-3 text-ink-2' },
  'follow-up': { label: 'Patrícia em follow-up', cls: 'bg-brand/12 text-brand' },
  recusado: { label: 'Recusado', cls: 'bg-bad/12 text-bad' },
} as const

type OrcRow = {
  id: string
  paciente: string
  procedimento: string
  valor: number
  criado: string
  status: keyof typeof STATUS
  followUps: number
  ultimaAcao: string
}

function fmtData(iso: string) {
  const d = iso.slice(0, 10).split('-')
  return d.length === 3 ? `${d[2]}/${d[1]}/${d[0]}` : iso
}

function toOrc(r: BudgetRow): OrcRow {
  return {
    id: r.id,
    paciente: r.patients?.nome ?? '—',
    procedimento: r.procedimento,
    valor: Number(r.valor) || 0,
    criado: fmtData(r.created_at),
    status: r.status,
    followUps: r.follow_ups,
    ultimaAcao: r.ultima_acao ?? '—',
  }
}

export default function Orcamentos({
  data,
  realClinicId,
  clinicNome,
}: {
  data: Data
  realClinicId?: string
  clinicNome: string
}) {
  const real = !!realClinicId
  const [rows, setRows] = useState<BudgetRow[]>([])
  const [pacientes, setPacientes] = useState<{ id: string; nome: string }[]>([])
  const [carregando, setCarregando] = useState(real)
  const [novo, setNovo] = useState(false)

  function recarregar() {
    if (!real) return
    setCarregando(true)
    listBudgets(realClinicId!)
      .then(r => setRows(r))
      .catch(() => setRows([]))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    if (!real) return
    let vivo = true
    setCarregando(true)
    listBudgets(realClinicId!)
      .then(r => vivo && setRows(r))
      .catch(() => vivo && setRows([]))
      .finally(() => vivo && setCarregando(false))
    listPatients(realClinicId!)
      .then(ps => vivo && setPacientes(ps.map(p => ({ id: p.id, nome: p.nome }))))
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [real, realClinicId])

  const lista: OrcRow[] = real
    ? rows.map(toOrc)
    : data.orcamentos.map(o => ({ ...o, status: o.status as keyof typeof STATUS }))

  const abertos = lista.filter(o => o.status === 'aguardando' || o.status === 'follow-up')
  const totalAberto = abertos.reduce((s, o) => s + o.valor, 0)
  const aprovados = lista.filter(o => o.status === 'aprovado')
  const taxaAprovacao = real ? (lista.length ? Math.round((aprovados.length / lista.length) * 100) : 0) : data.kpis.taxaAprovacao
  const recuperado = real ? aprovados.filter(o => o.followUps > 0).reduce((s, o) => s + o.valor, 0) : 4800

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="text-[12px] font-medium text-ink-2">Dinheiro na mesa (em aberto)</div>
          <div className="mt-1.5 text-[26px] font-semibold tracking-tight text-warn">{fmt(totalAberto)}</div>
          <div className="mt-1 text-[12px] text-ink-3">{abertos.length} propostas ativas</div>
        </div>
        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="text-[12px] font-medium text-ink-2">Taxa de aprovação {real ? '' : '(90d)'}</div>
          <div className="mt-1.5 text-[26px] font-semibold tracking-tight text-s1">{taxaAprovacao}%</div>
          {!real && <div className="mt-1 text-[12px] text-ok">▲ subiu 9 pts com follow-up automático</div>}
        </div>
        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="text-[12px] font-medium text-ink-2">Recuperado pela Patrícia (30d)</div>
          <div className="mt-1.5 text-[26px] font-semibold tracking-tight text-brand">{fmt(recuperado)}</div>
          <div className="mt-1 text-[12px] text-ink-3">orçamentos que voltaram após follow-up</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold">Propostas</h2>
        <button onClick={() => setNovo(true)} className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 hover:bg-brand-dim">
          + Novo orçamento
        </button>
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
            {carregando && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[12.5px] text-ink-3">Carregando orçamentos…</td></tr>
            )}
            {!carregando && lista.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[12.5px] text-ink-3">Nenhum orçamento ainda — crie o primeiro no botão “+ Novo orçamento”.</td></tr>
            )}
            {!carregando && lista.map(o => {
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
        no fluxo de follow-up da Patrícia — ela retoma a conversa no WhatsApp, responde objeções e avisa o time quando o paciente esquenta.
      </div>

      <ModalOrcamento
        open={novo}
        onClose={() => setNovo(false)}
        clinicNome={clinicNome}
        clinicId={realClinicId}
        pacientes={pacientes}
        onSaved={recarregar}
      />
    </div>
  )
}
