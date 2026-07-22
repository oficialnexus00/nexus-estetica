import { useState } from 'react'
import type { Exame, Pet } from '../data'
import Modal from '../components/Modal'
import { FormExame, FormResultado, type DadosExame, type DadosResultado } from '../components/Formularios'
import type { Acoes } from '../App'

interface Props {
  exames: Exame[]
  pets: Pet[]
  acoes: Acoes
}

type Filtro = 'todos' | 'solicitado' | 'concluído'

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

export default function Exames({ exames, pets, acoes }: Props) {
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [modalResultadoAberto, setModalResultadoAberto] = useState(false)
  const [exameEditando, setExameEditando] = useState<Exame | null>(null)

  const getNomePet = (petId: string) => pets.find(p => p.id === petId)?.nome ?? '—'

  const solicitados = exames.filter(e => e.status === 'solicitado')
  const concluidos = exames.filter(e => e.status === 'concluído')

  const examesFiltrados = filtro === 'solicitado' ? solicitados : filtro === 'concluído' ? concluidos : exames

  // Tarjas com os tokens do design system (igual Estoque/Tutores)
  const statusBadge = (status: string) => {
    switch (status) {
      case 'solicitado': return { label: 'Solicitado', cls: 'border-s2/40 bg-s2/10 text-s2' }
      case 'concluído': return { label: 'Concluído', cls: 'border-ok/40 bg-ok/10 text-ok' }
      case 'cancelado': return { label: 'Cancelado', cls: 'border-bad/40 bg-bad/10 text-bad' }
      default: return { label: '—', cls: 'border-line bg-surface-2 text-ink-3' }
    }
  }

  const handleNovoExame = async (d: DadosExame) => {
    await acoes.criarExame(d)
    setModalNovoAberto(false)
  }

  const handleAdicionarResultado = async (d: DadosResultado) => {
    if (!exameEditando) return
    await acoes.atualizarExame(exameEditando.id, d)
    setModalResultadoAberto(false)
    setExameEditando(null)
  }

  const handleDeletarExame = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este exame?')) return
    await acoes.deletarExame(id)
  }

  const filtros: [Filtro, string][] = [
    ['todos', `Todos (${exames.length})`],
    ['solicitado', `Solicitados (${solicitados.length})`],
    ['concluído', `Concluídos (${concluidos.length})`],
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
          + Solicitar exame
        </button>
      </div>

      <div className="space-y-3">
        {examesFiltrados.length === 0 ? (
          <p className="py-10 text-center text-[13.5px] text-ink-3">Nenhum exame encontrado.</p>
        ) : (
          examesFiltrados.map(exame => {
            const status = statusBadge(exame.status)
            return (
              <div key={exame.id} className="rounded-xl border border-line bg-surface-1 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14.5px] font-semibold">{exame.tipo}</span>
                      <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-medium ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[12px] text-ink-3">
                      {getNomePet(exame.pet_id)} · solicitado em {fmt(exame.data_solicitacao)}
                      {exame.data_resultado ? ` · resultado em ${fmt(exame.data_resultado)}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {exame.status === 'solicitado' && (
                      <button onClick={() => { setExameEditando(exame); setModalResultadoAberto(true) }}
                        className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                        Adicionar resultado
                      </button>
                    )}
                    <button onClick={() => handleDeletarExame(exame.id)}
                      className="rounded-lg border border-bad/40 bg-bad/10 px-2.5 py-1 text-[11.5px] font-medium text-bad transition hover:border-bad/60 hover:bg-bad/20">
                      Deletar
                    </button>
                  </div>
                </div>

                {(exame.resultado || exame.observacoes) && (
                  <div className="mt-3 space-y-2">
                    {exame.resultado && (
                      <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 border-l-2 border-l-brand/60">
                        <div className="text-[11px] text-ink-3">Resultado</div>
                        <div className="mt-0.5 text-[13px] text-ink-2">{exame.resultado}</div>
                      </div>
                    )}
                    {exame.observacoes && (
                      <div className="rounded-lg border border-line bg-surface-2 px-3 py-2">
                        <div className="text-[11px] text-ink-3">Observações</div>
                        <div className="mt-0.5 text-[13px] text-ink-2">{exame.observacoes}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <Modal aberto={modalNovoAberto} onFechar={() => setModalNovoAberto(false)} titulo="Solicitar exame">
        <FormExame petIds={pets.map(p => ({ id: p.id, nome: p.nome }))} onSubmit={handleNovoExame} onCancel={() => setModalNovoAberto(false)} />
      </Modal>

      <Modal aberto={modalResultadoAberto} onFechar={() => { setModalResultadoAberto(false); setExameEditando(null) }} titulo="Adicionar resultado">
        {exameEditando && (
          <FormResultado exame={exameEditando} onSubmit={handleAdicionarResultado} onCancel={() => { setModalResultadoAberto(false); setExameEditando(null) }} />
        )}
      </Modal>
    </div>
  )
}
