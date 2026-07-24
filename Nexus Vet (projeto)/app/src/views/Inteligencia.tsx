import { useState } from 'react'
import type { DB } from '../data'
import { brl } from '../data'

type Aba = 'produtividade' | 'vendas' | 'clientes'

const mesKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

/** Gera e baixa um CSV (separador ";" — abre direto no Excel pt-BR). */
function baixarCSV(nome: string, cabecalho: string[], linhas: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v).replace(/"/g, '""')
    return /[";\n]/.test(s) ? `"${s}"` : s
  }
  const csv = [cabecalho, ...linhas].map(l => l.map(esc).join(';')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nome}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function BotaoCSV({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="shrink-0 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
      ↓ Exportar CSV
    </button>
  )
}

/** Barra de ranking horizontal reutilizável. */
function BarraRank({ itens }: { itens: { chave: string; rotulo: string; valor: number; sub?: string }[] }) {
  const max = itens.reduce((m, i) => Math.max(m, i.valor), 0) || 1
  return (
    <div className="space-y-3">
      {itens.map((it, i) => (
        <div key={it.chave}>
          <div className="mb-1 flex items-center justify-between gap-3 text-[13px]">
            <span className="min-w-0 truncate font-medium">
              <span className="mr-1.5 tabular-nums text-ink-3">{i + 1}.</span>{it.rotulo}
            </span>
            <span className="shrink-0 tabular-nums text-ink-2">
              {brl(it.valor)}{it.sub && <span className="text-ink-3"> · {it.sub}</span>}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-brand/70" style={{ width: `${(it.valor / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function Kpi({ label, valor, hint, tom }: { label: string; valor: string; hint?: string; tom?: 'ok' | 'warn' | 'bad' }) {
  const cor = tom === 'ok' ? 'text-ok' : tom === 'warn' ? 'text-warn' : tom === 'bad' ? 'text-bad' : 'text-ink'
  return (
    <div className="rounded-xl border border-line bg-surface-1 p-4">
      <div className="text-[11.5px] uppercase tracking-wider text-ink-3">{label}</div>
      <div className={`mt-1.5 text-[24px] font-semibold tabular-nums tracking-tight ${cor}`}>{valor}</div>
      {hint && <div className="mt-0.5 text-[11.5px] text-ink-3">{hint}</div>}
    </div>
  )
}

export default function Inteligencia({ data }: { data: DB }) {
  const [aba, setAba] = useState<Aba>('produtividade')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {([['produtividade', 'Produtividade'], ['vendas', 'Vendas'], ['clientes', 'Clientes']] as const).map(([id, rotulo]) => (
          <button key={id} onClick={() => setAba(id)}
            className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition ${
              aba === id ? 'bg-brand/12 text-brand' : 'border border-line bg-surface-2 text-ink-2 hover:text-ink'}`}>
            {rotulo}
          </button>
        ))}
      </div>

      {aba === 'produtividade' && <Produtividade data={data} />}
      {aba === 'vendas' && <VendasBI data={data} />}
      {aba === 'clientes' && <Clientes data={data} />}
    </div>
  )
}

function Produtividade({ data }: { data: DB }) {
  const vendas = data.vendas ?? []
  const linhas = (data.profissionais ?? []).map(prof => {
    const atendimentos = data.tutores.reduce((n, t) =>
      n + t.pets.reduce((m, p) => m + p.atendimentos.filter(a => a.profissional === prof.nome).length, 0), 0)
    const vendasProf = vendas.filter(v => v.profissional === prof.nome)
    const faturamento = vendasProf.reduce((s, v) => s + v.total, 0)
    const ticket = vendasProf.length ? faturamento / vendasProf.length : 0
    return { prof, atendimentos, nVendas: vendasProf.length, faturamento, ticket }
  }).sort((a, b) => b.faturamento - a.faturamento)

  const totalFat = linhas.reduce((s, l) => s + l.faturamento, 0)
  const totalAt = linhas.reduce((s, l) => s + l.atendimentos, 0)

  const exportar = () => baixarCSV('produtividade-profissionais',
    ['Profissional', 'Especialidade', 'Atendimentos', 'Vendas', 'Faturamento', 'Ticket medio'],
    linhas.map(l => [l.prof.nome, l.prof.especialidade ?? '', l.atendimentos, l.nVendas, l.faturamento.toFixed(2), l.ticket.toFixed(2)]))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi label="Faturamento atribuído" valor={brl(totalFat)} hint="vendas com profissional" />
        <Kpi label="Atendimentos" valor={String(totalAt)} hint="registrados no prontuário" />
        <Kpi label="Profissionais" valor={String(linhas.length)} />
      </div>

      <div className="rounded-xl border border-line bg-surface-1 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-[14px] font-semibold">Faturamento por profissional</h3>
          <BotaoCSV onClick={exportar} />
        </div>
        {linhas.length === 0
          ? <p className="py-6 text-center text-[13px] text-ink-3">Nenhum profissional cadastrado.</p>
          : <BarraRank itens={linhas.map(l => ({ chave: l.prof.id, rotulo: l.prof.nome, valor: l.faturamento, sub: `${l.nVendas} venda${l.nVendas === 1 ? '' : 's'}` }))} />}
      </div>

      <div className="rounded-xl border border-line bg-surface-1 p-5">
        <h3 className="mb-3 text-[14px] font-semibold">Detalhe</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="border-b border-line text-[11.5px] uppercase tracking-wider text-ink-3">
                <th className="px-1 py-2 font-medium">Profissional</th>
                <th className="px-1 py-2 text-right font-medium">Atend.</th>
                <th className="px-1 py-2 text-right font-medium">Vendas</th>
                <th className="px-1 py-2 text-right font-medium">Faturamento</th>
                <th className="px-1 py-2 text-right font-medium">Ticket médio</th>
              </tr>
            </thead>
            <tbody className="text-[13.5px]">
              {linhas.map(l => (
                <tr key={l.prof.id} className="border-b border-line/60 last:border-0">
                  <td className="px-1 py-2 font-medium">{l.prof.nome}<span className="block text-[11px] font-normal text-ink-3">{l.prof.especialidade}</span></td>
                  <td className="px-1 py-2 text-right tabular-nums text-ink-2">{l.atendimentos}</td>
                  <td className="px-1 py-2 text-right tabular-nums text-ink-2">{l.nVendas}</td>
                  <td className="px-1 py-2 text-right tabular-nums font-medium">{brl(l.faturamento)}</td>
                  <td className="px-1 py-2 text-right tabular-nums text-ink-2">{l.ticket ? brl(l.ticket) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function VendasBI({ data }: { data: DB }) {
  const vendas = data.vendas ?? []
  const mapa = new Map<string, { tipo: 'servico' | 'produto'; nome: string; qtd: number; receita: number }>()
  for (const v of vendas) {
    for (const it of v.itens) {
      const chave = `${it.tipo}|${it.nome}`
      const atual = mapa.get(chave) ?? { tipo: it.tipo, nome: it.nome, qtd: 0, receita: 0 }
      atual.qtd += it.quantidade
      atual.receita += it.quantidade * it.precoUnit
      mapa.set(chave, atual)
    }
  }
  const itens = [...mapa.values()].sort((a, b) => b.receita - a.receita)
  const totalReceita = itens.reduce((s, i) => s + i.receita, 0)
  const totalItens = itens.reduce((s, i) => s + i.qtd, 0)
  const descontos = vendas.reduce((s, v) => s + v.desconto, 0)

  const exportar = () => baixarCSV('vendas-por-item',
    ['Tipo', 'Item', 'Quantidade', 'Receita'],
    itens.map(i => [i.tipo === 'servico' ? 'Serviço' : 'Produto', i.nome, i.qtd, i.receita.toFixed(2)]))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Receita em vendas" valor={brl(totalReceita)} />
        <Kpi label="Itens vendidos" valor={String(totalItens)} />
        <Kpi label="Vendas" valor={String(vendas.length)} />
        <Kpi label="Descontos dados" valor={brl(descontos)} tom={descontos > 0 ? 'warn' : undefined} />
      </div>

      <div className="rounded-xl border border-line bg-surface-1 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-[14px] font-semibold">Ranking de rentabilidade</h3>
          <BotaoCSV onClick={exportar} />
        </div>
        {itens.length === 0
          ? <p className="py-6 text-center text-[13px] text-ink-3">Nenhuma venda registrada ainda.</p>
          : <BarraRank itens={itens.map(i => ({ chave: `${i.tipo}|${i.nome}`, rotulo: i.nome, valor: i.receita, sub: `${i.qtd}×` }))} />}
      </div>

      {itens.length > 0 && (
        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <h3 className="mb-3 text-[14px] font-semibold">Detalhe por item</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-left">
              <thead>
                <tr className="border-b border-line text-[11.5px] uppercase tracking-wider text-ink-3">
                  <th className="px-1 py-2 font-medium">Item</th>
                  <th className="px-1 py-2 font-medium">Tipo</th>
                  <th className="px-1 py-2 text-right font-medium">Qtd</th>
                  <th className="px-1 py-2 text-right font-medium">Receita</th>
                  <th className="px-1 py-2 text-right font-medium">% do total</th>
                </tr>
              </thead>
              <tbody className="text-[13.5px]">
                {itens.map(i => (
                  <tr key={`${i.tipo}|${i.nome}`} className="border-b border-line/60 last:border-0">
                    <td className="px-1 py-2 font-medium">{i.nome}</td>
                    <td className="px-1 py-2 text-ink-2">{i.tipo === 'servico' ? 'Serviço' : 'Produto'}</td>
                    <td className="px-1 py-2 text-right tabular-nums text-ink-2">{i.qtd}</td>
                    <td className="px-1 py-2 text-right tabular-nums font-medium">{brl(i.receita)}</td>
                    <td className="px-1 py-2 text-right tabular-nums text-ink-3">{totalReceita ? Math.round((i.receita / totalReceita) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function Clientes({ data }: { data: DB }) {
  const agora = new Date()
  const mesAtual = mesKey(agora)

  // sazonalidade — receita a receber por mês (últimos 6 meses)
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(agora.getFullYear(), agora.getMonth() - (5 - i), 1)
    return { key: mesKey(d), label: d.toLocaleDateString('pt-BR', { month: 'short' }) }
  })
  const receberPorMes = new Map(meses.map(m => [m.key, 0]))
  for (const l of data.lancamentos) {
    if (l.tipo !== 'receber') continue
    const k = l.vencimento.slice(0, 7)
    if (receberPorMes.has(k)) receberPorMes.set(k, (receberPorMes.get(k) ?? 0) + l.valor)
  }
  const serieMes = meses.map(m => ({ ...m, valor: receberPorMes.get(m.key) ?? 0 }))
  const maxMes = serieMes.reduce((m, s) => Math.max(m, s.valor), 0) || 1

  // novos x recorrentes
  const novosMes = data.tutores.filter(t => (t.desde ?? '').slice(0, 7) === mesAtual).length
  const compradores = new Map<string, number>()
  for (const l of data.lancamentos) {
    if (l.tipo !== 'receber' || !l.tutorNome) continue
    compradores.set(l.tutorNome, (compradores.get(l.tutorNome) ?? 0) + 1)
  }
  const recorrentes = [...compradores.values()].filter(n => n >= 2).length
  const ativos = data.tutores.filter(t => t.etapa === 'cliente').length
  const inativos = data.tutores.filter(t => t.etapa === 'inativo').length

  // origem dos clientes
  const origem = new Map<string, number>()
  for (const t of data.tutores) origem.set(t.origem || '—', (origem.get(t.origem || '—') ?? 0) + 1)
  const origens = [...origem.entries()].map(([nome, qtd]) => ({ nome, qtd })).sort((a, b) => b.qtd - a.qtd)

  const exportar = () => baixarCSV('clientes-base',
    ['Tutor', 'Etapa', 'Origem', 'Cliente desde', 'Pets'],
    data.tutores.map(t => [t.nome, t.etapa, t.origem, t.desde, t.pets.length]))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Base de clientes" valor={String(ativos)} hint="etapa cliente" />
        <Kpi label="Novos no mês" valor={String(novosMes)} tom={novosMes > 0 ? 'ok' : undefined} />
        <Kpi label="Recorrentes" valor={String(recorrentes)} hint="2+ lançamentos" />
        <Kpi label="Inativos" valor={String(inativos)} tom={inativos > 0 ? 'warn' : 'ok'} hint="para reativar" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface-1 p-5 lg:col-span-2">
          <h3 className="mb-4 text-[14px] font-semibold">Sazonalidade — a receber por mês</h3>
          <div className="flex h-40 items-end gap-3">
            {serieMes.map(m => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-md bg-brand/70 transition-all hover:bg-brand"
                       style={{ height: `${(m.valor / maxMes) * 100}%` }} title={brl(m.valor)} />
                </div>
                <span className="text-[11px] capitalize text-ink-3">{m.label.replace('.', '')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-[14px] font-semibold">Origem dos clientes</h3>
            <BotaoCSV onClick={exportar} />
          </div>
          <div className="space-y-2">
            {origens.map(o => (
              <div key={o.nome} className="flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3 py-2">
                <span className="text-[13px] font-medium">{o.nome}</span>
                <span className="text-[13px] tabular-nums text-ink-2">{o.qtd}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
