import { useEffect, useState } from 'react'
import { db, fmt, type Paciente } from '../data'
import { listPatients, type PatientRow } from '../lib/patients'
import FichaClinica from './FichaClinica'
import ModalPaciente from '../components/ModalPaciente'
import ModalAgendar from '../components/ModalAgendar'
import ModalWhatsApp from '../components/ModalWhatsApp'

type Data = (typeof db)['c1'] | (typeof db)['c2']

// Converte a linha do banco pro formato que a tela usa
function toPaciente(r: PatientRow): Paciente {
  return {
    id: r.id,
    nome: r.nome,
    telefone: r.telefone ?? '—',
    nasc: fmtNasc(r.nascimento),
    alerta: r.alerta_saude ?? undefined,
    ultimaVisita: '—',
    proxima: undefined,
    origem: r.origem ?? '—',
    saldo: Number(r.saldo) || 0,
  }
}

function fmtNasc(iso: string | null) {
  if (!iso) return '—'
  const [a, m, d] = iso.split('-')
  return d && m && a ? `${d}/${m}/${a}` : '—'
}

export default function Pacientes({
  data,
  realClinicId,
  clinicNome,
  profissionais,
}: {
  data: Data
  realClinicId?: string
  clinicNome: string
  profissionais: readonly { id: string; nome: string; especialidade?: string | null }[]
}) {
  const real = !!realClinicId
  const [busca, setBusca] = useState('')
  const [sel, setSel] = useState<Paciente | null>(null)
  const [ficha, setFicha] = useState<Paciente | null>(null)
  const [novo, setNovo] = useState(false)
  const [agendarPara, setAgendarPara] = useState<string | null>(null)
  const [wppPara, setWppPara] = useState<string | null>(null)

  const [rows, setRows] = useState<PatientRow[]>([])
  const [carregando, setCarregando] = useState(real)

  function recarregar() {
    if (!real) return
    setCarregando(true)
    listPatients(realClinicId!)
      .then(r => setRows(r))
      .catch(() => setRows([]))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    if (!real) return
    let vivo = true
    setCarregando(true)
    setSel(null)
    listPatients(realClinicId!)
      .then(r => vivo && setRows(r))
      .catch(() => vivo && setRows([]))
      .finally(() => vivo && setCarregando(false))
    return () => {
      vivo = false
    }
  }, [real, realClinicId])

  const base: Paciente[] = real ? rows.map(toPaciente) : [...data.pacientes]
  const lista = base.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))

  if (ficha) return <FichaClinica paciente={ficha} onClose={() => setFicha(null)} />

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar paciente por nome…"
            className="w-80 rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-[13px] outline-none placeholder:text-ink-3 focus:border-brand/60"
          />
          <button onClick={() => setNovo(true)} className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 hover:bg-brand-dim">
            + Novo paciente
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
          <table className="w-full min-w-[640px] text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] uppercase tracking-wider text-ink-3">
                <th className="px-4 py-3 font-medium">Paciente</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Última visita</th>
                <th className="px-4 py-3 font-medium">Próxima</th>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 text-right font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {carregando && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[12.5px] text-ink-3">
                    Carregando pacientes…
                  </td>
                </tr>
              )}
              {!carregando && lista.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[12.5px] text-ink-3">
                    {real
                      ? busca
                        ? `Nenhum paciente encontrado pra "${busca}".`
                        : 'Nenhum paciente ainda — cadastre o primeiro no botão “+ Novo paciente”.'
                      : 'Nenhum paciente.'}
                  </td>
                </tr>
              )}
              {!carregando &&
                lista.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => setSel(p)}
                    className={`cursor-pointer border-b border-line/50 transition last:border-b-0 hover:bg-surface-2 ${sel?.id === p.id ? 'bg-surface-2' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.nome}</div>
                      {p.alerta && <div className="mt-0.5 text-[11.5px] text-warn">⚠ {p.alerta}</div>}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink-2">{p.telefone}</td>
                    <td className="px-4 py-3 tabular-nums text-ink-2">{p.ultimaVisita}</td>
                    <td className="px-4 py-3 tabular-nums text-ink-2">{p.proxima ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[11.5px] font-medium ${p.origem.includes('Ads') ? 'bg-brand/12 text-brand' : 'bg-surface-3 text-ink-2'}`}>
                        {p.origem}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right tabular-nums ${p.saldo < 0 ? 'text-warn' : 'text-ink-3'}`}>
                      {p.saldo === 0 ? '—' : fmt(p.saldo)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {real && (
          <div className="text-[12px] text-ink-3">
            ● Lendo e gravando direto no banco (Supabase) — {clinicNome}.
          </div>
        )}
      </div>

      {/* Ficha lateral */}
      {sel && (
        <aside className="shrink-0 self-start rounded-xl border border-line bg-surface-1 p-5 lg:w-80">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/15 text-[16px] font-semibold text-brand">
                {sel.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <div className="text-[14.5px] font-semibold leading-tight">{sel.nome}</div>
                <div className="text-[12px] text-ink-3">nasc. {sel.nasc}</div>
              </div>
            </div>
            <button onClick={() => setSel(null)} className="text-ink-3 hover:text-ink">✕</button>
          </div>

          {sel.alerta && (
            <div className="mt-4 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-[12.5px] text-warn">
              ⚠ {sel.alerta}
            </div>
          )}

          <div className="mt-4 space-y-2.5 text-[13px]">
            <div className="flex justify-between"><span className="text-ink-3">Telefone</span><span className="tabular-nums">{sel.telefone}</span></div>
            <div className="flex justify-between"><span className="text-ink-3">Última visita</span><span className="tabular-nums">{sel.ultimaVisita}</span></div>
            <div className="flex justify-between"><span className="text-ink-3">Próxima consulta</span><span className="tabular-nums">{sel.proxima ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-ink-3">Origem</span><span>{sel.origem}</span></div>
            <div className="flex justify-between"><span className="text-ink-3">Saldo em aberto</span>
              <span className={sel.saldo < 0 ? 'font-semibold text-warn' : ''}>{sel.saldo === 0 ? 'Em dia ✓' : fmt(sel.saldo)}</span>
            </div>
          </div>

          <button
            onClick={() => setFicha(sel)}
            className="mt-5 w-full rounded-lg bg-brand px-3 py-2.5 text-[13px] font-semibold text-surface-0 hover:bg-brand-dim">
            Abrir ficha clínica →
          </button>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setAgendarPara(sel.nome)} className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12.5px] font-medium text-ink-2 hover:text-ink">Agendar</button>
            <button onClick={() => setWppPara(sel.nome)} className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12.5px] font-medium text-ink-2 hover:text-ink">💬 WhatsApp</button>
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <div className="text-[11.5px] font-medium uppercase tracking-wider text-ink-3">Ficha clínica</div>
            <div className="mt-2 text-[12.5px] leading-relaxed text-ink-3">
              Odontograma, anamnese, orçamentos e histórico — tudo do paciente num lugar só.
            </div>
          </div>
        </aside>
      )}

      <ModalPaciente
        open={novo}
        onClose={() => setNovo(false)}
        clinicNome={clinicNome}
        clinicId={realClinicId}
        onSaved={recarregar}
      />
      {agendarPara && (
        <ModalAgendar
          open
          onClose={() => setAgendarPara(null)}
          profissionais={profissionais}
          clinicNome={clinicNome}
          pacienteInicial={agendarPara}
          clinicId={realClinicId}
          onSaved={recarregar}
        />
      )}
      {wppPara && <ModalWhatsApp open onClose={() => setWppPara(null)} nome={wppPara} />}
    </div>
  )
}
