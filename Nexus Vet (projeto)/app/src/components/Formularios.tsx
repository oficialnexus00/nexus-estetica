import { useState, type FormEvent } from 'react'
import { Campo, inputCls, Acoes } from './Modal'
import type { DB, Especie, Tutor, Pet, InventoryItem, ProtocoloVacina, ModeloDocumento } from '../data'

const hoje = () => new Date().toISOString().slice(0, 10)

// Vacinas mais usadas, por espécie (referência de mercado — o protocolo real
// é o do veterinário da clínica; ver stack/dados-vacina-e-whatsapp.md)
const VACINAS: Record<Especie, string[]> = {
  cao: ['V8', 'V10', 'Antirrábica', 'Giárdia', 'Gripe canina'],
  gato: ['Tríplice felina', 'Quádrupla felina', 'Quíntupla felina (FeLV)', 'Antirrábica'],
}

/* ------------------------------------------------------ registrar dose */

export type DadosDose = {
  vacina: string; dataAplicacao: string; reforcoMeses?: number; intervaloDias?: number
}

export function FormDose({ especie, protocolos = [], onSalvar, onCancelar }: {
  especie: Especie; protocolos?: ProtocoloVacina[]
  onSalvar: (d: DadosDose) => Promise<void>; onCancelar: () => void
}) {
  // Protocolos da clínica que valem para esta espécie; se não houver, cai na lista padrão
  const doEspecie = protocolos.filter(p => p.ativo && (p.especie === especie || p.especie === 'ambos'))
  const opcoes = doEspecie.length ? doEspecie.map(p => p.nome) : (VACINAS[especie] ?? VACINAS.cao)

  const [vacina, setVacina] = useState(opcoes[0])
  const [dataAplicacao, setData] = useState(hoje())
  const [esquema, setEsquema] = useState<'anual' | 'filhote'>('anual')
  const [intervaloDias, setIntervalo] = useState(30)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Protocolo da vacina escolhida (se a clínica configurou)
  const protocolo = doEspecie.find(p => p.nome === vacina)
  const temFilhote = protocolo ? protocolo.doseFilhoteDias != null : true
  const esquemaEfetivo = temFilhote ? esquema : 'anual'
  // Intervalos: do protocolo quando existe; senão o padrão/manual
  const reforcoMeses = protocolo?.reforcoMeses ?? 12
  const filhoteDias = protocolo?.doseFilhoteDias ?? intervaloDias

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    try {
      await onSalvar({
        vacina,
        dataAplicacao,
        ...(esquemaEfetivo === 'filhote' ? { intervaloDias: filhoteDias } : { reforcoMeses }),
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo label="Vacina">
        <select value={vacina} onChange={e => { setVacina(e.target.value); setEsquema('anual') }} className={inputCls}>
          {opcoes.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </Campo>

      <Campo label="Data da aplicação">
        <input type="date" value={dataAplicacao} max={hoje()} required
          onChange={e => setData(e.target.value)} className={inputCls} />
      </Campo>

      {temFilhote && (
        <Campo label="Esquema">
          <div className="flex gap-2">
            {([['anual', 'Reforço'], ['filhote', 'Dose de filhote']] as const).map(([k, rotulo]) => (
              <button key={k} type="button" onClick={() => setEsquema(k)}
                className={`flex-1 rounded-lg border px-3 py-2 text-[12.5px] font-medium transition ${
                  esquema === k ? 'border-brand bg-brand/12 text-brand' : 'border-line bg-surface-2 text-ink-2'}`}>
                {rotulo}
              </button>
            ))}
          </div>
        </Campo>
      )}

      {/* Sem protocolo configurado + esquema filhote → intervalo manual (fallback) */}
      {!protocolo && esquema === 'filhote' && (
        <Campo label="Próxima dose em (dias)">
          <input type="number" min={7} max={90} value={intervaloDias}
            onChange={e => setIntervalo(Number(e.target.value))} className={inputCls} />
        </Campo>
      )}

      <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] text-ink-2">
        {protocolo
          ? (esquemaEfetivo === 'filhote'
              ? `Protocolo da clínica: próxima dose em ${filhoteDias} dias.`
              : `Protocolo da clínica: próximo reforço em ${reforcoMeses % 12 === 0 ? `${reforcoMeses / 12} ano${reforcoMeses > 12 ? 's' : ''}` : `${reforcoMeses} meses`}.`)
          : 'A próxima dose é calculada automaticamente e entra na fila de lembretes da Bia.'}
      </p>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancelar} enviando={enviando} rotulo="Registrar dose" />
    </form>
  )
}

/* --------------------------------------------- protocolo de vacina (clínica) */

export type DadosProtocolo = {
  nome: string; especie: Especie | 'ambos'; reforcoMeses: number; doseFilhoteDias?: number
}

export function FormProtocolo({ protocolo, onSalvar, onCancelar }: {
  protocolo?: ProtocoloVacina
  onSalvar: (d: DadosProtocolo) => Promise<void>
  onCancelar: () => void
}) {
  const [nome, setNome] = useState(protocolo?.nome ?? '')
  const [especie, setEspecie] = useState<Especie | 'ambos'>(protocolo?.especie ?? 'cao')
  const [reforcoMeses, setReforco] = useState(protocolo?.reforcoMeses ?? 12)
  const [temFilhote, setTemFilhote] = useState(protocolo?.doseFilhoteDias != null)
  const [doseFilhoteDias, setFilhote] = useState(protocolo?.doseFilhoteDias ?? 21)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim()) { setErro('Dê um nome à vacina.'); return }
    if (reforcoMeses <= 0) { setErro('O reforço precisa ser de pelo menos 1 mês.'); return }
    setEnviando(true); setErro(null)
    try {
      await onSalvar({
        nome: nome.trim(),
        especie,
        reforcoMeses: Number(reforcoMeses),
        doseFilhoteDias: temFilhote ? Number(doseFilhoteDias) : undefined,
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo label="Nome da vacina">
        <input value={nome} onChange={e => setNome(e.target.value)} placeholder="V10, Antirrábica, Giárdia…"
          className={inputCls} />
      </Campo>

      <Campo label="Espécie">
        <select value={especie} onChange={e => setEspecie(e.target.value as Especie | 'ambos')} className={inputCls}>
          <option value="cao">Cão</option>
          <option value="gato">Gato</option>
          <option value="ambos">Ambos</option>
        </select>
      </Campo>

      <Campo label="Reforço a cada (meses)">
        <input type="number" min={1} max={60} value={reforcoMeses}
          onChange={e => setReforco(Number(e.target.value))} className={inputCls} />
      </Campo>

      <label className="flex items-center gap-2 text-[13px] text-ink-2">
        <input type="checkbox" checked={temFilhote} onChange={e => setTemFilhote(e.target.checked)}
          className="h-4 w-4 rounded border-line accent-brand" />
        Tem série de filhote (doses seguidas antes do reforço anual)
      </label>

      {temFilhote && (
        <Campo label="Intervalo entre doses de filhote (dias)">
          <input type="number" min={7} max={90} value={doseFilhoteDias}
            onChange={e => setFilhote(Number(e.target.value))} className={inputCls} />
        </Campo>
      )}

      <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] text-ink-2">
        Ao registrar uma dose desta vacina, o sistema já sugere a próxima data com base neste protocolo.
      </p>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancelar} enviando={enviando} rotulo={protocolo ? 'Salvar protocolo' : 'Criar protocolo'} />
    </form>
  )
}

