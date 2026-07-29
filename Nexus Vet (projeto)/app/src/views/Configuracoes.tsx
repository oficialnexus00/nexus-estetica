import { useState } from 'react'
import type { DB } from '../data'
import type { Acoes } from '../App'
import Modal, { Campo } from '../components/Modal'
import ConfirmButton from '../components/ConfirmButton'
import { FormServico, FormProfissional, FormEditarServico, FormEditarProfissional, FormProtocolo, FormModelo, FormFornecedor, FormBox,
  type DadosServico, type DadosProfissional, type DadosEditarServico, type DadosEditarProfissional } from '../components/Formularios'
import type { ProtocoloVacina, ModeloDocumento, Fornecedor, Box, FinalidadeBox, ConfigComissao, PlanoBemEstar, BeneficioPlano, TipoBeneficio } from '../data'
import { ESPECIE_BOX, FINALIDADE_BOX, CONFIG_COMISSAO_PADRAO, rotuloBeneficio } from '../data'

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

const PLANO_DOT: Record<string, string> = { teal: 'bg-brand', blue: 'bg-s2', violet: 'bg-s4' }
const PLANO_CATEGORIAS: [string, string][] = [
  ['todos', 'Tudo (desconto geral)'], ['consulta', 'Consulta'], ['vacina', 'Vacina'],
  ['banho_tosa', 'Banho e tosa'], ['exame', 'Exame'], ['cirurgia', 'Cirurgia'],
]
const ESPECIE_LABEL: Record<string, string> = { cao: 'Cão', gato: 'Gato', ambos: 'Cão e gato' }
const TIPO_MODELO_LABEL: Record<string, string> = { receita: 'Receita', atestado: 'Atestado', termo: 'Termo', documento: 'Documento' }

const descreveProtocolo = (p: ProtocoloVacina) => {
  const reforco = p.reforcoMeses % 12 === 0
    ? `reforço a cada ${p.reforcoMeses / 12} ano${p.reforcoMeses > 12 ? 's' : ''}`
    : `reforço a cada ${p.reforcoMeses} meses`
  const filhote = p.doseFilhoteDias ? ` · filhote a cada ${p.doseFilhoteDias} dias` : ''
  return reforco + filhote
}

// Segmento (toggle de opções) tipado, usado na aba de Comissões
function SegmentoConfig<T extends string>({ valor, onMudar, opcoes }: {
  valor: T; onMudar: (v: T) => void; opcoes: [T, string][]
}) {
  return (
    <div className="flex rounded-lg border border-line bg-surface-2 p-0.5">
      {opcoes.map(([v, rotulo]) => (
        <button key={v} onClick={() => onMudar(v)}
          className={`flex-1 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition ${
            valor === v ? 'bg-brand/12 text-brand' : 'text-ink-2 hover:text-ink'}`}>
          {rotulo}
        </button>
      ))}
    </div>
  )
}

