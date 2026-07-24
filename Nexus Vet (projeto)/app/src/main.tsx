import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Login from './views/Login.tsx'
import { supabase, MODO_DEMO } from './lib/supabase'
import './index.css'

// Aplica o tema salvo antes do React montar — sem flash e já valendo na tela
// de login. O toggle dentro do app cuida das trocas em tempo real.
try {
  const t = localStorage.getItem('nexus-tema')
  document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark')
} catch { document.documentElement.setAttribute('data-theme', 'dark') }

function Root() {
  const [pronto, setPronto] = useState(MODO_DEMO)
  const [logado, setLogado] = useState(false)
  const [demo, setDemo] = useState(false)

  useEffect(() => {
    if (MODO_DEMO || !supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setLogado(!!data.session)
      setPronto(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setLogado(!!session))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!pronto) return <div className="flex h-full items-center justify-center text-ink-3">Carregando…</div>
  if (!logado && !demo) return <Login onDemo={() => setDemo(true)} />
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
