import { useState } from 'react'
import type { Atendimento, Pet } from '../data'
import Modal from './Modal'
import { FormAtendimento, type DadosAtendimento } from './Formularios'

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

/** Receita impressa com os dados do tutor e do pet já preenchidos. */
function imprimirReceita(pet: Pet, tutorNome: string, clinica: string, at: Atendimento) {
  const janela = window.open('', '_blank', 'width=720,height=900')
  if (!janela) return
  const esc = (s: string) =>
    s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string))

  janela.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Receituário — ${esc(pet.nome)}</title>
<style>
  body{font:14px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;color:#111;max-width:640px;margin:32px auto;padding:0 24px}
  h1{font-size:18px;margin:0 0 2px} .sub{color:#666;font-size:12px;margin-bottom:20px}
  .box{border:1px solid #ddd;border-radius:8px;padding:14px 16px;margin-bottom:18px}
  .box b{display:inline-block;min-width:64px;color:#555;font-weight:600}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#666;margin:22px 0 8px}
  pre{white-space:pre-wrap;font:inherit;margin:0}
  .assin{margin-top:56px;border-top:1px solid #333;width:280px;padding-top:6px;font-size:12px;color:#555}
  @media print{body{margin:0}}
</style></head><body>
  <h1>${esc(clinica)}</h1>
  <div class="sub">Receituário veterinário — ${fmt(at.data)}</div>
  <div class="box">
    <div><b>Pet:</b> ${esc(pet.nome)} — ${pet.especie === 'cao' ? 'Cão' : 'Gato'}, ${esc(pet.raca)}</div>
    <div><b>Tutor:</b> ${esc(tutorNome)}</div>
    ${at.peso ? `<div><b>Peso:</b> ${at.peso} kg</div>` : ''}
    ${pet.alerta ? `<div><b>Alerta:</b> ${esc(pet.alerta)}</div>` : ''}
  </div>
  <h2>Prescrição</h2>
  <pre>${esc(at.prescricao || '—')}</pre>
  ${at.conduta ? `<h2>Orientações</h2><pre>${esc(at.conduta)}</pre>` : ''}
  <div class="assin">${esc(at.profissional)}<br>Médico(a) Veterinário(a)</div>
  <script>window.onload=()=>window.print()<\/script>
</body></html>`)
  janela.document.close()
}

function Registro({ at, pet, tutorNome, clinica }: {
  at: Atendimento; pet: Pet; tutorNome: string; clinica: string
}) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="border-b border-line py-3 last:border-0">
      <button onClick={() => setAberto(!aberto)}
        className="flex w-full items-center justify-between gap-3 text-left">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {at.tipo && (
              <span className="shrink-0 rounded-md border border-brand/40 bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">
                {at.tipo}
              </span>
            )}
            <span className="truncate text-[13.5px] font-medium">{at.motivo}</span>
          </div>
          <div className="text-[11.5px] text-ink-3">
            {fmt(at.data)} · {at.profissional}
            {at.peso ? ` · ${at.peso} kg` : ''}
          </div>
        </div>
        <span className={`shrink-0 text-[11px] text-ink-3 transition-transform ${aberto ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {aberto && (
        <div className="mt-3 space-y-2.5 rounded-lg border border-line bg-surface-2 p-3.5">
          {([
            ['Anamnese', at.anamnese],
            ['Exame físico', at.exameFisico],
            ['Diagnóstico', at.diagnostico],
            ['Conduta', at.conduta],
            ['Prescrição', at.prescricao],
          ] as const).filter(([, v]) => v).map(([rotulo, valor]) => (
            <div key={rotulo}>
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">{rotulo}</div>
              <p className="whitespace-pre-line text-[13px] text-ink-2">{valor}</p>
            </div>
          ))}

          {at.temperatura && (
            <div className="text-[12px] text-ink-3">Temperatura: {at.temperatura} °C</div>
          )}

          {at.prescricao && (
            <button onClick={() => imprimirReceita(pet, tutorNome, clinica, at)}
              className="mt-1 rounded-lg border border-line bg-surface-1 px-3 py-1.5 text-[12px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
              Imprimir receita
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const SUGESTOES_COND = [
  'Dermatite alérgica crônica', 'Cardiopatia', 'Insuficiência renal', 'Diabetes',
  'Obesidade', 'Artrose', 'Epilepsia', 'Hipotireoidismo', 'Doença periodontal', 'Sopro cardíaco',
]

export default function Prontuario({ pet, tutorNome, clinica, tipos = [], onNovoAtendimento,
  condicoes = [], onAdicionarCondicao, onRemoverCondicao }: {
  pet: Pet; tutorNome: string; clinica: string; tipos?: string[]
  onNovoAtendimento?: (d: DadosAtendimento) => Promise<void>
  condicoes?: string[]
  onAdicionarCondicao?: (texto: string) => Promise<void>
  onRemoverCondicao?: (index: number) => Promise<void>
}) {
  const [registrando, setRegistrando] = useState(false)
  const [novaCond, setNovaCond] = useState('')
  const atendimentos = [...pet.atendimentos].sort((a, b) => b.data.localeCompare(a.data))

  const addCond = async () => {
    if (!novaCond.trim() || !onAdicionarCondicao) return
    await onAdicionarCondicao(novaCond)
    setNovaCond('')
  }

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-semibold">Prontuário</h3>
          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-ink-2">
            {atendimentos.length} {atendimentos.length === 1 ? 'atendimento' : 'atendimentos'}
          </span>
        </div>
        {onNovoAtendimento && (
          <button onClick={() => setRegistrando(true)}
            className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-surface-0 transition hover:bg-brand-dim">
            + Novo atendimento
          </button>
        )}
      </div>

      {/* Quadro clínico — condições crônicas (unificado no prontuário) */}
      {onAdicionarCondicao && (
        <div className="mb-4 rounded-lg border border-line bg-surface-2 p-3.5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">Quadro clínico · condições crônicas</div>
          {condicoes.length === 0 ? (
            <p className="mb-2.5 text-[12.5px] text-ink-3">Nenhuma condição registrada.</p>
          ) : (
            <div className="mb-2.5 flex flex-wrap gap-2">
              {condicoes.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 rounded-lg border border-warn/40 bg-warn/10 px-2.5 py-1 text-[12.5px] text-warn">
                  {c}
                  <button onClick={() => onRemoverCondicao?.(i)} aria-label={`Remover ${c}`} className="text-warn/70 transition hover:text-warn">✕</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={novaCond} onChange={e => setNovaCond(e.target.value)} list="cond-sugestoes"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCond() } }}
              placeholder="Ex.: Cardiopatia"
              className="min-w-0 flex-1 rounded-lg border border-line bg-surface-1 px-3 py-2 text-[13px] outline-none transition placeholder:text-ink-3 focus:border-brand/60" />
            <datalist id="cond-sugestoes">{SUGESTOES_COND.map(s => <option key={s} value={s} />)}</datalist>
            <button onClick={addCond} disabled={!novaCond.trim()}
              className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-50">
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Atendimentos */}
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3">Atendimentos</div>
      {atendimentos.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-ink-3">
          Nenhum atendimento registrado ainda.
        </p>
      ) : (
        <div>
          {atendimentos.map(at => (
            <Registro key={at.id} at={at} pet={pet} tutorNome={tutorNome} clinica={clinica} />
          ))}
        </div>
      )}

      {onNovoAtendimento && (
        <Modal titulo={`Atendimento — ${pet.nome}`} aberto={registrando} onFechar={() => setRegistrando(false)}>
          <FormAtendimento pet={pet} tipos={tipos} onCancelar={() => setRegistrando(false)}
            onSalvar={async d => { await onNovoAtendimento(d); setRegistrando(false) }} />
        </Modal>
      )}
    </div>
  )
}
