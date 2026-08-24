import { useEffect, useState } from 'react'
import { clinics, db } from './data'
import { supabase, MODO_DEMO } from './lib/supabase'
import { listClinics, type ClinicRow } from './lib/clinics'
import { listProfessionals, type ProfessionalRow } from './lib/agenda'
import Dashboard from './views/Dashboard'
import Agenda from './views/Agenda'
import Pacientes from './views/Pacientes'
import Orcamentos from './views/Orcamentos'
import Financeiro from './views/Financeiro'
import Bia from './views/Bia'
import ModalAgendar from './components/ModalAgendar'
import ModalBuscar from './components/ModalBuscar'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '◧' },
  { id: 'agenda', label: 'Agenda', icon: '▤' },
  { id: 'pacientes', label: 'Pacientes', icon: '◉' },
  { id: 'orcamentos', label: 'Orçamentos', icon: '▥' },
  { id: 'financeiro', label: 'Financeiro', icon: '◈' },
  { id: 'bia', label: 'Patrícia (IA)', icon: '✦' },
] as const

type View = (typeof NAV)[number]['id']

function Logo() {
  return (
    <svg viewBox="0 0 1024 1024" className="h-7 w-7">
      <defs>
        <linearGradient id="lg" gradientUnits="userSpaceOnUse" x1="300" y1="280" x2="760" y2="650">
          <stop offset="0" stopColor="#DFF7A0" /><stop offset="0.45" stopColor="#5CE39A" /><stop offset="1" stopColor="#00BFA5" />
        </linearGradient>
      </defs>
      <g fill="url(#lg)">
        <rect x="429.5" y="230" width="165" height="470" rx="82" transform="rotate(-37 512 465)" />
        <rect x="585" y="300" width="150" height="150" rx="34" />
        <rect x="289" y="480" width="150" height="150" rx="34" />
      </g>
    </svg>
  )
}

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [idx, setIdx] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [modal, setModal] = useState<null | 'agendar' | 'buscar'>(null)
  const [realClinics, setRealClinics] = useState<ClinicRow[] | null>(null)
  const [realProfs, setRealProfs] = useState<ProfessionalRow[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  // Carrega as clínicas reais do usuário logado (fora do modo demo)
  useEffect(() => {
    if (MODO_DEMO || !supabase) return
    let vivo = true
    listClinics()
      .then(c => vivo && setRealClinics(c))
      .catch(() => vivo && setRealClinics([]))
    return () => { vivo = false }
  }, [])

  const usingReal = !MODO_DEMO && !!realClinics && realClinics.length > 0
  // Lista mostrada no switcher: clínicas reais quando disponíveis, senão as de exemplo
  const displayClinics: { id: string; nome: string; cidade: string | null }[] = usingReal ? realClinics! : clinics
  const safeIdx = Math.min(idx, displayClinics.length - 1)
  const clinic = displayClinics[safeIdx]
  const realClinicId = usingReal ? realClinics![safeIdx]?.id : undefined
  // Demais telas seguem em dados de exemplo por enquanto (mapeados por posição)
  const data = db[safeIdx === 0 ? 'c1' : 'c2']

  // Profissionais reais da clínica ativa (pros modais e a agenda)
  useEffect(() => {
    if (!usingReal || !realClinicId) { setRealProfs([]); return }
    let vivo = true
    listProfessionals(realClinicId)
      .then(p => vivo && setRealProfs(p))
      .catch(() => vivo && setRealProfs([]))
    return () => { vivo = false }
  }, [usingReal, realClinicId])

  const profsParaModal = usingReal ? realProfs : data.dentistas

  const go = (v: View) => { setView(v); setMenuOpen(false) }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <Logo />
        <div>
          <div className="text-[15px] font-semibold tracking-tight">NEXUS</div>
          <div className="-mt-0.5 text-[11px] font-medium tracking-widest text-brand">ODONTO</div>
        </div>
      </div>

      <div className="px-3 pb-4">
        <select
          value={safeIdx}
          onChange={e => setIdx(Number(e.target.value))}
          className="w-full cursor-pointer rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] font-medium text-ink outline-none transition hover:border-brand/50"
        >
          {displayClinics.map((c, i) => <option key={c.id} value={i}>{c.nome}</option>)}
        </select>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => go(item.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition
              ${view === item.id ? 'bg-brand/12 text-brand' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'}`}
          >
            <span className="text-[15px] leading-none">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
          <div className="text-[12px] leading-tight text-ink-2">
            <span className="font-semibold text-ink">Patrícia ativa</span> — atendendo o WhatsApp
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-ink-3">{MODO_DEMO ? 'Piloto · dados fictícios' : 'Sistema ativo'}</span>
          {!MODO_DEMO && supabase && (
            <button onClick={() => supabase?.auth.signOut()} className="text-[11px] text-ink-3 hover:text-ink">Sair</button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-full">
      {/* Sidebar desktop */}
      <aside className="hidden w-60 shrink-0 border-r border-line bg-surface-1 md:block">
        {sidebar}
      </aside>

      {/* Drawer mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-line bg-surface-1">{sidebar}</aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-surface-0/90 px-4 py-3.5 backdrop-blur md:px-8 md:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setMenuOpen(true)}
              className="rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[15px] leading-none text-ink-2 md:hidden">☰</button>
            <div className="min-w-0">
              <h1 className="truncate text-[16px] font-semibold tracking-tight md:text-[17px]">{NAV.find(n => n.id === view)?.label}</h1>
              <div className="truncate text-[11.5px] text-ink-3 md:text-[12px]">{clinic.nome}{clinic.cidade ? ` · ${clinic.cidade}` : ''} · qui, 2 jul 2026</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <button onClick={() => setModal('buscar')} className="hidden rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-[13px] font-medium text-ink-2 transition hover:text-ink sm:block">
              ⌕ Buscar
            </button>
            <button onClick={() => setModal('agendar')} className="whitespace-nowrap rounded-lg bg-brand px-3 py-2 text-[12.5px] font-semibold text-surface-0 transition hover:bg-brand-dim md:px-3.5 md:text-[13px]">
              + Agendar
            </button>
          </div>
        </header>

        <div className="px-4 py-5 md:px-8 md:py-6">
          {view === 'dashboard' && <Dashboard data={data} />}
          {view === 'agenda' && <Agenda data={data} realClinicId={realClinicId} refreshKey={refreshKey} />}
          {view === 'pacientes' && <Pacientes data={data} realClinicId={realClinicId} clinicNome={clinic.nome} profissionais={profsParaModal} />}
          {view === 'orcamentos' && <Orcamentos data={data} realClinicId={realClinicId} clinicNome={clinic.nome} />}
          {view === 'financeiro' && <Financeiro data={data} />}
          {view === 'bia' && <Bia />}
        </div>
      </main>

      <ModalAgendar
        open={modal === 'agendar'}
        onClose={() => setModal(null)}
        profissionais={profsParaModal}
        clinicNome={clinic.nome}
        clinicId={realClinicId}
        onSaved={() => setRefreshKey(k => k + 1)}
      />
      <ModalBuscar open={modal === 'buscar'} onClose={() => setModal(null)} data={data} />
    </div>
  )
}
