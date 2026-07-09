import { useState } from 'react'
import Odontograma, { type EstadoDente } from '../components/Odontograma'
import type { Paciente } from '../data'

const TABS = ['Ficha clínica', 'Anamnese', 'Orçamentos', 'Financeiro', 'Consultas'] as const
type Tab = (typeof TABS)[number]

// Estados do odontograma (espelha o padrão que a clínica já usa)
const ESTADOS: Record<number, EstadoDente> = {
  14: 'realizar', 25: 'realizar', 26: 'realizar',
  44: 'realizar', 45: 'realizar', 34: 'realizar', 35: 'realizar',
  16: 'realizado', 36: 'realizado',
}

type Proc = { id: string; nome: string; dente: string; estado: 'A realizar' | 'Realizado' }
const PROCS: Proc[] = [
  { id: 'p1', nome: 'Restauração em resina fotopolimerizável', dente: '44 V', estado: 'A realizar' },
  { id: 'p2', nome: 'Restauração em resina fotopolimerizável', dente: '45 V', estado: 'A realizar' },
  { id: 'p3', nome: 'Restauração em resina fotopolimerizável', dente: '34 V', estado: 'A realizar' },
  { id: 'p4', nome: 'Restauração em resina fotopolimerizável', dente: '35 O, M', estado: 'A realizar' },
  { id: 'p5', nome: 'Restauração em resina fotopolimerizável', dente: '14 V', estado: 'A realizar' },
  { id: 'p6', nome: 'Restauração em resina fotopolimerizável', dente: '26 V', estado: 'A realizar' },
  { id: 'p7', nome: 'Profilaxia + aplicação de flúor', dente: 'Geral', estado: 'Realizado' },
  { id: 'p8', nome: 'Restauração em resina', dente: '16 O', estado: 'Realizado' },
]

