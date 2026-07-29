import { useState } from 'react'
import type { PlanoBemEstar, BeneficioPlano, TipoBeneficio } from '../data'
import { Campo } from './Modal'

export const PLANO_DOT: Record<string, string> = { teal: 'bg-brand', blue: 'bg-s2', violet: 'bg-s4' }
export const PLANO_CATEGORIAS: [string, string][] = [
  ['todos', 'Tudo (desconto geral)'], ['consulta', 'Consulta'], ['vacina', 'Vacina'],
  ['banho_tosa', 'Banho e tosa'], ['exame', 'Exame'], ['cirurgia', 'Cirurgia'],
]
export const planoInput = 'rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] outline-none focus:border-brand/60'

export default function FormPlano({ plano, onSalvar, onCancelar }: {
  plano?: PlanoBemEstar
  onSalvar: (p: Omit<PlanoBemEstar, 'id'>) => Promise<void>
  onCancelar: () => void
}) {
  const [nome, setNome] = useState(plano?.nome ?? '')
  const [preco, setPreco] = useState(plano ? String(plano.preco) : '')
  const [cor, setCor] = useState<PlanoBemEstar['cor']>(plano?.cor ?? 'teal')
  const [ativo, setAtivo] = useState(plano?.ativo ?? true)
  const [bens, setBens] = useState<BeneficioPlano[]>(plano?.beneficios ?? [])
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const novoBen = () => setBens(b => [...b, { id: 'b' + Date.now() + b.length, descricao: '', tipo: 'desconto', categoria: 'todos', descontoPct: 10 }])
  const mudarBen = (id: string, patch: Partial<BeneficioPlano>) => setBens(b => b.map(x => x.id === id ? { ...x, ...patch } : x))
  const removerBen = (id: string) => setBens(b => b.filter(x => x.id !== id))

  async function enviar() {
    const p = Number(preco.replace(/\./g, '').replace(',', '.'))
    if (!nome.trim()) { setErro('Dê um nome ao plano.'); return }
    if (!p || p <= 0) { setErro('Informe a mensalidade.'); return }
    if (bens.length === 0) { setErro('Adicione ao menos um benefício.'); return }
    for (const b of bens) {
      if (!b.descricao.trim()) { setErro('Todo benefício precisa de uma descrição.'); return }
      if (b.tipo === 'cota' && (!b.cota || b.cota <= 0)) { setErro('Cota precisa de uma quantidade.'); return }
      if (b.tipo === 'desconto' && (!b.descontoPct || b.descontoPct <= 0)) { setErro('Desconto precisa de um percentual.'); return }
    }
    setEnviando(true); setErro(null)
    try {
      await onSalvar({ nome: nome.trim(), preco: p, cor, ativo, beneficios: bens.map(b => ({
        ...b,
        cota: b.tipo === 'cota' ? b.cota : undefined,
        janela: b.tipo === 'cota' ? (b.janela ?? 'mes') : undefined,
        descontoPct: b.tipo === 'desconto' ? b.descontoPct : undefined,
      })) })
    } catch { setErro('Não consegui salvar.'); setEnviando(false) }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Nome do plano">
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Preventivo" className={planoInput} />
        </Campo>
        <Campo label="Mensalidade (R$)">
          <input inputMode="decimal" value={preco} onChange={e => setPreco(e.target.value)} placeholder="89,90" className={planoInput} />
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Cor">
          <select value={cor} onChange={e => setCor(e.target.value as PlanoBemEstar['cor'])} className={planoInput}>
            <option value="teal">Teal</option><option value="blue">Azul</option><option value="violet">Violeta</option>
          </select>
        </Campo>
        <Campo label="Situação">
          <select value={ativo ? '1' : '0'} onChange={e => setAtivo(e.target.value === '1')} className={planoInput}>
            <option value="1">Ativo</option><option value="0">Inativo</option>
          </select>
        </Campo>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[12px] font-medium text-ink-2">Benefícios</span>
          <button type="button" onClick={novoBen} className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">+ Benefício</button>
        </div>
        {bens.length === 0 && <p className="rounded-lg border border-dashed border-line px-3 py-3 text-center text-[12px] text-ink-3">Sem benefícios ainda. Adicione consulta, vacina, banho, desconto…</p>}
        <div className="space-y-2">
          {bens.map(b => (
            <div key={b.id} className="rounded-lg border border-line bg-surface-2 p-2.5">
              <div className="flex items-center gap-2">
                <input value={b.descricao} onChange={e => mudarBen(b.id, { descricao: e.target.value })} placeholder="Descrição (ex.: Consultas)" className={planoInput + ' flex-1'} />
                <button type="button" onClick={() => removerBen(b.id)} aria-label="Remover" className="shrink-0 rounded-md border border-line px-2 py-1.5 text-[12px] text-ink-3 transition hover:border-bad/50 hover:text-bad">✕</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <select value={b.tipo} onChange={e => mudarBen(b.id, { tipo: e.target.value as TipoBeneficio })} className={planoInput}>
                  <option value="incluso">Incluso (ilimitado)</option>
                  <option value="cota">Cota (N por período)</option>
                  <option value="desconto">Desconto (%)</option>
                </select>
                <select value={b.categoria} onChange={e => mudarBen(b.id, { categoria: e.target.value })} className={planoInput + ' flex-1 min-w-[130px]'}>
                  {PLANO_CATEGORIAS.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
                </select>
                {b.tipo === 'cota' && (
                  <>
                    <input type="number" min={1} value={b.cota ?? 1} onChange={e => mudarBen(b.id, { cota: Number(e.target.value) })} className={planoInput + ' w-16'} aria-label="Quantidade" />
                    <select value={b.janela ?? 'mes'} onChange={e => mudarBen(b.id, { janela: e.target.value as 'mes' | 'ano' })} className={planoInput}>
                      <option value="mes">por mês</option><option value="ano">por ano</option>
                    </select>
                  </>
                )}
                {b.tipo === 'desconto' && (
                  <div className="flex items-center gap-1">
                    <input type="number" min={1} max={100} value={b.descontoPct ?? 10} onChange={e => mudarBen(b.id, { descontoPct: Number(e.target.value) })} className={planoInput + ' w-16'} aria-label="Percentual" />
                    <span className="text-[13px] text-ink-3">%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancelar} className="rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-[13px] font-medium text-ink-2 transition hover:text-ink">Cancelar</button>
        <button type="button" onClick={enviar} disabled={enviando} className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-60">{enviando ? 'Salvando…' : 'Salvar plano'}</button>
      </div>
    </div>
  )
}
