import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Login from './views/Login.tsx'
import { supabase, MODO_DEMO } from './lib/supabase'
import './index.css'

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
