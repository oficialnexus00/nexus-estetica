import { useState } from 'react'
import type { DB, Lancamento, Fornecedor } from '../data'
import { brl, diasAtraso } from '../data'
import type { Acoes } from '../App'
import Modal from '../components/Modal'
import { FormLancamento } from '../components/Formularios'
import { reciboPagamento } from '../lib/imprimir'

type Aba = 'resumo' | 'dre' | 'receber' | 'pagar' | 'atraso' | 'analise'

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
const inicioDoMes = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10) }
const hoje = () => new Date().toISOString().slice(0, 10)
const dataHaXDias = (x: number) => {
  const d = new Date()
  d.setDate(d.getDate() - x)
  return d.toISOString().slice(0, 10)
}

// Rótulos amigáveis para as categorias cruas do banco
const LABEL_CATEGORIA: Record<string, string> = {
  consulta: 'Consultas',
  exame: 'Exames',
  banho_tosa: 'Banho e tosa',
  vacina: 'Vacinas',
  cirurgia: 'Cirurgias',
  fixo: 'Custos fixos',
  insumo: 'Insumos e fornecedores',
  produto: 'Produtos',
  outro: 'Outros',
}
const rotuloCategoria = (c?: string) => c ? (LABEL_CATEGORIA[c] ?? c.charAt(0).toUpperCase() + c.slice(1)) : 'Sem categoria'

// Agrupa lançamentos por categoria, somando os valores (maior primeiro)
function agruparPorCategoria(itens: Lancamento[]) {
  const mapa = new Map<string, number>()
  for (const l of itens) {
    const chave = l.categoria ?? 'outro'
    mapa.set(chave, (mapa.get(chave) ?? 0) + l.valor)
  }
  return [...mapa.entries()]
    .map(([categoria, valor]) => ({ categoria, valor }))
    .sort((a, b) => b.valor - a.valor)
}

