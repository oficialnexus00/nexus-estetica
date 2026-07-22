import { useState } from 'react'
import type { Vacina, SituacaoVacina, Especie, ProtocoloVacina } from '../data'
import Modal from './Modal'
import { FormDose, type DadosDose } from './Formularios'

// Equivalente vet do Odontograma do NEXUS Odonto: o módulo clínico visual.
// Aqui o que importa não é "onde" (dente), é "quando" (próxima dose) — porque
// é a data de vencimento que gera a recorrência e traz o pet de volta.

const COR: Record<SituacaoVacina, { dot: string; label: string; texto: string }> = {
  em_dia: { dot: '#2fbf71', label: 'Em dia', texto: 'text-ok' },
  proxima: { dot: '#e0a63a', label: 'Vence em breve', texto: 'text-warn' },
  atrasada: { dot: '#e66767', label: 'Atrasada', texto: 'text-bad' },
}

const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const diasAte = (d: string) =>
  Math.round((new Date(d).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)

function Linha({ v }: { v: Vacina }) {
  const c = COR[v.situacao]
  const dias = diasAte(v.proximaDose)
  const prazo =
    v.situacao === 'atrasada' ? `${Math.abs(dias)} dias em atraso`
    : dias === 0 ? 'vence hoje'
    : `em ${dias} dias`

  return (
    <div className="flex items-center gap-3 border-b border-line py-3 last:border-0">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.dot }} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-medium">{v.vacina}</div>
        <div className="text-[11.5px] text-ink-3">Aplicada em {fmt(v.aplicacao)}</div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[12.5px] tabular-nums">{fmt(v.proximaDose)}</div>
        <div className={`text-[11px] ${c.texto}`}>{prazo}</div>
      </div>
    </div>
  )
}

export default function CarteiraVacina({ vacinas, especie, protocolos = [], onRegistrarDose }: {
  vacinas: Vacina[]; especie: Especie; protocolos?: ProtocoloVacina[]
  onRegistrarDose?: (d: DadosDose) => Promise<void>
}) {
  const [registrando, setRegistrando] = useState(false)
  const atrasadas = vacinas.filter(v => v.situacao === 'atrasada').length
  const proximas = vacinas.filter(v => v.situacao === 'proxima').length

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-semibold">Carteira de vacinação</h3>
          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-ink-2">
            {especie === 'cao' ? 'Cão' : 'Gato'}
          </span>
        </div>
        {onRegistrarDose && (
          <button onClick={() => setRegistrando(true)}
            className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-surface-0 transition hover:bg-brand-dim">
            + Registrar dose
          </button>
        )}
      </div>

      {onRegistrarDose && (
        <Modal titulo="Registrar dose aplicada" aberto={registrando} onFechar={() => setRegistrando(false)}>
          <FormDose especie={especie} protocolos={protocolos} onCancelar={() => setRegistrando(false)}
            onSalvar={async d => { await onRegistrarDose(d); setRegistrando(false) }} />
        </Modal>
      )}

      {(atrasadas > 0 || proximas > 0) && (
        <div className="mb-3 flex flex-wrap gap-2">
          {atrasadas > 0 && (
            <span className="rounded-lg border border-bad/40 bg-bad/10 px-2.5 py-1 text-[11.5px] text-bad">
              {atrasadas} {atrasadas === 1 ? 'vacina atrasada' : 'vacinas atrasadas'} — a Bia já pode chamar
            </span>
          )}
          {proximas > 0 && (
            <span className="rounded-lg border border-warn/40 bg-warn/10 px-2.5 py-1 text-[11.5px] text-warn">
              {proximas} vencendo em breve
            </span>
          )}
        </div>
      )}

      {vacinas.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-ink-3">Nenhuma dose registrada ainda.</p>
      ) : (
        <div>{vacinas.map(v => <Linha key={v.vacina + v.aplicacao} v={v} />)}</div>
      )}

      <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-3 text-[11.5px]">
        {(Object.keys(COR) as SituacaoVacina[]).map(k => (
          <span key={k} className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-sm" style={{ background: COR[k].dot }} /> {COR[k].label}
          </span>
        ))}
      </div>
    </div>
  )
}
