import { useState } from 'react'
import type { Pet, Exame } from '../data'
import Modal from './Modal'

// Linha do tempo clínica — inspirada no "Histórico/Linha do tempo" do SimplesVet:
// junta num único feed cronológico tudo que aconteceu com o pet (atendimentos,
// vacinas, exames, observações e patologias/diagnósticos), com tipo e cor.
// Permite adicionar registros rápidos (observação/patologia) direto daqui.

type Tipo = 'atendimento' | 'vacina' | 'exame' | 'observacao' | 'patologia'
type Filtro = 'tudo' | 'atendimento' | 'vacina' | 'exame' | 'nota'

type Evento = {
  id: string
  tipo: Tipo
  data: string
  titulo?: string
  descricao?: string
  tag?: { label: string; cls: string }
}

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

const META: Record<Tipo, { icone: string; rotulo: string; cls: string }> = {
  atendimento: { icone: '🩺', rotulo: 'Atendimento', cls: 'border-brand/40 bg-brand/10 text-brand' },
  vacina: { icone: '💉', rotulo: 'Vacina', cls: 'border-ok/40 bg-ok/10 text-ok' },
  exame: { icone: '🔬', rotulo: 'Exame', cls: 'border-s2/40 bg-s2/10 text-s2' },
  patologia: { icone: '🩹', rotulo: 'Diagnóstico', cls: 'border-bad/40 bg-bad/10 text-bad' },
  observacao: { icone: '📝', rotulo: 'Observação', cls: 'border-line bg-surface-2 text-ink-2' },
}

// Sugestões comuns para o campo de patologia (datalist)
const PATOLOGIAS = [
  'Dermatite alérgica', 'Otite', 'Gastroenterite', 'Obesidade', 'Doença periodontal',
  'Insuficiência renal', 'Cardiopatia', 'Diabetes', 'Artrose', 'Conjuntivite',
]

