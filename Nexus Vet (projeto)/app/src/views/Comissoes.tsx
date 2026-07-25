import { useState } from 'react'
import type { DB } from '../data'
import { brl, baseComissaoVenda, CONFIG_COMISSAO_PADRAO } from '../data'
import type { Acoes } from '../App'
import { extratoComissao } from '../lib/imprimir'
import ConfirmButton from '../components/ConfirmButton'

const hoje = () => new Date().toISOString().slice(0, 10)
const dataHaXDias = (x: number) => { const d = new Date(); d.setDate(d.getDate() - x); return d.toISOString().slice(0, 10) }
const inicioDoMes = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10) }
const fmtCurto = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

const inputCls = 'rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] outline-none focus:border-brand/60'

export default function Comissoes({ data, acoes }: { data: DB; acoes: Acoes }) {
  const [de, setDe] = useState(inicioDoMes())
  const [ate, setAte] = useState(hoje())

  const cfg = data.comissao ?? CONFIG_COMISSAO_PADRAO
  const profissionais = data.profissionais ?? []
  // só comissões ainda NÃO fechadas (as fechadas já viraram conta a pagar no Financeiro)
  const vendas = (data.vendas ?? []).filter(v => v.data >= de && v.data <= ate && !v.comissaoFechada)

  const linhas = profissionais.map(p => {
    const suas = vendas.filter(v => v.profissional === p.nome)
    const base = suas.reduce((s, v) => s + baseComissaoVenda(v, cfg), 0)
    const pct = p.comissaoPct ?? 0
    const comissao = base * pct / 100
    return { prof: p, suas, base, pct, comissao }
  })

  const totalComissoes = linhas.reduce((s, l) => s + l.comissao, 0)
  const totalBase = linhas.reduce((s, l) => s + l.base, 0)

  const periodoTxt = `${fmtCurto(de)} a ${fmtCurto(ate)}`

  const emitirExtrato = (l: typeof linhas[number]) => extratoComissao({
    clinica: acoes.clinicaNome, profissional: l.prof.nome, pct: l.pct, periodo: periodoTxt,
    linhas: l.suas.map(v => {
      const baseV = baseComissaoVenda(v, cfg)
      return {
        data: v.data,
        descricao: v.itens.map(i => `${i.quantidade}× ${i.nome}`).join(', '),
        base: baseV, comissao: baseV * l.pct / 100,
      }
    }),
    totalBase: l.base, totalComissao: l.comissao,
  })

  return (
    <div className="space-y-4">
      {/* Filtro de período */}
      <div className="rounded-xl border border-line bg-surface-1 p-4">
        <div className="mb-3 text-[13px] font-medium">Período de apuração</div>
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[150px]">
            <label className="text-[11.5px] text-ink-3">De</label>
            <input type="date" value={de} onChange={e => setDe(e.target.value)} className={inputCls + ' mt-1 w-full'} />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-[11.5px] text-ink-3">Até</label>
            <input type="date" value={ate} onChange={e => setAte(e.target.value)} className={inputCls + ' mt-1 w-full'} />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={() => { setDe(dataHaXDias(30)); setAte(hoje()) }}
              className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
              Últimos 30 dias
            </button>
            <button onClick={() => { setDe(inicioDoMes()); setAte(hoje()) }}
              className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
              Este mês
            </button>
          </div>
        </div>
      </div>

      {/* Regra atual (só leitura — configura em Configurações → Comissões) */}
      <div className="rounded-xl border border-line bg-surface-1 px-4 py-3 text-[12px] text-ink-3">
        Regra atual: comissão sobre <span className="font-medium text-ink-2">{cfg.incideSobre === 'servicos' ? 'somente serviços' : 'serviços e produtos'}</span>,
        {' '}calculada sobre o <span className="font-medium text-ink-2">{cfg.base === 'liquido' ? 'valor cobrado (com desconto)' : 'valor de tabela'}</span>.
        {' '}Ajuste a regra e as margens em <span className="font-medium text-ink-2">Configurações → Comissões</span>.
      </div>

      {/* Resumo */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <div className="text-[11.5px] uppercase tracking-wider text-ink-3">Total de comissões</div>
          <div className="mt-1.5 text-[24px] font-semibold tabular-nums text-brand">{brl(totalComissoes)}</div>
          <div className="mt-0.5 text-[11.5px] text-ink-3">a pagar no período</div>
        </div>
        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <div className="text-[11.5px] uppercase tracking-wider text-ink-3">Base (vendas)</div>
          <div className="mt-1.5 text-[24px] font-semibold tabular-nums">{brl(totalBase)}</div>
          <div className="mt-0.5 text-[11.5px] text-ink-3">vendas com profissional</div>
        </div>
      </div>

      {/* Fechamento — lança as comissões como conta a pagar no Financeiro */}
      {totalComissoes > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/40 bg-brand/8 px-4 py-3">
          <div className="text-[12.5px] text-ink-2">
            Fechar o período lança <span className="font-semibold text-ink">{brl(totalComissoes)}</span> como contas a pagar no Financeiro (uma por profissional) — entram no DRE como despesa de comissões.
          </div>
          <ConfirmButton titulo="Fechar comissão do período"
            mensagem={`Lançar ${brl(totalComissoes)} em comissões a pagar no Financeiro (${periodoTxt})? Cada profissional vira uma conta a pagar.`}
            confirmLabel="Fechar e lançar"
            onConfirm={() => acoes.fecharComissoes({
              periodo: periodoTxt,
              itens: linhas.filter(l => l.comissao > 0).map(l => ({ profNome: l.prof.nome, valor: l.comissao })),
              vendaIds: vendas.map(v => v.id),
            })}
            className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
            Fechar comissão · {brl(totalComissoes)}
          </ConfirmButton>
        </div>
      )}

      {/* Por profissional */}
      <div className="space-y-3">
        {linhas.map(l => (
          <div key={l.prof.id} className="rounded-xl border border-line bg-surface-1 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[14.5px] font-semibold">{l.prof.nome}</div>
                <div className="mt-0.5 text-[12px] text-ink-3">
                  {l.suas.length} {l.suas.length === 1 ? 'venda' : 'vendas'} · base {brl(l.base)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] text-ink-3">Margem</div>
                  <div className="text-[13.5px] font-semibold tabular-nums">{l.prof.comissaoPct ?? 0}%</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-ink-3">Comissão</div>
                  <div className="text-[15px] font-semibold tabular-nums text-brand">{brl(l.comissao)}</div>
                </div>
                <button onClick={() => emitirExtrato(l)}
                  className="shrink-0 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                  Extrato
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11.5px] text-ink-3">
        A comissão é calculada sobre as vendas atribuídas a cada profissional no Ponto de venda,
        seguindo a regra da clínica. As margens (%) e a regra ficam em Configurações → Comissões.
      </p>
    </div>
  )
}
