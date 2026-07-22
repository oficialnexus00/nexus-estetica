import { useState } from 'react'
import type { DB, ItemVenda, FormaPagamento, Venda, Lancamento, MovimentoCaixa, Orcamento } from '../data'
import { brl, diasAtraso } from '../data'
import type { Acoes } from '../App'
import { cupomVenda, orcamentoPDF } from '../lib/imprimir'

type Aba = 'pdv' | 'realizadas' | 'orcamentos' | 'caixa' | 'saldo' | 'ranking' | 'precos'

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

const FORMAS: { valor: FormaPagamento; rotulo: string }[] = [
  { valor: 'dinheiro', rotulo: 'Dinheiro' },
  { valor: 'pix', rotulo: 'Pix' },
  { valor: 'credito', rotulo: 'Crédito' },
  { valor: 'debito', rotulo: 'Débito' },
  { valor: 'boleto', rotulo: 'Boleto' },
]

const inputCls = 'rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] outline-none focus:border-brand/60'

export default function Vendas({ data, acoes }: { data: DB; acoes: Acoes }) {
  const [aba, setAba] = useState<Aba>('pdv')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {([['pdv', 'Ponto de venda'], ['realizadas', `Vendas realizadas (${(data.vendas ?? []).length})`],
          ['orcamentos', `Orçamentos (${(data.orcamentos ?? []).filter(o => o.status === 'aberto').length})`],
          ['caixa', 'Caixa'], ['saldo', 'Saldo dos clientes'], ['ranking', 'Ranking de clientes'], ['precos', 'Lista de preços']] as const).map(([id, rotulo]) => (
          <button key={id} onClick={() => setAba(id)}
            className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition ${
              aba === id ? 'bg-brand/12 text-brand' : 'border border-line bg-surface-2 text-ink-2 hover:text-ink'}`}>
            {rotulo}
          </button>
        ))}
      </div>

      {aba === 'pdv' && <PDV data={data} acoes={acoes} />}
      {aba === 'realizadas' && <Realizadas data={data} clinica={acoes.clinicaNome} />}
      {aba === 'orcamentos' && <Orcamentos data={data} acoes={acoes} />}
      {aba === 'caixa' && <Caixa data={data} acoes={acoes} />}
      {aba === 'saldo' && <SaldoClientes data={data} acoes={acoes} />}
      {aba === 'ranking' && <Ranking data={data} />}
      {aba === 'precos' && <ListaPrecos data={data} />}
    </div>
  )
}

function PDV({ data, acoes }: { data: DB; acoes: Acoes }) {
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([])
  const [tipo, setTipo] = useState<'servico' | 'produto'>('servico')
  const [refId, setRefId] = useState('')
  const [qtd, setQtd] = useState(1)
  const [petSel, setPetSel] = useState('') // "tutorId|petId" ou vazio (avulsa)
  const [desconto, setDesconto] = useState(0)
  const [forma, setForma] = useState<FormaPagamento>('pix')
  const [profissional, setProfissional] = useState('')
  const [enviando, setEnviando] = useState(false)

  const servicos = data.servicos.map(s => ({ id: s.id, nome: s.nome, preco: s.preco }))
  const produtos = (data.estoque ?? []).filter(i => i.preco_venda != null && i.ativo)
    .map(i => ({ id: i.id, nome: i.nome, preco: i.preco_venda as number, estoque: i.quantidade_estoque }))
  const opcoes = tipo === 'servico' ? servicos : produtos

  const pets = data.tutores.flatMap(t => t.pets.map(p => ({ tutorId: t.id, tutorNome: t.nome, petId: p.id, petNome: p.nome })))

  const subtotal = carrinho.reduce((s, i) => s + i.quantidade * i.precoUnit, 0)
  const total = Math.max(0, subtotal - desconto)

  const adicionar = () => {
    const escolha = opcoes.find(o => o.id === (refId || opcoes[0]?.id))
    if (!escolha) return
    setCarrinho(atual => {
      const existe = atual.find(i => i.refId === escolha.id && i.tipo === tipo)
      if (existe) return atual.map(i => i === existe ? { ...i, quantidade: i.quantidade + qtd } : i)
      return [...atual, { refId: escolha.id, tipo, nome: escolha.nome, quantidade: qtd, precoUnit: escolha.preco }]
    })
    setQtd(1)
  }

  const remover = (idx: number) => setCarrinho(atual => atual.filter((_, i) => i !== idx))
  const mudarQtd = (idx: number, q: number) =>
    setCarrinho(atual => atual.map((i, n) => n === idx ? { ...i, quantidade: Math.max(1, q) } : i))

  const finalizar = async () => {
    if (carrinho.length === 0) return
    const pet = pets.find(p => `${p.tutorId}|${p.petId}` === petSel)
    setEnviando(true)
    await acoes.registrarVenda({
      clienteNome: pet?.tutorNome, petNome: pet?.petNome,
      itens: carrinho, desconto, formaPagamento: forma, profissional: profissional || undefined,
    })
    cupomVenda({
      clinica: acoes.clinicaNome, data: new Date().toISOString().slice(0, 10),
      clienteNome: pet?.tutorNome, petNome: pet?.petNome,
      itens: carrinho.map(i => ({ nome: i.nome, quantidade: i.quantidade, precoUnit: i.precoUnit })),
      desconto, total, formaPagamento: forma,
    })
    setCarrinho([]); setDesconto(0); setPetSel(''); setProfissional(''); setEnviando(false)
  }

  const salvarOrcamento = async () => {
    if (carrinho.length === 0) return
    const pet = pets.find(p => `${p.tutorId}|${p.petId}` === petSel)
    setEnviando(true)
    await acoes.criarOrcamento({ clienteNome: pet?.tutorNome, petNome: pet?.petNome, itens: carrinho, desconto })
    setCarrinho([]); setDesconto(0); setPetSel(''); setEnviando(false)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Coluna esquerda: adicionar itens */}
      <div className="space-y-4">
        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <h3 className="mb-3 text-[14px] font-semibold">Adicionar item</h3>
          <div className="flex flex-wrap gap-2">
            <select value={tipo} onChange={e => { setTipo(e.target.value as 'servico' | 'produto'); setRefId('') }} className={inputCls}>
              <option value="servico">Serviço</option>
              <option value="produto">Produto</option>
            </select>
            <select value={refId || opcoes[0]?.id || ''} onChange={e => setRefId(e.target.value)} className={inputCls + ' min-w-0 flex-1'}>
              {opcoes.length === 0 ? <option value="">Nenhum disponível</option>
                : opcoes.map(o => <option key={o.id} value={o.id}>{o.nome} — {brl(o.preco)}</option>)}
            </select>
            <input type="number" min={1} value={qtd} onChange={e => setQtd(Math.max(1, Number(e.target.value)))}
              className={inputCls + ' w-16'} aria-label="Quantidade" />
            <button onClick={adicionar} disabled={opcoes.length === 0}
              className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-50">
              + Adicionar
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <h3 className="mb-3 text-[14px] font-semibold">Cliente / Pet <span className="font-normal text-ink-3">(opcional)</span></h3>
          <select value={petSel} onChange={e => setPetSel(e.target.value)} className={inputCls + ' w-full'}>
            <option value="">Venda avulsa (sem cliente)</option>
            {pets.map(p => <option key={p.petId} value={`${p.tutorId}|${p.petId}`}>{p.petNome} · {p.tutorNome}</option>)}
          </select>
        </div>

        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <h3 className="mb-3 text-[14px] font-semibold">Profissional <span className="font-normal text-ink-3">(comissão)</span></h3>
          <select value={profissional} onChange={e => setProfissional(e.target.value)} className={inputCls + ' w-full'}>
            <option value="">Sem profissional</option>
            {(data.profissionais ?? []).map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
          </select>
        </div>
      </div>

      {/* Coluna direita: comanda */}
      <div className="rounded-xl border border-line bg-surface-1 p-4">
        <h3 className="mb-3 text-[14px] font-semibold">Comanda</h3>
        {carrinho.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-ink-3">Nenhum item. Adicione serviços ou produtos.</p>
        ) : (
          <div className="space-y-2">
            {carrinho.map((i, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{i.nome}</div>
                  <div className="text-[11px] text-ink-3">{brl(i.precoUnit)} un · {i.tipo === 'produto' ? 'produto' : 'serviço'}</div>
                </div>
                <input type="number" min={1} value={i.quantidade} onChange={e => mudarQtd(idx, Number(e.target.value))}
                  className={inputCls + ' w-14'} aria-label="Quantidade" />
                <span className="w-20 shrink-0 text-right text-[13px] font-medium tabular-nums">{brl(i.quantidade * i.precoUnit)}</span>
                <button onClick={() => remover(idx)} aria-label="Remover" className="shrink-0 text-ink-3 transition hover:text-bad">✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-2 border-t border-line pt-3">
          <div className="flex items-center justify-between text-[13px] text-ink-2">
            <span>Subtotal</span><span className="tabular-nums">{brl(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-[13px] text-ink-2">
            <label htmlFor="desc">Desconto (R$)</label>
            <input id="desc" type="number" min={0} value={desconto}
              onChange={e => setDesconto(Math.max(0, Number(e.target.value)))} className={inputCls + ' w-24 text-right'} />
          </div>
          <div className="flex items-center justify-between text-[16px] font-semibold">
            <span>Total</span><span className="tabular-nums text-brand">{brl(total)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <label className="text-[13px] text-ink-2">Pagamento</label>
            <select value={forma} onChange={e => setForma(e.target.value as FormaPagamento)} className={inputCls + ' flex-1'}>
              {FORMAS.map(f => <option key={f.valor} value={f.valor}>{f.rotulo}</option>)}
            </select>
          </div>
          <button onClick={finalizar} disabled={carrinho.length === 0 || enviando}
            className="mt-2 w-full rounded-lg bg-brand px-4 py-2.5 text-[14px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-50">
            {enviando ? 'Finalizando…' : `Finalizar venda · ${brl(total)}`}
          </button>
          <button onClick={salvarOrcamento} disabled={carrinho.length === 0 || enviando}
            className="w-full rounded-lg border border-line bg-surface-2 px-4 py-2 text-[13px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink disabled:opacity-50">
            Salvar como orçamento
          </button>
        </div>
      </div>
    </div>
  )
}

function Realizadas({ data, clinica }: { data: DB; clinica: string }) {
  const vendas = data.vendas ?? []
  const reimprimir = (v: Venda) => cupomVenda({
    clinica, data: v.data, clienteNome: v.clienteNome, petNome: v.petNome,
    itens: v.itens.map(i => ({ nome: i.nome, quantidade: i.quantidade, precoUnit: i.precoUnit })),
    desconto: v.desconto, total: v.total, formaPagamento: v.formaPagamento,
  })

  if (vendas.length === 0) {
    return <p className="py-10 text-center text-[13.5px] text-ink-3">Nenhuma venda registrada ainda.</p>
  }

  return (
    <div className="space-y-3">
      {vendas.map(v => (
        <div key={v.id} className="rounded-xl border border-line bg-surface-1 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14.5px] font-semibold tabular-nums">{brl(v.total)}</span>
                <span className="rounded-md border border-ok/40 bg-ok/10 px-2 py-0.5 text-[10.5px] font-medium capitalize text-ok">{v.formaPagamento}</span>
              </div>
              <div className="mt-0.5 text-[12px] text-ink-3">
                {fmt(v.data)}{v.clienteNome ? ` · ${v.clienteNome}${v.petNome ? ` (${v.petNome})` : ''}` : ' · venda avulsa'}
              </div>
              <div className="mt-1 text-[12px] text-ink-2">
                {v.itens.map(i => `${i.quantidade}× ${i.nome}`).join(' · ')}
              </div>
            </div>
            <button onClick={() => reimprimir(v)}
              className="shrink-0 rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
              Cupom
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function Orcamentos({ data, acoes }: { data: DB; acoes: Acoes }) {
  const orcamentos = data.orcamentos ?? []
  if (orcamentos.length === 0) {
    return <p className="py-10 text-center text-[13.5px] text-ink-3">Nenhum orçamento. Monte um no Ponto de venda e clique em "Salvar como orçamento".</p>
  }
  return (
    <div className="space-y-3">
      {orcamentos.map(o => <OrcamentoCard key={o.id} o={o} acoes={acoes} />)}
    </div>
  )
}

function OrcamentoCard({ o, acoes }: { o: Orcamento; acoes: Acoes }) {
  const [forma, setForma] = useState<FormaPagamento>('pix')
  const status = o.status === 'convertido' ? { label: 'Convertido', cls: 'border-ok/40 bg-ok/10 text-ok' }
    : o.status === 'recusado' ? { label: 'Recusado', cls: 'border-bad/40 bg-bad/10 text-bad' }
    : { label: 'Aberto', cls: 'border-s2/40 bg-s2/10 text-s2' }

  const pdf = () => orcamentoPDF({
    clinica: acoes.clinicaNome, data: o.data, validade: o.validade,
    clienteNome: o.clienteNome, petNome: o.petNome,
    itens: o.itens.map(i => ({ nome: i.nome, quantidade: i.quantidade, precoUnit: i.precoUnit })),
    desconto: o.desconto, total: o.total,
  })

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14.5px] font-semibold tabular-nums">{brl(o.total)}</span>
            <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-medium ${status.cls}`}>{status.label}</span>
          </div>
          <div className="mt-0.5 text-[12px] text-ink-3">
            {fmt(o.data)}{o.validade ? ` · válido até ${fmt(o.validade)}` : ''}
            {o.clienteNome ? ` · ${o.clienteNome}${o.petNome ? ` (${o.petNome})` : ''}` : ''}
          </div>
          <div className="mt-1 text-[12px] text-ink-2">{o.itens.map(i => `${i.quantidade}× ${i.nome}`).join(' · ')}</div>
        </div>
        <button onClick={pdf}
          className="shrink-0 rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
          PDF
        </button>
      </div>

      {o.status === 'aberto' && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <select value={forma} onChange={e => setForma(e.target.value as FormaPagamento)} className={inputCls}>
            {FORMAS.map(f => <option key={f.valor} value={f.valor}>{f.rotulo}</option>)}
          </select>
          <button onClick={() => acoes.converterOrcamento(o.id, forma)}
            className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
            Converter em venda
          </button>
          <button onClick={() => { if (confirm('Recusar este orçamento?')) acoes.recusarOrcamento(o.id) }}
            className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-[12.5px] font-medium text-bad transition hover:border-bad/60 hover:bg-bad/20">
            Recusar
          </button>
        </div>
      )}
    </div>
  )
}

