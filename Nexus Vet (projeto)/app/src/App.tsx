import { useCallback, useEffect, useState } from 'react'
import { clinics as clinicasDemo, db } from './data'
import type { DB, Tutor, ItemVenda, FormaPagamento } from './data'

export type DadosVenda = {
  clienteNome?: string; petNome?: string; itens: ItemVenda[]; desconto: number; formaPagamento: FormaPagamento; profissional?: string
}

export type DadosInternacao = {
  petId: string; motivo: string; box?: string; profissional?: string; previsaoAlta?: string; valorDiaria: number
}
export type DadosParametro = {
  temperatura?: number; fc?: number; fr?: number; mucosas?: string; obs?: string
}
export type DadosMedicacao = {
  medicamento: string; dose: string; via: string; intervaloHoras: number; inicio: string
}
import { supabase, MODO_DEMO } from './lib/supabase'
import { carregarClinica, carregarClinicas, situacaoDa } from './lib/queries'
import * as mut from './lib/mutations'
import Modal from './components/Modal'
import { FormAgendamento, type DadosAgendamento, type DadosDose, type DadosTutorPet,
  type DadosEditarTutor, type DadosEditarPet, type DadosAtendimento,
  type DadosLancamento, type DadosFornecedor, type DadosServico, type DadosProfissional, type DadosEditarServico, type DadosEditarProfissional,
  type DadosEstoque, type DadosEditarEstoque, type DadosMovimento,
  type DadosExame, type DadosResultado, type DadosProtocolo, type DadosModelo } from './components/Formularios'
import Dashboard from './views/Dashboard'
import Agenda from './views/Agenda'
import Tutores from './views/Tutores'
import Financeiro from './views/Financeiro'
import Configuracoes from './views/Configuracoes'
import Estoque from './views/Estoque'
import Exames from './views/Exames'
import Vendas from './views/Vendas'
import Comissoes from './views/Comissoes'
import Internacao from './views/Internacao'
import Inteligencia from './views/Inteligencia'
import Reativacao from './views/Reativacao'
import Bia from './views/Bia'
import Guia from './views/Guia'
import Suporte from './views/Suporte'
import ThemeToggle, { type Tema } from './components/ThemeToggle'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'agenda', label: 'Agenda', icon: '📅' },
  { id: 'tutores', label: 'Tutores & Pets', icon: '🐾' },
  { id: 'financeiro', label: 'Financeiro', icon: '💰' },
  { id: 'vendas', label: 'Vendas', icon: '🛒' },
  { id: 'comissoes', label: 'Comissões', icon: '💵' },
  { id: 'internacao', label: 'Internação', icon: '🏥' },
  { id: 'inteligencia', label: 'Inteligência', icon: '📊' },
  { id: 'estoque', label: 'Estoque', icon: '📦' },
  { id: 'exames', label: 'Exames', icon: '🔬' },
  { id: 'reativacao', label: 'Reativação', icon: '🔔' },
  { id: 'configuracoes', label: 'Configurações', icon: '⚙️' },
  { id: 'bia', label: 'Bia (IA)', icon: '✦' },
  { id: 'guia', label: 'Guia de uso', icon: '📚' },
  { id: 'suporte', label: 'Suporte', icon: '🎧' },
] as const

type View = (typeof NAV)[number]['id']
type Clinica = { id: string; nome: string; cidade: string | null }

// "+ Agendar" só aparece na Agenda — é onde criar agendamento pertence ao fluxo.
const VIEWS_COM_AGENDAR = new Set<View>(['agenda'])

/** Ações de escrita disponíveis para as telas. */
export type Acoes = {
  demo: boolean
  registrarDose: (petId: string, d: DadosDose) => Promise<void>
  criarTutorComPet: (d: DadosTutorPet) => Promise<void>
  criarAgendamento: (d: DadosAgendamento) => Promise<void>
  confirmarPendentes: () => Promise<number>
  editarTutor: (tutorId: string, d: DadosEditarTutor) => Promise<void>
  editarPet: (petId: string, d: DadosEditarPet) => Promise<void>
  registrarAtendimento: (petId: string, d: DadosAtendimento) => Promise<void>
  registrarNotaClinica: (petId: string, d: { tipo: 'observacao' | 'patologia'; texto: string }) => Promise<void>
  adicionarCondicao: (petId: string, texto: string) => Promise<void>
  removerCondicao: (petId: string, index: number) => Promise<void>
  criarLancamento: (d: DadosLancamento) => Promise<void>
  baixarLancamento: (id: string) => Promise<void>
  criarFornecedor: (d: DadosFornecedor) => Promise<void>
  atualizarFornecedor: (id: string, d: DadosFornecedor) => Promise<void>
  deletarFornecedor: (id: string) => Promise<void>
  criarServico: (d: DadosServico) => Promise<void>
  atualizarServico: (id: string, d: DadosEditarServico) => Promise<void>
  deletarServico: (id: string) => Promise<void>
  criarProfissional: (d: DadosProfissional) => Promise<void>
  atualizarProfissional: (id: string, d: DadosEditarProfissional) => Promise<void>
  deletarProfissional: (id: string) => Promise<void>
  criarItemEstoque: (d: DadosEstoque) => Promise<void>
  atualizarItemEstoque: (id: string, d: DadosEditarEstoque) => Promise<void>
  deletarItemEstoque: (id: string) => Promise<void>
  registrarMovimentoEstoque: (id: string, d: DadosMovimento) => Promise<void>
  criarExame: (d: DadosExame) => Promise<void>
  atualizarExame: (id: string, d: DadosResultado) => Promise<void>
  deletarExame: (id: string) => Promise<void>
  criarProtocolo: (d: DadosProtocolo) => Promise<void>
  atualizarProtocolo: (id: string, d: DadosProtocolo) => Promise<void>
  deletarProtocolo: (id: string) => Promise<void>
  criarTipoAtendimento: (nome: string) => Promise<void>
  deletarTipoAtendimento: (nome: string) => Promise<void>
  criarModelo: (d: DadosModelo) => Promise<void>
  atualizarModelo: (id: string, d: DadosModelo) => Promise<void>
  deletarModelo: (id: string) => Promise<void>
  registrarVenda: (d: DadosVenda) => Promise<void>
  atualizarComissao: (profId: string, pct: number) => Promise<void>
  criarOrcamento: (d: Omit<DadosVenda, 'formaPagamento'>) => Promise<void>
  converterOrcamento: (id: string, formaPagamento: FormaPagamento) => Promise<void>
  recusarOrcamento: (id: string) => Promise<void>
  abrirCaixa: (valorInicial: number) => Promise<void>
  registrarMovimentoCaixa: (d: { tipo: 'entrada' | 'saida'; descricao: string; valor: number }) => Promise<void>
  fecharCaixa: () => Promise<void>
  internarPet: (d: DadosInternacao) => Promise<void>
  registrarParametro: (internacaoId: string, d: DadosParametro) => Promise<void>
  adicionarMedicacao: (internacaoId: string, d: DadosMedicacao) => Promise<void>
  removerMedicacao: (internacaoId: string, medId: string) => Promise<void>
  alternarAplicacao: (internacaoId: string, medId: string, idx: number) => Promise<void>
  darAlta: (internacaoId: string) => Promise<void>
  clinicaNome: string
}

