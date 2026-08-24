import { useEffect } from 'react'

// Toast leve pra ações que ainda entram na v1 completa (nada fica "morto")
export default function Toast({ msg, onDone }: { msg: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [msg, onDone])

  if (!msg) return null
  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg border border-line bg-surface-2 px-4 py-2.5 text-[13px] font-medium text-ink shadow-2xl">
      {msg}
    </div>
  )
}