function Caixa({ data, acoes }: { data: DB; acoes: Acoes }) {
  const caixa = data.caixa
  const [valorInicial, setValorInicial] = useState('0')
  const [movTipo, setMovTipo] = useState<'entrada' | 'saida'>('saida')
  const [movDesc, setMovDesc] = useState('')
  const [movValor, setMovValor] = useState('')

  const saldo = (caixa?.movimentos ?? []).reduce((s, m) =>
    m.tipo === 'saida' ? s - m.valor : (m.tipo === 'abertura' || m.tipo === 'entrada') ? s + m.valor : s, 0)

  const META: Record<string, { rotulo: string; cls: string; sinal: string }> = {
    abertura: { rotulo: 'Abertura', cls: 'text-ink-2', sinal: '' },
    entrada: { rotulo: 'Suprimento', cls: 'text-ok', sinal: '+' },
    saida: { rotulo: 'Sangria', cls: 'text-bad', sinal: '−' },
    fechamento: { rotulo: 'Fechamento', cls: 'text-ink-3', sinal: '' },
  }

  // Sem caixa aberto → abrir
  if (!caixa || !caixa.aberto) {
    return (
      <div className="rounded-xl border border-line bg-surface-1 p-5">
        <h3 className="text-[14px] font-semibold">Caixa fechado</h3>
        <p className="mt-1 mb-4 text-[12.5px] text-ink-3">
          {caixa && !caixa.aberto ? 'O último caixa foi fechado. Abra um novo para movimentar.' : 'Abra o caixa para começar o dia.'}
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-[12px] text-ink-3">Valor inicial (R$)</label>
            <input type="number" min={0} value={valorInicial} onChange={e => setValorInicial(e.target.value)} className={inputCls + ' w-32'} />
          </div>
          <button onClick={() => acoes.abrirCaixa(Math.max(0, Number(valorInicial.replace(',', '.'))))}
            className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
            Abrir caixa
          </button>
        </div>

        {caixa && !caixa.aberto && caixa.movimentos.length > 0 && (
          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-2 text-[12px] font-medium text-ink-2">Último caixa ({fmt(caixa.data)})</div>
            <ListaMovimentos movimentos={caixa.movimentos} meta={META} />
          </div>
        )}
      </div>
    )
  }

  const registrarMov = () => {
    const v = Math.max(0, Number(movValor.replace(',', '.')))
    if (!v) return
    acoes.registrarMovimentoCaixa({ tipo: movTipo, descricao: movDesc.trim() || (movTipo === 'entrada' ? 'Suprimento' : 'Sangria'), valor: v })
    setMovDesc(''); setMovValor('')
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <div className="text-[11.5px] uppercase tracking-wider text-ink-3">Saldo em caixa</div>
          <div className="mt-1.5 text-[24px] font-semibold tabular-nums text-brand">{brl(saldo)}</div>
          <div className="mt-0.5 text-[11.5px] text-ink-3">aberto às {caixa.movimentos[0]?.hora}</div>
        </div>
        <div className="flex items-center justify-end">
          <button onClick={() => { if (confirm('Fechar o caixa agora?')) acoes.fecharCaixa() }}
            className="rounded-lg border border-bad/40 bg-bad/10 px-3.5 py-2 text-[13px] font-medium text-bad transition hover:border-bad/60 hover:bg-bad/20">
            Fechar caixa
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface-1 p-4">
        <h3 className="mb-3 text-[14px] font-semibold">Registrar movimento</h3>
        <div className="flex flex-wrap gap-2">
          <select value={movTipo} onChange={e => setMovTipo(e.target.value as 'entrada' | 'saida')} className={inputCls}>
            <option value="saida">Sangria (saída)</option>
            <option value="entrada">Suprimento (entrada)</option>
          </select>
          <input value={movDesc} onChange={e => setMovDesc(e.target.value)} placeholder="Descrição"
            className={inputCls + ' min-w-0 flex-1'} />
          <input type="number" min={0} value={movValor} onChange={e => setMovValor(e.target.value)} placeholder="Valor"
            className={inputCls + ' w-28'} />
          <button onClick={registrarMov}
            className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
            Registrar
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface-1 p-4">
        <h3 className="mb-3 text-[14px] font-semibold">Movimentos do dia</h3>
        <ListaMovimentos movimentos={caixa.movimentos} meta={META} />
      </div>
    </div>
  )
}