export default function LinhaDoTempo({ pet, exames, onNota }: {
  pet: Pet; exames: Exame[]
  onNota?: (d: { tipo: 'observacao' | 'patologia'; texto: string }) => Promise<void>
}) {
  const [filtro, setFiltro] = useState<Filtro>('tudo')
  const [form, setForm] = useState<'observacao' | 'patologia' | null>(null)
  const [aberto, setAberto] = useState(true)

  const eventos: Evento[] = [
    ...pet.atendimentos.map(a => ({
      id: 'at' + a.id, tipo: 'atendimento' as const, data: a.data,
      titulo: a.motivo,
      descricao: [a.profissional, a.diagnostico].filter(Boolean).join(' · ') || undefined,
      tag: a.tipo ? { label: a.tipo, cls: 'border-brand/40 bg-brand/10 text-brand' } : undefined,
    })),
    ...pet.vacinas.map((v, i) => ({
      id: 'vac' + i + v.aplicacao, tipo: 'vacina' as const, data: v.aplicacao,
      titulo: v.vacina, descricao: `Próxima dose em ${fmt(v.proximaDose)}`,
    })),
    ...exames.map(e => ({
      id: 'ex' + e.id, tipo: 'exame' as const,
      data: e.data_resultado ?? e.data_solicitacao,
      titulo: e.tipo, descricao: e.resultado || undefined,
      tag: e.status === 'concluído' ? { label: 'Concluído', cls: 'border-ok/40 bg-ok/10 text-ok' }
        : e.status === 'cancelado' ? { label: 'Cancelado', cls: 'border-bad/40 bg-bad/10 text-bad' }
        : { label: 'Solicitado', cls: 'border-s2/40 bg-s2/10 text-s2' },
    })),
    ...(pet.registros ?? []).map(r => ({
      id: 'reg' + r.id, tipo: r.tipo, data: r.data,
      titulo: r.tipo === 'patologia' ? r.texto : undefined,
      descricao: r.tipo === 'patologia' ? r.autor : r.texto,
    })),
  ].sort((a, b) => b.data.localeCompare(a.data))

  const lista = filtro === 'tudo' ? eventos
    : filtro === 'nota' ? eventos.filter(e => e.tipo === 'observacao' || e.tipo === 'patologia')
    : eventos.filter(e => e.tipo === filtro)

  const cont = (fn: (t: Tipo) => boolean) => eventos.filter(e => fn(e.tipo)).length
  const filtros: [Filtro, string][] = [
    ['tudo', `Tudo (${eventos.length})`],
    ['atendimento', `Atendimentos (${cont(t => t === 'atendimento')})`],
    ['vacina', `Vacinas (${cont(t => t === 'vacina')})`],
    ['exame', `Exames (${cont(t => t === 'exame')})`],
    ['nota', `Notas (${cont(t => t === 'observacao' || t === 'patologia')})`],
  ]

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5">
      <div className={`flex flex-wrap items-center justify-between gap-2 ${aberto ? 'mb-3' : ''}`}>
        <button onClick={() => setAberto(v => !v)} aria-expanded={aberto}
          className="flex items-center gap-2 text-left transition hover:text-brand">
          <span className="text-[12px] leading-none text-ink-3">{aberto ? '▾' : '▸'}</span>
          <h3 className="text-[14px] font-semibold">Linha do tempo</h3>
          <span className="text-[11.5px] font-normal text-ink-3">{eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}</span>
        </button>
        {aberto && onNota && (
          <div className="flex items-center gap-1.5">
            <button onClick={() => setForm('observacao')}
              className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
              + Observação
            </button>
            <button onClick={() => setForm('patologia')}
              className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
              + Diagnóstico
            </button>
          </div>
        )}
      </div>

      {aberto && (<>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {filtros.map(([f, rotulo]) => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`rounded-lg px-2.5 py-1 text-[11.5px] font-medium transition ${
              filtro === f ? 'bg-brand/12 text-brand' : 'border border-line bg-surface-2 text-ink-2 hover:text-ink'}`}>
            {rotulo}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-ink-3">Nada no histórico ainda.</p>
      ) : (
        <div className="relative space-y-3 pl-6">
          <div className="absolute bottom-1 left-[9px] top-1 w-px bg-line" />
          {lista.map(ev => {
            const m = META[ev.tipo]
            return (
              <div key={ev.id} className="relative">
                <div className="absolute -left-6 top-0.5 flex h-[19px] w-[19px] items-center justify-center rounded-full border border-line bg-surface-2 text-[10px]">
                  {m.icone}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${m.cls}`}>{m.rotulo}</span>
                  {ev.titulo && <span className="text-[13.5px] font-medium">{ev.titulo}</span>}
                  {ev.tag && (
                    <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${ev.tag.cls}`}>{ev.tag.label}</span>
                  )}
                  <span className="text-[11.5px] text-ink-3">{fmt(ev.data)}</span>
                </div>
                {ev.descricao && (
                  <p className="mt-0.5 line-clamp-2 text-[12px] text-ink-3">{ev.descricao}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
      </>)}

      {onNota && (
        <Modal titulo={form === 'patologia' ? 'Registrar diagnóstico' : 'Nova observação'}
          aberto={form !== null} onFechar={() => setForm(null)}>
          {form && <FormNota tipo={form} onSalvar={async d => { await onNota(d); setForm(null) }} onCancelar={() => setForm(null)} />}
        </Modal>
      )}
    </div>
  )
}

function FormNota({ tipo, onSalvar, onCancelar }: {
  tipo: 'observacao' | 'patologia'
  onSalvar: (d: { tipo: 'observacao' | 'patologia'; texto: string }) => Promise<void>
  onCancelar: () => void
}) {
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const campoCls = 'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] outline-none transition placeholder:text-ink-3 focus:border-brand/60'

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    setEnviando(true)
    await onSalvar({ tipo, texto })
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      {tipo === 'patologia' ? (
        <div>
          <label className="mb-1 block text-[12.5px] font-medium text-ink-2">Diagnóstico</label>
          <input value={texto} onChange={e => setTexto(e.target.value)} list="patologias-sugestoes"
            placeholder="Ex.: Dermatite alérgica" className={campoCls} autoFocus />
          <datalist id="patologias-sugestoes">
            {PATOLOGIAS.map(p => <option key={p} value={p} />)}
          </datalist>
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-[12.5px] font-medium text-ink-2">Observação</label>
          <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={3}
            placeholder="Anotação livre sobre o pet…" className={campoCls + ' resize-y'} autoFocus />
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancelar}
          className="rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-[13px] font-medium text-ink-2 transition hover:text-ink">
          Cancelar
        </button>
        <button type="submit" disabled={enviando || !texto.trim()}
          className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-60">
          {enviando ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
