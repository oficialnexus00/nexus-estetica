import { useState, type ReactNode } from 'react'
import Modal from './Modal'

// Botão com confirmação própria (mini-modal) — substitui o confirm() nativo,
// que é bloqueado dentro de iframes em sandbox (ex.: o preview do Artifact).

export default function ConfirmButton({
  className, children, titulo = 'Confirmar', mensagem, confirmLabel = 'Confirmar',
  danger = false, onConfirm, ...rest
}: {
  className?: string
  children: ReactNode
  titulo?: string
  mensagem: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  'aria-label'?: string
}) {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <button type="button" aria-label={rest['aria-label']} className={className} onClick={() => setAberto(true)}>
        {children}
      </button>

      <Modal titulo={titulo} aberto={aberto} onFechar={() => setAberto(false)}>
        <p className="text-[13.5px] text-ink-2">{mensagem}</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={() => setAberto(false)}
            className="flex-1 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-[13px] font-medium text-ink-2 transition hover:text-ink">
            Cancelar
          </button>
          <button type="button" onClick={() => { setAberto(false); onConfirm() }}
            className={`flex-1 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition ${
              danger ? 'border border-bad/40 bg-bad/15 text-bad hover:bg-bad/20'
                     : 'bg-brand text-surface-0 hover:bg-brand-dim'}`}>
            {confirmLabel}
          </button>
        </div>
      </Modal>
    </>
  )
}