export default function Configuracoes({ data, acoes }: { data: DB; acoes: Acoes }) {
  const [aba, setAba] = useState<'servicos' | 'profissionais' | 'comissoes' | 'planos' | 'fornecedores' | 'boxes' | 'protocolos' | 'tipos' | 'modelos'>('servicos')
  const [editandoPlano, setEditandoPlano] = useState<PlanoBemEstar | null>(null)
  const [adicionandoPlano, setAdicionandoPlano] = useState(false)
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
    ['comissoes', '💵 Comissões'],
    ['planos', '⭐ Planos'],
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

      {aba === 'comissoes' && (() => {
        const cfg = data.comissao ?? CONFIG_COMISSAO_PADRAO
        const profs = data.profissionais ?? []
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-[15px] font-semibold">Comissões</h2>
              <p className="mt-0.5 text-[12.5px] text-ink-3">Defina como a clínica remunera veterinários e vendedores. A regra e as margens abaixo valem para toda a apuração.</p>
            </div>

            {/* Regra de cálculo da clínica */}
            <div className="rounded-xl border border-line bg-surface-1 p-4">
              <div className="mb-1 text-[13.5px] font-semibold">Regra de cálculo</div>
              <p className="mb-3 text-[11.5px] text-ink-3">Como a base da comissão é apurada — normalmente definida por contrato.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1.5 text-[11.5px] text-ink-3">Comissão incide sobre</div>
                  <SegmentoConfig valor={cfg.incideSobre} onMudar={v => acoes.atualizarRegraComissao({ ...cfg, incideSobre: v })}
                    opcoes={[['servicos', 'Somente serviços'], ['tudo', 'Serviços e produtos']]} />
                </div>
                <div>
                  <div className="mb-1.5 text-[11.5px] text-ink-3">Calcular sobre</div>
                  <SegmentoConfig valor={cfg.base} onMudar={v => acoes.atualizarRegraComissao({ ...cfg, base: v })}
                    opcoes={[['liquido', 'Valor cobrado (com desconto)'], ['bruto', 'Valor de tabela']]} />
                </div>
              </div>
            </div>

            {/* Margem por profissional */}
            <div className="rounded-xl border border-line bg-surface-1 p-4">
              <div className="mb-1 text-[13.5px] font-semibold">Margem por profissional</div>
              <p className="mb-3 text-[11.5px] text-ink-3">O percentual que cada veterinário ou vendedor recebe sobre a base.</p>
              {profs.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-ink-3">Cadastre profissionais na aba “Profissionais”.</p>
              ) : (
                <div className="space-y-2">
                  {profs.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
                      <div className="min-w-0">
                        <div className="truncate text-[13.5px] font-medium">{p.nome}</div>
                        {p.especialidade && <div className="text-[11.5px] text-ink-3">{p.especialidade}</div>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input type="number" min={0} max={100} value={p.comissaoPct ?? 0}
                          onChange={e => acoes.atualizarComissao(p.id, Number(e.target.value))}
                          className="w-16 rounded-lg border border-line bg-surface-1 px-3 py-2 text-[13px] text-right outline-none focus:border-brand/60"
                          aria-label={`Comissão de ${p.nome}`} />
                        <span className="text-[13px] text-ink-3">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[11.5px] text-ink-3">A apuração (valores a pagar e extratos) fica na tela <span className="font-medium text-ink-2">Comissões</span> do menu.</p>
            </div>
          </div>
        )
      })()}

      {aba === 'planos' && (() => {
        const planos = data.planos ?? []
        const assinaturas = (data.assinaturas ?? []).filter(a => a.status === 'ativa')
        const nAssin = (id: string) => assinaturas.filter(a => a.planoId === id).length
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">Planos de bem-estar</h2>
                <p className="mt-0.5 text-[12.5px] text-ink-3">Assinatura da própria clínica — o benefício é aplicado sozinho no atendimento e no PDV.</p>
              </div>
              <button onClick={() => setAdicionandoPlano(true)}
                className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
                + Novo plano
              </button>
            </div>
            {planos.length === 0 ? (
              <div className="rounded-xl border border-line bg-surface-1 p-6 text-center">
                <p className="text-[13.5px] text-ink-2">Nenhum plano criado ainda.</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {planos.map(pl => (
                  <div key={pl.id} className="flex flex-col rounded-xl border border-line bg-surface-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${PLANO_DOT[pl.cor]}`} />
                          <h3 className="text-[14.5px] font-semibold">{pl.nome}</h3>
                        </div>
                        <div className="mt-0.5 text-[13px] text-ink-2"><span className="text-[16px] font-semibold text-ink">R$ {pl.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>/mês</div>
                      </div>
                      {!pl.ativo && <span className="rounded-md border border-line bg-surface-2 px-2 py-0.5 text-[10.5px] text-ink-3">inativo</span>}
                    </div>
                    <ul className="mt-3 flex-1 space-y-1 text-[12px] text-ink-2">
                      {pl.beneficios.map(b => <li key={b.id}>✓ {rotuloBeneficio(b)}</li>)}
                    </ul>
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                      <span className="text-[11.5px] text-ink-3">{nAssin(pl.id)} assinante{nAssin(pl.id) === 1 ? '' : 's'}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditandoPlano(pl)}
                          className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">Editar</button>
                        <ConfirmButton titulo={`Remover ${pl.nome}`} mensagem={`Remover o plano "${pl.nome}"? As assinaturas ativas serão canceladas.`}
                          confirmLabel="Remover" danger onConfirm={() => acoes.deletarPlano(pl.id)}
                          className="rounded-lg border border-bad/40 bg-bad/10 px-2.5 py-1 text-[11.5px] font-medium text-bad transition hover:border-bad/60 hover:bg-bad/20">Deletar</ConfirmButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}

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

      <Modal titulo="Novo plano de bem-estar" aberto={adicionandoPlano} onFechar={() => setAdicionandoPlano(false)}>
        <FormPlano onCancelar={() => setAdicionandoPlano(false)}
          onSalvar={async p => { await acoes.criarPlano(p); setAdicionandoPlano(false) }} />
      </Modal>

      <Modal titulo={`Editar ${editandoPlano?.nome}`} aberto={!!editandoPlano} onFechar={() => setEditandoPlano(null)}>
        {editandoPlano && (
          <FormPlano plano={editandoPlano} onCancelar={() => setEditandoPlano(null)}
            onSalvar={async p => { await acoes.atualizarPlano(editandoPlano.id, p); setEditandoPlano(null) }} />
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

/* ------------------------------------------------------ editor de plano de bem-estar */

const planoInput = 'rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] outline-none focus:border-brand/60'

function FormPlano({ plano, onSalvar, onCancelar }: {
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