/* --------------------------------------------- modelo de documento (clínica) */

export type DadosModelo = {
  nome: string; tipo: ModeloDocumento['tipo']; conteudo: string
}

const TIPOS_MODELO: { valor: ModeloDocumento['tipo']; rotulo: string }[] = [
  { valor: 'receita', rotulo: 'Receita' },
  { valor: 'atestado', rotulo: 'Atestado' },
  { valor: 'termo', rotulo: 'Termo' },
  { valor: 'documento', rotulo: 'Documento' },
]

export function FormModelo({ modelo, onSalvar, onCancelar }: {
  modelo?: ModeloDocumento
  onSalvar: (d: DadosModelo) => Promise<void>
  onCancelar: () => void
}) {
  const [nome, setNome] = useState(modelo?.nome ?? '')
  const [tipo, setTipo] = useState<ModeloDocumento['tipo']>(modelo?.tipo ?? 'receita')
  const [conteudo, setConteudo] = useState(modelo?.conteudo ?? '')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim()) { setErro('Dê um nome ao modelo.'); return }
    if (!conteudo.trim()) { setErro('Escreva o conteúdo do modelo.'); return }
    setEnviando(true); setErro(null)
    try {
      await onSalvar({ nome: nome.trim(), tipo, conteudo })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Nome do modelo">
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Receita padrão" className={inputCls} />
        </Campo>
        <Campo label="Tipo">
          <select value={tipo} onChange={e => setTipo(e.target.value as ModeloDocumento['tipo'])} className={inputCls}>
            {TIPOS_MODELO.map(t => <option key={t.valor} value={t.valor}>{t.rotulo}</option>)}
          </select>
        </Campo>
      </div>

      <Campo label="Conteúdo">
        <textarea value={conteudo} onChange={e => setConteudo(e.target.value)} rows={7}
          className={inputCls + ' resize-y font-mono text-[12.5px]'}
          placeholder="Texto do documento…" />
      </Campo>

      <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[11.5px] text-ink-2">
        Use os marcadores: <code>{'{pet}'}</code> <code>{'{tutor}'}</code> <code>{'{especie}'}</code>{' '}
        <code>{'{raca}'}</code> <code>{'{idade}'}</code> <code>{'{data}'}</code> <code>{'{clinica}'}</code> —
        são preenchidos ao emitir.
      </p>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancelar} enviando={enviando} rotulo={modelo ? 'Salvar modelo' : 'Criar modelo'} />
    </form>
  )
}

/* -------------------------------------------------- novo tutor com pet */

export type DadosTutorPet = {
  nome: string; telefone: string; cpf?: string
  email?: string; nascimento?: string; endereco?: string
  pet: { nome: string; especie: Especie; raca?: string; nascimento?: string; microchip?: string; pedigree?: boolean; sexo?: 'macho' | 'femea'; pelagem?: string }
}

