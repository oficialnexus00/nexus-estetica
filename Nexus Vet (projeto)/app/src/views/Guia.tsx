import { useState } from 'react'

// ÁREA "GUIA DE USO" (para o cliente da clínica) — ESQUELETO PRONTO.
// O conteúdo (textos, passos, vídeos, FAQ) fica para depois: basta preencher
// os arrays abaixo. Enquanto estiverem vazios/rascunho, a UI mostra o
// estado "em preparação" — nada quebra.

// ---- PREENCHER DEPOIS ----------------------------------------------------

// Checklist de primeiros passos. Edite os títulos/descrições quando o fluxo fechar.
const PASSOS: { titulo: string; desc?: string }[] = [
  { titulo: 'Passo 1 — a definir' },
  { titulo: 'Passo 2 — a definir' },
  { titulo: 'Passo 3 — a definir' },
  { titulo: 'Passo 4 — a definir' },
  { titulo: 'Passo 5 — a definir' },
]

// Guias por módulo. `resumo` vazio => aparece "Guia em breve".
const MODULOS: { icon: string; nome: string; resumo?: string }[] = [
  { icon: '📅', nome: 'Agenda' },
  { icon: '🐾', nome: 'Tutores & Pets' },
  { icon: '🛒', nome: 'Vendas / PDV' },
  { icon: '🏥', nome: 'Internação' },
  { icon: '💰', nome: 'Financeiro' },
  { icon: '📊', nome: 'Inteligência' },
  { icon: '📦', nome: 'Estoque' },
  { icon: '🔬', nome: 'Exames' },
  { icon: '⚙️', nome: 'Configurações' },
  { icon: '✦', nome: 'Bia (IA)' },
]

// Vídeos e FAQ ficam vazios por enquanto (mostram estado "em breve").
const VIDEOS: { titulo: string; duracao: string }[] = []
const FAQ: { p: string; r: string }[] = []

// --------------------------------------------------------------------------

const Rascunho = () => (
  <span className="rounded-md border border-warn/40 bg-warn/10 px-1.5 py-0.5 text-[10px] font-medium text-warn">rascunho</span>
)
const EmBreve = () => (
  <span className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-ink-3">em breve</span>
)

const Vazio = ({ children }: { children: string }) => (
  <div className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-[12.5px] text-ink-3">{children}</div>
)

export default function Guia() {
  const [feitos, setFeitos] = useState<boolean[]>(PASSOS.map(() => false))
  const concluidos = feitos.filter(Boolean).length
  const pct = PASSOS.length ? Math.round((concluidos / PASSOS.length) * 100) : 0
  const toggle = (i: number) => setFeitos(f => f.map((v, n) => n === i ? !v : v))

  return (
    <div className="space-y-4">
      {/* Aviso de área em preparação */}
      <div className="flex items-center gap-2 rounded-xl border border-warn/30 bg-warn/5 px-4 py-2.5">
        <span>🚧</span>
        <span className="text-[12.5px] text-ink-2">
          <b className="text-ink">Área em preparação.</b> A estrutura está pronta; o conteúdo (passos, guias, vídeos e FAQ) será preenchido em breve.
        </span>
      </div>

      {/* Comece por aqui — checklist */}
      <div className="rounded-xl border border-line bg-surface-1 p-5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="text-[15px] font-semibold">Comece por aqui</h3>
          <Rascunho />
        </div>
        <p className="mb-3 text-[12.5px] text-ink-3">Um passo a passo para a clínica começar com o pé direito.</p>

        {/* progresso */}
        <div className="mb-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="shrink-0 text-[12px] tabular-nums text-ink-2">{concluidos}/{PASSOS.length}</span>
        </div>

        <div className="space-y-2">
          {PASSOS.map((passo, i) => (
            <button key={i} onClick={() => toggle(i)}
              className="flex w-full items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-left transition hover:border-brand/50">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                feitos[i] ? 'border-brand bg-brand text-surface-0' : 'border-ink-3 text-transparent'}`}>✓</span>
              <div className="min-w-0">
                <div className={`text-[13.5px] font-medium ${feitos[i] ? 'text-ink-3 line-through' : 'text-ink'}`}>{passo.titulo}</div>
                {passo.desc && <div className="text-[12px] text-ink-3">{passo.desc}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Guias por módulo */}
      <div className="rounded-xl border border-line bg-surface-1 p-5">
        <h3 className="mb-3 text-[15px] font-semibold">Guias por módulo</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULOS.map(m => (
            <div key={m.nome} className="rounded-lg border border-line bg-surface-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[16px]">{m.icon}</span>
                  <span className="text-[13.5px] font-medium">{m.nome}</span>
                </div>
                {!m.resumo && <EmBreve />}
              </div>
              <div className="mt-2 text-[12px] text-ink-3">{m.resumo || 'Passo a passo em breve.'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Vídeos + FAQ */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">Vídeos</h3>
            {VIDEOS.length === 0 && <EmBreve />}
          </div>
          {VIDEOS.length === 0
            ? <Vazio>Tutoriais em vídeo serão adicionados aqui.</Vazio>
            : <div className="space-y-2">{VIDEOS.map(v => (
                <div key={v.titulo} className="flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3 py-2.5">
                  <span className="text-[13px] font-medium">▶ {v.titulo}</span>
                  <span className="text-[11.5px] text-ink-3">{v.duracao}</span>
                </div>))}
              </div>}
        </div>

        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">Perguntas frequentes</h3>
            {FAQ.length === 0 && <EmBreve />}
          </div>
          {FAQ.length === 0
            ? <Vazio>As dúvidas mais comuns dos clientes entram aqui.</Vazio>
            : <div className="space-y-1.5">{FAQ.map(f => (
                <div key={f.p} className="rounded-lg border border-line bg-surface-2 px-3 py-2.5">
                  <div className="text-[13px] font-medium">{f.p}</div>
                  <div className="mt-1 text-[12.5px] text-ink-2">{f.r}</div>
                </div>))}
              </div>}
        </div>
      </div>
    </div>
  )
}
