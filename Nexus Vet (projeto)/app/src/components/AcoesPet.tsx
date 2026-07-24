import { useState, type FormEvent } from 'react'
import type { DB, Pet } from '../data'
import type { Acoes } from '../App'
import Modal, { Campo, inputCls, Acoes as AcoesForm } from './Modal'
import EmitirDocumento from './EmitirDocumento'
import { FormAtendimento, FormDose, FormExame } from './Formularios'
import { comprovanteVacinacao } from '../lib/imprimir'

// Quadro de ações da ficha do pet — inspirado no "Adicionar" do SimplesVet, que
// deixa na cara tudo que dá pra registrar no animal. Aqui cada tile tem um
// subtítulo explicando a ação (mais explicativo que o do concorrente).

const hoje = () => new Date().toISOString().slice(0, 10)

type Aberto =
  | null | 'atendimento' | 'peso' | 'vacina' | 'exame'
  | 'observacao' | 'patologia' | 'internacao'

export default function AcoesPet({ pet, tutorNome, data, acoes }: {
  pet: Pet; tutorNome: string; data: DB; acoes: Acoes
}) {
  const [aberto, setAberto] = useState<Aberto>(null)
  const fechar = () => setAberto(null)

  const internacaoAtiva = (data.internacoes ?? []).find(i => i.petId === pet.id && i.status === 'internado')

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-4">
      <h3 className="mb-3 px-1 text-[12.5px] font-semibold uppercase tracking-wider text-ink-3">
        Adicionar ao prontuário
      </h3>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <Tile icon="🩺" cor="#00BFA5" titulo="Atendimento" sub="Consulta no prontuário"
          onClick={() => setAberto('atendimento')} />
        <Tile icon="⚖️" cor="#e0a63a" titulo="Peso" sub="Registra a pesagem do dia"
          onClick={() => setAberto('peso')} />
        <Tile icon="💉" cor="#2fbf71" titulo="Vacina" sub="Aplica dose e agenda o reforço"
          onClick={() => setAberto('vacina')} />
        <Tile icon="🔬" cor="#e66767" titulo="Exame" sub="Solicita e vai pra ficha"
          onClick={() => setAberto('exame')} />
        <Tile icon="💬" cor="#6aa3e0" titulo="Observação" sub="Nota livre na linha do tempo"
          onClick={() => setAberto('observacao')} />
        <Tile icon="🔖" cor="#b07de0" titulo="Patologia" sub="Diagnóstico / achado clínico"
          onClick={() => setAberto('patologia')} />

        <EmitirDocumento pet={pet} tutorNome={tutorNome} clinica={acoes.clinicaNome} modelos={data.modelos ?? []}
          trigger={abrir => (
            <Tile icon="📄" cor="#4bb3a6" titulo="Documento" sub="Receita, atestado ou termo" onClick={abrir} />
          )} />

        <Tile icon="🧾" cor="#8a94a8" titulo="Comprovante de vacina" sub="Carteirinha em PDF"
          onClick={() => comprovanteVacinacao({
            clinica: acoes.clinicaNome, tutor: tutorNome, pet: pet.nome, especie: pet.especie, vacinas: pet.vacinas,
          })} />

        {internacaoAtiva ? (
          <Tile icon="🏥" cor="#c0567a" titulo="Internado" sub={internacaoAtiva.motivo} disabled />
        ) : (
          <Tile icon="🏥" cor="#c0567a" titulo="Internar" sub="Interna o pet num box"
            onClick={() => setAberto('internacao')} />
        )}
      </div>

      {/* modais */}
      <Modal titulo={`Novo atendimento · ${pet.nome}`} aberto={aberto === 'atendimento'} onFechar={fechar}>
        <FormAtendimento pet={pet} tipos={data.tiposAtendimento ?? []} onCancelar={fechar}
          onSalvar={async d => { await acoes.registrarAtendimento(pet.id, d); fechar() }} />
      </Modal>

      <Modal titulo={`Registrar peso · ${pet.nome}`} aberto={aberto === 'peso'} onFechar={fechar}>
        <FormPeso pesoAtual={pet.peso} onCancelar={fechar}
          onSalvar={async ({ peso, data: dt }) => {
            await acoes.registrarAtendimento(pet.id, { data: dt, profissional: '—', tipo: 'Pesagem', motivo: 'Registro de peso', peso })
            fechar()
          }} />
      </Modal>

      <Modal titulo={`Aplicar vacina · ${pet.nome}`} aberto={aberto === 'vacina'} onFechar={fechar}>
        <FormDose especie={pet.especie} protocolos={data.protocolos ?? []} onCancelar={fechar}
          onSalvar={async d => { await acoes.registrarDose(pet.id, d); fechar() }} />
      </Modal>

      <Modal titulo={`Solicitar exame · ${pet.nome}`} aberto={aberto === 'exame'} onFechar={fechar}>
        <FormExame petIds={[{ id: pet.id, nome: pet.nome }]} onCancel={fechar}
          onSubmit={async d => { await acoes.criarExame(d); fechar() }} />
      </Modal>

      <Modal titulo={`Nova observação · ${pet.nome}`} aberto={aberto === 'observacao'} onFechar={fechar}>
        <FormNota rotulo="Observação" placeholder="Tutora relatou melhora após 3 dias…" onCancelar={fechar}
          onSalvar={async texto => { await acoes.registrarNotaClinica(pet.id, { tipo: 'observacao', texto }); fechar() }} />
      </Modal>

      <Modal titulo={`Nova patologia · ${pet.nome}`} aberto={aberto === 'patologia'} onFechar={fechar}>
        <FormNota rotulo="Patologia / diagnóstico" placeholder="Dermatite alérgica de contato" onCancelar={fechar}
          onSalvar={async texto => { await acoes.registrarNotaClinica(pet.id, { tipo: 'patologia', texto }); fechar() }} />
      </Modal>

      <Modal titulo={`Internar · ${pet.nome}`} aberto={aberto === 'internacao'} onFechar={fechar}>
        <FormInternarRapido data={data} onCancelar={fechar}
          onSalvar={async d => { await acoes.internarPet({ ...d, petId: pet.id }); fechar() }} />
      </Modal>
    </div>
  )
}