export function FormTutor({ onSalvar, onCancelar }: {
  onSalvar: (d: DadosTutorPet) => Promise<void>; onCancelar: () => void
}) {
  const [f, setF] = useState({ nome: '', telefone: '', cpf: '', email: '', nascTutor: '', endereco: '', petNome: '', especie: 'cao' as Especie, raca: '', nascimento: '', microchip: '', sexo: '', pelagem: '' })
  const [pedigree, setPedigree] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    try {
      await onSalvar({
        nome: f.nome.trim(),
        telefone: f.telefone.replace(/\D/g, ''),
        cpf: f.cpf.replace(/\D/g, '') || undefined,
        email: f.email.trim() || undefined,
        nascimento: f.nascTutor || undefined,
        endereco: f.endereco.trim() || undefined,
        pet: {
          nome: f.petNome.trim(), especie: f.especie,
          raca: f.raca.trim() || undefined, nascimento: f.nascimento || undefined,
          microchip: f.microchip.trim() || undefined, pedigree,
          sexo: (f.sexo || undefined) as 'macho' | 'femea' | undefined,
          pelagem: f.pelagem.trim() || undefined,
        },
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo label="Nome do tutor">
        <input value={f.nome} onChange={set('nome')} required placeholder="Maria Silva" className={inputCls} />
      </Campo>
      <Campo label="WhatsApp (com DDD)">
        <input value={f.telefone} onChange={set('telefone')} required placeholder="47 99999-0000" className={inputCls} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="E-mail (opcional)">
          <input type="email" value={f.email} onChange={set('email')} placeholder="voce@email.com" className={inputCls} />
        </Campo>
        <Campo label="Nascimento (opcional)">
          <input type="date" value={f.nascTutor} max={hoje()} onChange={set('nascTutor')} className={inputCls} />
        </Campo>
      </div>
      <Campo label="CPF (opcional)">
        <input value={f.cpf} onChange={set('cpf')} placeholder="000.000.000-00" className={inputCls} />
      </Campo>
      <Campo label="Endereço (opcional)">
        <input value={f.endereco} onChange={set('endereco')} placeholder="Rua, número — cidade/UF" className={inputCls} />
      </Campo>

      <div className="!mt-5 border-t border-line pt-4">
        <p className="mb-3 text-[12px] font-medium uppercase tracking-wider text-ink-3">Primeiro pet</p>
        <div className="space-y-3">
          <Campo label="Nome do pet">
            <input value={f.petNome} onChange={set('petNome')} required placeholder="Thor" className={inputCls} />
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Espécie">
              <select value={f.especie} onChange={set('especie')} className={inputCls}>
                <option value="cao">Cão</option>
                <option value="gato">Gato</option>
              </select>
            </Campo>
            <Campo label="Raça">
              <input value={f.raca} onChange={set('raca')} placeholder="SRD" className={inputCls} />
            </Campo>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Sexo (opcional)">
              <select value={f.sexo} onChange={set('sexo')} className={inputCls}>
                <option value="">—</option>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
            </Campo>
            <Campo label="Pelagem / cor (opcional)">
              <input value={f.pelagem} onChange={set('pelagem')} placeholder="Ex.: Caramelo" className={inputCls} />
            </Campo>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Nascimento (opcional)">
              <input type="date" value={f.nascimento} max={hoje()} onChange={set('nascimento')} className={inputCls} />
            </Campo>
            <Campo label="Nº do microchip (opcional)">
              <input value={f.microchip} onChange={set('microchip')} placeholder="000000000000000" className={inputCls} />
            </Campo>
          </div>
          <Campo label="Pedigree">
            <button type="button" onClick={() => setPedigree(v => !v)}
              className={`w-full rounded-lg border px-3 py-2 text-[13px] font-medium transition ${
                pedigree ? 'border-brand bg-brand/12 text-brand' : 'border-line bg-surface-2 text-ink-2 hover:text-ink'}`}>
              {pedigree ? '✓ Com pedigree' : 'Sem pedigree'}
            </button>
          </Campo>
        </div>
      </div>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancelar} enviando={enviando} rotulo="Cadastrar" />
    </form>
  )
}

/* ------------------------------------------------------ lançamento */

export type DadosLancamento = {
  tipo: 'receber' | 'pagar'; descricao: string; categoria?: string
  valor: number; vencimento: string; tutorId?: string; tutorNome?: string
}

export function FormLancamento({ dados, onSalvar, onCancelar }: {
  dados: DB; onSalvar: (d: DadosLancamento) => Promise<void>; onCancelar: () => void
}) {
  const [tipo, setTipo] = useState<'receber' | 'pagar'>('receber')
  const [f, setF] = useState({ descricao: '', categoria: '', valor: '', vencimento: hoje(), tutorId: '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const valor = Number(f.valor.replace(/\./g, '').replace(',', '.'))
    if (!valor || valor <= 0) { setErro('Informe um valor maior que zero.'); return }
    setEnviando(true); setErro(null)
    try {
      const tutor = dados.tutores.find(t => t.id === f.tutorId)
      await onSalvar({
        tipo, descricao: f.descricao.trim(), categoria: f.categoria.trim() || undefined,
        valor, vencimento: f.vencimento,
        tutorId: f.tutorId || undefined, tutorNome: tutor?.nome,
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <div className="flex gap-2">
        {([['receber', 'A receber'], ['pagar', 'A pagar']] as const).map(([k, rotulo]) => (
          <button key={k} type="button" onClick={() => setTipo(k)}
            className={`flex-1 rounded-lg border px-3 py-2 text-[12.5px] font-medium transition ${
              tipo === k ? 'border-brand bg-brand/12 text-brand' : 'border-line bg-surface-2 text-ink-2'}`}>
            {rotulo}
          </button>
        ))}
      </div>

      <Campo label="Descrição">
        <input value={f.descricao} required onChange={set('descricao')}
          placeholder={tipo === 'receber' ? 'Consulta clínica' : 'Fornecedor — vacinas'} className={inputCls} />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Valor (R$)">
          <input inputMode="decimal" value={f.valor} required onChange={set('valor')}
            placeholder="150,00" className={inputCls} />
        </Campo>
        <Campo label="Vencimento">
          <input type="date" value={f.vencimento} required onChange={set('vencimento')} className={inputCls} />
        </Campo>
      </div>

      <Campo label="Categoria (opcional)">
        <input value={f.categoria} onChange={set('categoria')}
          placeholder={tipo === 'receber' ? 'consulta' : 'insumo'} className={inputCls} />
      </Campo>

      {tipo === 'receber' && (
        <Campo label="Tutor (opcional — permite a Bia cobrar)">
          <select value={f.tutorId} onChange={set('tutorId')} className={inputCls}>
            <option value="">Sem vínculo</option>
            {dados.tutores.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </Campo>
      )}

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancelar} enviando={enviando} rotulo="Lançar" />
    </form>
  )
}

/* --------------------------------------------------- novo atendimento */

export type DadosAtendimento = {
  data: string; profissional: string; tipo?: string; motivo: string
  anamnese?: string; exameFisico?: string; peso?: number; temperatura?: number
  diagnostico?: string; conduta?: string; prescricao?: string
}

const areaCls = inputCls + ' min-h-[64px] resize-y'

export function FormAtendimento({ pet, tipos = [], onSalvar, onCancelar }: {
  pet: Pet; tipos?: string[]; onSalvar: (d: DadosAtendimento) => Promise<void>; onCancelar: () => void
}) {
  const [f, setF] = useState({
    data: hoje(), profissional: 'Dra. Helena', tipo: tipos[0] ?? '', motivo: '', anamnese: '', exameFisico: '',
    peso: pet.peso ? String(pet.peso) : '', temperatura: '',
    diagnostico: '', conduta: '', prescricao: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    try {
      await onSalvar({
        data: f.data, profissional: f.profissional.trim(),
        tipo: f.tipo.trim() || undefined, motivo: f.motivo.trim(),
        anamnese: f.anamnese.trim() || undefined,
        exameFisico: f.exameFisico.trim() || undefined,
        peso: f.peso ? Number(f.peso.replace(',', '.')) : undefined,
        temperatura: f.temperatura ? Number(f.temperatura.replace(',', '.')) : undefined,
        diagnostico: f.diagnostico.trim() || undefined,
        conduta: f.conduta.trim() || undefined,
        prescricao: f.prescricao.trim() || undefined,
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      {pet.alerta && (
        <div className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-[12.5px] text-bad">
          ⚠ Alerta de saúde: {pet.alerta}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Data">
          <input type="date" value={f.data} max={hoje()} required onChange={set('data')} className={inputCls} />
        </Campo>
        <Campo label="Profissional">
          <input value={f.profissional} required onChange={set('profissional')} className={inputCls} />
        </Campo>
      </div>

      {tipos.length > 0 && (
        <Campo label="Tipo de atendimento">
          <select value={f.tipo} onChange={set('tipo')} className={inputCls}>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Campo>
      )}

      <Campo label="Motivo da consulta">
        <input value={f.motivo} required onChange={set('motivo')}
          placeholder="Coceira nas patas" className={inputCls} />
      </Campo>

      <Campo label="Anamnese (o que o tutor relata)">
        <textarea value={f.anamnese} onChange={set('anamnese')} className={areaCls} />
      </Campo>

      <Campo label="Exame físico">
        <textarea value={f.exameFisico} onChange={set('exameFisico')} className={areaCls} />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Peso (kg)">
          <input inputMode="decimal" value={f.peso} placeholder="0,0" onChange={set('peso')} className={inputCls} />
        </Campo>
        <Campo label="Temperatura (°C)">
          <input inputMode="decimal" value={f.temperatura} placeholder="38,5" onChange={set('temperatura')} className={inputCls} />
        </Campo>
      </div>

      <Campo label="Diagnóstico">
        <input value={f.diagnostico} onChange={set('diagnostico')} className={inputCls} />
      </Campo>

      <Campo label="Conduta / orientações">
        <textarea value={f.conduta} onChange={set('conduta')} className={areaCls} />
      </Campo>

      <Campo label="Prescrição (vai na receita impressa)">
        <textarea value={f.prescricao} onChange={set('prescricao')} className={areaCls}
          placeholder={'Medicamento — dose e intervalo\nOutro medicamento — ...'} />
      </Campo>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancelar} enviando={enviando} rotulo="Salvar atendimento" />
    </form>
  )
}

/* ------------------------------------------------------ editar tutor */

export type DadosEditarTutor = {
  nome: string; telefone: string; cpf?: string; etapa: Tutor['etapa']
  email?: string; nascimento?: string; endereco?: string
}

export function FormEditarTutor({ tutor, onSalvar, onCancelar }: {
  tutor: Tutor; onSalvar: (d: DadosEditarTutor) => Promise<void>; onCancelar: () => void
}) {
  const [f, setF] = useState({
    nome: tutor.nome, telefone: tutor.telefone, cpf: '', etapa: tutor.etapa,
    email: tutor.email ?? '', nascimento: tutor.nascimento ?? '', endereco: tutor.endereco ?? '',
  })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    try {
      await onSalvar({
        nome: f.nome.trim(), telefone: f.telefone.trim(), cpf: f.cpf.replace(/\D/g, '') || undefined, etapa: f.etapa,
        email: f.email.trim() || undefined, nascimento: f.nascimento || undefined, endereco: f.endereco.trim() || undefined,
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo label="Nome do tutor">
        <input value={f.nome} required onChange={e => setF({ ...f, nome: e.target.value })} className={inputCls} />
      </Campo>
      <Campo label="WhatsApp (com DDD)">
        <input value={f.telefone} required onChange={e => setF({ ...f, telefone: e.target.value })} className={inputCls} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="E-mail">
          <input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="voce@email.com" className={inputCls} />
        </Campo>
        <Campo label="Nascimento">
          <input type="date" value={f.nascimento} max={hoje()} onChange={e => setF({ ...f, nascimento: e.target.value })} className={inputCls} />
        </Campo>
      </div>
      <Campo label="Endereço">
        <input value={f.endereco} onChange={e => setF({ ...f, endereco: e.target.value })} placeholder="Rua, número — cidade/UF" className={inputCls} />
      </Campo>
      <Campo label="CPF (deixe vazio para manter)">
        <input value={f.cpf} onChange={e => setF({ ...f, cpf: e.target.value })} placeholder="000.000.000-00" className={inputCls} />
      </Campo>
      <Campo label="Etapa no funil">
        <select value={f.etapa} onChange={e => setF({ ...f, etapa: e.target.value as Tutor['etapa'] })} className={inputCls}>
          <option value="lead">Lead</option>
          <option value="agendado">Agendado</option>
          <option value="cliente">Cliente</option>
          <option value="inativo">Inativo</option>
        </select>
      </Campo>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancelar} enviando={enviando} />
    </form>
  )
}

/* -------------------------------------------------------- editar pet */

export type DadosEditarPet = {
  nome: string; especie: Especie; raca?: string; nascimento?: string
  pesoKg?: number; castrado: boolean; alertaSaude?: string
  microchip?: string; pedigree?: boolean; sexo?: 'macho' | 'femea'; pelagem?: string
}

export function FormEditarPet({ pet, onSalvar, onCancelar }: {
  pet: Pet; onSalvar: (d: DadosEditarPet) => Promise<void>; onCancelar: () => void
}) {
  const [f, setF] = useState({
    nome: pet.nome, especie: pet.especie, raca: pet.raca === '—' ? '' : pet.raca,
    nascimento: pet.nascimento, peso: pet.peso ? String(pet.peso) : '',
    castrado: pet.castrado, alerta: pet.alerta ?? '',
    microchip: pet.microchip ?? '', pedigree: pet.pedigree ?? false,
    sexo: pet.sexo ?? '', pelagem: pet.pelagem ?? '',
  })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    try {
      await onSalvar({
        nome: f.nome.trim(), especie: f.especie,
        raca: f.raca.trim() || undefined,
        nascimento: f.nascimento || undefined,
        pesoKg: f.peso ? Number(f.peso.replace(',', '.')) : undefined,
        castrado: f.castrado,
        alertaSaude: f.alerta.trim() || undefined,
        microchip: f.microchip.trim() || undefined,
        pedigree: f.pedigree,
        sexo: (f.sexo || undefined) as 'macho' | 'femea' | undefined,
        pelagem: f.pelagem.trim() || undefined,
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo label="Nome do pet">
        <input value={f.nome} required onChange={e => setF({ ...f, nome: e.target.value })} className={inputCls} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Espécie">
          <select value={f.especie} onChange={e => setF({ ...f, especie: e.target.value as Especie })} className={inputCls}>
            <option value="cao">Cão</option>
            <option value="gato">Gato</option>
          </select>
        </Campo>
        <Campo label="Raça">
          <input value={f.raca} onChange={e => setF({ ...f, raca: e.target.value })} className={inputCls} />
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Nascimento">
          <input type="date" value={f.nascimento} max={hoje()} onChange={e => setF({ ...f, nascimento: e.target.value })} className={inputCls} />
        </Campo>
        <Campo label="Peso (kg)">
          <input inputMode="decimal" value={f.peso} placeholder="0,0" onChange={e => setF({ ...f, peso: e.target.value })} className={inputCls} />
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Sexo">
          <select value={f.sexo} onChange={e => setF({ ...f, sexo: e.target.value })} className={inputCls}>
            <option value="">—</option>
            <option value="macho">Macho</option>
            <option value="femea">Fêmea</option>
          </select>
        </Campo>
        <Campo label="Pelagem / cor">
          <input value={f.pelagem} onChange={e => setF({ ...f, pelagem: e.target.value })} placeholder="Ex.: Caramelo" className={inputCls} />
        </Campo>
      </div>
      <Campo label="Nº do microchip">
        <input value={f.microchip} onChange={e => setF({ ...f, microchip: e.target.value })}
          placeholder="000000000000000" className={inputCls} />
      </Campo>
      <Campo label="Alerta de saúde (alergias, condições)">
        <input value={f.alerta} onChange={e => setF({ ...f, alerta: e.target.value })}
          placeholder="Alergia a carrapaticida" className={inputCls} />
      </Campo>
      <Campo label="Pedigree">
        <button type="button" onClick={() => setF({ ...f, pedigree: !f.pedigree })}
          className={`w-full rounded-lg border px-3 py-2 text-[13px] font-medium transition ${
            f.pedigree ? 'border-brand bg-brand/12 text-brand' : 'border-line bg-surface-2 text-ink-2 hover:text-ink'}`}>
          {f.pedigree ? '✓ Com pedigree' : 'Sem pedigree'}
        </button>
      </Campo>
      <label className="flex cursor-pointer items-center gap-2.5 pt-1">
        <input type="checkbox" checked={f.castrado} onChange={e => setF({ ...f, castrado: e.target.checked })}
          className="h-4 w-4 accent-brand" />
        <span className="text-[13px] text-ink-2">Castrado</span>
      </label>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancelar} enviando={enviando} />
    </form>
  )
}

/* ------------------------------------------------------- agendamento */

export type DadosAgendamento = {
  tutorId: string; petId: string; serviceId: string; data: string; hora: string; profissional: string
}

export function FormAgendamento({ dados, onSalvar, onCancelar }: {
  dados: DB; onSalvar: (d: DadosAgendamento) => Promise<void>; onCancelar: () => void
}) {
  const petsDisponiveis = dados.tutores.flatMap(t => t.pets.map(p => ({ ...p, tutorId: t.id, tutorNome: t.nome })))
  const [petId, setPetId] = useState(petsDisponiveis[0]?.id ?? '')
  const [serviceId, setServiceId] = useState(dados.servicos[0]?.id ?? '')
  const [data, setData] = useState(hoje())
  const [hora, setHora] = useState('09:00')
  const [profissional, setProfissional] = useState('Dra. Helena')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const pet = petsDisponiveis.find(p => p.id === petId)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!pet) { setErro('Selecione um pet.'); return }
    setEnviando(true); setErro(null)
    try {
      await onSalvar({ tutorId: pet.tutorId, petId, serviceId, data, hora, profissional })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  if (petsDisponiveis.length === 0) {
    return (
      <div>
        <p className="text-[13px] text-ink-2">Cadastre um tutor e um pet antes de agendar.</p>
        <button onClick={onCancelar} className="mt-4 w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-[13px] text-ink-2">Fechar</button>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo label="Pet">
        <select value={petId} onChange={e => setPetId(e.target.value)} className={inputCls}>
          {petsDisponiveis.map(p => (
            <option key={p.id} value={p.id}>{p.nome} — {p.tutorNome}</option>
          ))}
        </select>
      </Campo>
      <Campo label="Serviço">
        <select value={serviceId} onChange={e => setServiceId(e.target.value)} className={inputCls}>
          {dados.servicos.map(s => (
            <option key={s.id} value={s.id}>{s.nome} — R$ {s.preco}</option>
          ))}
        </select>
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Data">
          <input type="date" value={data} min={hoje()} required onChange={e => setData(e.target.value)} className={inputCls} />
        </Campo>
        <Campo label="Hora">
          <input type="time" value={hora} required onChange={e => setHora(e.target.value)} className={inputCls} />
        </Campo>
      </div>
      <Campo label="Profissional">
        <input value={profissional} onChange={e => setProfissional(e.target.value)} className={inputCls} />
      </Campo>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancelar} enviando={enviando} rotulo="Agendar" />
    </form>
  )
}

/* -------------------------------------------------------- novo serviço */

export type DadosServico = {
  nome: string; categoria: string; preco: number; duracao: number
}

export function FormServico({ onSalvar, onCancelar }: {
  onSalvar: (d: DadosServico) => Promise<void>; onCancelar: () => void
}) {
  const [f, setF] = useState({ nome: '', categoria: 'consulta', preco: '', duracao: '30' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const preco = Number(f.preco.replace(/\./g, '').replace(',', '.'))
    const duracao = Number(f.duracao)
    if (!preco || preco <= 0) { setErro('Informe um preço maior que zero.'); return }
    if (!duracao || duracao <= 0) { setErro('Informe uma duração maior que zero.'); return }
    setEnviando(true); setErro(null)
    try {
      await onSalvar({ nome: f.nome.trim(), categoria: f.categoria.trim(), preco, duracao })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo label="Nome do serviço">
        <input value={f.nome} onChange={set('nome')} required placeholder="Consulta clínica" className={inputCls} />
      </Campo>

      <Campo label="Categoria">
        <select value={f.categoria} onChange={set('categoria')} className={inputCls}>
          <option value="consulta">Consulta</option>
          <option value="vacina">Vacina</option>
          <option value="banho_tosa">Banho e tosa</option>
          <option value="cirurgia">Cirurgia</option>
          <option value="exame">Exame</option>
          <option value="outro">Outro</option>
        </select>
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Valor (R$)">
          <input inputMode="decimal" value={f.preco} onChange={set('preco')} required placeholder="150,00" className={inputCls} />
        </Campo>
        <Campo label="Duração (min)">
          <input type="number" min={5} value={f.duracao} onChange={set('duracao')} required className={inputCls} />
        </Campo>
      </div>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancelar} enviando={enviando} rotulo="Adicionar serviço" />
    </form>
  )
}

/* ------------------------------------------------------ novo profissional */

export type DadosProfissional = {
  nome: string; especialidade?: string; telefone?: string
}

export function FormProfissional({ onSalvar, onCancelar }: {
  onSalvar: (d: DadosProfissional) => Promise<void>; onCancelar: () => void
}) {
  const [f, setF] = useState({ nome: '', especialidade: '', telefone: '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    try {
      await onSalvar({
        nome: f.nome.trim(),
        especialidade: f.especialidade.trim() || undefined,
        telefone: f.telefone.replace(/\D/g, '') || undefined,
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo label="Nome">
        <input value={f.nome} onChange={set('nome')} required placeholder="Dra. Helena" className={inputCls} />
      </Campo>

      <Campo label="Especialidade (opcional)">
        <input value={f.especialidade} onChange={set('especialidade')} placeholder="Clínica geral" className={inputCls} />
      </Campo>

      <Campo label="WhatsApp (opcional)">
        <input value={f.telefone} onChange={set('telefone')} placeholder="47 99999-0000" className={inputCls} />
      </Campo>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancelar} enviando={enviando} rotulo="Adicionar profissional" />
    </form>
  )
}

/* ------------------------------------------------------ editar serviço */

export type DadosEditarServico = {
  nome: string; categoria: string; preco: number; duracao: number
}

export function FormEditarServico({ servico, onSalvar, onCancelar }: {
  servico: DB['servicos'][0]; onSalvar: (d: DadosEditarServico) => Promise<void>; onCancelar: () => void
}) {
  const [f, setF] = useState({ nome: servico.nome, categoria: servico.categoria, preco: String(servico.preco), duracao: String(servico.duracao) })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const preco = Number(f.preco.replace(/\./g, '').replace(',', '.'))
    const duracao = Number(f.duracao)
    if (!preco || preco <= 0) { setErro('Informe um preço maior que zero.'); return }
    if (!duracao || duracao <= 0) { setErro('Informe uma duração maior que zero.'); return }
    setEnviando(true); setErro(null)
    try {
      await onSalvar({ nome: f.nome.trim(), categoria: f.categoria.trim(), preco, duracao })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo label="Nome do serviço">
        <input value={f.nome} onChange={set('nome')} required placeholder="Consulta clínica" className={inputCls} />
      </Campo>

      <Campo label="Categoria">
        <select value={f.categoria} onChange={set('categoria')} className={inputCls}>
          <option value="consulta">Consulta</option>
          <option value="vacina">Vacina</option>
          <option value="banho_tosa">Banho e tosa</option>
          <option value="cirurgia">Cirurgia</option>
          <option value="exame">Exame</option>
          <option value="outro">Outro</option>
        </select>
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Valor (R$)">
          <input inputMode="decimal" value={f.preco} onChange={set('preco')} required placeholder="150,00" className={inputCls} />
        </Campo>
        <Campo label="Duração (min)">
          <input type="number" min={5} value={f.duracao} onChange={set('duracao')} required className={inputCls} />
        </Campo>
      </div>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancelar} enviando={enviando} />
    </form>
  )
}

/* --------------------------------------------------- editar profissional */

export type DadosEditarProfissional = {
  nome: string; especialidade?: string; telefone?: string
}

export function FormEditarProfissional({ profissional, onSalvar, onCancelar }: {
  profissional: DB['profissionais'][0]; onSalvar: (d: DadosEditarProfissional) => Promise<void>; onCancelar: () => void
}) {
  const [f, setF] = useState({ nome: profissional.nome, especialidade: profissional.especialidade ?? '', telefone: profissional.telefone ?? '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    try {
      await onSalvar({
        nome: f.nome.trim(),
        especialidade: f.especialidade.trim() || undefined,
        telefone: f.telefone.replace(/\D/g, '') || undefined,
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo label="Nome">
        <input value={f.nome} onChange={set('nome')} required placeholder="Dra. Helena" className={inputCls} />
      </Campo>

      <Campo label="Especialidade (opcional)">
        <input value={f.especialidade} onChange={set('especialidade')} placeholder="Clínica geral" className={inputCls} />
      </Campo>

      <Campo label="WhatsApp (opcional)">
        <input value={f.telefone} onChange={set('telefone')} placeholder="47 99999-0000" className={inputCls} />
      </Campo>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancelar} enviando={enviando} />
    </form>
  )
}

/* --------------------------------------------------- criar item estoque */

export type DadosEstoque = {
  nome: string; categoria: 'medicamento' | 'vacina' | 'material' | 'alimento'
  codigo?: string; lote?: string; data_validade?: string
  quantidade_estoque: number; quantidade_minima: number; quantidade_maxima: number
  fornecedor_nome?: string; fornecedor_contato?: string
  preco_custo?: number; preco_venda?: number
}

export function FormEstoque({ onSubmit, onCancel }: {
  onSubmit: (d: DadosEstoque) => Promise<void>; onCancel: () => void
}) {
  const [f, setF] = useState({
    nome: '', categoria: 'medicamento' as const, codigo: '', lote: '', data_validade: '',
    quantidade_estoque: 1, quantidade_minima: 1, quantidade_maxima: 10,
    fornecedor_nome: '', fornecedor_contato: '', preco_custo: 0, preco_venda: 0,
  })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string | number } }) => setF({ ...f, [k]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!f.nome.trim()) { setErro('Nome é obrigatório'); return }
    if (f.quantidade_estoque < 0 || f.quantidade_minima < 0 || f.quantidade_maxima < 0) { setErro('Quantidades não podem ser negativas'); return }
    setEnviando(true); setErro(null)
    try {
      await onSubmit({
        nome: f.nome.trim(),
        categoria: f.categoria,
        codigo: f.codigo.trim() || undefined,
        lote: f.lote.trim() || undefined,
        data_validade: f.data_validade || undefined,
        quantidade_estoque: Number(f.quantidade_estoque),
        quantidade_minima: Number(f.quantidade_minima),
        quantidade_maxima: Number(f.quantidade_maxima),
        fornecedor_nome: f.fornecedor_nome.trim() || undefined,
        fornecedor_contato: f.fornecedor_contato.trim() || undefined,
        preco_custo: f.preco_custo > 0 ? Number(f.preco_custo) : undefined,
        preco_venda: f.preco_venda > 0 ? Number(f.preco_venda) : undefined,
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3 max-h-96 overflow-y-auto">
      <Campo label="Nome do Produto *">
        <input value={f.nome} onChange={set('nome')} required placeholder="Amoxicilina 500mg" className={inputCls} />
      </Campo>

      <Campo label="Categoria *">
        <select value={f.categoria} onChange={set('categoria')} className={inputCls}>
          <option value="medicamento">Medicamento</option>
          <option value="vacina">Vacina</option>
          <option value="material">Material</option>
          <option value="alimento">Alimento</option>
        </select>
      </Campo>

      <Campo label="Código (opcional)">
        <input value={f.codigo} onChange={set('codigo')} placeholder="123456" className={inputCls} />
      </Campo>

      <Campo label="Lote (opcional)">
        <input value={f.lote} onChange={set('lote')} placeholder="LOTE123456" className={inputCls} />
      </Campo>

      <Campo label="Data de Validade (opcional)">
        <input value={f.data_validade} onChange={set('data_validade')} type="date" className={inputCls} />
      </Campo>

      <div className="grid grid-cols-3 gap-2">
        <Campo label="Estoque *">
          <input value={f.quantidade_estoque} onChange={set('quantidade_estoque')} type="number" required min="0" className={inputCls} />
        </Campo>
        <Campo label="Mínimo *">
          <input value={f.quantidade_minima} onChange={set('quantidade_minima')} type="number" required min="0" className={inputCls} />
        </Campo>
        <Campo label="Máximo *">
          <input value={f.quantidade_maxima} onChange={set('quantidade_maxima')} type="number" required min="0" className={inputCls} />
        </Campo>
      </div>

      <Campo label="Fornecedor (opcional)">
        <input value={f.fornecedor_nome} onChange={set('fornecedor_nome')} placeholder="FarmaXYZ" className={inputCls} />
      </Campo>

      <Campo label="Contato Fornecedor (opcional)">
        <input value={f.fornecedor_contato} onChange={set('fornecedor_contato')} placeholder="47 3344-5566" className={inputCls} />
      </Campo>

      <div className="grid grid-cols-2 gap-2">
        <Campo label="Preço Custo (opcional)">
          <input value={f.preco_custo} onChange={set('preco_custo')} type="number" min="0" step="0.01" placeholder="0.00" className={inputCls} />
        </Campo>
        <Campo label="Preço Venda (opcional)">
          <input value={f.preco_venda} onChange={set('preco_venda')} type="number" min="0" step="0.01" placeholder="0.00" className={inputCls} />
        </Campo>
      </div>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancel} enviando={enviando} />
    </form>
  )
}

/* --------------------------------------------------- editar item estoque */

export type DadosEditarEstoque = Partial<DadosEstoque>

export function FormEditarEstoque({ item, onSubmit, onCancel }: {
  item: InventoryItem; onSubmit: (d: DadosEditarEstoque) => Promise<void>; onCancel: () => void
}) {
  const [f, setF] = useState({
    nome: item.nome, categoria: item.categoria, codigo: item.codigo ?? '', lote: item.lote ?? '',
    data_validade: item.data_validade ?? '',
    quantidade_estoque: item.quantidade_estoque, quantidade_minima: item.quantidade_minima,
    quantidade_maxima: item.quantidade_maxima,
    fornecedor_nome: item.fornecedor_nome ?? '', fornecedor_contato: item.fornecedor_contato ?? '',
    preco_custo: item.preco_custo ?? 0, preco_venda: item.preco_venda ?? 0,
  })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string | number } }) => setF({ ...f, [k]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!f.nome.trim()) { setErro('Nome é obrigatório'); return }
    if (f.quantidade_estoque < 0 || f.quantidade_minima < 0 || f.quantidade_maxima < 0) { setErro('Quantidades não podem ser negativas'); return }
    setEnviando(true); setErro(null)
    try {
      await onSubmit({
        nome: f.nome.trim(),
        categoria: f.categoria,
        codigo: f.codigo.trim() || undefined,
        lote: f.lote.trim() || undefined,
        data_validade: f.data_validade || undefined,
        quantidade_estoque: Number(f.quantidade_estoque),
        quantidade_minima: Number(f.quantidade_minima),
        quantidade_maxima: Number(f.quantidade_maxima),
        fornecedor_nome: f.fornecedor_nome.trim() || undefined,
        fornecedor_contato: f.fornecedor_contato.trim() || undefined,
        preco_custo: f.preco_custo > 0 ? Number(f.preco_custo) : undefined,
        preco_venda: f.preco_venda > 0 ? Number(f.preco_venda) : undefined,
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3 max-h-96 overflow-y-auto">
      <Campo label="Nome do Produto">
        <input value={f.nome} onChange={set('nome')} required placeholder="Amoxicilina 500mg" className={inputCls} />
      </Campo>

      <Campo label="Categoria">
        <select value={f.categoria} onChange={set('categoria')} className={inputCls}>
          <option value="medicamento">Medicamento</option>
          <option value="vacina">Vacina</option>
          <option value="material">Material</option>
          <option value="alimento">Alimento</option>
        </select>
      </Campo>

      <Campo label="Código">
        <input value={f.codigo} onChange={set('codigo')} placeholder="123456" className={inputCls} />
      </Campo>

      <Campo label="Lote">
        <input value={f.lote} onChange={set('lote')} placeholder="LOTE123456" className={inputCls} />
      </Campo>

      <Campo label="Data de Validade">
        <input value={f.data_validade} onChange={set('data_validade')} type="date" className={inputCls} />
      </Campo>

      <div className="grid grid-cols-3 gap-2">
        <Campo label="Estoque">
          <input value={f.quantidade_estoque} onChange={set('quantidade_estoque')} type="number" required min="0" className={inputCls} />
        </Campo>
        <Campo label="Mínimo">
          <input value={f.quantidade_minima} onChange={set('quantidade_minima')} type="number" required min="0" className={inputCls} />
        </Campo>
        <Campo label="Máximo">
          <input value={f.quantidade_maxima} onChange={set('quantidade_maxima')} type="number" required min="0" className={inputCls} />
        </Campo>
      </div>

      <Campo label="Fornecedor">
        <input value={f.fornecedor_nome} onChange={set('fornecedor_nome')} placeholder="FarmaXYZ" className={inputCls} />
      </Campo>

      <Campo label="Contato Fornecedor">
        <input value={f.fornecedor_contato} onChange={set('fornecedor_contato')} placeholder="47 3344-5566" className={inputCls} />
      </Campo>

      <div className="grid grid-cols-2 gap-2">
        <Campo label="Preço Custo">
          <input value={f.preco_custo} onChange={set('preco_custo')} type="number" min="0" step="0.01" placeholder="0.00" className={inputCls} />
        </Campo>
        <Campo label="Preço Venda">
          <input value={f.preco_venda} onChange={set('preco_venda')} type="number" min="0" step="0.01" placeholder="0.00" className={inputCls} />
        </Campo>
      </div>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancel} enviando={enviando} />
    </form>
  )
}

/* --------------------------------------------------- registrar movimento */

export type DadosMovimento = {
  tipo: 'entrada' | 'saida' | 'ajuste' | 'perda' | 'vencimento'
  quantidade: number
  motivo?: string
}

export function FormMovimentoEstoque({ item, onSubmit, onCancel }: {
  item: InventoryItem; onSubmit: (d: DadosMovimento) => Promise<void>; onCancel: () => void
}) {
  const [f, setF] = useState({ tipo: 'entrada' as 'entrada' | 'saida' | 'ajuste' | 'perda' | 'vencimento', quantidade: 1, motivo: '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string | number } }) => setF({ ...f, [k]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (f.quantidade <= 0) { setErro('Quantidade deve ser maior que 0'); return }
    setEnviando(true); setErro(null)
    try {
      await onSubmit({
        tipo: f.tipo,
        quantidade: Number(f.quantidade),
        motivo: f.motivo.trim() || undefined,
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui registrar.')
      setEnviando(false)
    }
  }

  const motivos: Record<'entrada' | 'saida' | 'ajuste' | 'perda' | 'vencimento', string[]> = {
    entrada: ['Compra', 'Devolução', 'Doação'],
    saida: ['Uso em atendimento', 'Venda', 'Perda'],
    ajuste: ['Recontagem', 'Correção de estoque'],
    perda: ['Quebra', 'Vencimento', 'Roubo'],
    vencimento: ['Produto vencido'],
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] font-medium">
        {item.nome} <span className="text-ink-3">· estoque atual: {item.quantidade_estoque}</span>
      </div>

      <Campo label="Tipo de Movimento">
        <select value={f.tipo} onChange={set('tipo')} className={inputCls}>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
          <option value="ajuste">Ajuste</option>
          <option value="perda">Perda</option>
          <option value="vencimento">Vencimento</option>
        </select>
      </Campo>

      <Campo label="Quantidade">
        <input value={f.quantidade} onChange={set('quantidade')} type="number" required min="1" className={inputCls} />
      </Campo>

      <Campo label="Motivo">
        <select value={f.motivo} onChange={set('motivo')} className={inputCls}>
          <option value="">Selecione um motivo</option>
          {motivos[f.tipo].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </Campo>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancel} enviando={enviando} />
    </form>
  )
}

/* --------------------------------------------------- solicitar exame */

export type DadosExame = {
  petId: string
  tipo: string
  atendimentoId?: string
}

export function FormExame({ petIds, onSubmit, onCancel }: {
  petIds: { id: string; nome: string }[]
  onSubmit: (d: DadosExame) => Promise<void>
  onCancel: () => void
}) {
  const [f, setF] = useState({ petId: petIds[0]?.id ?? '', tipo: '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!f.petId.trim()) { setErro('Pet é obrigatório'); return }
    if (!f.tipo.trim()) { setErro('Tipo de exame é obrigatório'); return }
    setEnviando(true); setErro(null)
    try {
      await onSubmit({ petId: f.petId, tipo: f.tipo.trim() })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui solicitar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <Campo label="Pet *">
        <select value={f.petId} onChange={set('petId')} className={inputCls} required>
          <option value="">Selecione um pet</option>
          {petIds.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </Campo>

      <Campo label="Tipo de Exame *">
        <input value={f.tipo} onChange={set('tipo')} required placeholder="Hemograma, Ultrassom, Raio-X..." className={inputCls} />
      </Campo>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancel} enviando={enviando} />
    </form>
  )
}

/* --------------------------------------------------- adicionar resultado */

export type DadosResultado = Partial<{
  data_resultado: string
  resultado: string
  observacoes: string
  status: 'concluído' | 'cancelado'
}>

export function FormResultado({ exame, onSubmit, onCancel }: {
  exame: { id: string; tipo: string }
  onSubmit: (d: DadosResultado) => Promise<void>
  onCancel: () => void
}) {
  const hoje = new Date().toISOString().slice(0, 10)
  const [f, setF] = useState({ data_resultado: hoje, resultado: '', observacoes: '', status: 'concluído' as const })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true); setErro(null)
    try {
      await onSubmit({
        data_resultado: f.data_resultado,
        resultado: f.resultado.trim() || undefined,
        observacoes: f.observacoes.trim() || undefined,
        status: f.status,
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não consegui salvar.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] font-medium">{exame.tipo}</div>

      <Campo label="Data do Resultado *">
        <input value={f.data_resultado} onChange={set('data_resultado')} type="date" required className={inputCls} />
      </Campo>

      <Campo label="Resultado (opcional)">
        <textarea value={f.resultado} onChange={set('resultado')} placeholder="Descreva o resultado do exame..." rows={3} className={inputCls} />
      </Campo>

      <Campo label="Observações (opcional)">
        <textarea value={f.observacoes} onChange={set('observacoes')} placeholder="Notas adicionais..." rows={2} className={inputCls} />
      </Campo>

      <Campo label="Status">
        <select value={f.status} onChange={set('status')} className={inputCls}>
          <option value="concluído">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </Campo>

      {erro && <p className="text-[12.5px] text-bad">{erro}</p>}
      <Acoes onCancelar={onCancel} enviando={enviando} />
    </form>
  )
}
