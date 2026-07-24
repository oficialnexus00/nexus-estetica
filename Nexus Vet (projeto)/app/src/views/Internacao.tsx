import { useState } from 'react'
import type { DB, Internacao as TInternacao, Box, FinalidadeBox } from '../data'
import { brl, ESPECIE_BOX, FINALIDADE_BOX } from '../data'
import type { Acoes, DadosInternacao, DadosMedicacao, DadosParametro } from '../App'
import Modal, { Campo, inputCls as modalInput, Acoes as AcoesForm } from '../components/Modal'
import ConfirmButton from '../components/ConfirmButton'

type Aba = 'internados' | 'boxes' | 'historico'

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
const hojeStr = () => new Date().toISOString().slice(0, 10)
const diasInternado = (i: TInternacao) => {
  const fim = i.saida ?? hojeStr()
  return Math.max(1, Math.round((new Date(fim + 'T00:00:00').getTime() - new Date(i.entrada + 'T00:00:00').getTime()) / 86400000))
}

const inputCls = 'rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] outline-none focus:border-brand/60'

// cor da tarja pela finalidade do box
const FINAL_CLS: Record<FinalidadeBox, string> = {
  comum: 'border-s1/40 bg-s1/10 text-s1',
  uti: 'border-bad/40 bg-bad/10 text-bad',
  isolamento: 'border-s3/40 bg-s3/10 text-s3',
  semi: 'border-s2/40 bg-s2/10 text-s2',
}
const rotuloBox = (b: Box) => `${ESPECIE_BOX[b.especie]} · ${FINALIDADE_BOX[b.finalidade]}`

