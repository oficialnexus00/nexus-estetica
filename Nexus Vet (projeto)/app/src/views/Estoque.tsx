import { useState } from 'react'
import type { InventoryItem } from '../data'
import { brl } from '../data'
import Modal from '../components/Modal'
import { FormEstoque, FormEditarEstoque, FormMovimentoEstoque, type DadosEstoque, type DadosEditarEstoque, type DadosMovimento } from '../components/Formularios'
import type { Acoes } from '../App'

interface Props {
  itens: InventoryItem[]
  acoes: Acoes
}

type Filtro = 'todos' | 'vencidos' | 'reposicao'

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

const CATEGORIA_LABEL: Record<string, string> = {
  medicamento: 'Medicamento', vacina: 'Vacina', material: 'Material', alimento: 'Alimento',
}

export default function Estoque({ itens, acoes }: Props) {
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [modalEditarAberto, setModalEditarAberto] = useState(false)
  const [modalMovimentoAberto, setModalMovimentoAberto] = useState(false)
  const [itemEditando, setItemEditando] = useState<InventoryItem | null>(null)
  const [itemMovimento, setItemMovimento] = useState<InventoryItem | null>(null)

  const hoje = new Date().toISOString().slice(0, 10)
  const proximoMes = new Date(); proximoMes.setDate(proximoMes.getDate() + 30)
  const proximoMesStr = proximoMes.toISOString().slice(0, 10)

  const vencidos = itens.filter(i => i.data_validade && i.data_validade < hoje)
  const reposicao = itens.filter(i => i.quantidade_estoque <= i.quantidade_minima)
  const vencimento_proximo = itens.filter(i => i.data_validade && i.data_validade >= hoje && i.data_validade <= proximoMesStr && !vencidos.includes(i))

  const itensFiltrados = filtro === 'vencidos' ? vencidos : filtro === 'reposicao' ? reposicao : itens

  // Status com os tokens do design system (igual às tarjas do Tutores/Carteira)
  const statusEstoque = (item: InventoryItem) => {
    if (vencidos.includes(item)) return { label: 'Vencido', cls: 'border-bad/40 bg-bad/10 text-bad' }
    if (reposicao.includes(item)) return { label: 'Repor estoque', cls: 'border-warn/40 bg-warn/10 text-warn' }
    if (vencimento_proximo.includes(item)) return { label: 'Vence em 30d', cls: 'border-s2/40 bg-s2/10 text-s2' }
    return { label: 'Em dia', cls: 'border-ok/40 bg-ok/10 text-ok' }
  }

  const handleNovoItem = async (d: DadosEstoque) => {
    await acoes.criarItemEstoque(d)
    setModalNovoAberto(false)
  }

  const handleEditarItem = async (d: DadosEditarEstoque) => {
    if (!itemEditando) return
    await acoes.atualizarItemEstoque(itemEditando.id, d)
    setModalEditarAberto(false)
    setItemEditando(null)
  }

  const handleDeletarItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este item?')) return
    await acoes.deletarItemEstoque(id)
  }

  const handleRegistrarMovimento = async (d: DadosMovimento) => {
    if (!itemMovimento) return
    await acoes.registrarMovimentoEstoque(itemMovimento.id, d)
    setModalMovimentoAberto(false)
    setItemMovimento(null)
  }

  const filtros: [Filtro, string][] = [
    ['todos', `Todos (${itens.length})`],
    ['vencidos', `Vencidos (${vencidos.length})`],
    ['reposicao', `Reposição (${reposicao.length})`],
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {filtros.map(([f, rotulo]) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition ${
                filtro === f ? 'bg-brand/12 text-brand' : 'border border-line bg-surface-2 text-ink-2 hover:text-ink'}`}>
              {rotulo}
            </button>
          ))}
        </div>
        <button onClick={() => setModalNovoAberto(true)}
          className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
          + Novo item
        </button>
      </div>

      <div className="space-y-3">
        {itensFiltrados.length === 0 ? (
          <p className="py-10 text-center text-[13.5px] text-ink-3">Nenhum item encontrado.</p>
        ) : (
          itensFiltrados.map(item => {
            const status = statusEstoque(item)
            const emReposicao = reposicao.includes(item)
            const pct = item.quantidade_maxima > 0
              ? Math.min(100, (item.quantidade_estoque / item.quantidade_maxima) * 100) : 0
            return (
              <div key={item.id} className="rounded-xl border border-line bg-surface-1 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14.5px] font-semibold">{item.nome}</span>
                      <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-medium ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[12px] text-ink-3">
                      {CATEGORIA_LABEL[item.categoria] ?? item.categoria}
                      {item.lote ? ` · Lote ${item.lote}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => { setItemMovimento(item); setModalMovimentoAberto(true) }}
                      className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                      Movimentar
                    </button>
                    <button onClick={() => { setItemEditando(item); setModalEditarAberto(true) }}
                      className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                      Editar
                    </button>
                    <button onClick={() => handleDeletarItem(item.id)}
                      className="rounded-lg border border-bad/40 bg-bad/10 px-2.5 py-1 text-[11.5px] font-medium text-bad transition hover:border-bad/60 hover:bg-bad/20">
                      Deletar
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-line bg-surface-2 px-3 py-2">
                    <div className="text-[11px] text-ink-3">Em estoque</div>
                    <div className={`text-[15px] font-semibold tabular-nums ${emReposicao ? 'text-warn' : 'text-ink'}`}>
                      {item.quantidade_estoque} <span className="text-[11px] font-normal text-ink-3">un</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-1">
                      <div className={`h-full rounded-full ${emReposicao ? 'bg-warn/70' : 'bg-brand/70'}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1 text-[10.5px] text-ink-3">mín {item.quantidade_minima} · máx {item.quantidade_maxima}</div>
                  </div>

                  <div className="rounded-lg border border-line bg-surface-2 px-3 py-2">
                    <div className="text-[11px] text-ink-3">Validade</div>
                    <div className="text-[15px] font-semibold tabular-nums">
                      {item.data_validade ? fmt(item.data_validade) : '—'}
                    </div>
                    {item.fornecedor_nome && (
                      <div className="mt-1 truncate text-[11px] text-ink-3">
                        {item.fornecedor_nome}{item.fornecedor_contato ? ` · ${item.fornecedor_contato}` : ''}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-line bg-surface-2 px-3 py-2">
                    <div className="text-[11px] text-ink-3">Custo / Venda</div>
                    <div className="text-[15px] font-semibold tabular-nums">
                      {item.preco_custo != null ? brl(item.preco_custo) : '—'}
                      <span className="text-[12px] font-normal text-ink-3"> / {item.preco_venda != null ? brl(item.preco_venda) : '—'}</span>
                    </div>
                    {item.preco_custo != null && item.preco_venda != null && item.preco_custo > 0 && (
                      <div className="mt-1 text-[11px] text-ink-3">
                        margem {Math.round(((item.preco_venda - item.preco_custo) / item.preco_custo) * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <Modal aberto={modalNovoAberto} onFechar={() => setModalNovoAberto(false)} titulo="Adicionar item ao estoque">
        <FormEstoque onSubmit={handleNovoItem} onCancel={() => setModalNovoAberto(false)} />
      </Modal>

      <Modal aberto={modalEditarAberto} onFechar={() => { setModalEditarAberto(false); setItemEditando(null) }} titulo="Editar item">
        {itemEditando && (
          <FormEditarEstoque
            item={itemEditando}
            onSubmit={handleEditarItem}
            onCancel={() => { setModalEditarAberto(false); setItemEditando(null) }}
          />
        )}
      </Modal>

      <Modal aberto={modalMovimentoAberto} onFechar={() => { setModalMovimentoAberto(false); setItemMovimento(null) }} titulo="Registrar movimento">
        {itemMovimento && (
          <FormMovimentoEstoque
            item={itemMovimento}
            onSubmit={handleRegistrarMovimento}
            onCancel={() => { setModalMovimentoAberto(false); setItemMovimento(null) }}
          />
        )}
      </Modal>
    </div>
  )
}
