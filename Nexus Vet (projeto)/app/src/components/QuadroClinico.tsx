import { useState } from 'react'
import type { Pet } from '../data'

// Quadro clínico do pet — condições crônicas / cuidados contínuos.
// Diferente da linha do tempo (eventos): aqui ficam as condições persistentes.

const SUGESTOES = [
  'Dermatite alérgica crônica', 'Cardiopatia', 'Insuficiência renal', 'Diabetes',
  'Obesidade', 'Artrose', 'Epilepsia', 'Hipotireoidismo', 'Doença periodontal', 'Sopro cardíaco',
]

export default function QuadroClinico({ pet, onAdicionar, onRemover }: {
  pet: Pet
  onAdicionar: (texto: string) => Promise<void>
  onRemover: (index: number) => Promise<void>
}) {
  const [texto, setTexto] = useState('')
  const condicoes = pet.condicoes ?? []

  const add = async () => {
    if (!texto.trim()) return
    await onAdicionar(texto)
    setTexto('')
  }

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5">
      <h3 className="text-[14px] font-semibold">Quadro clínico</h3>
      <p className="mb-3 text-[12px] text-ink-3">Condições crônicas e cuidados contínuos do pet.</p>

      {condicoes.length === 0 ? (
        <p className="mb-3 text-[13px] text-ink-3">Nenhuma condição registrada.</p>
      ) : (
        <div className="mb-3 flex flex-wrap gap-2">
          {condicoes.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5 rounded-lg border border-warn/40 bg-warn/10 px-2.5 py-1 text-[12.5px] text-warn">
              {c}
              <button onClick={() => onRemover(i)} aria-label={`Remover ${c}`} className="text-warn/70 transition hover:text-warn">✕</button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input value={texto} onChange={e => setTexto(e.target.value)} list="condicoes-sugestoes"
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Ex.: Cardiopatia"
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] outline-none transition placeholder:text-ink-3 focus:border-brand/60" />
        <datalist id="condicoes-sugestoes">{SUGESTOES.map(s => <option key={s} value={s} />)}</datalist>
        <button onClick={add} disabled={!texto.trim()}
          className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-50">
          Adicionar
        </button>
      </div>
    </div>
  )
}