function Tile({ icon, cor, titulo, sub, onClick, disabled }: {
  icon: string; cor: string; titulo: string; sub: string; onClick?: () => void; disabled?: boolean
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="group flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-3 text-left transition hover:border-brand/50 disabled:cursor-not-allowed disabled:opacity-55">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[16px]"
        style={{ background: cor + '22', color: cor }}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold text-ink">{titulo}</span>
        <span className="block truncate text-[11px] text-ink-3">{sub}</span>
      </span>
    </button>
  )
}

/* ---------- forminhas compactas locais ---------- */

function FormPeso({ pesoAtual, onSalvar, onCancelar }: {
  pesoAtual?: number; onSalvar: (d: { peso: number; data: string }) => Promise<void>; onCancelar: () => void
}) {
  const [peso, setPeso] = useState(pesoAtual ? String(pesoAtual) : '')
  const [d, setD] = useState(hoje())
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const v = Number(peso.replace(',', '.'))
    if (!v || v <= 0) { setErro('Informe um peso maior que zero.'); return }
    setEnviando(true); setErro(null)
    try { await onSalvar({ peso: v, data: d }) }
    catch (err) { setErro(err instanceof Error ? err.message : 'Não consegui salvar.'); setEnviando(false) }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <p className="text-[12.5px] text-ink-3">Entra na curva de evolução de peso e na linha do tempo.</p>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Peso (kg)">
          <input inputMode="decimal" value={peso} required onChange={e => setPeso(e.target.value)}
            placeholder="32,4" className={inputCls} />
        </Campo>
        <Campo label="Data">
          <input type="date" value={d} max={hoje()} required onChange={e => setD(e.target.value)} className={inputCls} />
        </Campo>
      </div>
      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <AcoesForm onCancelar={onCancelar} enviando={enviando} rotulo="Registrar peso" />
    </form>
  )
}

function FormNota({ rotulo, placeholder, onSalvar, onCancelar }: {
  rotulo: string; placeholder: string; onSalvar: (texto: string) => Promise<void>; onCancelar: () => void
}) {
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!texto.trim()) { setErro('Escreva algo antes de salvar.'); return }
    setEnviando(true); setErro(null)
    try { await onSalvar(texto.trim()) }
    catch (err) { setErro(err instanceof Error ? err.message : 'Não consegui salvar.'); setEnviando(false) }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo label={rotulo}>
        <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder={placeholder}
          className={inputCls + ' min-h-[96px] resize-y'} />
      </Campo>
      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <AcoesForm onCancelar={onCancelar} enviando={enviando} rotulo="Salvar" />
    </form>
  )
}

function FormInternarRapido({ data, onSalvar, onCancelar }: {
  data: DB
  onSalvar: (d: { motivo: string; box?: string; profissional?: string; previsaoAlta?: string; valorDiaria: number }) => Promise<void>
  onCancelar: () => void
}) {
  const ocupados = new Set((data.internacoes ?? []).filter(i => i.status === 'internado' && i.box).map(i => i.box))
  const livres = (data.boxes ?? []).filter(b => !ocupados.has(b.id))
  const [f, setF] = useState({ motivo: '', box: '', profissional: '', previsaoAlta: '', valorDiaria: '120' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    try {
      await onSalvar({
        motivo: f.motivo.trim() || 'Internação',
        box: f.box || undefined,
        profissional: f.profissional.trim() || undefined,
        previsaoAlta: f.previsaoAlta || undefined,
        valorDiaria: Number(f.valorDiaria.replace(',', '.')) || 0,
      })
    } catch (err) { setErro(err instanceof Error ? err.message : 'Não consegui internar.'); setEnviando(false) }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo label="Motivo da internação (opcional)">
        <input value={f.motivo} onChange={set('motivo')}
          placeholder="Pós-operatório — observação 24h" className={inputCls} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Box (opcional)">
          <select value={f.box} onChange={set('box')} className={inputCls}>
            <option value="">Sem box definido</option>
            {livres.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
          </select>
        </Campo>
        <Campo label="Diária (R$)">
          <input inputMode="decimal" value={f.valorDiaria} onChange={set('valorDiaria')}
            placeholder="120" className={inputCls} />
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Responsável (opcional)">
          <select value={f.profissional} onChange={set('profissional')} className={inputCls}>
            <option value="">—</option>
            {(data.profissionais ?? []).map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
          </select>
        </Campo>
        <Campo label="Previsão de alta (opcional)">
          <input type="date" value={f.previsaoAlta} onChange={set('previsaoAlta')} className={inputCls} />
        </Campo>
      </div>
      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <AcoesForm onCancelar={onCancelar} enviando={enviando} rotulo="Internar" />
    </form>
  )
}
