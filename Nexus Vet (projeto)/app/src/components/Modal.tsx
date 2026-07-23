import { useEffect, type ReactNode } from 'react'

export default function Modal({ titulo, aberto, onFechar, children, largura = 'md' }: {
  titulo: string; aberto: boolean; onFechar: () => void; children: ReactNode
  largura?: 'md' | 'lg' | 'xl'
}) {
  useEffect(() => {
    if (!aberto) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [aberto, onFechar])

  if (!aberto) return null

  const larguraCls = largura === 'xl' ? 'sm:max-w-4xl' : largura === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-md'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onFechar} />
      <div role="dialog" aria-modal="true" aria-label={titulo}
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-surface-1 p-5 sm:rounded-2xl ${larguraCls}`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-[15px] font-semibold tracking-tight">{titulo}</h3>
          <button onClick={onFechar} aria-label="Fechar"
            className="rounded-lg border border-line bg-surface-2 px-2 py-1 text-[13px] leading-none text-ink-2 transition hover:text-ink">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-ink-2">{label}</span>
      {children}
    </label>
  )
}

export const inputCls =
  'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13.5px] text-ink outline-none transition placeholder:text-ink-3 focus:border-brand/60'

export function Acoes({ onCancelar, enviando, rotulo = 'Salvar' }: {
  onCancelar: () => void; enviando?: boolean; rotulo?: string
}) {
  return (
    <div className="mt-5 flex gap-2">
      <button type="button" onClick={onCancelar}
        className="flex-1 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-[13px] font-medium text-ink-2 transition hover:text-ink">
        Cancelar
      </button>
      <button type="submit" disabled={enviando}
        className="flex-1 rounded-lg bg-brand px-3 py-2.5 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-60">
        {enviando ? 'Salvando…' : rotulo}
      </button>
    </div>
  )
}
