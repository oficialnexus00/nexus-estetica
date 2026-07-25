import { useState } from 'react'
import type { DB } from '../data'
import type { Acoes } from '../App'
import Modal from '../components/Modal'
import ConfirmButton from '../components/ConfirmButton'
import { FormServico, FormProfissional, FormEditarServico, FormEditarProfissional, FormProtocolo, FormModelo, FormFornecedor, FormBox,
  type DadosServico, type DadosProfissional, type DadosEditarServico, type DadosEditarProfissional } from '../components/Formularios'
import type { ProtocoloVacina, ModeloDocumento, Fornecedor, Box, FinalidadeBox } from '../data'
import { ESPECIE_BOX, FINALIDADE_BOX } from '../data'

const FINAL_CLS: Record<FinalidadeBox, string> = {
  comum: 'border-s1/40 bg-s1/10 text-s1',
  uti: 'border-bad/40 bg-bad/10 text-bad',
  isolamento: 'border-s3/40 bg-s3/10 text-s3',
  semi: 'border-s2/40 bg-s2/10 text-s2',
}

const CATEGORIAS: Record<string, string> = {
  consulta: 'Consulta',
  vacina: 'Vacina',
  banho_tosa: 'Banho e tosa',
  cirurgia: 'Cirurgia',
  exame: 'Exame',
  outro: 'Outro',
}

const ESPECIE_LABEL: Record<string, string> = { cao: 'Cão', gato: 'Gato', ambos: 'Cão e gato' }
const TIPO_MODELO_LABEL: Record<string, string> = { receita: 'Receita', atestado: 'Atestado', termo: 'Termo', documento: 'Documento' }

const descreveProtocolo = (p: ProtocoloVacina) => {
  const reforco = p.reforcoMeses % 12 === 0
    ? `reforço a cada ${p.reforcoMeses / 12} ano${p.reforcoMeses > 12 ? 's' : ''}`
    : `reforço a cada ${p.reforcoMeses} meses`
  const filhote = p.doseFilhoteDias ? ` · filhote a cada ${p.doseFilhoteDias} dias` : ''
  return reforco + filhote
}