/** Gera o aprazamento (horários previstos) de uma medicação nas próximas 24h. */
function gerarHorarios(inicio: string, intervaloHoras: number): { hora: string; aplicado: boolean }[] {
  const [h, m] = inicio.split(':').map(Number)
  const base = h * 60 + (m || 0)
  const intervalo = Math.max(1, intervaloHoras)
  const n = Math.max(1, Math.floor(24 / intervalo))
  return Array.from({ length: n }, (_, i) => {
    const t = (base + i * intervalo * 60) % (24 * 60)
    const hh = String(Math.floor(t / 60)).padStart(2, '0')
    const mm = String(t % 60).padStart(2, '0')
    return { hora: `${hh}:${mm}`, aplicado: false }
  })
}

/** Ícone da Bia: bonequinha colorida (vestido teal) com a estrelinha de IA na base. */
function BiaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 -my-1" aria-hidden="true">
      {/* corpo alargado horizontalmente (mesma altura) */}
      <g transform="matrix(1.28 0 0 1 -3.36 0)">
        {/* cabelo (atrás) */}
        <circle cx="12" cy="6" r="4.1" fill="#5D4037" />
        {/* rosto */}
        <circle cx="12" cy="6.5" r="3.1" fill="#F3C892" />
        {/* franja */}
        <path fill="#5D4037" d="M8.9 5.4c.9-1.3 5.3-1.3 6.2 0 .2.6.2 1.2.1 1.8-.6-1-1.7-1.4-3.2-1.4s-2.6.4-3.2 1.4c-.1-.6-.1-1.2.1-1.8z" />
        {/* laço */}
        <path fill="#00BFA5" d="M14.8 3.1c.7-.2 1.5.1 1.6.7.1.6-.5 1.1-1.2 1.2z" />
        {/* vestido (teal da marca) */}
        <path fill="#00BFA5" d="M12 9.4c-2.2 0-3.5 1.7-4 4-.22 1 .5 1.9 1.5 1.9h5c1 0 1.72-.9 1.5-1.9-.5-2.3-1.8-4-4-4z" />
      </g>
      {/* estrelinha de IA — base, centro (simétrica) */}
      <path fill="#FFCA28" d="M12 15.3c.34 1.66.9 2.22 2.56 2.56-1.66.34-2.22.9-2.56 2.56-.34-1.66-.9-2.22-2.56-2.56 1.66-.34 2.22-.9 2.56-2.56z" />
    </svg>
  )
}

function Logo() {
  return (
    <svg viewBox="0 0 1024 1024" className="h-7 w-7">
      <defs>
        <linearGradient id="lg" gradientUnits="userSpaceOnUse" x1="300" y1="280" x2="760" y2="650">
          <stop offset="0" stopColor="#DFF7A0" /><stop offset="0.45" stopColor="#5CE39A" /><stop offset="1" stopColor="#00BFA5" />
        </linearGradient>
      </defs>
      <g fill="url(#lg)">
        <rect x="429.5" y="230" width="165" height="470" rx="82" transform="rotate(-37 512 465)" />
        <rect x="585" y="300" width="150" height="150" rx="34" />
        <rect x="289" y="480" width="150" height="150" rx="34" />
      </g>
    </svg>
  )
}