function ListaMovimentos({ movimentos, meta }: {
  movimentos: MovimentoCaixa[]
  meta: Record<string, { rotulo: string; cls: string; sinal: string }>
}) {
  return (
    <div className="space-y-1.5">
      {movimentos.map(m => {
        const info = meta[m.tipo]
        return (
          <div key={m.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium">{m.descricao}</div>
              <div className="text-[11px] text-ink-3">{info.rotulo} · {m.hora}</div>
            </div>
            {m.tipo !== 'fechamento' && (
              <span className={`shrink-0 text-[13px] font-medium tabular-nums ${info.cls}`}>{info.sinal}{brl(m.valor)}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SaldoClientes({ data, acoes }: { data: DB; acoes: Acoes }) {
  // Conta-corrente: o que cada cliente deve = lançamentos "a receber" em aberto
  const abertos = data.lancamentos.filter(l => l.tipo === 'receber' && !l.pagoEm && l.tutorNome)

  const mapa = new Map<string, Lancamento[]>()
  for (const l of abertos) {
    const lista = mapa.get(l.tutorNome!) ?? []
    lista.push(l)
    mapa.set(l.tutorNome!, lista)
  }
  const clientes = [...mapa.entries()]
    .map(([nome, itens]) => ({ nome, itens, total: itens.reduce((s, l) => s + l.valor, 0) }))
    .sort((a, b) => b.total - a.total)

  const totalGeral = clientes.reduce((s, c) => s + c.total, 0)

  if (clientes.length === 0) {
    return <p className="py-10 text-center text-[13.5px] text-ink-3">Nenhum cliente com saldo em aberto. 🐾</p>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <div className="text-[11.5px] uppercase tracking-wider text-ink-3">A receber de clientes</div>
          <div className="mt-1.5 text-[22px] font-semibold tabular-nums text-bad">{brl(totalGeral)}</div>
        </div>
        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <div className="text-[11.5px] uppercase tracking-wider text-ink-3">Clientes devedores</div>
          <div className="mt-1.5 text-[22px] font-semibold tabular-nums">{clientes.length}</div>
        </div>
      </div>

      <div className="space-y-3">
        {clientes.map(c => (
          <div key={c.nome} className="rounded-xl border border-line bg-surface-1 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[14.5px] font-semibold">{c.nome}</span>
              <span className="text-[14px] font-semibold tabular-nums text-bad">{brl(c.total)}</span>
            </div>
            <div className="space-y-1.5">
              {c.itens.map(l => {
                const atraso = diasAtraso(l)
                return (
                  <div key={l.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium">{l.descricao}</div>
                      <div className="text-[11px] text-ink-3">
                        vence {new Date(l.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                        {atraso > 0 && <span className="text-bad"> · {atraso} {atraso === 1 ? 'dia' : 'dias'} em atraso</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[13px] font-medium tabular-nums">{brl(l.valor)}</span>
                      <button onClick={() => acoes.baixarLancamento(l.id)}
                        className="whitespace-nowrap rounded-md border border-line bg-surface-1 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                        Dar baixa
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Ranking({ data }: { data: DB }) {
  // Faturamento por cliente a partir dos lançamentos a receber (pagos ou não)
  const mapa = new Map<string, { total: number; qtd: number }>()
  for (const l of data.lancamentos) {
    if (l.tipo !== 'receber' || !l.tutorNome) continue
    const atual = mapa.get(l.tutorNome) ?? { total: 0, qtd: 0 }
    mapa.set(l.tutorNome, { total: atual.total + l.valor, qtd: atual.qtd + 1 })
  }
  const ranking = [...mapa.entries()]
    .map(([nome, v]) => ({ nome, ...v }))
    .sort((a, b) => b.total - a.total)

  const maxTotal = ranking.length ? ranking[0].total : 1

  if (ranking.length === 0) {
    return <p className="py-10 text-center text-[13.5px] text-ink-3">Ainda não há vendas registradas por cliente.</p>
  }

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5">
      <h3 className="mb-4 text-[14px] font-semibold">Clientes que mais compram</h3>
      <div className="space-y-3">
        {ranking.map((c, i) => (
          <div key={c.nome}>
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <span className="font-medium">
                <span className="mr-1.5 text-ink-3 tabular-nums">{i + 1}.</span>{c.nome}
              </span>
              <span className="tabular-nums text-ink-2">
                {brl(c.total)} <span className="text-ink-3">· {c.qtd} {c.qtd === 1 ? 'lançamento' : 'lançamentos'}</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-brand/70" style={{ width: `${(c.total / maxTotal) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ListaPrecos({ data }: { data: DB }) {
  const produtos = (data.estoque ?? []).filter(i => i.preco_venda != null && i.ativo)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface-1 p-5">
        <h3 className="mb-3 text-[14px] font-semibold">Serviços</h3>
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

      <div className="rounded-xl border border-line bg-surface-1 p-5">
        <h3 className="mb-3 text-[14px] font-semibold">Produtos</h3>
        {produtos.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-ink-3">Nenhum produto com preço de venda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left">
              <thead>
                <tr className="border-b border-line text-[11.5px] uppercase tracking-wider text-ink-3">
                  <th className="px-1 py-2 font-medium">Produto</th>
                  <th className="px-1 py-2 font-medium">Estoque</th>
                  <th className="px-1 py-2 text-right font-medium">Preço</th>
                </tr>
              </thead>
              <tbody className="text-[13.5px]">
                {produtos.map(p => (
                  <tr key={p.id} className="border-b border-line/60 last:border-0">
                    <td className="px-1 py-2 font-medium">{p.nome}</td>
                    <td className="px-1 py-2 tabular-nums text-ink-2">{p.quantidade_estoque} un</td>
                    <td className="px-1 py-2 text-right tabular-nums font-medium">{brl(p.preco_venda as number)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