function GraficoBarras({ dados }: {
  dados: Array<{ label: string; recebido: number; pago: number }>
}) {
  if (dados.length === 0) return <p className="py-8 text-center text-ink-3">Sem dados no período</p>

  const maxValor = Math.max(...dados.flatMap(d => [d.recebido, d.pago]))
  const escala = maxValor > 0 ? 100 / maxValor : 1

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5">
      <h3 className="mb-4 text-[14px] font-semibold">Fluxo de caixa</h3>
      <div className="space-y-4">
        {dados.map((d, i) => (
          <div key={i}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[12.5px] font-medium">{d.label}</span>
              <span className="text-[11px] text-ink-3">
                {brl(d.recebido)} / {brl(d.pago)}
              </span>
            </div>
            <div className="flex h-6 gap-1 overflow-hidden rounded-lg bg-surface-2">
              {d.recebido > 0 && (
                <div
                  className="flex items-center justify-center bg-gradient-to-r from-ok/60 to-ok/80 text-[10px] font-semibold text-white transition"
                  style={{ width: `${d.recebido * escala}%` }}
                  title={`Recebido: ${brl(d.recebido)}`}
                >
                  {d.recebido * escala > 20 && '+'}
                </div>
              )}
              {d.pago > 0 && (
                <div
                  className="flex items-center justify-center bg-gradient-to-r from-bad/60 to-bad/80 text-[10px] font-semibold text-white transition"
                  style={{ width: `${d.pago * escala}%` }}
                  title={`Pago: ${brl(d.pago)}`}
                >
                  {d.pago * escala > 20 && '-'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-4 border-t border-line pt-3 text-[11.5px]">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-ok/80" />
          <span>Recebido</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-bad/80" />
          <span>Pago</span>
        </div>
      </div>
    </div>
  )
}

// Uma seção do DRE (Receitas ou Despesas) com as linhas por categoria + barra de proporção
function BlocoDRE({ titulo, grupos, total, tom }: {
  titulo: string
  grupos: Array<{ categoria: string; valor: number }>
  total: number
  tom: 'ok' | 'bad'
}) {
  const corTexto = tom === 'ok' ? 'text-ok' : 'text-bad'
  const corBarra = tom === 'ok' ? 'bg-ok/70' : 'bg-bad/70'
  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider text-ink-2">{titulo}</h3>
        <span className={`text-[15px] font-semibold tabular-nums ${corTexto}`}>{brl(total)}</span>
      </div>
      {grupos.length === 0 ? (
        <p className="py-3 text-[12.5px] text-ink-3">Nada no período.</p>
      ) : (
        <div className="space-y-2.5">
          {grupos.map(g => {
            const pct = total > 0 ? (g.valor / total) * 100 : 0
            return (
              <div key={g.categoria}>
                <div className="mb-1 flex items-center justify-between text-[13px]">
                  <span className="font-medium">{rotuloCategoria(g.categoria)}</span>
                  <span className="tabular-nums text-ink-2">
                    {brl(g.valor)} <span className="text-ink-3">· {pct.toFixed(0)}%</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className={`h-full rounded-full ${corBarra}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Filtro de período reutilizável (datas + atalhos)
function FiltroPeriodo({ inicio, fim, setInicio, setFim }: {
  inicio: string; fim: string; setInicio: (v: string) => void; setFim: (v: string) => void
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-1 p-4">
      <div className="mb-3 text-[13px] font-medium">Filtrar por período</div>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[150px]">
          <label className="text-[11.5px] text-ink-3">De</label>
          <input type="date" value={inicio} onChange={e => setInicio(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] outline-none" />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-[11.5px] text-ink-3">Até</label>
          <input type="date" value={fim} onChange={e => setFim(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] outline-none" />
        </div>
        <div className="flex items-end gap-2">
          <button onClick={() => { setInicio(dataHaXDias(7)); setFim(hoje()) }}
            className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
            Última semana
          </button>
          <button onClick={() => { setInicio(dataHaXDias(30)); setFim(hoje()) }}
            className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
            Últimos 30 dias
          </button>
          <button onClick={() => { setInicio(inicioDoMes()); setFim(hoje()) }}
            className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
            Este mês
          </button>
        </div>
      </div>
    </div>
  )
}

function Card({ label, valor, hint, tom }: {
  label: string; valor: string; hint?: string; tom?: 'ok' | 'warn' | 'bad'
}) {
  const cor = tom === 'ok' ? 'text-ok' : tom === 'warn' ? 'text-warn' : tom === 'bad' ? 'text-bad' : 'text-ink'
  return (
    <div className="rounded-xl border border-line bg-surface-1 p-4">
      <div className="text-[11.5px] uppercase tracking-wider text-ink-3">{label}</div>
      <div className={`mt-1.5 text-[21px] font-semibold tabular-nums tracking-tight ${cor}`}>{valor}</div>
      {hint && <div className="mt-0.5 text-[11.5px] text-ink-3">{hint}</div>}
    </div>
  )
}

function Linha({ l, onBaixar, onRecibo, fornecedor }: {
  l: Lancamento; onBaixar?: (l: Lancamento) => void; onRecibo?: (l: Lancamento) => void; fornecedor?: Fornecedor
}) {
  const atraso = diasAtraso(l)
  const aberto = !l.pagoEm
  const vencido = aberto && atraso > 0

  // Sub-linha: no "a receber" mostra tutor/pet; no "a pagar" mostra a empresa fornecedora
  const nomeFornecedor = l.fornecedorNome ?? fornecedor?.nomeFantasia ?? fornecedor?.razaoSocial
  const subInfo = l.tipo === 'pagar' && nomeFornecedor
    ? [nomeFornecedor, fornecedor?.cnpj && `CNPJ ${fornecedor.cnpj}`, l.documento].filter(Boolean).join(' · ')
    : l.tutorNome
      ? `${l.tutorNome}${l.petNome ? ` · ${l.petNome}` : ''}`
      : l.categoria

  return (
    <tr className="border-b border-line/60 last:border-0 hover:bg-surface-2/60">
      <td className="px-3 py-2.5">
        <div className="text-[13.5px] font-medium">{l.descricao}</div>
        {subInfo && <div className="text-[11.5px] text-ink-3">{subInfo}</div>}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[13px] tabular-nums">
        {fmt(l.vencimento)}
        {vencido && <div className="text-[11px] text-bad">{atraso} {atraso === 1 ? 'dia' : 'dias'} em atraso</div>}
      </td>
      <td className="px-3 py-2.5 text-right text-[13.5px] tabular-nums font-medium">{brl(l.valor)}</td>
      <td className="px-3 py-2.5 text-right">
        {l.pagoEm ? (
          <div className="flex items-center justify-end gap-1.5">
            <span className="whitespace-nowrap rounded-md border border-ok/40 bg-ok/10 px-2 py-0.5 text-[11px] font-medium text-ok">
              {l.formaPagamento ?? 'pago'}
            </span>
            {onRecibo && l.tipo === 'receber' && (
              <button onClick={() => onRecibo(l)}
                className="whitespace-nowrap rounded-md border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                Recibo
              </button>
            )}
          </div>
        ) : onBaixar ? (
          <button onClick={() => onBaixar(l)}
            className="whitespace-nowrap rounded-md border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
            Dar baixa
          </button>
        ) : null}
      </td>
    </tr>
  )
}

function Tabela({ itens, onBaixar, onRecibo, vazio, fornecedores }: {
  itens: Lancamento[]; onBaixar?: (l: Lancamento) => void; onRecibo?: (l: Lancamento) => void; vazio: string
  fornecedores?: Fornecedor[]
}) {
  if (itens.length === 0) return <p className="py-10 text-center text-[13.5px] text-ink-3">{vazio}</p>
  const porId = new Map((fornecedores ?? []).map(fo => [fo.id, fo]))
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
      <table className="w-full min-w-[520px]">
        <thead>
          <tr className="border-b border-line text-left text-[11.5px] uppercase tracking-wider text-ink-3">
            <th className="px-3 py-2.5 font-medium">Descrição</th>
            <th className="px-3 py-2.5 font-medium">Vencimento</th>
            <th className="px-3 py-2.5 text-right font-medium">Valor</th>
            <th className="px-3 py-2.5 text-right font-medium">Situação</th>
          </tr>
        </thead>
        <tbody>{itens.map(l => (
          <Linha key={l.id} l={l} onBaixar={onBaixar} onRecibo={onRecibo}
            fornecedor={l.fornecedorId ? porId.get(l.fornecedorId) : undefined} />
        ))}</tbody>
      </table>
    </div>
  )
}

export default function Financeiro({ data, acoes }: { data: DB; acoes: Acoes }) {
  const [aba, setAba] = useState<Aba>('resumo')
  const [lancando, setLancando] = useState(false)
  const [dataInicio, setDataInicio] = useState(dataHaXDias(30))
  const [dataFim, setDataFim] = useState(hoje())
  // DRE: 'realizado' = só o que foi pago/recebido; 'previsto' = tudo que vence no período
  const [regimeDRE, setRegimeDRE] = useState<'realizado' | 'previsto'>('realizado')

  const L = data.lancamentos
  const emAberto = (t: Lancamento['tipo']) => L.filter(l => l.tipo === t && !l.pagoEm)
  const pagosNoMes = (t: Lancamento['tipo']) =>
    L.filter(l => l.tipo === t && l.pagoEm && l.pagoEm >= inicioDoMes())

  const soma = (xs: Lancamento[]) => xs.reduce((s, l) => s + l.valor, 0)

  const recebido = soma(pagosNoMes('receber'))
  const pago = soma(pagosNoMes('pagar'))
  const aReceber = soma(emAberto('receber'))
  const aPagar = soma(emAberto('pagar'))
  const inadimplentes = emAberto('receber').filter(l => diasAtraso(l) > 0)
  const atraso = soma(inadimplentes)

  const abas: [Aba, string][] = [
    ['resumo', 'Resumo'],
    ['dre', 'Demonstrativo'],
    ['analise', 'Análise'],
    ['receber', `A receber (${emAberto('receber').length})`],
    ['pagar', `A pagar (${emAberto('pagar').length})`],
    ['atraso', `Em atraso (${inadimplentes.length})`],
  ]

  const baixar = (l: Lancamento) => acoes.baixarLancamento(l.id)
  const emitirRecibo = (l: Lancamento) => reciboPagamento({
    clinica: acoes.clinicaNome, descricao: l.descricao, valor: l.valor,
    data: l.pagoEm!, forma: l.formaPagamento, tutor: l.tutorNome, pet: l.petNome,
  })

  // Um lançamento entra no período pela data certa conforme o regime:
  //  · caixa (realizado) → data de pagamento (pagoEm)
  //  · competência (previsto/em aberto) → vencimento
  const dentroDoPeriodo = (d?: string) => !!d && d >= dataInicio && d <= dataFim
  const lancamentosNoPeriodo = L.filter(l => dentroDoPeriodo(l.vencimento)) // por vencimento
  const pagosNoPeriodo = L.filter(l => dentroDoPeriodo(l.pagoEm))           // por data de pagamento (caixa)

  // Análise por período — recebido/pago é regime de caixa; a receber/pagar é por vencimento
  const recebidoPeriodo = soma(pagosNoPeriodo.filter(l => l.tipo === 'receber'))
  const pagoPeriodo = soma(pagosNoPeriodo.filter(l => l.tipo === 'pagar'))
  const aReceberlPeriodo = soma(lancamentosNoPeriodo.filter(l => l.tipo === 'receber' && !l.pagoEm))
  const aPagerlPeriodo = soma(lancamentosNoPeriodo.filter(l => l.tipo === 'pagar' && !l.pagoEm))

  // DRE (Demonstrativo) — no regime 'realizado' conta o que foi pago/recebido no período (caixa);
  // no 'previsto' conta tudo que vence no período, pago ou não.
  const baseDRE = regimeDRE === 'realizado' ? pagosNoPeriodo : lancamentosNoPeriodo
  const receitasDRE = agruparPorCategoria(baseDRE.filter(l => l.tipo === 'receber'))
  const despesasDRE = agruparPorCategoria(baseDRE.filter(l => l.tipo === 'pagar'))
  const totalReceitasDRE = soma(baseDRE.filter(l => l.tipo === 'receber'))
  const totalDespesasDRE = soma(baseDRE.filter(l => l.tipo === 'pagar'))
  const resultadoDRE = totalReceitasDRE - totalDespesasDRE
  const margemDRE = totalReceitasDRE > 0 ? (resultadoDRE / totalReceitasDRE) * 100 : 0

  // Gráfico: últimas 4 semanas
  const gerarDadosGrafico = () => {
    const dados = []
    for (let i = 3; i >= 0; i--) {
      const fimSemana = dataHaXDias(i * 7)
      const inicioSemana = dataHaXDias((i + 1) * 7)
      const semanaLancamentos = L.filter(l => l.vencimento >= inicioSemana && l.vencimento <= fimSemana)
      const recebido = soma(semanaLancamentos.filter(l => l.tipo === 'receber' && l.pagoEm))
      const pago = soma(semanaLancamentos.filter(l => l.tipo === 'pagar' && l.pagoEm))
      dados.push({
        label: `Semana ${new Date(fimSemana + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}`,
        recebido,
        pago,
      })
    }
    return dados
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {abas.map(([id, rotulo]) => (
            <button key={id} onClick={() => setAba(id)}
              className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition ${
                aba === id ? 'bg-brand/12 text-brand' : 'border border-line bg-surface-2 text-ink-2 hover:text-ink'}`}>
              {rotulo}
            </button>
          ))}
        </div>
        <button onClick={() => setLancando(true)}
          className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
          + Lançamento
        </button>
      </div>

      {aba === 'resumo' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card label="Recebido no mês" valor={brl(recebido)} tom="ok" />
            <Card label="Pago no mês" valor={brl(pago)} />
            <Card label="Saldo do mês" valor={brl(recebido - pago)} tom={recebido - pago >= 0 ? 'ok' : 'bad'} />
            <Card label="Em atraso" valor={brl(atraso)} tom={atraso > 0 ? 'bad' : 'ok'}
              hint={`${inadimplentes.length} lançamentos`} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card label="A receber (em aberto)" valor={brl(aReceber)} hint={`${emAberto('receber').length} lançamentos`} />
            <Card label="A pagar (em aberto)" valor={brl(aPagar)} hint={`${emAberto('pagar').length} lançamentos`} />
          </div>

          <div className="rounded-xl border border-line bg-surface-1 p-5">
            <h3 className="mb-1 text-[14px] font-semibold">Tabela de preços</h3>
            <p className="mb-3 text-[12px] text-ink-3">A Bia consulta daqui — por isso ela nunca inventa valor.</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left">
                <thead>
                  <tr className="border-b border-line text-[11.5px] uppercase tracking-wider text-ink-3">
                    <th className="px-1 py-2 font-medium">Serviço</th>
                    <th className="px-1 py-2 font-medium">Duração</th>
                    <th className="px-1 py-2 text-right font-medium">Preço</th>
                  </tr>
                </thead>
                <tbody className="text-[13.5px]">
                  {data.servicos.map(s => (
                    <tr key={s.id} className="border-b border-line/60 last:border-0">
                      <td className="px-1 py-2 font-medium">{s.nome}</td>
                      <td className="px-1 py-2 tabular-nums text-ink-2">{s.duracao} min</td>
                      <td className="px-1 py-2 text-right tabular-nums font-medium">{brl(s.preco)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {aba === 'receber' && (
        <Tabela itens={[...emAberto('receber'), ...pagosNoMes('receber')]} onBaixar={baixar} onRecibo={emitirRecibo}
          vazio="Nenhuma conta a receber." />
      )}

      {aba === 'pagar' && (
        <Tabela itens={[...emAberto('pagar'), ...pagosNoMes('pagar')]} onBaixar={baixar}
          fornecedores={data.fornecedores} vazio="Nenhuma conta a pagar." />
      )}

      {aba === 'atraso' && (
        <div className="space-y-3">
          {inadimplentes.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-bad/40 bg-bad/10 px-4 py-3">
              <span className="text-[13px] text-bad">
                {brl(atraso)} em atraso — a Bia pode cobrar pelo WhatsApp
              </span>
            </div>
          )}
          <Tabela itens={inadimplentes} onBaixar={baixar} vazio="Ninguém em atraso. 🐾" />
        </div>
      )}

      {aba === 'dre' && (
        <div className="space-y-4">
          <FiltroPeriodo inicio={dataInicio} fim={dataFim} setInicio={setDataInicio} setFim={setDataFim} />

          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] text-ink-3">
              {regimeDRE === 'realizado'
                ? 'Só o que já entrou/saiu no caixa.'
                : 'Tudo que vence no período — pago ou não.'}
            </p>
            <div className="flex rounded-lg border border-line bg-surface-2 p-0.5">
              {(['realizado', 'previsto'] as const).map(r => (
                <button key={r} onClick={() => setRegimeDRE(r)}
                  className={`rounded-md px-3 py-1.5 text-[12px] font-medium capitalize transition ${
                    regimeDRE === r ? 'bg-brand/12 text-brand' : 'text-ink-2 hover:text-ink'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card label="Receitas" valor={brl(totalReceitasDRE)} tom="ok" />
            <Card label="Despesas" valor={brl(totalDespesasDRE)} tom="bad" />
            <Card label="Resultado" valor={brl(resultadoDRE)} tom={resultadoDRE >= 0 ? 'ok' : 'bad'}
              hint={`Margem ${margemDRE.toFixed(0)}%`} />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <BlocoDRE titulo="Receitas por categoria" grupos={receitasDRE} total={totalReceitasDRE} tom="ok" />
            <BlocoDRE titulo="Despesas por categoria" grupos={despesasDRE} total={totalDespesasDRE} tom="bad" />
          </div>

          <div className={`rounded-xl border p-4 text-center ${
            resultadoDRE >= 0 ? 'border-ok/40 bg-ok/10' : 'border-bad/40 bg-bad/10'}`}>
            <span className="text-[13px] text-ink-2">Resultado do período: </span>
            <span className={`text-[16px] font-semibold tabular-nums ${resultadoDRE >= 0 ? 'text-ok' : 'text-bad'}`}>
              {brl(resultadoDRE)}
            </span>
            {totalReceitasDRE > 0 && (
              <span className="text-[12px] text-ink-3"> · margem de {margemDRE.toFixed(1)}%</span>
            )}
          </div>
        </div>
      )}

      {aba === 'analise' && (
        <div className="space-y-4">
          <FiltroPeriodo inicio={dataInicio} fim={dataFim} setInicio={setDataInicio} setFim={setDataFim} />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card label="Recebido" valor={brl(recebidoPeriodo)} tom="ok" />
            <Card label="Pago" valor={brl(pagoPeriodo)} />
            <Card label="Saldo" valor={brl(recebidoPeriodo - pagoPeriodo)} tom={recebidoPeriodo - pagoPeriodo >= 0 ? 'ok' : 'bad'} />
            <Card label="Diferença" valor={brl(aReceberlPeriodo - aPagerlPeriodo)} hint={`A receber: ${brl(aReceberlPeriodo)}`} />
          </div>

          <GraficoBarras dados={gerarDadosGrafico()} />

          <Tabela itens={lancamentosNoPeriodo} onBaixar={baixar} onRecibo={emitirRecibo}
            fornecedores={data.fornecedores} vazio="Nenhum lançamento neste período." />
        </div>
      )}

      <Modal titulo="Novo lançamento" aberto={lancando} onFechar={() => setLancando(false)}>
        <FormLancamento dados={data} onCancelar={() => setLancando(false)}
          onSalvar={async d => { await acoes.criarLancamento(d); setLancando(false) }} />
      </Modal>
    </div>
  )
}