export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [agendando, setAgendando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  // Tema dia/noite — persiste a escolha e aplica no <html> via data-theme.
  const [tema, setTema] = useState<Tema>(() => {
    if (typeof localStorage !== 'undefined') {
      const salvo = localStorage.getItem('nexus-tema')
      if (salvo === 'light' || salvo === 'dark') return salvo
    }
    return 'dark'
  })
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
    try { localStorage.setItem('nexus-tema', tema) } catch { /* ignora */ }
  }, [tema])
  const alternarTema = () => setTema(t => (t === 'dark' ? 'light' : 'dark'))

  const [clinicas, setClinicas] = useState<Clinica[]>(MODO_DEMO ? clinicasDemo.map(c => ({ ...c })) : [])
  const [clinicId, setClinicId] = useState<string>(MODO_DEMO ? 'c1' : '')
  const [data, setData] = useState<DB | null>(MODO_DEMO ? db.c1 : null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (MODO_DEMO) return
    carregarClinicas()
      .then(cs => { setClinicas(cs); if (cs.length) setClinicId(cs[0].id) })
      .catch(e => setErro(e.message ?? 'Falha ao carregar clínicas'))
  }, [])

  const recarregar = useCallback(async () => {
    if (MODO_DEMO || !clinicId) return
    setData(await carregarClinica(clinicId))
  }, [clinicId])

  useEffect(() => {
    if (MODO_DEMO) { setData(db[clinicId as 'c1' | 'c2'] ?? db.c1); return }
    if (!clinicId) return
    let cancelado = false
    setData(null); setErro(null)
    carregarClinica(clinicId)
      .then(d => { if (!cancelado) setData(d) })
      .catch(e => { if (!cancelado) setErro(e.message ?? 'Falha ao carregar dados') })
    return () => { cancelado = true }
  }, [clinicId])

  const notificar = (msg: string) =>
    setAviso(MODO_DEMO ? `${msg} (demonstração — não foi salvo no banco)` : msg)

  // ------------------------------------------------------------- ações
  const acoes: Acoes = {
    demo: MODO_DEMO,
    clinicaNome: clinicas.find(c => c.id === clinicId)?.nome ?? 'Clínica',

    async criarLancamento(d) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          lancamentos: [{
            id: 'f' + Date.now(), tipo: d.tipo, descricao: d.descricao,
            categoria: d.categoria, valor: d.valor, vencimento: d.vencimento,
            tutorNome: d.tutorNome,
            fornecedorId: d.fornecedorId, fornecedorNome: d.fornecedorNome, documento: d.documento,
          }, ...atual.lancamentos],
        }))
      } else {
        await mut.criarLancamento(clinicId, d)
        await recarregar()
      }
      notificar(`Lançamento de ${d.descricao} registrado.`)
    },

    async baixarLancamento(id) {
      const hoje = new Date().toISOString().slice(0, 10)
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          lancamentos: atual.lancamentos.map(l =>
            l.id === id ? { ...l, pagoEm: hoje, formaPagamento: 'pix' as const } : l),
        }))
      } else {
        await mut.baixarLancamento(id)
        await recarregar()
      }
      notificar('Baixa registrada.')
    },

    async criarFornecedor(d) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          fornecedores: [{ id: 'fo' + Date.now(), ...d, ativo: true }, ...atual.fornecedores],
        }))
      } else {
        await mut.criarFornecedor(clinicId, d)
        await recarregar()
      }
      notificar(`Fornecedor ${d.nomeFantasia || d.razaoSocial} cadastrado.`)
    },

    async atualizarFornecedor(id, d) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          fornecedores: atual.fornecedores.map(fo => fo.id === id ? { ...fo, ...d } : fo),
        }))
      } else {
        await mut.atualizarFornecedor(id, d)
        await recarregar()
      }
      notificar('Fornecedor atualizado.')
    },

    async deletarFornecedor(id) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          fornecedores: atual.fornecedores.filter(fo => fo.id !== id),
        }))
      } else {
        await mut.deletarFornecedor(id)
        await recarregar()
      }
      notificar('Fornecedor removido.')
    },

    async registrarAtendimento(petId, d) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          tutores: atual.tutores.map(t => ({
            ...t,
            pets: t.pets.map(p => p.id !== petId ? p : ({
              ...p,
              peso: d.peso ?? p.peso,   // o peso do dia atualiza o cadastro (igual ao trigger do banco)
              atendimentos: [{ id: 'c' + Date.now(), ...d, profissional: d.profissional }, ...p.atendimentos],
            })),
          })),
        }))
      } else {
        await mut.criarAtendimento(clinicId, petId, d)
        await recarregar()
      }
      notificar('Atendimento registrado no prontuário.')
    },

    async registrarNotaClinica(petId, d) {
      const hoje = new Date().toISOString().slice(0, 10)
      setData(atual => atual && ({
        ...atual,
        tutores: atual.tutores.map(t => ({
          ...t,
          pets: t.pets.map(p => p.id !== petId ? p : ({
            ...p,
            registros: [{ id: 'r' + Date.now(), tipo: d.tipo, data: hoje, texto: d.texto.trim(), autor: 'Equipe' },
                        ...(p.registros ?? [])],
          })),
        })),
      }))
      notificar(d.tipo === 'patologia' ? 'Diagnóstico registrado.' : 'Observação registrada.')
    },

    async adicionarCondicao(petId, texto) {
      const t = texto.trim()
      if (!t) return
      setData(atual => atual && ({
        ...atual,
        tutores: atual.tutores.map(tu => ({
          ...tu,
          pets: tu.pets.map(p => p.id !== petId ? p : ({ ...p, condicoes: [...(p.condicoes ?? []), t] })),
        })),
      }))
      notificar('Condição adicionada ao quadro clínico.')
    },

    async removerCondicao(petId, index) {
      setData(atual => atual && ({
        ...atual,
        tutores: atual.tutores.map(tu => ({
          ...tu,
          pets: tu.pets.map(p => p.id !== petId ? p : ({ ...p, condicoes: (p.condicoes ?? []).filter((_, i) => i !== index) })),
        })),
      }))
      notificar('Condição removida.')
    },

    async registrarDose(petId, d) {
      const proxima = mut.calcularProximaDose(d.dataAplicacao, d)
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          tutores: atual.tutores.map(t => ({
            ...t,
            pets: t.pets.map(p => p.id !== petId ? p : ({
              ...p,
              vacinas: [{ vacina: d.vacina, aplicacao: d.dataAplicacao, proximaDose: proxima, situacao: situacaoDa(proxima) },
                        ...p.vacinas.filter(v => v.vacina !== d.vacina)],
            })),
          })),
        }))
      } else {
        await mut.registrarDose(clinicId, { petId, ...d })
        await recarregar()
      }
      notificar(`Dose de ${d.vacina} registrada. Próxima em ${new Date(proxima).toLocaleDateString('pt-BR')}.`)
    },

    async criarTutorComPet(d) {
      if (MODO_DEMO) {
        const novo: Tutor = {
          id: 't' + Date.now(), nome: d.nome, telefone: d.telefone, origem: 'Cadastro manual',
          email: d.email, nascimento: d.nascimento, endereco: d.endereco,
          etapa: 'lead', desde: new Date().toISOString().slice(0, 10),
          pets: [{
            id: 'p' + Date.now(), nome: d.pet.nome, especie: d.pet.especie,
            raca: d.pet.raca ?? '—', nascimento: d.pet.nascimento ?? new Date().toISOString().slice(0, 10),
            peso: 0, castrado: false, microchip: d.pet.microchip, pedigree: d.pet.pedigree,
            sexo: d.pet.sexo, pelagem: d.pet.pelagem, condicoes: [],
            vacinas: [], atendimentos: [],
          }],
        }
        setData(atual => atual && ({ ...atual, tutores: [novo, ...atual.tutores] }))
      } else {
        const tutorId = await mut.criarTutor(clinicId, { nome: d.nome, telefone: d.telefone, cpf: d.cpf })
        await mut.criarPet(clinicId, { tutorId, ...d.pet })
        await recarregar()
      }
      notificar(`${d.nome} e ${d.pet.nome} cadastrados.`)
    },

    async criarAgendamento(d) {
      const pet = data?.tutores.flatMap(t => t.pets).find(p => p.id === d.petId)
      const servico = data?.servicos.find(s => s.id === d.serviceId)
      if (MODO_DEMO) {
        const tutor = data?.tutores.find(t => t.pets.some(p => p.id === d.petId))
        setData(atual => atual && ({
          ...atual,
          agenda: [...atual.agenda, {
            id: 'a' + Date.now(), data: d.data, hora: d.hora, pet: pet?.nome ?? '—', tutor: tutor?.nome ?? '—',
            servico: servico?.nome ?? '—', profissional: d.profissional,
            status: 'pendente' as const, canal: 'recepcao' as const,
          }].sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora)),
        }))
      } else {
        await mut.criarAgendamento(clinicId, {
          tutorId: d.tutorId, petId: d.petId, serviceId: d.serviceId,
          inicio: `${d.data}T${d.hora}:00`, duracaoMin: servico?.duracao ?? 30,
        })
        await recarregar()
      }
      notificar(`${pet?.nome ?? 'Pet'} agendado para ${new Date(d.data + 'T00:00:00').toLocaleDateString('pt-BR')} às ${d.hora}.`)
    },

    async editarTutor(tutorId, d) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          tutores: atual.tutores.map(t => t.id !== tutorId ? t
            : ({ ...t, nome: d.nome, telefone: d.telefone, etapa: d.etapa,
                 email: d.email, nascimento: d.nascimento, endereco: d.endereco })),
        }))
      } else {
        await mut.atualizarTutor(tutorId, {
          nome: d.nome, telefone: d.telefone, cpf: d.cpf, etapa_funil: d.etapa,
        })
        await recarregar()
      }
      notificar(`Cadastro de ${d.nome} atualizado.`)
    },

    async editarPet(petId, d) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          tutores: atual.tutores.map(t => ({
            ...t,
            pets: t.pets.map(p => p.id !== petId ? p : ({
              ...p,
              nome: d.nome, especie: d.especie, raca: d.raca ?? '—',
              nascimento: d.nascimento ?? p.nascimento,
              peso: d.pesoKg ?? p.peso, castrado: d.castrado, alerta: d.alertaSaude,
              microchip: d.microchip, pedigree: d.pedigree,
              sexo: d.sexo, pelagem: d.pelagem,
            })),
          })),
        }))
      } else {
        await mut.atualizarPet(petId, d)
        await recarregar()
      }
      notificar(`Cadastro do ${d.nome} atualizado.`)
    },

    async confirmarPendentes() {
      const pendentes = data?.agenda.filter(a => a.status === 'pendente').length ?? 0
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          agenda: atual.agenda.map(a => a.status === 'pendente' ? { ...a, status: 'confirmada' as const } : a),
        }))
      } else {
        await mut.confirmarPendentes(clinicId, new Date().toISOString().slice(0, 10))
        await recarregar()
      }
      notificar(`${pendentes} ${pendentes === 1 ? 'agendamento confirmado' : 'agendamentos confirmados'} pela Bia.`)
      return pendentes
    },

    async criarServico(d) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          servicos: [...atual.servicos, {
            id: 's' + Date.now(), nome: d.nome, categoria: d.categoria, preco: d.preco, duracao: d.duracao,
          }],
        }))
      } else {
        await mut.criarServico(clinicId, d)
        await recarregar()
      }
      notificar(`Serviço "${d.nome}" adicionado.`)
    },

    async criarProfissional(d) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          profissionais: [...(atual.profissionais ?? []), {
            id: 'pr' + Date.now(), nome: d.nome, especialidade: d.especialidade, telefone: d.telefone,
          }],
        }))
      } else {
        await mut.criarProfissional(clinicId, d)
        await recarregar()
      }
      notificar(`Profissional "${d.nome}" adicionado.`)
    },

    async atualizarServico(id, d) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          servicos: atual.servicos.map(s => s.id !== id ? s : ({ ...s, ...d })),
        }))
      } else {
        await mut.atualizarServico(id, d)
        await recarregar()
      }
      notificar(`Serviço atualizado.`)
    },

    async deletarServico(id) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          servicos: atual.servicos.filter(s => s.id !== id),
        }))
      } else {
        await mut.inativarServico(id)
        await recarregar()
      }
      notificar(`Serviço removido.`)
    },

    async atualizarProfissional(id, d) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          profissionais: (atual.profissionais ?? []).map(p => p.id !== id ? p : ({ ...p, ...d })),
        }))
      } else {
        await mut.atualizarProfissional(id, d)
        await recarregar()
      }
      notificar(`Profissional atualizado.`)
    },

    async deletarProfissional(id) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          profissionais: (atual.profissionais ?? []).filter(p => p.id !== id),
        }))
      } else {
        await mut.inativarProfissional(id)
        await recarregar()
      }
      notificar(`Profissional removido.`)
    },

    async criarItemEstoque(d) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          estoque: [...(atual.estoque ?? []), {
            id: 'inv' + Date.now(), ativo: true, ...d,
          }],
        }))
      } else {
        await mut.criarItemEstoque(clinicId, d)
        await recarregar()
      }
      notificar(`Item "${d.nome}" adicionado ao estoque.`)
    },

    async atualizarItemEstoque(id, d) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          estoque: (atual.estoque ?? []).map(i => i.id !== id ? i : { ...i, ...d }),
        }))
      } else {
        await mut.atualizarItemEstoque(id, d)
        await recarregar()
      }
      notificar(`Item atualizado.`)
    },

    async deletarItemEstoque(id) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          estoque: (atual.estoque ?? []).filter(i => i.id !== id),
        }))
      } else {
        await mut.inativarItemEstoque(id)
        await recarregar()
      }
      notificar(`Item removido do estoque.`)
    },

    async registrarMovimentoEstoque(id, d) {
      if (MODO_DEMO) {
        const multiplicador = d.tipo === 'saida' || d.tipo === 'perda' || d.tipo === 'vencimento' ? -1 : 1
        setData(atual => atual && ({
          ...atual,
          estoque: (atual.estoque ?? []).map(i =>
            i.id !== id ? i : { ...i, quantidade_estoque: Math.max(0, i.quantidade_estoque + (multiplicador * d.quantidade)) }
          ),
        }))
      } else {
        await mut.registrarMovimentoEstoque(clinicId, { inventory_id: id, ...d })
        await recarregar()
      }
      notificar(`Movimento registrado: ${d.tipo} de ${d.quantidade} unidades.`)
    },

    async criarExame(d) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          exames: [...(atual.exames ?? []), {
            id: 'ex' + Date.now(),
            pet_id: d.petId,
            atendimento_id: d.atendimentoId,
            tipo: d.tipo,
            data_solicitacao: new Date().toISOString().slice(0, 10),
            status: 'solicitado' as const,
          }],
        }))
      } else {
        await mut.criarExame(clinicId, d)
        await recarregar()
      }
      notificar(`Exame "${d.tipo}" solicitado.`)
    },

    async atualizarExame(id, d) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          exames: (atual.exames ?? []).map(e => e.id !== id ? e : { ...e, ...d, status: d.status ?? e.status }),
        }))
      } else {
        await mut.atualizarExame(id, d)
        await recarregar()
      }
      notificar(`Resultado adicionado.`)
    },

    async deletarExame(id) {
      if (MODO_DEMO) {
        setData(atual => atual && ({
          ...atual,
          exames: (atual.exames ?? []).filter(e => e.id !== id),
        }))
      } else {
        await mut.deletarExame(id)
        await recarregar()
      }
      notificar(`Exame removido.`)
    },

    async criarProtocolo(d) {
      setData(atual => atual && ({
        ...atual,
        protocolos: [...(atual.protocolos ?? []), {
          id: 'pr' + Date.now(), nome: d.nome, especie: d.especie,
          reforcoMeses: d.reforcoMeses, doseFilhoteDias: d.doseFilhoteDias, ativo: true,
        }],
      }))
      notificar(`Protocolo de ${d.nome} criado.`)
    },

    async atualizarProtocolo(id, d) {
      setData(atual => atual && ({
        ...atual,
        protocolos: (atual.protocolos ?? []).map(p => p.id !== id ? p : ({
          ...p, nome: d.nome, especie: d.especie,
          reforcoMeses: d.reforcoMeses, doseFilhoteDias: d.doseFilhoteDias,
        })),
      }))
      notificar(`Protocolo de ${d.nome} atualizado.`)
    },

    async deletarProtocolo(id) {
      setData(atual => atual && ({
        ...atual,
        protocolos: (atual.protocolos ?? []).filter(p => p.id !== id),
      }))
      notificar(`Protocolo removido.`)
    },

    async criarTipoAtendimento(nome) {
      const n = nome.trim()
      if (!n) return
      setData(atual => atual && ({
        ...atual,
        tiposAtendimento: [...(atual.tiposAtendimento ?? []).filter(t => t !== n), n],
      }))
      notificar(`Tipo de atendimento "${n}" adicionado.`)
    },

    async deletarTipoAtendimento(nome) {
      setData(atual => atual && ({
        ...atual,
        tiposAtendimento: (atual.tiposAtendimento ?? []).filter(t => t !== nome),
      }))
      notificar(`Tipo de atendimento removido.`)
    },

    async criarModelo(d) {
      setData(atual => atual && ({
        ...atual,
        modelos: [...(atual.modelos ?? []), { id: 'md' + Date.now(), nome: d.nome, tipo: d.tipo, conteudo: d.conteudo }],
      }))
      notificar(`Modelo "${d.nome}" criado.`)
    },

    async atualizarModelo(id, d) {
      setData(atual => atual && ({
        ...atual,
        modelos: (atual.modelos ?? []).map(m => m.id !== id ? m : { ...m, nome: d.nome, tipo: d.tipo, conteudo: d.conteudo }),
      }))
      notificar(`Modelo "${d.nome}" atualizado.`)
    },

    async deletarModelo(id) {
      setData(atual => atual && ({
        ...atual,
        modelos: (atual.modelos ?? []).filter(m => m.id !== id),
      }))
      notificar(`Modelo removido.`)
    },

    async registrarVenda(d) {
      const hoje = new Date().toISOString().slice(0, 10)
      const subtotal = d.itens.reduce((s, i) => s + i.quantidade * i.precoUnit, 0)
      const total = Math.max(0, subtotal - d.desconto)
      const descricao = d.itens.length === 1
        ? d.itens[0].nome
        : `Venda (${d.itens.length} itens)`
      const venda = {
        id: 'vd' + Date.now(), data: hoje,
        clienteNome: d.clienteNome, petNome: d.petNome,
        itens: d.itens, desconto: d.desconto, total, formaPagamento: d.formaPagamento, profissional: d.profissional,
      }
      setData(atual => atual && ({
        ...atual,
        vendas: [venda, ...(atual.vendas ?? [])],
        // baixa automática no estoque para os produtos vendidos
        estoque: (atual.estoque ?? []).map(it => {
          const vendido = d.itens.filter(x => x.tipo === 'produto' && x.refId === it.id)
            .reduce((s, x) => s + x.quantidade, 0)
          return vendido ? { ...it, quantidade_estoque: Math.max(0, it.quantidade_estoque - vendido) } : it
        }),
        // lançamento no financeiro (recebido)
        lancamentos: [{
          id: 'f' + Date.now(), tipo: 'receber' as const, descricao, categoria: 'venda',
          valor: total, vencimento: hoje, pagoEm: hoje, formaPagamento: d.formaPagamento,
          tutorNome: d.clienteNome, petNome: d.petNome,
        }, ...atual.lancamentos],
      }))
      notificar(`Venda de ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrada.`)
    },

    async atualizarComissao(profId, pct) {
      setData(atual => atual && ({
        ...atual,
        profissionais: (atual.profissionais ?? []).map(p => p.id === profId ? { ...p, comissaoPct: Math.max(0, pct) } : p),
      }))
      notificar('Comissão atualizada.')
    },

    async criarOrcamento(d) {
      const agora = new Date()
      const hoje = agora.toISOString().slice(0, 10)
      const validade = new Date(agora.getTime() + 7 * 86400000).toISOString().slice(0, 10)
      const subtotal = d.itens.reduce((s, i) => s + i.quantidade * i.precoUnit, 0)
      const total = Math.max(0, subtotal - d.desconto)
      setData(atual => atual && ({
        ...atual,
        orcamentos: [{
          id: 'or' + Date.now(), data: hoje, validade,
          clienteNome: d.clienteNome, petNome: d.petNome,
          itens: d.itens, desconto: d.desconto, total, status: 'aberto' as const,
        }, ...(atual.orcamentos ?? [])],
      }))
      notificar(`Orçamento de ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} salvo.`)
    },

    async converterOrcamento(id, formaPagamento) {
      const hoje = new Date().toISOString().slice(0, 10)
      const orc = (data?.orcamentos ?? []).find(o => o.id === id)
      setData(atual => {
        if (!atual) return atual
        const o = (atual.orcamentos ?? []).find(x => x.id === id && x.status === 'aberto')
        if (!o) return atual
        const descricao = o.itens.length === 1 ? o.itens[0].nome : `Venda (${o.itens.length} itens)`
        const venda = {
          id: 'vd' + Date.now(), data: hoje,
          clienteNome: o.clienteNome, petNome: o.petNome,
          itens: o.itens, desconto: o.desconto, total: o.total, formaPagamento,
        }
        return {
          ...atual,
          orcamentos: atual.orcamentos.map(x => x.id === id ? { ...x, status: 'convertido' as const } : x),
          vendas: [venda, ...(atual.vendas ?? [])],
          estoque: (atual.estoque ?? []).map(it => {
            const vendido = o.itens.filter(x => x.tipo === 'produto' && x.refId === it.id).reduce((s, x) => s + x.quantidade, 0)
            return vendido ? { ...it, quantidade_estoque: Math.max(0, it.quantidade_estoque - vendido) } : it
          }),
          lancamentos: [{
            id: 'f' + Date.now(), tipo: 'receber' as const, descricao, categoria: 'venda',
            valor: o.total, vencimento: hoje, pagoEm: hoje, formaPagamento,
            tutorNome: o.clienteNome, petNome: o.petNome,
          }, ...atual.lancamentos],
        }
      })
      notificar(`Orçamento convertido em venda${orc ? ` de ${orc.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : ''}.`)
    },

    async recusarOrcamento(id) {
      setData(atual => atual && ({
        ...atual,
        orcamentos: (atual.orcamentos ?? []).map(o => o.id === id ? { ...o, status: 'recusado' as const } : o),
      }))
      notificar('Orçamento recusado.')
    },

    async abrirCaixa(valorInicial) {
      const agora = new Date()
      const hoje = agora.toISOString().slice(0, 10)
      const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      setData(atual => atual && ({
        ...atual,
        caixa: {
          id: 'cx' + Date.now(), data: hoje, aberto: true,
          movimentos: [{ id: 'mc' + Date.now(), tipo: 'abertura', descricao: 'Abertura de caixa', valor: valorInicial, hora }],
        },
      }))
      notificar('Caixa aberto.')
    },

    async registrarMovimentoCaixa(d) {
      const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      setData(atual => atual && atual.caixa && ({
        ...atual,
        caixa: {
          ...atual.caixa,
          movimentos: [...atual.caixa.movimentos, { id: 'mc' + Date.now(), tipo: d.tipo, descricao: d.descricao, valor: d.valor, hora }],
        },
      }))
      notificar(d.tipo === 'entrada' ? 'Suprimento registrado.' : 'Sangria registrada.')
    },

    async fecharCaixa() {
      const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      setData(atual => atual && atual.caixa && ({
        ...atual,
        caixa: {
          ...atual.caixa,
          aberto: false,
          movimentos: [...atual.caixa.movimentos, { id: 'mc' + Date.now(), tipo: 'fechamento', descricao: 'Fechamento de caixa', valor: 0, hora }],
        },
      }))
      notificar('Caixa fechado.')
    },

    async internarPet(d) {
      const pet = data?.tutores.flatMap(t => t.pets.map(p => ({ p, tutor: t }))).find(x => x.p.id === d.petId)
      if (!pet) return
      const hoje = new Date().toISOString().slice(0, 10)
      const nova = {
        id: 'int' + Date.now(), petId: d.petId, petNome: pet.p.nome, tutorNome: pet.tutor.nome,
        especie: pet.p.especie, box: d.box, motivo: d.motivo, profissional: d.profissional,
        entrada: hoje, previsaoAlta: d.previsaoAlta, valorDiaria: d.valorDiaria,
        status: 'internado' as const, parametros: [], medicacoes: [],
      }
      setData(atual => atual && ({ ...atual, internacoes: [nova, ...(atual.internacoes ?? [])] }))
      notificar(`${pet.p.nome} internado.`)
    },

    async registrarParametro(internacaoId, d) {
      const agora = new Date()
      const hoje = agora.toISOString().slice(0, 10)
      const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      setData(atual => atual && ({
        ...atual,
        internacoes: (atual.internacoes ?? []).map(i => i.id !== internacaoId ? i : ({
          ...i,
          parametros: [...i.parametros, { id: 'pc' + Date.now(), data: hoje, hora, ...d }],
        })),
      }))
      notificar('Parâmetros clínicos registrados.')
    },

    async adicionarMedicacao(internacaoId, d) {
      setData(atual => atual && ({
        ...atual,
        internacoes: (atual.internacoes ?? []).map(i => i.id !== internacaoId ? i : ({
          ...i,
          medicacoes: [...i.medicacoes, {
            id: 'md-int' + Date.now(), medicamento: d.medicamento, dose: d.dose, via: d.via,
            intervaloHoras: d.intervaloHoras, horarios: gerarHorarios(d.inicio, d.intervaloHoras),
          }],
        })),
      }))
      notificar(`${d.medicamento} adicionado ao aprazamento.`)
    },

    async removerMedicacao(internacaoId, medId) {
      setData(atual => atual && ({
        ...atual,
        internacoes: (atual.internacoes ?? []).map(i => i.id !== internacaoId ? i : ({
          ...i,
          medicacoes: i.medicacoes.filter(m => m.id !== medId),
        })),
      }))
      notificar('Medicação removida do aprazamento.')
    },

    async alternarAplicacao(internacaoId, medId, idx) {
      setData(atual => atual && ({
        ...atual,
        internacoes: (atual.internacoes ?? []).map(i => i.id !== internacaoId ? i : ({
          ...i,
          medicacoes: i.medicacoes.map(m => m.id !== medId ? m : ({
            ...m,
            horarios: m.horarios.map((h, n) => n === idx ? { ...h, aplicado: !h.aplicado } : h),
          })),
        })),
      }))
    },

    async darAlta(internacaoId) {
      const hoje = new Date().toISOString().slice(0, 10)
      const alvo = (data?.internacoes ?? []).find(i => i.id === internacaoId)
      const dias = alvo
        ? Math.max(1, Math.round((new Date(hoje + 'T00:00:00').getTime() - new Date(alvo.entrada + 'T00:00:00').getTime()) / 86400000))
        : 1
      const valor = alvo ? dias * alvo.valorDiaria : 0
      setData(atual => {
        if (!atual) return atual
        const i = (atual.internacoes ?? []).find(x => x.id === internacaoId)
        if (!i) return atual
        return {
          ...atual,
          internacoes: atual.internacoes.map(x => x.id === internacaoId ? { ...x, status: 'alta' as const, saida: hoje } : x),
          lancamentos: [{
            id: 'f' + Date.now(), tipo: 'receber' as const,
            descricao: `Internação — ${dias} ${dias === 1 ? 'diária' : 'diárias'} (${i.petNome})`,
            categoria: 'internacao', valor, vencimento: hoje,
            tutorNome: i.tutorNome, petNome: i.petNome,
          }, ...atual.lancamentos],
        }
      })
      notificar(alvo
        ? `Alta de ${alvo.petNome}. ${dias} ${dias === 1 ? 'diária' : 'diárias'} → ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} lançados a receber.`
        : 'Alta registrada.')
    },
  }

  const clinic = clinicas.find(c => c.id === clinicId)
  const go = (v: View) => { setView(v); setMenuOpen(false) }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <Logo />
        <div>
          <div className="text-[15px] font-semibold tracking-tight">NEXUS</div>
          <div className="-mt-0.5 text-[11px] font-medium tracking-widest text-brand">VET</div>
        </div>
      </div>

      <div className="px-3 pb-4">
        <select value={clinicId} onChange={e => setClinicId(e.target.value)} disabled={clinicas.length === 0}
          aria-label="Clínica"
          className="w-full cursor-pointer rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] font-medium text-ink outline-none transition hover:border-brand/50 disabled:opacity-50">
          {clinicas.length === 0
            ? <option>Carregando…</option>
            : clinicas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map(item => (
          <button key={item.id} onClick={() => go(item.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition
              ${view === item.id ? 'bg-brand/12 text-brand' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'}`}>
            {item.id === 'bia'
              ? <BiaIcon />
              : <span className="text-[15px] leading-none">{item.icon}</span>}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
          <div className="text-[12px] leading-tight text-ink-2">
            <span className="font-semibold text-ink">Bia ativa</span> — atendendo o WhatsApp
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-ink-3">{MODO_DEMO ? 'Piloto · dados fictícios' : 'Sistema ativo'}</span>
          {!MODO_DEMO && supabase && (
            <button onClick={() => supabase?.auth.signOut()} className="text-[11px] text-ink-3 hover:text-ink">Sair</button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-full">
      <aside className="hidden w-60 shrink-0 border-r border-line bg-surface-1 md:block">{sidebar}</aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-line bg-surface-1">{sidebar}</aside>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-surface-0/90 px-4 py-3.5 backdrop-blur md:px-8 md:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setMenuOpen(true)} aria-label="Abrir menu"
              className="rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[15px] leading-none text-ink-2 md:hidden">☰</button>
            <div className="min-w-0">
              <h1 className="truncate text-[16px] font-semibold tracking-tight md:text-[17px]">{NAV.find(n => n.id === view)?.label}</h1>
              <div className="truncate text-[11.5px] text-ink-3 md:text-[12px]">
                {clinic ? `${clinic.nome}${clinic.cidade ? ` · ${clinic.cidade}` : ''}` : '—'}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle tema={tema} onToggle={alternarTema} />
            <button onClick={() => go('suporte')}
              className={`whitespace-nowrap rounded-lg border px-3 py-2 text-[12.5px] font-medium transition md:px-3.5 md:text-[13px] ${
                view === 'suporte' ? 'border-brand/50 bg-brand/12 text-brand' : 'border-line bg-surface-2 text-ink-2 hover:border-brand/50 hover:text-ink'}`}>
              🎧 Suporte
            </button>
            {VIEWS_COM_AGENDAR.has(view) && (
              <button onClick={() => setAgendando(true)} disabled={!data}
                className="whitespace-nowrap rounded-lg bg-brand px-3 py-2 text-[12.5px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-50 md:px-3.5 md:text-[13px]">
                + Agendar
              </button>
            )}
          </div>
        </header>

        {aviso && (
          <div className="flex items-start justify-between gap-3 border-b border-brand/30 bg-brand/10 px-4 py-2.5 md:px-8">
            <span className="text-[12.5px] text-ink">{aviso}</span>
            <button onClick={() => setAviso(null)} aria-label="Fechar aviso"
              className="shrink-0 text-[12px] text-ink-3 hover:text-ink">✕</button>
          </div>
        )}

        <div className="px-4 py-5 md:px-8 md:py-6">
          {erro && (
            <div className="rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-[13px] text-bad">
              Não consegui carregar os dados: {erro}
            </div>
          )}

          {!erro && !data && (
            <div className="flex items-center gap-2.5 py-16 text-[13.5px] text-ink-3">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
              Carregando dados da clínica…
            </div>
          )}

          {!erro && data && (
            <>
              {view === 'dashboard' && <Dashboard data={data} ir={(v) => setView(v)} />}
              {view === 'agenda' && <Agenda data={data} acoes={acoes} />}
              {view === 'tutores' && <Tutores data={data} acoes={acoes} />}
              {view === 'financeiro' && <Financeiro data={data} acoes={acoes} />}
              {view === 'vendas' && <Vendas data={data} acoes={acoes} />}
              {view === 'comissoes' && <Comissoes data={data} acoes={acoes} />}
              {view === 'internacao' && <Internacao data={data} acoes={acoes} />}
              {view === 'inteligencia' && <Inteligencia data={data} />}
              {view === 'estoque' && <Estoque itens={data.estoque ?? []} acoes={acoes} />}
              {view === 'exames' && <Exames exames={data.exames ?? []} pets={data.tutores.flatMap(t => t.pets)} acoes={acoes} />}
              {view === 'reativacao' && <Reativacao data={data} />}
              {view === 'configuracoes' && <Configuracoes data={data} acoes={acoes} />}
              {view === 'bia' && <Bia />}
              {view === 'guia' && <Guia />}
              {view === 'suporte' && <Suporte />}
            </>
          )}
        </div>
      </main>

      {data && (
        <Modal titulo="Novo agendamento" aberto={agendando} onFechar={() => setAgendando(false)}>
          <FormAgendamento dados={data} onCancelar={() => setAgendando(false)}
            onSalvar={async d => { await acoes.criarAgendamento(d); setAgendando(false) }} />
        </Modal>
      )}
    </div>
  )
}
