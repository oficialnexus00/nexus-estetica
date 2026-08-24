import { useMemo, useState } from 'react'
import Modal, { inputCls } from './Modal'
import type { Paciente, Orcamento, Consulta } from '../data'
import { fmt } from '../data'

type Data = { pacientes: readonly Paciente[]; orcamentos: readonly Orcamento[]; consultas: readonly Consulta[] }

export default function ModalBuscar({ open, onClose, data }: { open: boolean; onClose: () => void; data: Data }) {
  const [q, setQ] = useState('')

  const res = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (t.length < 2) return null
    const m = (s: string) => s.toLowerCase().includes(t)
    return {
      pacientes: data.pacientes.filter(p => m(p.nome) || m(p.telefone)).slice(0, 5),
      orcamentos: data.orcamentos.filter(o => m(o.paciente) || m(o.procedimento)).slice(0, 5),
      consultas: data.consultas.filter(c => m(c.paciente) || m(c.procedimento)).slice(0, 5),
    }
  }, [q, data])

  const vazio = res && res.pacientes.length + res.orcamentos.length + res.consultas.length === 0

  function fechar() {
    setQ('')
    onClose()
  }

  return (
    <Modal open={open} onClose={fechar} title="Buscar" subtitle="Pacientes, orçamentos e agenda" maxW="max-w-lg">
      <input
        autoFocus
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Digite um nome, telefone ou procedimento…"
        className={inputCls}
      />

      <div className="mt-4 max-h-[46vh] space-y-4 overflow-y-auto">
        {!res && <p className="py-6 text-center text-[12.5px] text-ink-3">Digite ao menos 2 letras pra buscar.</p>}
        {vazio && <p className="py-6 text-center text-[12.5px] text-ink-3">Nada encontrado pra "{q}".</p>}

        {res && res.pacientes.length > 0 && (
          <Grupo titulo="Pacientes">
            {res.pacientes.map(p => (
              <Linha key={p.id} titulo={p.nome} sub={`${p.telefone} · última visita ${p.ultimaVisita}`} tag={p.origem} />
            ))}
          </Grupo>
        )}

        {res && res.orcamentos.length > 0 && (
          <Grupo titulo="Orçamentos">
            {res.orcamentos.map(o => (
              <Linha key={o.id} titulo={o.paciente} sub={o.procedimento} tag={fmt(o.valor)} />
            ))}
          </Grupo>
        )}

        {res && res.consultas.length > 0 && (
          <Grupo titulo="Agenda">
            {res.consultas.map(c => (
              <Linha key={c.id} titulo={c.paciente} sub={c.procedimento} tag={c.hora} />
            ))}
          </Grupo>
        )}
      </div>
    </Modal>
  )
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-3">{titulo}</div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Linha({ titulo, sub, tag }: { titulo: string; sub: string; tag: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5 transition hover:border-brand/40">
      <div className="min-w-0">
        <div className="truncate text-[13px] font-medium text-ink">{titulo}</div>
        <div className="truncate text-[12px] text-ink-3">{sub}</div>
      </div>
      <span className="shrink-0 rounded-md bg-surface-3 px-2 py-0.5 text-[11.5px] text-ink-2">{tag}</span>
    </div>
  )
}
