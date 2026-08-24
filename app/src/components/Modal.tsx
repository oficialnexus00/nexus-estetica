import { useEffect, type ReactNode } from 'react'

// Estilos de campo compartilhados (casam com o Login e o resto do app)
export const inputCls =
  'w-full rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-[13.5px] text-ink outline-none placeholder:text-ink-3 focus:border-brand/60'
export const labelCls = 'mb-1.5 block text-[12.5px] font-medium text-ink-2'

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxW = 'max-w-md',
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  maxW?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-[8vh]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxW} rounded-2xl border border-line bg-surface-1 shadow-2xl`}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-[12px] text-ink-3">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-lg p-1 text-ink-3 transition hover:bg-surface-2 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

// Painel de sucesso reutilizável (mostrado após "salvar")
export function SucessoPanel({
  titulo,
  linhas,
  nota,
  onClose,
}: {
  titulo: string
  linhas: { label: string; valor: string }[]
  nota?: string
  onClose: () => void
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/12">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-brand" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="mt-3 text-[15px] font-semibold">{titulo}</h3>

      <div className="mt-4 space-y-2 rounded-xl border border-line bg-surface-2 p-4 text-left">
        {linhas.map(l => (
          <div key={l.label} className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="text-ink-3">{l.label}</span>
            <span className="font-medium text-ink">{l.valor}</span>
          </div>
        ))}
      </div>

      {nota && (
        <div className="mt-3 rounded-lg border border-brand/25 bg-brand/8 px-3 py-2.5 text-left text-[12px] leading-relaxed text-ink-2">
          {nota}
        </div>
      )}

      <button
        onClick={onClose}
        className="mt-4 w-full rounded-lg bg-brand px-4 py-2.5 text-[13.5px] font-semibold text-surface-0 transition hover:bg-brand-dim"
      >
        Fechar
      </button>
    </div>
  )
}
