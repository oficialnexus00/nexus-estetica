import { useState } from 'react'
import type { Vacina, SituacaoVacina, ProtocoloVacina, Pet } from '../data'
import Modal from './Modal'
import { FormDose, type DadosDose } from './Formularios'

// Vacinação unificada: junta o PROTOCOLO da clínica (o plano — o que o pet
// precisa tomar e de quanto em quanto tempo) com a CARTEIRA do pet (o que já
// foi aplicado e quando vence). É a data da próxima dose que gera a recorrência
// e traz o pet de volta — por isso os dois viram uma coisa só.

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
const diasAte = (d: string) =>
  Math.round((new Date(d + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)

const descreveReforco = (p: ProtocoloVacina) =>
  p.reforcoMeses % 12 === 0
    ? `reforço a cada ${p.reforcoMeses / 12} ano${p.reforcoMeses > 12 ? 's' : ''}`
    : `reforço a cada ${p.reforcoMeses} meses`

const STATUS: Record<SituacaoVacina, { label: string; cls: string; dot: string }> = {
  em_dia: { label: 'Em dia', cls: 'border-ok/40 bg-ok/10 text-ok', dot: '#2fbf71' },
  proxima: { label: 'Vence em breve', cls: 'border-warn/40 bg-warn/10 text-warn', dot: '#e0a63a' },
  atrasada: { label: 'Atrasada', cls: 'border-bad/40 bg-bad/10 text-bad', dot: '#e66767' },
}
const NUNCA = { label: 'Nunca aplicada', cls: 'border-s2/40 bg-s2/10 text-s2', dot: '#5d6b84' }

function Linha({ nome, sub, v }: { nome: string; sub: string; v?: Vacina }) {
  const st = v ? STATUS[v.situacao] : NUNCA
  const prazo = v ? (() => {
    const d = diasAte(v.proximaDose)
    return v.situacao === 'atrasada' ? `${Math.abs(d)} dias em atraso` : d === 0 ? 'vence hoje' : `em ${d} dias`
  })() : null

  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: st.dot }} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-medium">{nome}</div>
        <div className="text-[11.5px] text-ink-3">
          {sub}{v ? ` · aplicada ${fmt(v.aplicacao)} · próxima ${fmt(v.proximaDose)}` : ' · aguardando 1ª dose'}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-medium ${st.cls}`}>{st.label}</span>
        {prazo && <div className="mt-0.5 text-[11px] text-ink-3">{prazo}</div>}
      </div>
    </div>
  )
}

export default function Vacinacao({ pet, protocolos = [], onRegistrarDose }: {
  pet: Pet; protocolos?: ProtocoloVacina[]
  onRegistrarDose?: (d: DadosDose) => Promise<void>
}) {
  const [registrando, setRegistrando] = useState(false)
  const especie = pet.especie
  const vacinas = pet.vacinas

  const aplicaveis = protocolos.filter(p => p.ativo && (p.especie === especie || p.especie === 'ambos'))
  const nomesProtocolo = new Set(aplicaveis.map(p => p.nome))
  const avulsas = vacinas.filter(v => !nomesProtocolo.has(v.vacina))

  const atrasadas = vacinas.filter(v => v.situacao === 'atrasada').length
  const proximas = vacinas.filter(v => v.situacao === 'proxima').length

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-semibold">Vacinação</h3>
          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-ink-2">{especie === 'cao' ? 'Cão' : 'Gato'}</span>
        </div>
        {onRegistrarDose && (
          <button onClick={() => setRegistrando(true)}
            className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-surface-0 transition hover:bg-brand-dim">
            + Registrar dose
          </button>
        )}
      </div>
      <p className="mb-3 text-[12px] text-ink-3">Protocolo da clínica cruzado com a carteira do pet — a data da próxima dose é o que traz o pet de volta.</p>

      {(atrasadas > 0 || proximas > 0) && (
        <div className="mb-3 flex flex-wrap gap-2">
          {atrasadas > 0 && (
            <span className="rounded-lg border border-bad/40 bg-bad/10 px-2.5 py-1 text-[11.5px] text-bad">
              {atrasadas} {atrasadas === 1 ? 'atrasada' : 'atrasadas'} — a Bia já pode chamar
            </span>
          )}
          {proximas > 0 && (
            <span className="rounded-lg border border-warn/40 bg-warn/10 px-2.5 py-1 text-[11.5px] text-warn">
              {proximas} vencendo em breve
            </span>
          )}
        </div>
      )}

      {aplicaveis.length === 0 && avulsas.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-ink-3">Nenhum protocolo cadastrado nem dose registrada.</p>
      ) : (
        <div className="space-y-2">
          {aplicaveis.map(p => (
            <Linha key={p.id} nome={p.nome} sub={descreveReforco(p)} v={vacinas.find(x => x.vacina === p.nome)} />
          ))}

          {avulsas.length > 0 && (
            <>
              <div className="pt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3">Outras doses aplicadas</div>
              {avulsas.map(v => <Linha key={v.vacina + v.aplicacao} nome={v.vacina} sub="fora do protocolo" v={v} />)}
            </>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-3 text-[11.5px]">
        {([['#2fbf71', 'Em dia'], ['#e0a63a', 'Vence em breve'], ['#e66767', 'Atrasada'], ['#5d6b84', 'Nunca aplicada']] as const).map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} /> {l}</span>
        ))}
      </div>

      {onRegistrarDose && (
        <Modal titulo="Registrar dose aplicada" aberto={registrando} onFechar={() => setRegistrando(false)}>
          <FormDose especie={especie} protocolos={protocolos} onCancelar={() => setRegistrando(false)}
            onSalvar={async d => { await onRegistrarDose(d); setRegistrando(false) }} />
        </Modal>
      )}
    </div>
  )
}
