import { useState } from 'react'
import { supabase, MODO_DEMO } from '../lib/supabase'

function Logo() {
  return (
    <svg viewBox="0 0 1024 1024" className="h-10 w-10">
      <defs>
        <linearGradient id="lgLogin" gradientUnits="userSpaceOnUse" x1="300" y1="280" x2="760" y2="650">
          <stop offset="0" stopColor="#DFF7A0" /><stop offset="0.45" stopColor="#5CE39A" /><stop offset="1" stopColor="#00BFA5" />
        </linearGradient>
      </defs>
      <g fill="url(#lgLogin)">
        <rect x="429.5" y="230" width="165" height="470" rx="82" transform="rotate(-37 512 465)" />
        <rect x="585" y="300" width="150" height="150" rx="34" />
        <rect x="289" y="480" width="150" height="150" rx="34" />
      </g>
    </svg>
  )
}

export default function Login({ onDemo }: { onDemo: () => void }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (MODO_DEMO || !supabase) { onDemo(); return }
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setCarregando(false)
    if (error) setErro('E-mail ou senha incorretos. Tente novamente.')
    // sucesso → o listener de sessão no App troca de tela sozinho
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <div>
            <div className="text-[20px] font-semibold tracking-tight">NEXUS <span className="text-brand">Vet</span></div>
            <div className="mt-1 text-[13px] text-ink-3">Gestão da clínica com IA</div>
          </div>
        </div>

        <form onSubmit={entrar} className="space-y-3 rounded-2xl border border-line bg-surface-1 p-6">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink-2">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="voce@clinica.com.br"
              className="w-full rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-[13.5px] outline-none placeholder:text-ink-3 focus:border-brand/60" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink-2">Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required
              placeholder="••••••••"
              className="w-full rounded-lg border border-line bg-surface-2 px-3.5 py-2.5 text-[13.5px] outline-none placeholder:text-ink-3 focus:border-brand/60" />
          </div>

          {erro && <div className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-[12.5px] text-bad">{erro}</div>}

          <button type="submit" disabled={carregando}
            className="w-full rounded-lg bg-brand px-4 py-2.5 text-[13.5px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-60">
            {carregando ? 'Entrando…' : 'Entrar'}
          </button>

          {MODO_DEMO && (
            <button type="button" onClick={onDemo}
              className="w-full rounded-lg border border-line bg-surface-2 px-4 py-2.5 text-[13px] font-medium text-ink-2 transition hover:text-ink">
              Ver demonstração (dados fictícios)
            </button>
          )}
        </form>

        {MODO_DEMO && (
          <p className="mt-4 text-center text-[11.5px] leading-relaxed text-ink-3">
            Modo demonstração ativo — o login real liga assim que o Supabase for configurado.
          </p>
        )}
      </div>
    </div>
  )
}