export default function FichaClinica({ paciente, onClose }: { paciente: Paciente; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('Ficha clínica')
  const [orcados, setOrcados] = useState<string[]>([])
  const iniciais = paciente.nome.split(' ').map(n => n[0]).slice(0, 2).join('')
  const aRealizar = PROCS.filter(p => p.estado === 'A realizar')

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-0">
      {/* Topo */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3 md:px-6">
        <button onClick={onClose} className="flex items-center gap-2 text-[13px] text-ink-2 hover:text-ink">
          ← Voltar aos pacientes
        </button>
        <span className="text-[11.5px] text-ink-3">Piloto · dados fictícios</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
        <div className="mx-auto max-w-5xl space-y-5">
          {/* Cabeçalho do paciente */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/15 text-[20px] font-semibold text-brand">{iniciais}</div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[19px] font-semibold tracking-tight">{paciente.nome}</h1>
              <div className="text-[12.5px] text-ink-3">nasc. {paciente.nasc} · {paciente.telefone} · origem {paciente.origem}</div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-surface-0 hover:bg-brand-dim">Agendar</button>
              <button className="rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-[12.5px] font-medium text-ink-2 hover:text-ink">💬 WhatsApp</button>
            </div>
          </div>

          {paciente.alerta && (
            <div className="inline-flex items-center gap-2 rounded-lg border border-warn/30 bg-warn/10 px-3 py-1.5 text-[12.5px] font-medium text-warn">
              ⚠ 1 alerta de saúde — {paciente.alerta}
            </div>
          )}

          {/* Abas */}
          <div className="flex gap-1 overflow-x-auto border-b border-line">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-[13px] font-medium transition
                  ${tab === t ? 'border-brand text-brand' : 'border-transparent text-ink-3 hover:text-ink-2'}`}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'Ficha clínica' && (
            <div className="space-y-5">
              <Odontograma estados={ESTADOS} />

              {/* Diferencial NEXUS */}
              {aRealizar.length > orcados.length && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand/25 bg-brand/8 px-4 py-3">
                  <div className="text-[13px] text-ink-2">
                    🤖 <span className="font-semibold text-brand">{aRealizar.length - orcados.length} procedimentos a orçar.</span> Ao orçar,
                    a Patrícia envia a proposta no WhatsApp e faz o follow-up sozinha.
                  </div>
                  <button
                    onClick={() => setOrcados(aRealizar.map(p => p.id))}
                    className="whitespace-nowrap rounded-lg bg-brand px-3.5 py-2 text-[12.5px] font-semibold text-surface-0 hover:bg-brand-dim">
                    Orçar todos + Patrícia
                  </button>
                </div>
              )}

              {/* Ficha geral */}
              <div>
                <h3 className="mb-3 text-[14px] font-semibold">Ficha geral</h3>
                <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
                  <table className="w-full min-w-[640px] text-[13px]">
                    <thead>
                      <tr className="border-b border-line text-left text-[11.5px] uppercase tracking-wider text-ink-3">
                        <th className="px-4 py-3 font-medium">Procedimento</th>
                        <th className="px-4 py-3 font-medium">Dente</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 text-right font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PROCS.map(p => {
                        const orcado = orcados.includes(p.id)
                        return (
                          <tr key={p.id} className="border-b border-line/50 last:border-b-0">
                            <td className="px-4 py-3 font-medium">{p.nome}</td>
                            <td className="px-4 py-3 tabular-nums text-ink-2">{p.dente}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-md px-2 py-1 text-[11.5px] font-semibold ${p.estado === 'Realizado' ? 'bg-ok/12 text-ok' : 'bg-warn/15 text-warn'}`}>
                                {p.estado}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {p.estado === 'A realizar' ? (
                                orcado ? (
                                  <span className="text-[12px] font-medium text-brand">✓ Patrícia acompanhando</span>
                                ) : (
                                  <button onClick={() => setOrcados([...orcados, p.id])}
                                    className="rounded-lg border border-brand/40 px-3 py-1.5 text-[12px] font-semibold text-brand hover:bg-brand/10">
                                    + Orçar
                                  </button>
                                )
                              ) : <span className="text-[12px] text-ink-3">—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'Anamnese' && (
            <div className="rounded-xl border border-line bg-surface-1 p-6 text-[13px]">
              <h3 className="mb-4 text-[14px] font-semibold">Anamnese</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Hipertensão', paciente.alerta?.includes('Hiperten') ? 'Sim — verificar PA antes' : 'Não'],
                  ['Diabetes', paciente.alerta?.includes('Diab') ? 'Sim — tipo 2' : 'Não'],
                  ['Alergia a medicamento', paciente.alerta?.includes('Alergia') ? 'Sim — dipirona' : 'Nega'],
                  ['Gestante', 'Não'],
                  ['Faz uso de anticoagulante', 'Não'],
                  ['Fumante', 'Não'],
                ].map(([q, a]) => (
                  <div key={q} className="flex justify-between rounded-lg border border-line bg-surface-2 px-3 py-2.5">
                    <span className="text-ink-2">{q}</span>
                    <span className={`font-medium ${String(a).startsWith('Sim') ? 'text-warn' : 'text-ink'}`}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Orçamentos' && (
            <div className="rounded-xl border border-line bg-surface-1 p-6 text-[13px] text-ink-2">
              Os orçamentos deste paciente aparecem aqui e entram automaticamente no
              follow-up da Patrícia. <span className="text-ink-3">(Ver aba “Orçamentos” no menu para a visão geral.)</span>
            </div>
          )}
          {tab === 'Financeiro' && (
            <div className="rounded-xl border border-line bg-surface-1 p-6 text-[13px] text-ink-2">
              Saldo, recebimentos e parcelas do paciente. Integra com o link de pagamento (PagTrust).
            </div>
          )}
          {tab === 'Consultas' && (
            <div className="rounded-xl border border-line bg-surface-1 p-6 text-[13px] text-ink-2">
              Histórico de consultas e comparecimentos — alimenta o indicador de no-show no dashboard.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
