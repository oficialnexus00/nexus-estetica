import { useState } from 'react'
import { clinics, db } from './data'
import Dashboard from './views/Dashboard'
import Agenda from './views/Agenda'
import Pacientes from './views/Pacientes'
import Orcamentos from './views/Orcamentos'
import Financeiro from './views/Financeiro'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '◧' },
  { id: 'agenda', label: 'Agenda', icon: '▤' },
  { id: 'pacientes', label: 'Pacientes', icon: '◉' },
  { id: 'orcamentos', label: 'Orçamentos', icon: '▥' },
  { id: 'financeiro', label: 'Financeiro', icon: '◈' },
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
  const [clinicId, setClinicId] = useState<'c1' | 'c2'>('c1')
  const data = db[clinicId]
  const clinic = clinics.find(c => c.id === clinicId)!

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-surface-1">
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
          <Logo />
          <div>
            <div className="text-[15px] font-semibold tracking-tight">NEXUS</div>
            <div className="-mt-0.5 text-[11px] font-medium tracking-widest text-brand">ODONTO</div>
          </div>
        </div>

        {/* Seletor de clínica */}
        <div className="px-3 pb-4">
          <select
            value={clinicId}
            onChange={e => setClinicId(e.target.value as 'c1' | 'c2')}
            className="w-full cursor-pointer rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] font-medium text-ink outline-none transition hover:border-brand/50"
          >
            {clinics.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
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
              <span className="font-semibold text-ink">Bia ativa</span> — atendendo o WhatsApp
            </div>
          </div>
          <div className="mt-3 text-[11px] text-ink-3">Piloto · dados fictícios</div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface-0/90 px-8 py-4 backdrop-blur">
          <div>
            <h1 className="text-[17px] font-semibold tracking-tight">{NAV.find(n => n.id === view)?.label}</h1>
            <div className="text-[12px] text-ink-3">{clinic.nome} · {clinic.cidade} · qui, 2 jul 2026</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-[13px] font-medium text-ink-2 transition hover:text-ink">
              ⌕ Buscar
            </button>
            <button className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
              + Novo agendamento
            </button>
          </div>
        </header>

        <div className="px-8 py-6">
          {view === 'dashboard' && <Dashboard data={data} />}
          {view === 'agenda' && <Agenda data={data} />}
          {view === 'pacientes' && <Pacientes data={data} />}
          {view === 'orcamentos' && <Orcamentos data={data} />}
          {view === 'financeiro' && <Financeiro data={data} />}
        </div>
      </main>
    </div>
  )
}