export default function Internacao({ data, acoes }: { data: DB; acoes: Acoes }) {
  const [aba, setAba] = useState<Aba>('internados')
  const [selId, setSelId] = useState<string | null>(null)
  const [internando, setInternando] = useState(false)
  const [histDe, setHistDe] = useState('')
  const [histAte, setHistAte] = useState('')

  const internacoes = data.internacoes ?? []
  const boxes = data.boxes ?? []
  const internados = internacoes.filter(i => i.status === 'internado')
  const historico = internacoes.filter(i => i.status === 'alta')
  // filtro por período no histórico (pela data de alta; cai na entrada se faltar)
  const dataRef = (i: TInternacao) => i.saida ?? i.entrada
  const historicoFiltrado = historico
    .filter(i => { const d = dataRef(i); return (!histDe || d >= histDe) && (!histAte || d <= histAte) })
    .sort((a, b) => dataRef(b).localeCompare(dataRef(a)))
  const selecionada = internados.find(i => i.id === selId) ?? null

  if (selecionada) {
    return <Ficha internacao={selecionada} boxes={boxes} acoes={acoes} onVoltar={() => setSelId(null)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {([['internados', `Internados (${internados.length})`], ['boxes', 'Boxes'], ['historico', `Histórico (${historico.length})`]] as const).map(([id, rotulo]) => (
            <button key={id} onClick={() => setAba(id)}
              className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition ${
                aba === id ? 'bg-brand/12 text-brand' : 'border border-line bg-surface-2 text-ink-2 hover:text-ink'}`}>
              {rotulo}
            </button>
          ))}
        </div>
        <button onClick={() => setInternando(true)}
          className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
          + Internar pet
        </button>
      </div>

      {aba === 'internados' && (
        internados.length === 0
          ? <p className="py-10 text-center text-[13.5px] text-ink-3">Nenhum animal internado agora. 🐾</p>
          : <div className="grid gap-3 md:grid-cols-2">
              {internados.map(i => <CardInternado key={i.id} i={i} boxes={boxes} onAbrir={() => setSelId(i.id)} />)}
            </div>
      )}

      {aba === 'boxes' && <MapaBoxes boxes={boxes} internados={internados} />}

      {aba === 'historico' && (
        historico.length === 0
          ? <p className="py-10 text-center text-[13.5px] text-ink-3">Nenhuma internação encerrada ainda.</p>
          : (
            <div className="space-y-3">
              <FiltroPeriodo de={histDe} ate={histAte} setDe={setHistDe} setAte={setHistAte}
                total={historicoFiltrado.length} deTodos={historico.length} />
              {historicoFiltrado.length === 0
                ? <p className="py-10 text-center text-[13.5px] text-ink-3">Nenhuma internação encerrada no período selecionado.</p>
                : historicoFiltrado.map(i => <CardHistorico key={i.id} i={i} />)}
            </div>
          )
      )}

      <Modal titulo="Internar pet" aberto={internando} onFechar={() => setInternando(false)}>
        <FormInternar data={data} boxes={boxes} internados={internados}
          onCancelar={() => setInternando(false)}
          onSalvar={async d => { await acoes.internarPet(d); setInternando(false) }} />
      </Modal>
    </div>
  )
}

function CardInternado({ i, boxes, onAbrir }: { i: TInternacao; boxes: Box[]; onAbrir: () => void }) {
  const box = boxes.find(b => b.id === i.box)
  const pendentes = i.medicacoes.reduce((s, m) => s + m.horarios.filter(h => !h.aplicado).length, 0)
  const ultimo = i.parametros[i.parametros.length - 1]

  return (
    <button onClick={onAbrir} className="rounded-xl border border-line bg-surface-1 p-4 text-left transition hover:border-brand/50">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14.5px] font-semibold">{i.petNome}</span>
            <span className="text-[11.5px]">{i.especie === 'gato' ? '🐱' : '🐶'}</span>
          </div>
          <div className="mt-0.5 text-[12px] text-ink-3">{i.tutorNome}</div>
        </div>
        {box && <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10.5px] font-medium ${FINAL_CLS[box.finalidade]}`}>{box.nome}</span>}
      </div>
      <div className="mt-2 line-clamp-2 text-[12.5px] text-ink-2">{i.motivo}</div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2.5 text-[11.5px] text-ink-3">
        <span>{diasInternado(i)}º dia · desde {fmt(i.entrada)}</span>
        {ultimo?.temperatura != null && <span>T {ultimo.temperatura}°C</span>}
        {pendentes > 0
          ? <span className="text-warn">● {pendentes} med. pendente{pendentes === 1 ? '' : 's'}</span>
          : <span className="text-ok">● medicação em dia</span>}
      </div>
    </button>
  )
}

// Filtro por período do histórico — presets + intervalo De/Até (não muda os cards)
function FiltroPeriodo({ de, ate, setDe, setAte, total, deTodos }: {
  de: string; ate: string; setDe: (v: string) => void; setAte: (v: string) => void
  total: number; deTodos: number
}) {
  const hoje = hojeStr()
  const menos = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }
  const aplicar = (n: number | null) => { if (n === null) { setDe(''); setAte('') } else { setDe(menos(n)); setAte(hoje) } }
  const presets: [string, number | null][] = [['Tudo', null], ['7 dias', 7], ['30 dias', 30], ['90 dias', 90]]
  const ativo = (n: number | null) => n === null ? (!de && !ate) : (de === menos(n) && ate === hoje)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-1 p-3">
      <div className="flex flex-wrap gap-1.5">
        {presets.map(([r, n]) => (
          <button key={r} onClick={() => aplicar(n)}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
              ativo(n) ? 'bg-brand/12 text-brand' : 'border border-line bg-surface-2 text-ink-2 hover:text-ink'}`}>
            {r}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-[12px] text-ink-3">De
          <input type="date" value={de} max={ate || hoje} onChange={e => setDe(e.target.value)} className={inputCls} />
        </label>
        <label className="flex items-center gap-1.5 text-[12px] text-ink-3">Até
          <input type="date" value={ate} min={de || undefined} onChange={e => setAte(e.target.value)} className={inputCls} />
        </label>
        <span className="text-[12px] text-ink-3">{total} de {deTodos}</span>
      </div>
    </div>
  )
}

function CardHistorico({ i }: { i: TInternacao }) {
  return (
    <div className="rounded-xl border border-line bg-surface-1 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold">{i.petNome}</span>
            <span className="rounded-md border border-ink-3/40 bg-surface-2 px-2 py-0.5 text-[10.5px] font-medium text-ink-2">Alta</span>
          </div>
          <div className="mt-0.5 text-[12px] text-ink-3">{i.tutorNome} · {i.motivo}</div>
        </div>
        <div className="shrink-0 text-right text-[11.5px] text-ink-3">
          <div>{fmt(i.entrada)} → {i.saida ? fmt(i.saida) : '—'}</div>
          <div className="text-ink-2">{diasInternado(i)} {diasInternado(i) === 1 ? 'diária' : 'diárias'} · {brl(diasInternado(i) * i.valorDiaria)}</div>
        </div>
      </div>
    </div>
  )
}

function MapaBoxes({ boxes, internados }: { boxes: Box[]; internados: TInternacao[] }) {
  if (boxes.length === 0) {
    return <p className="py-10 text-center text-[13.5px] text-ink-3">Nenhum box cadastrado.</p>
  }
  const ocupados = internados.filter(i => i.box).length
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <div className="text-[11.5px] uppercase tracking-wider text-ink-3">Ocupação</div>
          <div className="mt-1.5 text-[22px] font-semibold tabular-nums text-brand">{ocupados}/{boxes.length}</div>
        </div>
        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <div className="text-[11.5px] uppercase tracking-wider text-ink-3">Livres</div>
          <div className="mt-1.5 text-[22px] font-semibold tabular-nums">{boxes.length - ocupados}</div>
        </div>
        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <div className="text-[11.5px] uppercase tracking-wider text-ink-3">Taxa</div>
          <div className="mt-1.5 text-[22px] font-semibold tabular-nums">{Math.round((ocupados / boxes.length) * 100)}%</div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {boxes.map(b => {
          const ocupante = internados.find(i => i.box === b.id)
          return (
            <div key={b.id} className={`rounded-xl border p-4 ${ocupante ? 'border-brand/40 bg-brand/5' : 'border-line bg-surface-1'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[14px] font-semibold">{b.nome}</span>
                <div className="flex flex-wrap gap-1">
                  <span className="rounded-md border border-line bg-surface-2 px-2 py-0.5 text-[10.5px] font-medium text-ink-2">{ESPECIE_BOX[b.especie]}</span>
                  <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-medium ${FINAL_CLS[b.finalidade]}`}>{FINALIDADE_BOX[b.finalidade]}</span>
                </div>
              </div>
              {b.observacao && <div className="mt-1 text-[11px] text-ink-3">{b.observacao}</div>}
              {ocupante
                ? <div className="mt-2 text-[12.5px]">
                    <span className="font-medium">{ocupante.petNome}</span>
                    <span className="text-ink-3"> · {ocupante.tutorNome}</span>
                    <div className="mt-0.5 text-[11.5px] text-ink-3">{diasInternado(ocupante)}º dia</div>
                  </div>
                : <div className="mt-2 text-[12.5px] text-ink-3">Livre</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ------------------------------------------------------------- ficha (detalhe)

function Ficha({ internacao: i, boxes, acoes, onVoltar }: {
  internacao: TInternacao; boxes: Box[]; acoes: Acoes; onVoltar: () => void
}) {
  const [addMed, setAddMed] = useState(false)
  const box = boxes.find(b => b.id === i.box)
  const dias = diasInternado(i)

  return (
    <div className="space-y-4">
      <button onClick={onVoltar} className="text-[12.5px] text-ink-2 transition hover:text-ink">← Voltar aos internados</button>

      <div className="rounded-xl border border-line bg-surface-1 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-semibold">{i.petNome}</span>
              <span>{i.especie === 'gato' ? '🐱' : '🐶'}</span>
              {box && <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-medium ${FINAL_CLS[box.finalidade]}`}>{box.nome}</span>}
            </div>
            <div className="mt-0.5 text-[12.5px] text-ink-3">{i.tutorNome}</div>
            <div className="mt-2 text-[13px] text-ink-2">{i.motivo}</div>
          </div>
          <div className="shrink-0 text-right text-[11.5px] text-ink-3">
            <div>{dias}º dia de internação</div>
            <div>desde {fmt(i.entrada)}{i.previsaoAlta ? ` · previsão ${fmt(i.previsaoAlta)}` : ''}</div>
            {i.profissional && <div className="text-ink-2">{i.profissional}</div>}
            <div className="mt-1 text-ink-2">{brl(dias * i.valorDiaria)} em diárias</div>
          </div>
        </div>
        <div className="mt-3 flex justify-end border-t border-line pt-3">
          <ConfirmButton titulo={`Dar alta — ${i.petNome}`}
            mensagem={`Dar alta a ${i.petNome}? As diárias serão lançadas a receber no Financeiro.`}
            confirmLabel="Dar alta" onConfirm={() => { acoes.darAlta(i.id); onVoltar() }}
            className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
            Dar alta
          </ConfirmButton>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MapaExecucao internacao={i} acoes={acoes} onAdicionar={() => setAddMed(true)} />
        <Parametros internacao={i} acoes={acoes} />
      </div>

      <Modal titulo="Adicionar medicação" aberto={addMed} onFechar={() => setAddMed(false)}>
        <FormMedicacao onCancelar={() => setAddMed(false)}
          onSalvar={async d => { await acoes.adicionarMedicacao(i.id, d); setAddMed(false) }} />
      </Modal>
    </div>
  )
}

function MapaExecucao({ internacao: i, acoes, onAdicionar }: {
  internacao: TInternacao; acoes: Acoes; onAdicionar: () => void
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-1 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold">Mapa de execução</h3>
        <button onClick={onAdicionar} className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
          + Medicação
        </button>
      </div>
      {i.medicacoes.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-ink-3">Nenhuma medicação aprazada. Adicione uma para gerar os horários.</p>
      ) : (
        <div className="space-y-3">
          {i.medicacoes.map(m => (
            <div key={m.id} className="rounded-lg border border-line bg-surface-2 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13.5px] font-medium">{m.medicamento}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11.5px] text-ink-3">{m.dose} · {m.via} · {m.intervaloHoras}/{m.intervaloHoras}h</span>
                  <ConfirmButton aria-label={`Remover ${m.medicamento}`}
                    titulo="Remover medicação" mensagem={`Remover ${m.medicamento} do aprazamento?`}
                    confirmLabel="Remover" danger onConfirm={() => acoes.removerMedicacao(i.id, m.id)}
                    className="shrink-0 rounded-md border border-line px-1.5 py-0.5 text-[11px] leading-none text-ink-3 transition hover:border-bad/50 hover:text-bad">
                    ✕
                  </ConfirmButton>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {m.horarios.map((h, idx) => (
                  <button key={idx} onClick={() => acoes.alternarAplicacao(i.id, m.id, idx)}
                    title={h.aplicado ? 'Aplicado — clique para desfazer' : 'Marcar como aplicado'}
                    className={`rounded-md border px-2 py-1 text-[11.5px] font-medium tabular-nums transition ${
                      h.aplicado ? 'border-ok/50 bg-ok/15 text-ok' : 'border-line bg-surface-1 text-ink-2 hover:border-brand/50 hover:text-ink'}`}>
                    {h.aplicado ? '✓ ' : ''}{h.hora}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Parametros({ internacao: i, acoes }: { internacao: TInternacao; acoes: Acoes }) {
  const [temperatura, setTemperatura] = useState('')
  const [fc, setFc] = useState('')
  const [fr, setFr] = useState('')
  const [mucosas, setMucosas] = useState('')
  const [obs, setObs] = useState('')
  const [enviando, setEnviando] = useState(false)

  const num = (v: string) => { const n = Number(v.replace(',', '.')); return v.trim() && !Number.isNaN(n) ? n : undefined }

  const registrar = async () => {
    const d: DadosParametro = {
      temperatura: num(temperatura), fc: num(fc), fr: num(fr),
      mucosas: mucosas.trim() || undefined, obs: obs.trim() || undefined,
    }
    if (d.temperatura == null && d.fc == null && d.fr == null && !d.mucosas && !d.obs) return
    setEnviando(true)
    await acoes.registrarParametro(i.id, d)
    setTemperatura(''); setFc(''); setFr(''); setMucosas(''); setObs(''); setEnviando(false)
  }

  const registros = [...i.parametros].reverse()
  const vazio = !temperatura.trim() && !fc.trim() && !fr.trim() && !mucosas.trim() && !obs.trim()

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-4">
      <h3 className="mb-3 text-[14px] font-semibold">Parâmetros clínicos</h3>
      <div className="grid grid-cols-3 gap-2">
        <input value={temperatura} onChange={e => setTemperatura(e.target.value)} placeholder="Temp °C" className={inputCls} />
        <input value={fc} onChange={e => setFc(e.target.value)} placeholder="FC bpm" className={inputCls} />
        <input value={fr} onChange={e => setFr(e.target.value)} placeholder="FR mpm" className={inputCls} />
      </div>
      <input value={mucosas} onChange={e => setMucosas(e.target.value)} placeholder="Mucosas" className={inputCls + ' mt-2 w-full'} />
      <input value={obs} onChange={e => setObs(e.target.value)} placeholder="Observação" className={inputCls + ' mt-2 w-full'} />
      <button onClick={registrar} disabled={enviando || vazio}
        className="mt-2 w-full rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-50">
        {enviando ? 'Registrando…' : 'Registrar aferição'}
      </button>
      {vazio && <p className="mt-1.5 text-center text-[11.5px] text-ink-3">Preencha ao menos um campo (temperatura, FC, FR, mucosas ou observação).</p>}

      <div className="mt-4 space-y-1.5 border-t border-line pt-3">
        {registros.length === 0
          ? <p className="py-4 text-center text-[12.5px] text-ink-3">Sem aferições ainda.</p>
          : registros.map(p => (
            <div key={p.id} className="rounded-lg border border-line bg-surface-2 px-3 py-2">
              <div className="flex items-center justify-between text-[11.5px] text-ink-3">
                <span>{fmt(p.data)} · {p.hora}</span>
                <span className="flex gap-2 tabular-nums text-ink-2">
                  {p.temperatura != null && <span>T {p.temperatura}°</span>}
                  {p.fc != null && <span>FC {p.fc}</span>}
                  {p.fr != null && <span>FR {p.fr}</span>}
                </span>
              </div>
              {(p.mucosas || p.obs) && (
                <div className="mt-1 text-[12px] text-ink-2">
                  {p.mucosas && <span className="text-ink-3">Mucosas: </span>}{p.mucosas}
                  {p.mucosas && p.obs && ' · '}{p.obs}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}

// ------------------------------------------------------------- formulários (modais)

function FormInternar({ data, boxes, internados, onCancelar, onSalvar }: {
  data: DB; boxes: Box[]; internados: TInternacao[]
  onCancelar: () => void; onSalvar: (d: DadosInternacao) => Promise<void>
}) {
  const pets = data.tutores.flatMap(t => t.pets.map(p => ({ petId: p.id, label: `${p.nome} · ${t.nome}` })))
  const jaInternados = new Set(internados.map(i => i.petId))
  const disponiveis = pets.filter(p => !jaInternados.has(p.petId))
  const boxesLivres = boxes.filter(b => !internados.some(i => i.box === b.id))

  const [petId, setPetId] = useState(disponiveis[0]?.petId ?? '')
  const [motivo, setMotivo] = useState('')
  const [box, setBox] = useState('')
  const [profissional, setProfissional] = useState('')
  const [previsaoAlta, setPrevisaoAlta] = useState('')
  const [valorDiaria, setValorDiaria] = useState('120')
  const [enviando, setEnviando] = useState(false)

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!petId) return
    setEnviando(true)
    await onSalvar({
      petId, motivo: motivo.trim() || 'Internação', box: box || undefined,
      profissional: profissional || undefined, previsaoAlta: previsaoAlta || undefined,
      valorDiaria: Math.max(0, Number(valorDiaria.replace(',', '.')) || 0),
    })
    setEnviando(false)
  }

  if (disponiveis.length === 0) {
    return <p className="py-4 text-center text-[13px] text-ink-3">Todos os pets cadastrados já estão internados.</p>
  }

  return (
    <form onSubmit={submeter} className="space-y-3">
      <Campo label="Pet">
        <select value={petId} onChange={e => setPetId(e.target.value)} className={modalInput}>
          {disponiveis.map(p => <option key={p.petId} value={p.petId}>{p.label}</option>)}
        </select>
      </Campo>
      <Campo label="Motivo (opcional)">
        <input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ex.: pós-operatório, fluidoterapia…" className={modalInput} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Box">
          <select value={box} onChange={e => setBox(e.target.value)} className={modalInput}>
            <option value="">Sem box</option>
            {boxesLivres.map(b => <option key={b.id} value={b.id}>{b.nome} — {rotuloBox(b)}</option>)}
          </select>
        </Campo>
        <Campo label="Responsável">
          <select value={profissional} onChange={e => setProfissional(e.target.value)} className={modalInput}>
            <option value="">—</option>
            {(data.profissionais ?? []).map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
          </select>
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Previsão de alta">
          <input type="date" value={previsaoAlta} onChange={e => setPrevisaoAlta(e.target.value)} className={modalInput} />
        </Campo>
        <Campo label="Diária (R$)">
          <input type="number" min={0} value={valorDiaria} onChange={e => setValorDiaria(e.target.value)} className={modalInput} />
        </Campo>
      </div>
      <AcoesForm onCancelar={onCancelar} enviando={enviando} rotulo="Internar" />
    </form>
  )
}

function FormMedicacao({ onCancelar, onSalvar }: {
  onCancelar: () => void; onSalvar: (d: DadosMedicacao) => Promise<void>
}) {
  const [medicamento, setMedicamento] = useState('')
  const [dose, setDose] = useState('')
  const [via, setVia] = useState('IV')
  const [intervaloHoras, setIntervaloHoras] = useState('8')
  const [inicio, setInicio] = useState('08:00')
  const [enviando, setEnviando] = useState(false)

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!medicamento.trim()) return
    setEnviando(true)
    await onSalvar({
      medicamento: medicamento.trim(), dose: dose.trim(), via,
      intervaloHoras: Math.max(1, Number(intervaloHoras) || 1), inicio,
    })
    setEnviando(false)
  }

  return (
    <form onSubmit={submeter} className="space-y-3">
      <Campo label="Medicamento">
        <input value={medicamento} onChange={e => setMedicamento(e.target.value)} required placeholder="Ex.: Dipirona" className={modalInput} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Dose">
          <input value={dose} onChange={e => setDose(e.target.value)} placeholder="25 mg/kg" className={modalInput} />
        </Campo>
        <Campo label="Via">
          <select value={via} onChange={e => setVia(e.target.value)} className={modalInput}>
            {['IV', 'IM', 'SC', 'VO', 'Tópico'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Intervalo (horas)">
          <input type="number" min={1} max={24} value={intervaloHoras} onChange={e => setIntervaloHoras(e.target.value)} className={modalInput} />
        </Campo>
        <Campo label="1ª aplicação">
          <input type="time" value={inicio} onChange={e => setInicio(e.target.value)} className={modalInput} />
        </Campo>
      </div>
      <p className="text-[11.5px] text-ink-3">O aprazamento das próximas 24h é gerado automaticamente a partir do intervalo.</p>
      <AcoesForm onCancelar={onCancelar} enviando={enviando} rotulo="Aprazar" />
    </form>
  )
}