export default function Configuracoes({ data, acoes }: { data: DB; acoes: Acoes }) {
  const [aba, setAba] = useState<'servicos' | 'profissionais' | 'fornecedores' | 'boxes' | 'protocolos' | 'tipos' | 'modelos'>('servicos')
  const [adicionandoServico, setAdicionandoServico] = useState(false)
  const [editandoServico, setEditandoServico] = useState<DB['servicos'][0] | null>(null)
  const [adicionandoProfissional, setAdicionandoProfissional] = useState(false)
  const [editandoProfissional, setEditandoProfissional] = useState<DB['profissionais'][0] | null>(null)
  const [adicionandoProtocolo, setAdicionandoProtocolo] = useState(false)
  const [editandoProtocolo, setEditandoProtocolo] = useState<ProtocoloVacina | null>(null)
  const [novoTipo, setNovoTipo] = useState('')
  const [adicionandoModelo, setAdicionandoModelo] = useState(false)
  const [editandoModelo, setEditandoModelo] = useState<ModeloDocumento | null>(null)
  const [adicionandoFornecedor, setAdicionandoFornecedor] = useState(false)
  const [editandoFornecedor, setEditandoFornecedor] = useState<Fornecedor | null>(null)
  const [adicionandoBox, setAdicionandoBox] = useState(false)
  const [editandoBox, setEditandoBox] = useState<Box | null>(null)

  const ABAS = [
    ['servicos', '💼 Serviços'],
    ['profissionais', '👨‍⚕️ Profissionais'],
    ['fornecedores', '🏢 Fornecedores'],
    ['boxes', '🏥 Boxes de internação'],
    ['protocolos', '💉 Protocolo de vacinas'],
    ['tipos', '🩺 Tipos de atendimento'],
    ['modelos', '📄 Modelos de documento'],
  ] as const

  // boxes ocupados por uma internação ativa não podem ser removidos
  const boxesOcupados = new Set((data.internacoes ?? []).filter(i => i.status === 'internado' && i.box).map(i => i.box))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {ABAS.map(([tab, rotulo]) => (
          <button key={tab} onClick={() => setAba(tab)}
            className={`px-4 py-2 text-[13.5px] font-medium transition rounded-lg border ${
              aba === tab
                ? 'border-brand bg-brand/12 text-brand'
                : 'border-line bg-surface-1 text-ink-2 hover:border-brand/50 hover:text-ink'
            }`}>
            {rotulo}
          </button>
        ))}
      </div>

      {aba === 'servicos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Serviços disponíveis</h2>
            <button onClick={() => setAdicionandoServico(true)}
              className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
              + Novo serviço
            </button>
          </div>

          {data.servicos.length === 0 ? (
            <div className="rounded-xl border border-line bg-surface-1 p-6 text-center">
              <p className="text-[13.5px] text-ink-2">Nenhum serviço cadastrado ainda.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {data.servicos.map(s => (
                <div key={s.id} className="rounded-xl border border-line bg-surface-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[14px] font-semibold">{s.nome}</h3>
                      <p className="mt-0.5 text-[12px] text-ink-3">{CATEGORIAS[s.categoria] || s.categoria}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditandoServico(s)}
                        className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                        Editar
                      </button>
                      <button onClick={() => acoes.deletarServico(s.id)}
                        className="rounded-lg border border-bad/40 bg-bad/10 px-2.5 py-1 text-[11.5px] font-medium text-bad transition hover:border-bad/60 hover:bg-bad/20">
                        Deletar
                      </button>
                    </div>
                  </div>
                  {s.descricao && (
                    <p className="mt-3 text-[12.5px] leading-snug text-ink-2">{s.descricao}</p>
                  )}
                  {s.observacao && (
                    <div className="mt-2 rounded-lg border border-warn/30 bg-warn/10 px-2.5 py-1.5">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-warn">Observação</p>
                      <p className="mt-0.5 text-[12.5px] leading-snug text-ink-2">{s.observacao}</p>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[12px] text-ink-3">Valor</p>
                      <p className="text-[14px] font-semibold">{s.preco > 0 ? `R$ ${s.preco.toLocaleString('pt-BR')}` : 'Grátis'}</p>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <p className="text-[12px] text-ink-3">Duração</p>
                      <p className="text-[14px] font-semibold">{s.duracao} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {aba === 'profissionais' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Profissionais da clínica</h2>
            <button onClick={() => setAdicionandoProfissional(true)}
              className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
              + Novo profissional
            </button>
          </div>

          {data.profissionais && data.profissionais.length === 0 ? (
            <div className="rounded-xl border border-line bg-surface-1 p-6 text-center">
              <p className="text-[13.5px] text-ink-2">Nenhum profissional cadastrado ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.profissionais?.map(p => (
                <div key={p.id} className="rounded-xl border border-line bg-surface-1 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[14px] font-semibold">{p.nome}</h3>
                      {p.especialidade && (
                        <p className="mt-0.5 text-[12px] text-ink-3">{p.especialidade}</p>
                      )}
                      {p.telefone && (
                        <p className="mt-0.5 text-[12px] text-ink-3">{p.telefone}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="rounded-md bg-ok/12 px-2.5 py-1 text-[11px] font-medium text-ok">Ativo</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditandoProfissional(p)}
                          className="rounded-lg border border-line bg-surface-2 px-2 py-1 text-[11px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                          Editar
                        </button>
                        <button onClick={() => acoes.deletarProfissional(p.id)}
                          className="rounded-lg border border-bad/40 bg-bad/10 px-2 py-1 text-[11px] font-medium text-bad transition hover:border-bad/60 hover:bg-bad/20">
                          Deletar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {aba === 'fornecedores' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold">Fornecedores</h2>
              <p className="mt-0.5 text-[12px] text-ink-3">Empresas (PJ) que abastecem a clínica — vinculadas às contas a pagar.</p>
            </div>
            <button onClick={() => setAdicionandoFornecedor(true)}
              className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
              + Novo fornecedor
            </button>
          </div>

          {(data.fornecedores ?? []).length === 0 ? (
            <div className="rounded-xl border border-line bg-surface-1 p-6 text-center">
              <p className="text-[13.5px] text-ink-2">Nenhum fornecedor cadastrado ainda.</p>
              <p className="mt-1 text-[12px] text-ink-3">Cadastre as empresas de quem você compra insumos, vacinas e serviços.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {(data.fornecedores ?? []).map(fo => (
                <div key={fo.id} className="rounded-xl border border-line bg-surface-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[14px] font-semibold">{fo.nomeFantasia || fo.razaoSocial}</h3>
                        {fo.categoria && (
                          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-2">
                            {fo.categoria}
                          </span>
                        )}
                      </div>
                      {fo.nomeFantasia && fo.razaoSocial !== fo.nomeFantasia && (
                        <p className="mt-0.5 text-[12px] text-ink-3">{fo.razaoSocial}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button onClick={() => setEditandoFornecedor(fo)}
                        className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                        Editar
                      </button>
                      <ConfirmButton titulo="Remover fornecedor" mensagem={`Remover "${fo.nomeFantasia || fo.razaoSocial}" da lista de fornecedores?`}
                        confirmLabel="Remover" danger onConfirm={() => acoes.deletarFornecedor(fo.id)}
                        className="rounded-lg border border-bad/40 bg-bad/10 px-2.5 py-1 text-[11.5px] font-medium text-bad transition hover:border-bad/60 hover:bg-bad/20">
                        Deletar
                      </ConfirmButton>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-1 text-[12px] text-ink-2">
                    {fo.cnpj && <div><span className="text-ink-3">CNPJ</span> · {fo.cnpj}</div>}
                    {fo.inscricaoEstadual && <div><span className="text-ink-3">IE</span> · {fo.inscricaoEstadual}</div>}
                    {(fo.contato || fo.telefone) && (
                      <div>{[fo.contato, fo.telefone].filter(Boolean).join(' · ')}</div>
                    )}
                    {fo.email && <div className="truncate">{fo.email}</div>}
                    {fo.endereco && <div className="text-ink-3">{fo.endereco}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {aba === 'boxes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold">Boxes de internação</h2>
              <p className="mt-0.5 text-[12px] text-ink-3">Os leitos/quartos da sua clínica — monte conforme o tamanho e a necessidade.</p>
            </div>
            <button onClick={() => setAdicionandoBox(true)}
              className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
              + Novo box
            </button>
          </div>

          {(data.boxes ?? []).length === 0 ? (
            <div className="rounded-xl border border-line bg-surface-1 p-6 text-center">
              <p className="text-[13.5px] text-ink-2">Nenhum box cadastrado ainda.</p>
              <p className="mt-1 text-[12px] text-ink-3">Adicione os leitos da clínica (canino, felino, UTI, isolamento).</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(data.boxes ?? []).map(b => {
                const ocupado = boxesOcupados.has(b.id)
                return (
                  <div key={b.id} className="rounded-xl border border-line bg-surface-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="text-[14px] font-semibold">{b.nome}</h3>
                          <span className="rounded-md border border-line bg-surface-2 px-2 py-0.5 text-[10.5px] font-medium text-ink-2">
                            {ESPECIE_BOX[b.especie]}
                          </span>
                          <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-medium ${FINAL_CLS[b.finalidade]}`}>
                            {FINALIDADE_BOX[b.finalidade]}
                          </span>
                        </div>
                        {b.observacao && <p className="mt-1 text-[11.5px] text-ink-3">{b.observacao}</p>}
                        <p className={`mt-1 text-[11.5px] ${ocupado ? 'text-warn' : 'text-ok'}`}>
                          {ocupado ? '● Ocupado' : '● Livre'}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <button onClick={() => setEditandoBox(b)}
                          className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                          Editar
                        </button>
                        {ocupado ? (
                          <span title="Box ocupado — dê alta ao paciente antes de remover"
                            className="cursor-not-allowed rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-3/60">
                            Deletar
                          </span>
                        ) : (
                          <ConfirmButton titulo="Remover box" mensagem={`Remover o box "${b.nome}"?`}
                            confirmLabel="Remover" danger onConfirm={() => acoes.deletarBox(b.id)}
                            className="rounded-lg border border-bad/40 bg-bad/10 px-2.5 py-1 text-[11.5px] font-medium text-bad transition hover:border-bad/60 hover:bg-bad/20">
                            Deletar
                          </ConfirmButton>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {aba === 'protocolos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold">Protocolo de vacinas</h2>
              <p className="mt-0.5 text-[12px] text-ink-3">Define de quanto em quanto tempo a Bia chama o pet de volta.</p>
            </div>
            <button onClick={() => setAdicionandoProtocolo(true)}
              className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
              + Nova vacina
            </button>
          </div>

          {(data.protocolos ?? []).length === 0 ? (
            <div className="rounded-xl border border-line bg-surface-1 p-6 text-center">
              <p className="text-[13.5px] text-ink-2">Nenhum protocolo cadastrado ainda.</p>
              <p className="mt-1 text-[12px] text-ink-3">Cadastre as vacinas para a recorrência funcionar.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {(data.protocolos ?? []).map(p => (
                <div key={p.id} className="rounded-xl border border-line bg-surface-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[14px] font-semibold">{p.nome}</h3>
                        <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-2">
                          {ESPECIE_LABEL[p.especie] ?? p.especie}
                        </span>
                      </div>
                      <p className="mt-1 text-[12.5px] text-ink-3">{descreveProtocolo(p)}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditandoProtocolo(p)}
                        className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                        Editar
                      </button>
                      <button onClick={() => acoes.deletarProtocolo(p.id)}
                        className="rounded-lg border border-bad/40 bg-bad/10 px-2.5 py-1 text-[11.5px] font-medium text-bad transition hover:border-bad/60 hover:bg-bad/20">
                        Deletar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {aba === 'tipos' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-[15px] font-semibold">Tipos de atendimento</h2>
            <p className="mt-0.5 text-[12px] text-ink-3">Aparecem no registro de atendimento do prontuário.</p>
          </div>

          <form
            onSubmit={e => { e.preventDefault(); if (novoTipo.trim()) { acoes.criarTipoAtendimento(novoTipo); setNovoTipo('') } }}
            className="flex flex-wrap gap-2">
            <input value={novoTipo} onChange={e => setNovoTipo(e.target.value)}
              placeholder="Ex.: Consulta oftalmológica"
              className="min-w-0 flex-1 rounded-lg border border-line bg-surface-1 px-3.5 py-2 text-[13.5px] outline-none transition placeholder:text-ink-3 focus:border-brand/60 md:max-w-sm" />
            <button type="submit"
              className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
              + Adicionar
            </button>
          </form>

          {(data.tiposAtendimento ?? []).length === 0 ? (
            <div className="rounded-xl border border-line bg-surface-1 p-6 text-center">
              <p className="text-[13.5px] text-ink-2">Nenhum tipo cadastrado ainda.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(data.tiposAtendimento ?? []).map(t => (
                <span key={t} className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-1 px-3 py-1.5 text-[13px]">
                  {t}
                  <button onClick={() => acoes.deletarTipoAtendimento(t)} aria-label={`Remover ${t}`}
                    className="text-[13px] text-ink-3 transition hover:text-bad">✕</button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {aba === 'modelos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold">Modelos de documento</h2>
              <p className="mt-0.5 text-[12px] text-ink-3">Receitas, atestados e termos reutilizáveis — preenchidos ao emitir no pet.</p>
            </div>
            <button onClick={() => setAdicionandoModelo(true)}
              className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
              + Novo modelo
            </button>
          </div>

          {(data.modelos ?? []).length === 0 ? (
            <div className="rounded-xl border border-line bg-surface-1 p-6 text-center">
              <p className="text-[13.5px] text-ink-2">Nenhum modelo cadastrado ainda.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {(data.modelos ?? []).map(m => (
                <div key={m.id} className="rounded-xl border border-line bg-surface-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[14px] font-semibold">{m.nome}</h3>
                        <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-2">
                          {TIPO_MODELO_LABEL[m.tipo] ?? m.tipo}
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[12px] text-ink-3">{m.conteudo}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button onClick={() => setEditandoModelo(m)}
                        className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                        Editar
                      </button>
                      <button onClick={() => acoes.deletarModelo(m.id)}
                        className="rounded-lg border border-bad/40 bg-bad/10 px-2.5 py-1 text-[11.5px] font-medium text-bad transition hover:border-bad/60 hover:bg-bad/20">
                        Deletar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal titulo="Novo serviço" aberto={adicionandoServico} onFechar={() => setAdicionandoServico(false)}>
        <FormServico onCancelar={() => setAdicionandoServico(false)}
          onSalvar={async d => { await acoes.criarServico(d); setAdicionandoServico(false) }} />
      </Modal>

      <Modal titulo={`Editar ${editandoServico?.nome}`} aberto={!!editandoServico} onFechar={() => setEditandoServico(null)}>
        {editandoServico && (
          <FormEditarServico servico={editandoServico} onCancelar={() => setEditandoServico(null)}
            onSalvar={async d => { await acoes.atualizarServico(editandoServico.id, d); setEditandoServico(null) }} />
        )}
      </Modal>

      <Modal titulo="Novo profissional" aberto={adicionandoProfissional} onFechar={() => setAdicionandoProfissional(false)}>
        <FormProfissional onCancelar={() => setAdicionandoProfissional(false)}
          onSalvar={async d => { await acoes.criarProfissional(d); setAdicionandoProfissional(false) }} />
      </Modal>

      <Modal titulo={`Editar ${editandoProfissional?.nome}`} aberto={!!editandoProfissional} onFechar={() => setEditandoProfissional(null)}>
        {editandoProfissional && (
          <FormEditarProfissional profissional={editandoProfissional} onCancelar={() => setEditandoProfissional(null)}
            onSalvar={async d => { await acoes.atualizarProfissional(editandoProfissional.id, d); setEditandoProfissional(null) }} />
        )}
      </Modal>

      <Modal titulo="Novo fornecedor" aberto={adicionandoFornecedor} onFechar={() => setAdicionandoFornecedor(false)}>
        <FormFornecedor onCancelar={() => setAdicionandoFornecedor(false)}
          onSalvar={async d => { await acoes.criarFornecedor(d); setAdicionandoFornecedor(false) }} />
      </Modal>

      <Modal titulo={`Editar ${editandoFornecedor?.nomeFantasia || editandoFornecedor?.razaoSocial}`} aberto={!!editandoFornecedor} onFechar={() => setEditandoFornecedor(null)}>
        {editandoFornecedor && (
          <FormFornecedor fornecedor={editandoFornecedor} onCancelar={() => setEditandoFornecedor(null)}
            onSalvar={async d => { await acoes.atualizarFornecedor(editandoFornecedor.id, d); setEditandoFornecedor(null) }} />
        )}
      </Modal>

      <Modal titulo="Novo box de internação" aberto={adicionandoBox} onFechar={() => setAdicionandoBox(false)}>
        <FormBox boxes={data.boxes ?? []} onCancelar={() => setAdicionandoBox(false)}
          onSalvar={async d => { await acoes.criarBox(d); setAdicionandoBox(false) }} />
      </Modal>

      <Modal titulo={`Editar ${editandoBox?.nome}`} aberto={!!editandoBox} onFechar={() => setEditandoBox(null)}>
        {editandoBox && (
          <FormBox box={editandoBox} boxes={data.boxes ?? []} onCancelar={() => setEditandoBox(null)}
            onSalvar={async d => { await acoes.atualizarBox(editandoBox.id, d); setEditandoBox(null) }} />
        )}
      </Modal>

      <Modal titulo="Nova vacina no protocolo" aberto={adicionandoProtocolo} onFechar={() => setAdicionandoProtocolo(false)}>
        <FormProtocolo onCancelar={() => setAdicionandoProtocolo(false)}
          onSalvar={async d => { await acoes.criarProtocolo(d); setAdicionandoProtocolo(false) }} />
      </Modal>

      <Modal titulo={`Editar ${editandoProtocolo?.nome}`} aberto={!!editandoProtocolo} onFechar={() => setEditandoProtocolo(null)}>
        {editandoProtocolo && (
          <FormProtocolo protocolo={editandoProtocolo} onCancelar={() => setEditandoProtocolo(null)}
            onSalvar={async d => { await acoes.atualizarProtocolo(editandoProtocolo.id, d); setEditandoProtocolo(null) }} />
        )}
      </Modal>

      <Modal titulo="Novo modelo de documento" aberto={adicionandoModelo} onFechar={() => setAdicionandoModelo(false)}>
        <FormModelo onCancelar={() => setAdicionandoModelo(false)}
          onSalvar={async d => { await acoes.criarModelo(d); setAdicionandoModelo(false) }} />
      </Modal>

      <Modal titulo={`Editar ${editandoModelo?.nome}`} aberto={!!editandoModelo} onFechar={() => setEditandoModelo(null)}>
        {editandoModelo && (
          <FormModelo modelo={editandoModelo} onCancelar={() => setEditandoModelo(null)}
            onSalvar={async d => { await acoes.atualizarModelo(editandoModelo.id, d); setEditandoModelo(null) }} />
        )}
      </Modal>
    </div>
  )
}
