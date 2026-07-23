import { useState } from 'react'
import type { DB, StatusAgenda } from '../data'
import { brl } from '../data'

type Ir = (v: 'agenda' | 'exames' | 'reativacao' | 'tutores') => void

function Kpi({ label, valor, hint, tom }: { label: string; valor: string; hint?: string; tom?: 'ok' | 'warn' | 'bad' }) {
  const cor = tom === 'ok' ? 'text-ok' : tom === 'warn' ? 'text-warn' : tom === 'bad' ? 'text-bad' : 'text-ink'
  return (
    <div className="rounded-xl border border-line bg-surface-1 p-4">
      <div className="text-[11.5px] uppercase tracking-wider text-ink-3">{label}</div>
      <div className={`mt-1.5 text-[24px] font-semibold tabular-nums tracking-tight ${cor}`}>{valor}</div>
      {hint && <div className="mt-0.5 text-[11.5px] text-ink-3">{hint}</div>}
    </div>
  )
}

const diasAte = (d: string) =>
  Math.round((new Date(d + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)

const STATUS_AGENDA: Record<StatusAgenda, { label: string; cls: string }> = {
  pendente: { label: 'A confirmar', cls: 'border-warn/40 bg-warn/10 text-warn' },
  confirmada: { label: 'Confirmada', cls: 'border-s2/40 bg-s2/10 text-s2' },
  atendida: { label: 'Atendida', cls: 'border-ok/40 bg-ok/10 text-ok' },
  falta: { label: 'Faltou', cls: 'border-bad/40 bg-bad/10 text-bad' },
  cancelada: { label: 'Cancelada', cls: 'border-line bg-surface-2 text-ink-3' },
}

function Gerencial({ data, ir }: { data: DB; ir: Ir }) {
  const k = data.kpis
  const max = Math.max(...data.receitaSemana.map(d => d.valor))
  const atrasadas = data.tutores.flatMap(t => t.pets.flatMap(p =>
    p.vacinas.filter(v => v.situacao === 'atrasada').map(v => ({ pet: p.nome, tutor: t.nome, vacina: v.vacina }))
  ))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Faturamento mês" valor={brl(k.faturamentoMes)} />
        <Kpi label="Ticket médio" valor={brl(k.ticketMedio)} />
        <Kpi label="Ocupação" valor={`${k.ocupacaoPct}%`} hint="da agenda" />
        <Kpi label="No-show" valor={`${k.noShowPct}%`} tom={k.noShowPct > 10 ? 'bad' : 'ok'} hint="faltas no mês" />
        <Kpi label="Vacinas atrasadas" valor={String(k.vacinasAtrasadas)} tom={k.vacinasAtrasadas > 0 ? 'warn' : 'ok'} hint="receita parada" />
        <Kpi label="Agendados pela Bia" valor={String(k.agendadosPelaIA)} tom="ok" hint="sem tocar no telefone" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface-1 p-5 lg:col-span-2">
          <h3 className="mb-4 text-[14px] font-semibold">Receita da semana</h3>
          <div className="flex h-40 items-end gap-3">
            {data.receitaSemana.map(d => (
              <div key={d.dia} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-md bg-brand/70 transition-all hover:bg-brand"
                       style={{ height: `${(d.valor / max) * 100}%` }} title={brl(d.valor)} />
                </div>
                <span className="text-[11px] text-ink-3">{d.dia}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <h3 className="mb-1 text-[14px] font-semibold">Recorrência parada</h3>
          <p className="mb-3 text-[12px] text-ink-3">Vacinas vencidas = pet que devia ter voltado.</p>
          {atrasadas.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-ink-3">Tudo em dia. 🐾</p>
          ) : (
            <div className="space-y-2">
              {atrasadas.map((a, i) => (
                <div key={i} className="rounded-lg border border-line bg-surface-2 px-3 py-2">
                  <div className="text-[13px] font-medium">{a.pet} <span className="text-ink-3">· {a.tutor}</span></div>
                  <div className="text-[11.5px] text-bad">{a.vacina} atrasada</div>
                </div>
              ))}
              <button onClick={() => ir('reativacao')}
                className="mt-1 w-full rounded-lg bg-brand px-3 py-2 text-[12.5px] font-semibold text-surface-0 transition hover:bg-brand-dim">
                Ver os pets a chamar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Clinico({ data, ir }: { data: DB; ir: Ir }) {
  const hoje = new Date().toISOString().slice(0, 10)
  const agenda = data.agenda.filter(a => a.data === hoje)
  const aConfirmar = agenda.filter(a => a.status === 'pendente').length
  const examesPendentes = (data.exames ?? []).filter(e => e.status === 'solicitado')
  const petsPorId = new Map(data.tutores.flatMap(t => t.pets.map(p => [p.id, p.nome] as const)))
  const aChamar = data.tutores.reduce((n, t) =>
    n + t.pets.reduce((m, p) => m + p.vacinas.filter(v => diasAte(v.proximaDose) <= 7).length, 0), 0)
  const alertas = data.tutores.flatMap(t => t.pets.filter(p => p.alerta).map(p => ({ pet: p.nome, tutor: t.nome, alerta: p.alerta! })))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Atendimentos hoje" valor={String(agenda.length)} hint={`${aConfirmar} a confirmar`} />
        <Kpi label="Exames p/ laudar" valor={String(examesPendentes.length)} tom={examesPendentes.length > 0 ? 'warn' : 'ok'} hint="aguardando resultado" />
        <Kpi label="Pets a chamar" valor={String(aChamar)} tom={aChamar > 0 ? 'warn' : 'ok'} hint="vacina vencida/a vencer" />
        <Kpi label="Alertas de saúde" valor={String(alertas.length)} tom={alertas.length > 0 ? 'bad' : 'ok'} hint="pets com observação" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Agenda de hoje */}
        <div className="rounded-xl border border-line bg-surface-1 p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold">Agenda de hoje</h3>
            <button onClick={() => ir('agenda')} className="text-[12px] text-ink-3 transition hover:text-ink">Ver agenda →</button>
          </div>
          {agenda.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-ink-3">Nenhum atendimento hoje.</p>
          ) : (
            <div className="space-y-2">
              {agenda.map(a => {
                const s = STATUS_AGENDA[a.status]
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2">
                    <span className="w-12 shrink-0 text-[13px] font-semibold tabular-nums">{a.hora}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium">{a.pet} <span className="text-ink-3">· {a.tutor}</span></div>
                      <div className="truncate text-[11.5px] text-ink-3">{a.servico} · {a.profissional}</div>
                    </div>
                    {a.canal === 'ia' && (
                      <span className="shrink-0 rounded-md border border-brand/40 bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">Bia</span>
                    )}
                    <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10.5px] font-medium ${s.cls}`}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Exames aguardando resultado */}
        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold">Exames p/ laudar</h3>
            <button onClick={() => ir('exames')} className="text-[12px] text-ink-3 transition hover:text-ink">Ver →</button>
          </div>
          {examesPendentes.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-ink-3">Nenhum exame pendente. 🐾</p>
          ) : (
            <div className="space-y-2">
              {examesPendentes.map(e => (
                <div key={e.id} className="rounded-lg border border-line bg-surface-2 px-3 py-2">
                  <div className="text-[13px] font-medium">{e.tipo}</div>
                  <div className="text-[11.5px] text-ink-3">
                    {petsPorId.get(e.pet_id) ?? '—'} · solicitado {new Date(e.data_solicitacao + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alertas de saúde */}
      {alertas.length > 0 && (
        <div className="rounded-xl border border-bad/30 bg-bad/5 p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-bad">⚠ Alertas de saúde</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {alertas.map((a, i) => (
              <div key={i} className="rounded-lg border border-line bg-surface-1 px-3 py-2">
                <div className="text-[13px] font-medium">{a.pet} <span className="text-ink-3">· {a.tutor}</span></div>
                <div className="text-[12px] text-bad">{a.alerta}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ data, ir }: { data: DB; ir: Ir }) {
  const [lente, setLente] = useState<'gerencial' | 'clinico'>('gerencial')

  return (
    <div className="space-y-4">
      <div className="flex rounded-lg border border-line bg-surface-2 p-0.5 w-fit">
        {([['gerencial', 'Gerencial'], ['clinico', 'Clínico']] as const).map(([k, rotulo]) => (
          <button key={k} onClick={() => setLente(k)}
            className={`rounded-md px-3.5 py-1.5 text-[12.5px] font-medium transition ${
              lente === k ? 'bg-brand/12 text-brand' : 'text-ink-2 hover:text-ink'}`}>
            {rotulo}
          </button>
        ))}
      </div>

      {lente === 'gerencial' ? <Gerencial data={data} ir={ir} /> : <Clinico data={data} ir={ir} />}
    </div>
  )
}
