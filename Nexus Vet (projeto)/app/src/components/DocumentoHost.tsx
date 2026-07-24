import { useEffect, useRef, useState } from 'react'
import { EVENTO_DOCUMENTO, type DocumentoDetalhe } from '../lib/imprimir'

// Prévia de documento embutida no app (comprovante, receita, recibo, cupom…).
// Usa um iframe com o HTML pronto — isso renderiza dentro do sandbox do Artifact,
// onde abrir aba/print de popup é bloqueado. Botões:
//  • Imprimir / Salvar PDF → print do iframe (funciona no app hospedado)
//  • Baixar → salva o arquivo pronto (sempre funciona)
export default function DocumentoHost() {
  const [doc, setDoc] = useState<DocumentoDetalhe | null>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const h = (e: Event) => setDoc((e as CustomEvent<DocumentoDetalhe>).detail)
    window.addEventListener(EVENTO_DOCUMENTO, h as EventListener)
    return () => window.removeEventListener(EVENTO_DOCUMENTO, h as EventListener)
  }, [])

  useEffect(() => {
    if (!doc) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setDoc(null) }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [doc])

  if (!doc) return null

  const baixar = () => {
    const blob = new Blob([doc.html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${doc.titulo}.html`
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 4000)
  }

  const imprimir = () => {
    const w = frameRef.current?.contentWindow
    try { w?.focus(); w?.print() } catch { /* bloqueado no sandbox — use Baixar */ }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/75 p-3 sm:p-6" onClick={() => setDoc(null)}>
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-surface-1"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h3 className="truncate text-[14px] font-semibold tracking-tight">{doc.titulo}</h3>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={baixar}
              className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
              Baixar
            </button>
            <button onClick={imprimir}
              className="rounded-lg bg-brand px-3 py-1.5 text-[12.5px] font-semibold text-surface-0 transition hover:bg-brand-dim">
              Imprimir / Salvar PDF
            </button>
            <button onClick={() => setDoc(null)} aria-label="Fechar"
              className="rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-[13px] leading-none text-ink-2 transition hover:text-ink">
              ✕
            </button>
          </div>
        </div>
        <iframe ref={frameRef} title={doc.titulo} srcDoc={doc.html}
          className="w-full flex-1 bg-white" />
        <div className="border-t border-line px-4 py-2 text-center text-[11px] text-ink-3">
          Prévia do documento. Use <span className="text-ink-2">Imprimir / Salvar PDF</span> ou <span className="text-ink-2">Baixar</span>.
        </div>
      </div>
    </div>
  )
}
