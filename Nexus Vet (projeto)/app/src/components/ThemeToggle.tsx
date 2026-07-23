export type Tema = 'dark' | 'light'

// Toggle dia/noite — pílula elegante, alinhada aos botões do header.
// Mostra sol + lua e um "polegar" que desliza para o lado ativo.
export default function ThemeToggle({ tema, onToggle }: { tema: Tema; onToggle: () => void }) {
  const claro = tema === 'light'
  return (
    <button onClick={onToggle} role="switch" aria-checked={claro}
      aria-label={claro ? 'Mudar para o modo escuro' : 'Mudar para o modo claro'}
      title={claro ? 'Modo escuro' : 'Modo claro'}
      className="group relative inline-flex h-8 w-[58px] shrink-0 items-center rounded-full border border-line bg-surface-2 px-1 transition hover:border-brand/50">
      {/* trilho: sol à esquerda, lua à direita */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5">
        <Sol className={`h-3.5 w-3.5 transition ${claro ? 'text-warn' : 'text-ink-3'}`} />
        <Lua className={`h-3.5 w-3.5 transition ${claro ? 'text-ink-3' : 'text-s4'}`} />
      </span>
      {/* polegar deslizante */}
      <span className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-surface-0 shadow-sm ring-1 ring-line transition-transform duration-300 ease-out ${
        claro ? 'translate-x-0' : 'translate-x-[26px]'}`}>
        {claro
          ? <Sol className="h-3.5 w-3.5 text-warn" />
          : <Lua className="h-3.5 w-3.5 text-s4" />}
      </span>
    </button>
  )
}

function Sol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function Lua({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
