// Dados de demonstração — clínica veterinária fictícia.
// Mesma forma do `data.ts` do NEXUS Odonto, adaptada: paciente vira TUTOR + PET.
// Em produção estes dados vêm do Supabase (ver stack/schema-vet.sql).

export const clinics = [
  { id: 'c1', nome: 'Clínica Vet Bem-Estar', cidade: 'Balneário Camboriú/SC' },
  { id: 'c2', nome: 'PetCare Centro', cidade: 'Itajaí/SC' },
] as const

export type Especie = 'cao' | 'gato'
export type StatusAgenda = 'pendente' | 'confirmada' | 'atendida' | 'falta' | 'cancelada'
export type SituacaoVacina = 'em_dia' | 'proxima' | 'atrasada'

export type Vacina = {
  vacina: string
  aplicacao: string      // AAAA-MM-DD
  proximaDose: string    // AAAA-MM-DD
  situacao: SituacaoVacina
}

// Protocolo de vacina definido pela clínica: diz de quanto em quanto tempo cada
// vacina se repete. É o que a Bia usa para saber QUANDO chamar o pet de volta.
export type ProtocoloVacina = {
  id: string
  nome: string                 // "V10", "Antirrábica"
  especie: Especie | 'ambos'
  reforcoMeses: number         // intervalo do reforço (ex.: 12 = anual)
  doseFilhoteDias?: number     // se tem série de filhote, dias entre as doses (ex.: 21)
  ativo: boolean
}

// Modelo de documento reutilizável (receita, atestado, termo…) com placeholders
// {pet} {tutor} {especie} {raca} {idade} {data} {clinica}
export type ModeloDocumento = {
  id: string
  nome: string
  tipo: 'receita' | 'atestado' | 'termo' | 'documento'
  conteudo: string
}

export type Atendimento = {
  id: string
  data: string            // AAAA-MM-DD
  profissional: string
  tipo?: string           // tipo de atendimento (lista configurável da clínica)
  motivo: string
  anamnese?: string
  exameFisico?: string
  peso?: number
  temperatura?: number
  diagnostico?: string
  conduta?: string
  prescricao?: string
}

// Registro clínico leve (nota livre ou diagnóstico) — entra na linha do tempo
export type RegistroClinico = {
  id: string
  tipo: 'observacao' | 'patologia'
  data: string            // AAAA-MM-DD
  texto: string
  autor?: string
}

export type Pet = {
  id: string
  nome: string
  especie: Especie
  raca: string
  nascimento: string
  peso: number
  castrado: boolean
  sexo?: 'macho' | 'femea'
  porte?: 'pequeno' | 'medio' | 'grande' | 'gigante'
  pelagem?: string
  temperamento?: string       // dócil, agitado, medroso… orienta o manejo seguro
  microchip?: string
  rga?: string                // registro em associação de raça (animal com pedigree)
  pedigree?: boolean
  alerta?: string
  observacoes?: string        // anotações gerais (não é alerta clínico)
  condicoes?: string[]        // quadro clínico: condições crônicas/contínuas
  vacinas: Vacina[]
  atendimentos: Atendimento[]
  registros?: RegistroClinico[]
}

export type Tutor = {
  id: string
  nome: string
  telefone: string
  email?: string
  nascimento?: string
  endereco?: string
  origem: string
  etapa: 'lead' | 'agendado' | 'cliente' | 'inativo'
  desde: string
  pets: Pet[]
}

export type Agendamento = {
  id: string
  data: string            // AAAA-MM-DD
  hora: string
  pet: string
  tutor: string
  servico: string
  profissional: string
  status: StatusAgenda
  canal: 'ia' | 'recepcao'
}

export type Servico = { id: string; nome: string; categoria: string; preco: number; duracao: number; descricao?: string; observacao?: string }

export type Profissional = { id: string; nome: string; especialidade?: string; telefone?: string; comissaoPct?: number }

export type InventoryItem = {
  id: string
  nome: string
  codigo?: string
  categoria: 'medicamento' | 'vacina' | 'material' | 'alimento'
  quantidade_estoque: number
  quantidade_minima: number
  quantidade_maxima: number
  data_validade?: string
  lote?: string
  fornecedor_nome?: string
  fornecedor_contato?: string
  preco_custo?: number
  preco_venda?: number
  ativo: boolean
}

export type InventoryMovement = {
  id: string
  inventory_id: string
  tipo: 'entrada' | 'saida' | 'ajuste' | 'perda' | 'vencimento'
  quantidade: number
  motivo?: string
  atendimento_id?: string
  data: string
}

export type Exame = {
  id: string
  pet_id: string
  atendimento_id?: string
  tipo: string
  data_solicitacao: string
  data_resultado?: string
  resultado?: string
  observacoes?: string
  status: 'solicitado' | 'concluído' | 'cancelado'
}

export type FormaPagamento = 'dinheiro' | 'pix' | 'credito' | 'debito' | 'boleto' | 'outro'

// Venda (PDV) — comanda de produtos e/ou serviços
export type ItemVenda = {
  refId: string
  tipo: 'servico' | 'produto'
  nome: string
  quantidade: number
  precoUnit: number
}
export type Venda = {
  id: string
  data: string            // AAAA-MM-DD
  clienteNome?: string
  petNome?: string
  itens: ItemVenda[]
  desconto: number
  total: number
  formaPagamento?: FormaPagamento   // undefined quando lançada na conta do cliente (fiado)
  naConta?: boolean                 // true = adicionada à conta do cliente, em aberto
  profissional?: string
}

// Orçamento — venda ainda não confirmada; vira venda ao ser aprovado
export type Orcamento = {
  id: string
  data: string            // AAAA-MM-DD
  validade?: string       // AAAA-MM-DD
  clienteNome?: string
  petNome?: string
  itens: ItemVenda[]
  desconto: number
  total: number
  status: 'aberto' | 'convertido' | 'recusado'
}

// Internação — animal internado com parâmetros clínicos ao longo do tempo
export type ParametroClinico = {
  id: string
  data: string            // AAAA-MM-DD
  hora: string            // HH:MM
  temperatura?: number
  fc?: number             // frequência cardíaca (bpm)
  fr?: number             // frequência respiratória (mpm)
  mucosas?: string        // coloração das mucosas (normocoradas, pálidas…)
  obs?: string
}

// Mapa de execução (aprazamento) — cada horário previsto de uma medicação, marcável
export type HorarioAprazado = { hora: string; aplicado: boolean }
export type MedicacaoInternacao = {
  id: string
  medicamento: string
  dose: string            // "20mg", "1 comprimido"
  via: string             // IV, IM, SC, VO
  intervaloHoras: number  // de quantas em quantas horas
  horarios: HorarioAprazado[]
}

// Leito/baia da clínica — ocupação derivada das internações ativas
export type EspecieBox = 'cao' | 'gato' | 'ambos'
export type FinalidadeBox = 'comum' | 'uti' | 'isolamento' | 'semi'
export type Box = {
  id: string
  nome: string
  especie: EspecieBox        // tipo de animal que o box atende
  finalidade: FinalidadeBox  // internação comum, UTI, isolamento, semi-intensiva
  observacao?: string
}

export const ESPECIE_BOX: Record<EspecieBox, string> = { cao: 'Cão', gato: 'Gato', ambos: 'Cão e gato' }
export const FINALIDADE_BOX: Record<FinalidadeBox, string> = {
  comum: 'Internação comum', uti: 'UTI', isolamento: 'Isolamento', semi: 'Semi-intensiva',
}

export type Internacao = {
  id: string
  petId: string
  petNome: string
  tutorNome: string
  especie: Especie
  box?: string            // id do box
  motivo: string
  profissional?: string
  entrada: string         // AAAA-MM-DD
  previsaoAlta?: string
  saida?: string          // AAAA-MM-DD (preenchido na alta)
  valorDiaria: number     // R$/dia — base do lançamento gerado na alta
  status: 'internado' | 'alta'
  parametros: ParametroClinico[]
  medicacoes: MedicacaoInternacao[]
}

// Movimentos de caixa (abertura, suprimento, sangria, fechamento)
export type MovimentoCaixa = {
  id: string
  tipo: 'abertura' | 'entrada' | 'saida' | 'fechamento'
  descricao: string
  valor: number
  hora: string            // HH:MM
}
export type Caixa = {
  id: string
  data: string            // AAAA-MM-DD
  aberto: boolean
  movimentos: MovimentoCaixa[]
}

// Fornecedor (PJ) — empresa que fornece produtos/serviços para a clínica.
// É a contraparte B2B: a clínica atende tutores (PF/CPF) mas compra de empresas (PJ/CNPJ).
export type Fornecedor = {
  id: string
  razaoSocial: string          // razão social (identidade jurídica) — obrigatório
  nomeFantasia?: string        // como é conhecido no dia a dia
  cnpj?: string                // 00.000.000/0000-00
  inscricaoEstadual?: string
  contato?: string             // pessoa de contato
  telefone?: string
  email?: string
  endereco?: string
  categoria?: string           // insumos, medicamentos, ração, serviços…
  observacoes?: string
  ativo: boolean
}

export type Lancamento = {
  id: string
  tipo: 'receber' | 'pagar'
  descricao: string
  categoria?: string
  valor: number
  vencimento: string          // AAAA-MM-DD
  pagoEm?: string             // undefined = em aberto
  formaPagamento?: FormaPagamento
  tutorNome?: string
  petNome?: string
  fornecedorId?: string       // vínculo com a empresa fornecedora (contas a pagar)
  fornecedorNome?: string
  documento?: string          // nº da nota fiscal / boleto
}

// Regra de comissão definida pela clínica contratante (varia por contrato).
export type ConfigComissao = {
  incideSobre: 'servicos' | 'tudo'   // só serviços (padrão) ou serviços + produtos
  base: 'liquido' | 'bruto'          // sobre o valor cobrado após desconto (padrão) ou valor de tabela
}
export const CONFIG_COMISSAO_PADRAO: ConfigComissao = { incideSobre: 'servicos', base: 'liquido' }

export type DB = {
  tutores: Tutor[]
  agenda: Agendamento[]
  servicos: Servico[]
  profissionais: Profissional[]
  estoque: InventoryItem[]
  exames: Exame[]
  protocolos: ProtocoloVacina[]
  tiposAtendimento: string[]
  modelos: ModeloDocumento[]
  vendas: Venda[]
  orcamentos: Orcamento[]
  caixa: Caixa | null
  boxes: Box[]
  internacoes: Internacao[]
  lancamentos: Lancamento[]
  fornecedores: Fornecedor[]
  comissao: ConfigComissao
  kpis: { faturamentoMes: number; noShowPct: number; ocupacaoPct: number; vacinasAtrasadas: number; agendadosPelaIA: number; ticketMedio: number }
  receitaSemana: { dia: string; valor: number }[]
}

/**
 * Base de comissão de uma venda conforme a regra da clínica.
 * - incideSobre: filtra só serviços ou serviços + produtos
 * - base 'liquido': distribui o desconto proporcionalmente sobre a parte comissionável
 */
export const baseComissaoVenda = (v: Venda, cfg: ConfigComissao): number => {
  const comissionaveis = cfg.incideSobre === 'servicos'
    ? v.itens.filter(i => i.tipo === 'servico')
    : v.itens
  const brutoComissionavel = comissionaveis.reduce((s, i) => s + i.quantidade * i.precoUnit, 0)
  if (cfg.base === 'bruto') return brutoComissionavel
  const brutoTotal = v.itens.reduce((s, i) => s + i.quantidade * i.precoUnit, 0)
  const fator = brutoTotal > 0 ? v.total / brutoTotal : 1 // v.total = bruto − desconto
  return brutoComissionavel * fator
}

/** Formata um CNPJ (só dígitos ou já formatado) como 00.000.000/0000-00.
 *  Se não tiver 14 dígitos, devolve o que veio (deixa o usuário preencher parcial). */
export const formatarCNPJ = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length !== 14) return v
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

/** Dias de atraso de um lançamento em aberto (negativo = ainda vai vencer). */
export const diasAtraso = (l: Lancamento) =>
  Math.round((new Date().setHours(0, 0, 0, 0) - new Date(l.vencimento + 'T00:00:00').getTime()) / 86400000)

/** Dias até a próxima dose (negativo = já passou). Usa meia-noite local. */
export const diasAteDose = (proximaDose: string) =>
  Math.round((new Date(proximaDose + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)

/**
 * Situação da vacina SEMPRE recalculada pela data de hoje — não confiar no
 * campo `situacao` gravado, que "envelhece" e passa a divergir da data real.
 * < 0 = atrasada · até 30 dias = vence em breve · resto = em dia.
 */
export const situacaoVacina = (proximaDose: string): SituacaoVacina => {
  const dias = diasAteDose(proximaDose)
  if (dias < 0) return 'atrasada'
  if (dias <= 30) return 'proxima'
  return 'em_dia'
}

// datas relativas para a demonstração nunca ficar desatualizada
const desloca = (dias: number) => {
  const d = new Date(); d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}
const hojeMenos = (d: number) => desloca(-d)
const hojeMais = (d: number) => desloca(d)

const servicos: Servico[] = [
  { id: 's1', nome: 'Consulta clínica', categoria: 'consulta', preco: 150, duracao: 30, descricao: 'Avaliação clínica geral do pet, com exame físico e orientações ao tutor.' },
  { id: 's2', nome: 'Vacina V10', categoria: 'vacina', preco: 90, duracao: 15, descricao: 'Vacina múltipla para cães (V10). Protege contra cinomose, parvovirose, leptospirose e outras.' },
  { id: 's3', nome: 'Vacina antirrábica', categoria: 'vacina', preco: 70, duracao: 15 },
  { id: 's4', nome: 'Banho e tosa', categoria: 'banho_tosa', preco: 80, duracao: 60, observacao: 'Confirmar porte do animal para ajustar o valor.' },
  { id: 's5', nome: 'Castração', categoria: 'cirurgia', preco: 850, duracao: 120, descricao: 'Cirurgia de castração com anestesia e acompanhamento pós-operatório.', observacao: 'Jejum de 8h antes do procedimento.' },
  { id: 's6', nome: 'Hemograma', categoria: 'exame', preco: 120, duracao: 20 },
  { id: 's7', nome: 'Retorno', categoria: 'consulta', preco: 0, duracao: 20, descricao: 'Retorno / revisão de consulta — sem custo em até 15 dias do atendimento.', observacao: 'Ajuste o valor se a clínica cobrar pelo retorno.' },
]

const profissionais: Profissional[] = [
  { id: 'pr1', nome: 'Dra. Helena', especialidade: 'Clínica geral', telefone: '47 99999-0001', comissaoPct: 10 },
  { id: 'pr2', nome: 'Dr. Bruno', especialidade: 'Cirurgia', telefone: '47 99999-0002', comissaoPct: 12 },
  { id: 'pr3', nome: 'Equipe banho', especialidade: 'Banho e tosa', comissaoPct: 15 },
]

export const db: Record<'c1' | 'c2', DB> = {
  c1: {
    servicos,
    profissionais,
    tutores: [
      {
        id: 't1', nome: 'Marina Costa', telefone: '47 99812-4455', origem: 'Instagram Ads',
        email: 'marina.costa@email.com', nascimento: '1990-05-14',
        endereco: 'Rua das Flores, 123 — Balneário Camboriú/SC',
        etapa: 'cliente', desde: '2024-03-12',
        pets: [{
          id: 'p1', nome: 'Thor', especie: 'cao', raca: 'Golden Retriever',
          nascimento: '2021-06-04', peso: 32.4, castrado: true, alerta: 'Alergia a carrapaticida',
          sexo: 'macho', pelagem: 'Dourada', microchip: '981098201234567', pedigree: true,
          porte: 'grande', temperamento: 'Dócil', rga: 'CBKC-0553120',
          observacoes: 'Tranquilo no banho. Chega puxando pela guia. Prefere ser atendido pela manhã.',
          condicoes: ['Dermatite alérgica crônica', 'Sensibilidade a carrapaticida'],
          vacinas: [
            { vacina: 'V10', aplicacao: '2025-07-10', proximaDose: '2026-07-10', situacao: 'atrasada' },
            { vacina: 'Antirrábica', aplicacao: '2025-08-02', proximaDose: '2026-08-02', situacao: 'proxima' },
          ],
          atendimentos: [
            {
              id: 'c1', data: '2026-05-14', profissional: 'Dra. Helena',
              tipo: 'Consulta dermatológica',
              motivo: 'Coceira e vermelhidão nas patas',
              anamnese: 'Tutora relata que começou há uma semana, após passeio no parque. Sem mudança de ração.',
              exameFisico: 'Eritema interdigital nas quatro patas. Sem otite. Mucosas normocoradas.',
              peso: 32.4, temperatura: 38.6,
              diagnostico: 'Dermatite alérgica de contato',
              conduta: 'Banho com shampoo hipoalergênico 2x/semana. Evitar carrapaticida da marca atual.',
              prescricao: 'Prednisolona 20mg — 1/2 comprimido a cada 24h por 5 dias.\nShampoo hipoalergênico — uso tópico 2x/semana.',
            },
            {
              id: 'c2', data: '2025-11-03', profissional: 'Dr. Bruno',
              tipo: 'Consulta genérica',
              motivo: 'Check-up anual',
              exameFisico: 'Bom estado geral. Escore corporal 5/9. Dentição com tártaro leve.',
              peso: 31.1, temperatura: 38.2,
              diagnostico: 'Hígido',
              conduta: 'Manter ração atual. Sugerida limpeza dentária em 6 meses.',
            },
          ],
          registros: [
            { id: 'r1', tipo: 'patologia', data: '2026-05-14', texto: 'Dermatite alérgica de contato', autor: 'Dra. Helena' },
            { id: 'r2', tipo: 'observacao', data: '2026-05-20', texto: 'Tutora informou melhora do quadro após 5 dias de tratamento. Coceira reduziu bastante.', autor: 'Dra. Helena' },
          ],
        }],
      },
      {
        id: 't2', nome: 'Ricardo Alves', telefone: '47 99640-2213', origem: 'Indicação',
        etapa: 'cliente', desde: '2023-11-28',
        pets: [
          {
            id: 'p2', nome: 'Mel', especie: 'gato', raca: 'SRD',
            nascimento: '2022-01-19', peso: 4.1, castrado: true,
            vacinas: [
              { vacina: 'Tríplice felina', aplicacao: '2026-02-14', proximaDose: '2027-02-14', situacao: 'em_dia' },
              { vacina: 'Antirrábica', aplicacao: '2026-02-14', proximaDose: '2027-02-14', situacao: 'em_dia' },
            ],
            atendimentos: [],
          },
          {
            id: 'p3', nome: 'Bidu', especie: 'cao', raca: 'Shih-tzu',
            nascimento: '2019-09-30', peso: 7.8, castrado: false,
            vacinas: [{ vacina: 'V10', aplicacao: '2025-09-05', proximaDose: '2026-09-05', situacao: 'proxima' }],
            atendimentos: [],
          },
        ],
      },
      {
        id: 't3', nome: 'Juliana Prado', telefone: '47 99127-8890', origem: 'Google',
        etapa: 'inativo', desde: '2024-01-05',
        pets: [{
          id: 'p4', nome: 'Nina', especie: 'cao', raca: 'Border Collie',
          nascimento: '2023-04-22', peso: 18.2, castrado: false,
          vacinas: [{ vacina: 'V10', aplicacao: '2025-05-18', proximaDose: '2026-05-18', situacao: 'atrasada' }],
            atendimentos: [],
        }],
      },
      {
        id: 't4', nome: 'Felipe Moraes', telefone: '47 98803-1177', origem: 'Instagram Ads',
        etapa: 'agendado', desde: '2026-07-02',
        pets: [{
          id: 'p5', nome: 'Amora', especie: 'gato', raca: 'Siamês',
          nascimento: '2025-11-11', peso: 2.6, castrado: false,
          vacinas: [{ vacina: 'Tríplice felina', aplicacao: '2026-06-20', proximaDose: hojeMenos(5), situacao: 'atrasada' }],
            atendimentos: [],
        }],
      },
      {
        id: 't5', nome: 'Camila Ferreira', telefone: '47 99735-6621', origem: 'Instagram Ads',
        email: 'camila.ferreira@email.com', nascimento: '1988-09-23',
        endereco: 'Av. Brasil, 890 — Balneário Camboriú/SC',
        etapa: 'cliente', desde: '2024-06-18',
        pets: [{
          id: 'p6', nome: 'Amendoim', especie: 'cao', raca: 'Poodle', sexo: 'macho',
          nascimento: '2020-03-15', peso: 6.2, castrado: true, porte: 'pequeno', temperamento: 'Agitado',
          vacinas: [
            { vacina: 'V10', aplicacao: '2025-11-20', proximaDose: hojeMais(118), situacao: 'em_dia' },
            { vacina: 'Antirrábica', aplicacao: '2026-06-30', proximaDose: hojeMais(14), situacao: 'proxima' },
          ],
          atendimentos: [{
            id: 'c10', data: hojeMenos(20), profissional: 'Dra. Helena', tipo: 'Consulta clínica',
            motivo: 'Retorno de vômito', exameFisico: 'Bom estado geral, hidratado.', peso: 6.2, temperatura: 38.4,
            diagnostico: 'Gastrite leve', conduta: 'Dieta branda por 3 dias e protetor gástrico.',
          }],
        }],
      },
      {
        id: 't6', nome: 'Rafael Nunes', telefone: '47 99188-2044', origem: 'Indicação',
        email: 'rafael.nunes@email.com', etapa: 'cliente', desde: '2023-08-09',
        pets: [
          {
            id: 'p7', nome: 'Frida', especie: 'cao', raca: 'Bulldog Francês', sexo: 'femea',
            nascimento: '2022-10-02', peso: 11.4, castrado: true, porte: 'medio', temperamento: 'Dócil',
            observacoes: 'Braquicefálico — atenção ao calor e à respiração no banho.',
            condicoes: ['Braquicefalia'],
            vacinas: [{ vacina: 'V10', aplicacao: '2026-07-01', proximaDose: hojeMais(220), situacao: 'em_dia' }],
            atendimentos: [],
          },
          {
            id: 'p8', nome: 'Tobias', especie: 'gato', raca: 'Maine Coon', sexo: 'macho',
            nascimento: '2021-12-19', peso: 7.9, castrado: true, porte: 'grande', temperamento: 'Tranquilo',
            vacinas: [{ vacina: 'Tríplice felina', aplicacao: '2026-05-10', proximaDose: hojeMais(20), situacao: 'proxima' }],
            atendimentos: [],
          },
        ],
      },
      {
        id: 't7', nome: 'Beatriz Lima', telefone: '47 99902-3388', origem: 'Google',
        nascimento: '1995-02-28', etapa: 'cliente', desde: '2025-01-22',
        pets: [{
          id: 'p9', nome: 'Simba', especie: 'cao', raca: 'Golden Retriever', sexo: 'macho',
          nascimento: '2019-07-30', peso: 34.1, castrado: false, porte: 'grande', temperamento: 'Dócil',
          vacinas: [
            { vacina: 'V10', aplicacao: '2025-06-15', proximaDose: hojeMenos(40), situacao: 'atrasada' },
            { vacina: 'Antirrábica', aplicacao: '2025-06-15', proximaDose: hojeMenos(40), situacao: 'atrasada' },
          ],
          atendimentos: [],
        }],
      },
      {
        id: 't8', nome: 'Diego Souza', telefone: '47 98471-9012', origem: 'Instagram Ads',
        etapa: 'cliente', desde: '2024-11-03',
        pets: [{
          id: 'p10', nome: 'Luna', especie: 'cao', raca: 'Lhasa Apso', sexo: 'femea',
          nascimento: '2023-02-11', peso: 6.7, castrado: true, porte: 'pequeno', temperamento: 'Medroso',
          vacinas: [{ vacina: 'V10', aplicacao: '2026-07-05', proximaDose: hojeMais(240), situacao: 'em_dia' }],
          atendimentos: [],
        }],
      },
      {
        id: 't9', nome: 'Patrícia Gomes', telefone: '47 99560-7745', origem: 'Indicação',
        email: 'patricia.gomes@email.com', etapa: 'cliente', desde: '2023-05-14',
        pets: [{
          id: 'p11', nome: 'Bob', especie: 'cao', raca: 'Beagle', sexo: 'macho',
          nascimento: '2020-08-08', peso: 13.9, castrado: true, porte: 'medio', temperamento: 'Agitado',
          vacinas: [{ vacina: 'Antirrábica', aplicacao: '2026-06-10', proximaDose: hojeMais(9), situacao: 'proxima' }],
          atendimentos: [{
            id: 'c11', data: hojeMenos(12), profissional: 'Dr. Bruno', tipo: 'Consulta clínica',
            motivo: 'Mancando pata traseira', exameFisico: 'Leve edema no joelho direito.', peso: 13.9,
            diagnostico: 'Suspeita de lesão de ligamento', conduta: 'Repouso e anti-inflamatório; reavaliar em 10 dias.',
          }],
        }],
      },
      {
        id: 't10', nome: 'André Martins', telefone: '47 99013-5567', origem: 'Google',
        etapa: 'cliente', desde: '2025-03-30',
        pets: [{
          id: 'p12', nome: 'Nala', especie: 'gato', raca: 'Persa', sexo: 'femea',
          nascimento: '2022-04-27', peso: 3.8, castrado: true, porte: 'pequeno', temperamento: 'Tranquilo',
          observacoes: 'Pelagem longa — tosa higiênica periódica.',
          vacinas: [{ vacina: 'Tríplice felina', aplicacao: '2026-03-18', proximaDose: hojeMais(21), situacao: 'proxima' }],
          atendimentos: [],
        }],
      },
      {
        id: 't11', nome: 'Larissa Rocha', telefone: '47 99845-1290', origem: 'Instagram Ads',
        nascimento: '1992-11-06', etapa: 'cliente', desde: '2024-09-12',
        pets: [{
          id: 'p13', nome: 'Thor', especie: 'cao', raca: 'Rottweiler', sexo: 'macho',
          nascimento: '2021-01-25', peso: 41.5, castrado: false, porte: 'gigante', temperamento: 'Agitado',
          observacoes: 'Manejo com focinheira no banho por precaução.',
          vacinas: [{ vacina: 'V10', aplicacao: '2026-06-28', proximaDose: hojeMais(200), situacao: 'em_dia' }],
          atendimentos: [],
        }],
      },
      {
        id: 't12', nome: 'Gustavo Pereira', telefone: '47 98122-6633', origem: 'Indicação',
        etapa: 'cliente', desde: '2023-12-01',
        pets: [{
          id: 'p14', nome: 'Pretinha', especie: 'gato', raca: 'SRD', sexo: 'femea',
          nascimento: '2020-06-14', peso: 4.4, castrado: true, porte: 'pequeno', temperamento: 'Medroso',
          vacinas: [{ vacina: 'Antirrábica', aplicacao: '2025-06-01', proximaDose: hojeMenos(15), situacao: 'atrasada' }],
          atendimentos: [],
        }],
      },
      {
        id: 't13', nome: 'Fernanda Dias', telefone: '47 99677-8811', origem: 'Google',
        email: 'fernanda.dias@email.com', etapa: 'cliente', desde: '2025-05-19',
        pets: [{
          id: 'p15', nome: 'Zeca', especie: 'cao', raca: 'Dachshund', sexo: 'macho',
          nascimento: '2022-09-09', peso: 8.3, castrado: false, porte: 'pequeno', temperamento: 'Dócil',
          condicoes: ['Predisposição a problema de coluna'],
          vacinas: [{ vacina: 'V10', aplicacao: '2026-07-12', proximaDose: hojeMais(250), situacao: 'em_dia' }],
          atendimentos: [],
        }],
      },
      {
        id: 't14', nome: 'Bruno Carvalho', telefone: '47 98390-4521', origem: 'Instagram Ads',
        etapa: 'lead', desde: hojeMenos(3),
        pets: [{
          id: 'p16', nome: 'Maggie', especie: 'cao', raca: 'Labrador', sexo: 'femea',
          nascimento: '2024-05-20', peso: 22.0, castrado: false, porte: 'grande', temperamento: 'Agitado',
          vacinas: [],
          atendimentos: [],
        }],
      },
      {
        id: 't15', nome: 'Aline Ribeiro', telefone: '47 99254-7789', origem: 'Indicação',
        nascimento: '1990-07-17', etapa: 'cliente', desde: '2024-02-08',
        pets: [{
          id: 'p17', nome: 'Mia', especie: 'gato', raca: 'Ragdoll', sexo: 'femea',
          nascimento: '2023-08-30', peso: 4.0, castrado: true, porte: 'pequeno', temperamento: 'Tranquilo',
          vacinas: [{ vacina: 'Tríplice felina', aplicacao: '2026-04-05', proximaDose: hojeMais(25), situacao: 'proxima' }],
          atendimentos: [],
        }],
      },
      {
        id: 't16', nome: 'Marcelo Teixeira', telefone: '47 98865-3320', origem: 'Google',
        etapa: 'cliente', desde: '2023-10-25',
        pets: [{
          id: 'p18', nome: 'Rex', especie: 'cao', raca: 'Pastor Alemão', sexo: 'macho',
          nascimento: '2020-11-30', peso: 36.8, castrado: true, porte: 'grande', temperamento: 'Dócil',
          vacinas: [{ vacina: 'V10', aplicacao: '2026-06-22', proximaDose: hojeMais(190), situacao: 'em_dia' }],
          atendimentos: [],
        }],
      },
      {
        id: 't17', nome: 'Juliana Castro', telefone: '47 99401-6650', origem: 'Instagram Ads',
        etapa: 'inativo', desde: '2023-07-11',
        pets: [{
          id: 'p19', nome: 'Belinha', especie: 'cao', raca: 'Yorkshire', sexo: 'femea',
          nascimento: '2019-05-05', peso: 3.1, castrado: true, porte: 'pequeno', temperamento: 'Medroso',
          vacinas: [{ vacina: 'V10', aplicacao: '2025-05-10', proximaDose: hojeMenos(30), situacao: 'atrasada' }],
          atendimentos: [],
        }],
      },
      {
        id: 't18', nome: 'Thiago Almeida', telefone: '47 98547-1198', origem: 'Indicação',
        etapa: 'cliente', desde: '2025-06-27',
        pets: [{
          id: 'p20', nome: 'Fumaça', especie: 'gato', raca: 'Azul Russo', sexo: 'macho',
          nascimento: '2024-01-14', peso: 3.5, castrado: false, porte: 'pequeno', temperamento: 'Agitado',
          vacinas: [{ vacina: 'Tríplice felina', aplicacao: '2026-07-08', proximaDose: hojeMais(255), situacao: 'em_dia' }],
          atendimentos: [],
        }],
      },
    ],
    agenda: [
      // hoje
      { id: 'a1', data: hojeMais(0), hora: '08:30', pet: 'Thor', tutor: 'Marina Costa', servico: 'Vacina V10', profissional: 'Dra. Helena', status: 'confirmada', canal: 'ia' },
      { id: 'a2', data: hojeMais(0), hora: '09:00', pet: 'Mel', tutor: 'Ricardo Alves', servico: 'Consulta clínica', profissional: 'Dra. Helena', status: 'atendida', canal: 'recepcao' },
      { id: 'a3', data: hojeMais(0), hora: '10:00', pet: 'Amora', tutor: 'Felipe Moraes', servico: 'Consulta clínica', profissional: 'Dr. Bruno', status: 'confirmada', canal: 'ia' },
      { id: 'a4', data: hojeMais(0), hora: '11:00', pet: 'Bidu', tutor: 'Ricardo Alves', servico: 'Banho e tosa', profissional: 'Equipe banho', status: 'pendente', canal: 'ia' },
      { id: 'a5', data: hojeMais(0), hora: '14:00', pet: 'Nina', tutor: 'Juliana Prado', servico: 'Consulta clínica', profissional: 'Dr. Bruno', status: 'falta', canal: 'recepcao' },
      { id: 'a6', data: hojeMais(0), hora: '15:30', pet: 'Thor', tutor: 'Marina Costa', servico: 'Hemograma', profissional: 'Dra. Helena', status: 'pendente', canal: 'ia' },
      // resto da semana
      { id: 'a20', data: hojeMais(1), hora: '09:30', pet: 'Thor', tutor: 'Marina Costa', servico: 'Retorno', profissional: 'Dra. Helena', status: 'confirmada', canal: 'ia' },
      { id: 'a21', data: hojeMais(1), hora: '11:00', pet: 'Mel', tutor: 'Ricardo Alves', servico: 'Vacina antirrábica', profissional: 'Dra. Helena', status: 'pendente', canal: 'ia' },
      { id: 'a22', data: hojeMais(2), hora: '10:00', pet: 'Nina', tutor: 'Juliana Prado', servico: 'Consulta clínica', profissional: 'Dr. Bruno', status: 'confirmada', canal: 'recepcao' },
      { id: 'a23', data: hojeMais(3), hora: '14:30', pet: 'Bidu', tutor: 'Ricardo Alves', servico: 'Banho e tosa', profissional: 'Equipe banho', status: 'pendente', canal: 'ia' },
      // mais adiante no mês
      { id: 'a24', data: hojeMais(9), hora: '10:00', pet: 'Amora', tutor: 'Felipe Moraes', servico: 'Vacina V10', profissional: 'Dra. Helena', status: 'confirmada', canal: 'ia' },
      { id: 'a25', data: hojeMais(16), hora: '15:00', pet: 'Thor', tutor: 'Marina Costa', servico: 'Consulta clínica', profissional: 'Dr. Bruno', status: 'pendente', canal: 'ia' },
      // hoje (agenda cheia)
      { id: 'a30', data: hojeMais(0), hora: '08:00', pet: 'Amendoim', tutor: 'Camila Ferreira', servico: 'Banho e tosa', profissional: 'Equipe banho', status: 'confirmada', canal: 'recepcao' },
      { id: 'a31', data: hojeMais(0), hora: '09:30', pet: 'Frida', tutor: 'Rafael Nunes', servico: 'Consulta clínica', profissional: 'Dra. Helena', status: 'confirmada', canal: 'ia' },
      { id: 'a32', data: hojeMais(0), hora: '10:30', pet: 'Bob', tutor: 'Patrícia Gomes', servico: 'Retorno', profissional: 'Dr. Bruno', status: 'confirmada', canal: 'ia' },
      { id: 'a33', data: hojeMais(0), hora: '13:00', pet: 'Nala', tutor: 'André Martins', servico: 'Vacina antirrábica', profissional: 'Dra. Helena', status: 'pendente', canal: 'ia' },
      { id: 'a34', data: hojeMais(0), hora: '16:00', pet: 'Rex', tutor: 'Marcelo Teixeira', servico: 'Consulta clínica', profissional: 'Dr. Bruno', status: 'confirmada', canal: 'recepcao' },
      { id: 'a35', data: hojeMais(0), hora: '17:00', pet: 'Simba', tutor: 'Beatriz Lima', servico: 'Vacina V10', profissional: 'Dra. Helena', status: 'pendente', canal: 'ia' },
      // amanhã
      { id: 'a36', data: hojeMais(1), hora: '08:30', pet: 'Tobias', tutor: 'Rafael Nunes', servico: 'Banho e tosa', profissional: 'Equipe banho', status: 'confirmada', canal: 'recepcao' },
      { id: 'a37', data: hojeMais(1), hora: '10:00', pet: 'Pretinha', tutor: 'Gustavo Pereira', servico: 'Vacina antirrábica', profissional: 'Dra. Helena', status: 'confirmada', canal: 'ia' },
      { id: 'a38', data: hojeMais(1), hora: '14:00', pet: 'Maggie', tutor: 'Bruno Carvalho', servico: 'Consulta clínica', profissional: 'Dr. Bruno', status: 'pendente', canal: 'ia' },
      // próximos dias
      { id: 'a39', data: hojeMais(2), hora: '09:00', pet: 'Mia', tutor: 'Aline Ribeiro', servico: 'Vacina antirrábica', profissional: 'Dra. Helena', status: 'confirmada', canal: 'ia' },
      { id: 'a40', data: hojeMais(2), hora: '11:30', pet: 'Zeca', tutor: 'Fernanda Dias', servico: 'Consulta clínica', profissional: 'Dra. Helena', status: 'confirmada', canal: 'recepcao' },
      { id: 'a41', data: hojeMais(3), hora: '10:00', pet: 'Luna', tutor: 'Diego Souza', servico: 'Banho e tosa', profissional: 'Equipe banho', status: 'pendente', canal: 'ia' },
      { id: 'a42', data: hojeMais(4), hora: '15:00', pet: 'Belinha', tutor: 'Juliana Castro', servico: 'Vacina V10', profissional: 'Dra. Helena', status: 'pendente', canal: 'ia' },
      { id: 'a43', data: hojeMais(5), hora: '09:30', pet: 'Simba', tutor: 'Beatriz Lima', servico: 'Castração', profissional: 'Dr. Bruno', status: 'confirmada', canal: 'recepcao' },
      { id: 'a44', data: hojeMais(7), hora: '11:00', pet: 'Amendoim', tutor: 'Camila Ferreira', servico: 'Hemograma', profissional: 'Dra. Helena', status: 'pendente', canal: 'ia' },
    ],
    lancamentos: [
      // a receber — em aberto e vencidos (alimentam a régua de cobrança)
      { id: 'f1', tipo: 'receber', descricao: 'Consulta clínica', categoria: 'consulta', valor: 150,
        vencimento: hojeMenos(23), tutorNome: 'Juliana Prado', petNome: 'Nina' },
      { id: 'f2', tipo: 'receber', descricao: 'Hemograma + consulta', categoria: 'exame', valor: 270,
        vencimento: hojeMenos(9), tutorNome: 'Marina Costa', petNome: 'Thor' },
      { id: 'f3', tipo: 'receber', descricao: 'Banho e tosa', categoria: 'banho_tosa', valor: 80,
        vencimento: hojeMais(4), tutorNome: 'Ricardo Alves', petNome: 'Bidu' },
      // a receber — já pagos (espalhados no tempo p/ o filtro de período mostrar variação)
      { id: 'f4', tipo: 'receber', descricao: 'Vacina V10', categoria: 'vacina', valor: 90,
        vencimento: hojeMenos(2), pagoEm: hojeMenos(2), formaPagamento: 'pix', tutorNome: 'Marina Costa', petNome: 'Thor' },
      { id: 'f5', tipo: 'receber', descricao: 'Castração', categoria: 'cirurgia', valor: 850,
        vencimento: hojeMenos(6), pagoEm: hojeMenos(6), formaPagamento: 'credito', tutorNome: 'Ricardo Alves', petNome: 'Mel' },
      { id: 'f12', tipo: 'receber', descricao: 'Consulta clínica', categoria: 'consulta', valor: 150,
        vencimento: hojeMenos(12), pagoEm: hojeMenos(12), formaPagamento: 'debito', tutorNome: 'Fernanda Lima', petNome: 'Bob' },
      { id: 'f13', tipo: 'receber', descricao: 'Vacina múltipla V10', categoria: 'vacina', valor: 90,
        vencimento: hojeMenos(18), pagoEm: hojeMenos(18), formaPagamento: 'pix', tutorNome: 'André Souza', petNome: 'Luna' },
      { id: 'f14', tipo: 'receber', descricao: 'Cirurgia — retirada de nódulo', categoria: 'cirurgia', valor: 300,
        vencimento: hojeMenos(27), pagoEm: hojeMenos(27), formaPagamento: 'credito', tutorNome: 'Patrícia Gomes', petNome: 'Simba' },
      // a pagar
      { id: 'f6', tipo: 'pagar', descricao: 'Aluguel da clínica', categoria: 'fixo', valor: 4200, vencimento: hojeMais(6) },
      { id: 'f7', tipo: 'pagar', descricao: 'Compra de vacinas V10 e antirrábica', categoria: 'insumo', valor: 1380,
        vencimento: hojeMais(2), fornecedorId: 'fo2', fornecedorNome: 'LaborXYZ Biológicos Ltda', documento: 'NF 45872' },
      { id: 'f8', tipo: 'pagar', descricao: 'Energia elétrica', categoria: 'fixo', valor: 640,
        vencimento: hojeMenos(3), pagoEm: hojeMenos(3), formaPagamento: 'boleto' },
      { id: 'f15', tipo: 'pagar', descricao: 'Ração e insumos', categoria: 'insumo', valor: 380,
        vencimento: hojeMenos(16), pagoEm: hojeMenos(16), formaPagamento: 'boleto', fornecedorId: 'fo1', fornecedorNome: 'FarmaXYZ Distribuidora Ltda', documento: 'NF 12088' },
      { id: 'f16', tipo: 'pagar', descricao: 'Luvas e descartáveis', categoria: 'insumo', valor: 120,
        vencimento: hojeMenos(26), pagoEm: hojeMenos(26), formaPagamento: 'pix', fornecedorId: 'fo1', fornecedorNome: 'FarmaXYZ Distribuidora Ltda', documento: 'NF 11990' },
      { id: 'f11', tipo: 'pagar', descricao: 'Antibióticos e analgésicos', categoria: 'insumo', valor: 920,
        vencimento: hojeMenos(4), fornecedorId: 'fo1', fornecedorNome: 'FarmaXYZ Distribuidora Ltda', documento: 'NF 12043' },
      // recebidos ao longo do mês (movimento de uma clínica cheia)
      { id: 'f20', tipo: 'receber', descricao: 'Castração', categoria: 'cirurgia', valor: 850,
        vencimento: hojeMenos(24), pagoEm: hojeMenos(24), formaPagamento: 'credito', tutorNome: 'Diego Souza', petNome: 'Luna' },
      { id: 'f21', tipo: 'receber', descricao: 'Consulta + medicação', categoria: 'consulta', valor: 165,
        vencimento: hojeMenos(22), pagoEm: hojeMenos(22), formaPagamento: 'pix', tutorNome: 'Patrícia Gomes', petNome: 'Bob' },
      { id: 'f22', tipo: 'receber', descricao: 'Hemograma', categoria: 'exame', valor: 120,
        vencimento: hojeMenos(20), pagoEm: hojeMenos(20), formaPagamento: 'debito', tutorNome: 'André Martins', petNome: 'Nala' },
      { id: 'f23', tipo: 'receber', descricao: 'Castração', categoria: 'cirurgia', valor: 850,
        vencimento: hojeMenos(12), pagoEm: hojeMenos(12), formaPagamento: 'credito', tutorNome: 'Thiago Almeida', petNome: 'Fumaça' },
      { id: 'f24', tipo: 'receber', descricao: 'Banho e tosa', categoria: 'banho_tosa', valor: 80,
        vencimento: hojeMenos(11), pagoEm: hojeMenos(11), formaPagamento: 'debito', tutorNome: 'Camila Ferreira', petNome: 'Amendoim' },
      { id: 'f25', tipo: 'receber', descricao: 'Ração premium (2un)', categoria: 'venda', valor: 240,
        vencimento: hojeMenos(15), pagoEm: hojeMenos(15), formaPagamento: 'dinheiro', tutorNome: 'Marcelo Teixeira', petNome: 'Rex' },
      { id: 'f26', tipo: 'receber', descricao: 'Hemograma + consulta', categoria: 'exame', valor: 250,
        vencimento: hojeMenos(8), pagoEm: hojeMenos(8), formaPagamento: 'credito', tutorNome: 'Patrícia Gomes', petNome: 'Bob' },
      { id: 'f27', tipo: 'receber', descricao: 'Consulta clínica', categoria: 'consulta', valor: 150,
        vencimento: hojeMais(3), tutorNome: 'Fernanda Dias', petNome: 'Zeca' },
      // despesas do mês
      { id: 'f28', tipo: 'pagar', descricao: 'Salários equipe', categoria: 'fixo', valor: 8600,
        vencimento: hojeMais(5) },
      { id: 'f29', tipo: 'pagar', descricao: 'Internet e telefonia', categoria: 'fixo', valor: 260,
        vencimento: hojeMenos(10), pagoEm: hojeMenos(10), formaPagamento: 'boleto' },
    ],
    fornecedores: [
      { id: 'fo1', razaoSocial: 'FarmaXYZ Distribuidora de Medicamentos Ltda', nomeFantasia: 'FarmaXYZ',
        cnpj: '12.345.678/0001-90', inscricaoEstadual: '251.234.567', contato: 'Roberto Lima',
        telefone: '47 3344-5566', email: 'vendas@farmaxyz.com.br',
        endereco: 'Rua Industrial, 800 — Joinville/SC', categoria: 'Medicamentos', ativo: true },
      { id: 'fo2', razaoSocial: 'LaborXYZ Produtos Biológicos Ltda', nomeFantasia: 'LaborXYZ',
        cnpj: '23.456.789/0001-01', inscricaoEstadual: '252.345.678', contato: 'Fernanda Souza',
        telefone: '47 3365-7788', email: 'comercial@laborxyz.com.br',
        endereco: 'Av. das Indústrias, 1200 — Blumenau/SC', categoria: 'Vacinas', ativo: true },
      { id: 'fo3', razaoSocial: 'MedicSupply Materiais Hospitalares Ltda', nomeFantasia: 'MedicSupply',
        cnpj: '34.567.890/0001-12', contato: 'Paulo Andrade',
        telefone: '47 3322-9900', email: 'atendimento@medicsupply.com.br',
        endereco: 'Rua do Comércio, 450 — Itajaí/SC', categoria: 'Materiais', ativo: true },
      { id: 'fo4', razaoSocial: 'Quality Lab Diagnósticos Ltda', nomeFantasia: 'QualityLab',
        cnpj: '45.678.901/0001-23', contato: 'Dra. Camila Reis',
        telefone: '47 3311-2233', email: 'lab@qualitylab.com.br',
        endereco: 'Rua Sete de Setembro, 90 — Balneário Camboriú/SC', categoria: 'Laboratório', ativo: true },
      { id: 'fo5', razaoSocial: 'Ração Brasil Comércio de Alimentos Ltda', nomeFantasia: 'RaçãoBrasil',
        cnpj: '56.789.012/0001-34', contato: 'Marcos Vinícius',
        telefone: '47 3300-4455', email: 'pedidos@racaobrasil.com.br',
        endereco: 'BR-101, km 120 — Tijucas/SC', categoria: 'Alimentos', ativo: true },
    ],
    estoque: [
      { id: 'inv1', nome: 'Amoxicilina 500mg', categoria: 'medicamento', codigo: 'AMX500', quantidade_estoque: 45, quantidade_minima: 10, quantidade_maxima: 100, data_validade: '2026-12-31', lote: 'LOTE123456', fornecedor_nome: 'FarmaXYZ', fornecedor_contato: '47 3344-5566', preco_custo: 2.50, preco_venda: 8.90, ativo: true },
      { id: 'inv2', nome: 'Vacina V10', categoria: 'vacina', codigo: 'V10-2026', quantidade_estoque: 5, quantidade_minima: 10, quantidade_maxima: 50, data_validade: '2026-08-15', lote: 'VAC987654', fornecedor_nome: 'LaborXYZ', fornecedor_contato: '47 3365-7788', preco_custo: 45.00, preco_venda: 90.00, ativo: true },
      { id: 'inv3', nome: 'Álcool 70%', categoria: 'material', codigo: 'ALC70', quantidade_estoque: 20, quantidade_minima: 5, quantidade_maxima: 30, data_validade: '2026-06-01', lote: 'LOTE555666', fornecedor_nome: 'QualityLab', preco_custo: 0.50, preco_venda: 1.20, ativo: true },
      { id: 'inv4', nome: 'Vacina Antirrábica', categoria: 'vacina', codigo: 'ARR-2026', quantidade_estoque: 12, quantidade_minima: 8, quantidade_maxima: 40, data_validade: '2027-03-20', lote: 'VAC111222', fornecedor_nome: 'LaborXYZ', fornecedor_contato: '47 3365-7788', preco_custo: 35.00, preco_venda: 70.00, ativo: true },
      { id: 'inv5', nome: 'Dipirona 500mg', categoria: 'medicamento', codigo: 'DIP500', quantidade_estoque: 60, quantidade_minima: 20, quantidade_maxima: 150, data_validade: '2027-05-15', lote: 'LOTE777888', fornecedor_nome: 'FarmaXYZ', fornecedor_contato: '47 3344-5566', preco_custo: 0.30, preco_venda: 1.50, ativo: true },
      { id: 'inv6', nome: 'Gaze 10x10cm', categoria: 'material', codigo: 'GAZ1010', quantidade_estoque: 200, quantidade_minima: 50, quantidade_maxima: 500, data_validade: '2027-12-31', lote: 'LOTE999000', fornecedor_nome: 'MedicSupply', preco_custo: 0.15, preco_venda: 0.50, ativo: true },
      { id: 'inv7', nome: 'Clorexidina 0.12%', categoria: 'material', codigo: 'CLX012', quantidade_estoque: 8, quantidade_minima: 5, quantidade_maxima: 20, data_validade: '2026-09-10', lote: 'LOTE222333', fornecedor_nome: 'QualityLab', preco_custo: 12.00, preco_venda: 28.00, ativo: true },
      { id: 'inv8', nome: 'Ração Premium Cão', categoria: 'alimento', codigo: 'RAC-DOG', quantidade_estoque: 15, quantidade_minima: 5, quantidade_maxima: 40, data_validade: '2026-10-20', lote: 'LOTE333444', fornecedor_nome: 'RacãoBrasil', preco_custo: 85.00, preco_venda: 120.00, ativo: true },
      { id: 'inv9', nome: 'Agulha 25x7', categoria: 'material', codigo: 'AGU257', quantidade_estoque: 150, quantidade_minima: 50, quantidade_maxima: 300, data_validade: '2027-01-30', lote: 'LOTE444555', fornecedor_nome: 'MedicSupply', preco_custo: 0.05, preco_venda: 0.20, ativo: true },
      { id: 'inv10', nome: 'Seringa 3ml', categoria: 'material', codigo: 'SIR3ML', quantidade_estoque: 120, quantidade_minima: 40, quantidade_maxima: 250, data_validade: '2027-08-15', lote: 'LOTE555666', fornecedor_nome: 'MedicSupply', preco_custo: 0.10, preco_venda: 0.35, ativo: true },
    ],
    exames: [
      { id: 'ex1', pet_id: 'p1', atendimento_id: 'c1', tipo: 'Hemograma', data_solicitacao: hojeMenos(7), data_resultado: hojeMenos(2), resultado: 'Hemácias: 5.8M | Hemoglobina: 14.2g/dL | Hematócrito: 42% | Leucócitos: 7.2K | Plaquetas: 250K', observacoes: 'Tudo dentro dos limites normais', status: 'concluído' },
      { id: 'ex2', pet_id: 'p1', atendimento_id: 'c2', tipo: 'Raio-X de tórax', data_solicitacao: hojeMenos(1), status: 'solicitado' },
      { id: 'ex3', pet_id: 'p2', atendimento_id: undefined, tipo: 'Ultrassom abdominal', data_solicitacao: hojeMenos(5), data_resultado: hojeMenos(1), resultado: 'Rim esquerdo: 38mm | Rim direito: 40mm | Bexiga: normal | Baço: normal', observacoes: 'Sem alterações relevantes', status: 'concluído' },
      { id: 'ex4', pet_id: 'p4', atendimento_id: undefined, tipo: 'Hemograma', data_solicitacao: hojeMenos(10), status: 'cancelado' },
    ],
    protocolos: [
      { id: 'pr1', nome: 'V8', especie: 'cao', reforcoMeses: 12, doseFilhoteDias: 21, ativo: true },
      { id: 'pr2', nome: 'V10', especie: 'cao', reforcoMeses: 12, doseFilhoteDias: 21, ativo: true },
      { id: 'pr3', nome: 'Antirrábica', especie: 'ambos', reforcoMeses: 12, ativo: true },
      { id: 'pr4', nome: 'Giárdia', especie: 'cao', reforcoMeses: 12, doseFilhoteDias: 21, ativo: true },
      { id: 'pr5', nome: 'Tríplice felina', especie: 'gato', reforcoMeses: 12, doseFilhoteDias: 21, ativo: true },
    ],
    tiposAtendimento: [
      'Consulta genérica', 'Retorno', 'Consulta dermatológica', 'Consulta odontológica',
      'Vacinação', 'Cirurgia', 'Emergência', 'Banho e tosa',
    ],
    modelos: [
      { id: 'md1', nome: 'Receita padrão', tipo: 'receita',
        conteudo: 'Uso veterinário\n\nPaciente: {pet} — {especie}, {raca}\nTutor: {tutor}\n\nPrescrição:\n\n1) \n2) \n\nOrientações: ' },
      { id: 'md2', nome: 'Atestado de saúde', tipo: 'atestado',
        conteudo: 'Atesto, para os devidos fins, que o animal {pet} ({especie}, raça {raca}), pertencente a {tutor}, encontra-se clinicamente saudável na data de {data}, apto a viagens e atividades.' },
      { id: 'md3', nome: 'Termo de consentimento cirúrgico', tipo: 'termo',
        conteudo: 'Eu, {tutor}, autorizo a realização do procedimento cirúrgico no animal {pet} ({especie}, {raca}), estando ciente dos riscos inerentes ao procedimento e à anestesia, previamente explicados pela equipe da {clinica}.' },
    ],
    vendas: [
      { id: 'vd1', data: hojeMenos(1), clienteNome: 'Marina Costa', petNome: 'Thor',
        itens: [{ refId: 's2', tipo: 'servico', nome: 'Vacina V10', quantidade: 1, precoUnit: 90 }],
        desconto: 0, total: 90, formaPagamento: 'pix', profissional: 'Dra. Helena' },
      { id: 'vd2', data: hojeMenos(2), clienteNome: 'Ricardo Alves', petNome: 'Mel',
        itens: [
          { refId: 's1', tipo: 'servico', nome: 'Consulta clínica', quantidade: 1, precoUnit: 150 },
          { refId: 'inv5', tipo: 'produto', nome: 'Dipirona 500mg', quantidade: 10, precoUnit: 1.50 },
        ],
        desconto: 5, total: 160, formaPagamento: 'credito', profissional: 'Dr. Bruno' },
      { id: 'vd3', data: hojeMenos(28), clienteNome: 'Camila Ferreira', petNome: 'Amendoim',
        itens: [{ refId: 's1', tipo: 'servico', nome: 'Consulta clínica', quantidade: 1, precoUnit: 150 }],
        desconto: 0, total: 150, formaPagamento: 'pix', profissional: 'Dra. Helena' },
      { id: 'vd4', data: hojeMenos(27), clienteNome: 'Rafael Nunes', petNome: 'Frida',
        itens: [{ refId: 's4', tipo: 'servico', nome: 'Banho e tosa', quantidade: 1, precoUnit: 80 }],
        desconto: 0, total: 80, formaPagamento: 'dinheiro', profissional: 'Equipe banho' },
      { id: 'vd5', data: hojeMenos(25), clienteNome: 'Beatriz Lima', petNome: 'Simba',
        itens: [
          { refId: 's2', tipo: 'servico', nome: 'Vacina V10', quantidade: 1, precoUnit: 90 },
          { refId: 'inv8', tipo: 'produto', nome: 'Ração Premium Cão', quantidade: 1, precoUnit: 120 },
        ], desconto: 10, total: 200, formaPagamento: 'credito', profissional: 'Dra. Helena' },
      { id: 'vd6', data: hojeMenos(24), clienteNome: 'Diego Souza', petNome: 'Luna',
        itens: [{ refId: 's5', tipo: 'servico', nome: 'Castração', quantidade: 1, precoUnit: 850 }],
        desconto: 0, total: 850, formaPagamento: 'credito', profissional: 'Dr. Bruno' },
      { id: 'vd7', data: hojeMenos(22), clienteNome: 'Patrícia Gomes', petNome: 'Bob',
        itens: [
          { refId: 's1', tipo: 'servico', nome: 'Consulta clínica', quantidade: 1, precoUnit: 150 },
          { refId: 'inv5', tipo: 'produto', nome: 'Dipirona 500mg', quantidade: 10, precoUnit: 1.50 },
        ], desconto: 0, total: 165, formaPagamento: 'pix', profissional: 'Dr. Bruno' },
      { id: 'vd8', data: hojeMenos(20), clienteNome: 'André Martins', petNome: 'Nala',
        itens: [{ refId: 's6', tipo: 'servico', nome: 'Hemograma', quantidade: 1, precoUnit: 120 }],
        desconto: 0, total: 120, formaPagamento: 'debito', profissional: 'Dra. Helena' },
      { id: 'vd9', data: hojeMenos(19), clienteNome: 'Gustavo Pereira', petNome: 'Pretinha',
        itens: [{ refId: 's4', tipo: 'servico', nome: 'Banho e tosa', quantidade: 1, precoUnit: 80 }],
        desconto: 0, total: 80, formaPagamento: 'dinheiro', profissional: 'Equipe banho' },
      { id: 'vd10', data: hojeMenos(18), clienteNome: 'Larissa Rocha', petNome: 'Thor',
        itens: [{ refId: 's3', tipo: 'servico', nome: 'Vacina antirrábica', quantidade: 1, precoUnit: 70 }],
        desconto: 0, total: 70, formaPagamento: 'pix', profissional: 'Dra. Helena' },
      { id: 'vd11', data: hojeMenos(16), clienteNome: 'Fernanda Dias', petNome: 'Zeca',
        itens: [{ refId: 's1', tipo: 'servico', nome: 'Consulta clínica', quantidade: 1, precoUnit: 150 }],
        desconto: 0, total: 150, formaPagamento: 'credito', profissional: 'Dra. Helena' },
      { id: 'vd12', data: hojeMenos(15), clienteNome: 'Marcelo Teixeira', petNome: 'Rex',
        itens: [{ refId: 'inv8', tipo: 'produto', nome: 'Ração Premium Cão', quantidade: 2, precoUnit: 120 }],
        desconto: 0, total: 240, formaPagamento: 'dinheiro', profissional: 'Dra. Helena' },
      { id: 'vd13', data: hojeMenos(14), clienteNome: 'Aline Ribeiro', petNome: 'Mia',
        itens: [
          { refId: 's1', tipo: 'servico', nome: 'Consulta clínica', quantidade: 1, precoUnit: 150 },
          { refId: 'inv1', tipo: 'produto', nome: 'Amoxicilina 500mg', quantidade: 2, precoUnit: 8.90 },
        ], desconto: 0, total: 167.80, formaPagamento: 'pix', profissional: 'Dra. Helena' },
      { id: 'vd14', data: hojeMenos(12), clienteNome: 'Thiago Almeida', petNome: 'Fumaça',
        itens: [{ refId: 's5', tipo: 'servico', nome: 'Castração', quantidade: 1, precoUnit: 850 }],
        desconto: 0, total: 850, formaPagamento: 'credito', profissional: 'Dr. Bruno' },
      { id: 'vd15', data: hojeMenos(11), clienteNome: 'Camila Ferreira', petNome: 'Amendoim',
        itens: [{ refId: 's4', tipo: 'servico', nome: 'Banho e tosa', quantidade: 1, precoUnit: 80 }],
        desconto: 0, total: 80, formaPagamento: 'debito', profissional: 'Equipe banho' },
      { id: 'vd16', data: hojeMenos(10), clienteNome: 'Rafael Nunes', petNome: 'Tobias',
        itens: [{ refId: 's1', tipo: 'servico', nome: 'Consulta clínica', quantidade: 1, precoUnit: 150 }],
        desconto: 0, total: 150, formaPagamento: 'pix', profissional: 'Dr. Bruno' },
      { id: 'vd17', data: hojeMenos(9), clienteNome: 'Beatriz Lima', petNome: 'Simba',
        itens: [{ refId: 's2', tipo: 'servico', nome: 'Vacina V10', quantidade: 1, precoUnit: 90 }],
        desconto: 0, total: 90, formaPagamento: 'dinheiro', profissional: 'Dra. Helena' },
      { id: 'vd18', data: hojeMenos(8), clienteNome: 'Patrícia Gomes', petNome: 'Bob',
        itens: [
          { refId: 's6', tipo: 'servico', nome: 'Hemograma', quantidade: 1, precoUnit: 120 },
          { refId: 's1', tipo: 'servico', nome: 'Consulta clínica', quantidade: 1, precoUnit: 150 },
        ], desconto: 20, total: 250, formaPagamento: 'credito', profissional: 'Dr. Bruno' },
      { id: 'vd19', data: hojeMenos(6), clienteNome: 'Aline Ribeiro', petNome: 'Mia',
        itens: [{ refId: 's4', tipo: 'servico', nome: 'Banho e tosa', quantidade: 1, precoUnit: 80 }],
        desconto: 0, total: 80, formaPagamento: 'dinheiro', profissional: 'Equipe banho' },
      { id: 'vd20', data: hojeMenos(5), clienteNome: 'Marcelo Teixeira', petNome: 'Rex',
        itens: [{ refId: 's1', tipo: 'servico', nome: 'Consulta clínica', quantidade: 1, precoUnit: 150 }],
        desconto: 0, total: 150, formaPagamento: 'pix', profissional: 'Dr. Bruno' },
      { id: 'vd21', data: hojeMenos(4), clienteNome: 'André Martins', petNome: 'Nala',
        itens: [{ refId: 's3', tipo: 'servico', nome: 'Vacina antirrábica', quantidade: 1, precoUnit: 70 }],
        desconto: 0, total: 70, formaPagamento: 'debito', profissional: 'Dra. Helena' },
      { id: 'vd22', data: hojeMenos(3), clienteNome: 'Diego Souza', petNome: 'Luna',
        itens: [
          { refId: 'inv7', tipo: 'produto', nome: 'Clorexidina 0.12%', quantidade: 1, precoUnit: 28 },
          { refId: 'inv6', tipo: 'produto', nome: 'Gaze 10x10cm', quantidade: 5, precoUnit: 0.50 },
        ], desconto: 0, total: 30.50, formaPagamento: 'dinheiro', profissional: 'Dra. Helena' },
      { id: 'vd23', data: hojeMenos(2), clienteNome: 'Larissa Rocha', petNome: 'Thor',
        itens: [{ refId: 's4', tipo: 'servico', nome: 'Banho e tosa', quantidade: 1, precoUnit: 80 }],
        desconto: 0, total: 80, formaPagamento: 'pix', profissional: 'Equipe banho' },
      { id: 'vd24', data: hojeMenos(1), clienteNome: 'Camila Ferreira', petNome: 'Amendoim',
        itens: [{ refId: 's1', tipo: 'servico', nome: 'Consulta clínica', quantidade: 1, precoUnit: 150 }],
        desconto: 0, total: 150, formaPagamento: 'credito', profissional: 'Dra. Helena' },
    ],
    orcamentos: [
      { id: 'or1', data: hojeMenos(0), validade: hojeMais(7), clienteNome: 'Juliana Prado', petNome: 'Nina',
        itens: [
          { refId: 's5', tipo: 'servico', nome: 'Castração', quantidade: 1, precoUnit: 850 },
          { refId: 's1', tipo: 'servico', nome: 'Consulta clínica', quantidade: 1, precoUnit: 150 },
        ],
        desconto: 100, total: 900, status: 'aberto' },
    ],
    caixa: {
      id: 'cx1', data: hojeMenos(0), aberto: true,
      movimentos: [
        { id: 'mc1', tipo: 'abertura', descricao: 'Abertura de caixa', valor: 200, hora: '08:00' },
        { id: 'mc2', tipo: 'entrada', descricao: 'Venda Vacina V10 (dinheiro)', valor: 90, hora: '10:30' },
        { id: 'mc3', tipo: 'saida', descricao: 'Compra de material (sangria)', valor: 35, hora: '11:15' },
      ],
    },
    boxes: [
      { id: 'bx1', nome: 'Box 1', especie: 'cao', finalidade: 'comum' },
      { id: 'bx2', nome: 'Box 2', especie: 'cao', finalidade: 'comum', observacao: 'Cabe porte grande' },
      { id: 'bx3', nome: 'Box 3', especie: 'gato', finalidade: 'comum', observacao: 'Ambiente silencioso, longe dos cães' },
      { id: 'bx4', nome: 'Box 4', especie: 'ambos', finalidade: 'uti', observacao: 'Monitor multiparamétrico e oxigênio' },
      { id: 'bx5', nome: 'Box 5', especie: 'ambos', finalidade: 'isolamento', observacao: 'Antessala para paramentação' },
    ],
    internacoes: [
      {
        id: 'int1', petId: 'p2', petNome: 'Mel', tutorNome: 'Ricardo Alves', especie: 'gato',
        box: 'bx3', motivo: 'Pós-operatório de castração — observação de 24h',
        profissional: 'Dr. Bruno', entrada: hojeMenos(1), previsaoAlta: hojeMais(0),
        valorDiaria: 120, status: 'internado',
        parametros: [
          { id: 'pc1', data: hojeMenos(1), hora: '15:00', temperatura: 38.4, fc: 140, fr: 28, mucosas: 'Normocoradas', obs: 'Recuperação anestésica tranquila.' },
          { id: 'pc2', data: hojeMenos(1), hora: '21:00', temperatura: 38.1, fc: 132, fr: 26, mucosas: 'Normocoradas' },
          { id: 'pc3', data: hojeMenos(0), hora: '07:00', temperatura: 38.3, fc: 136, fr: 24, mucosas: 'Normocoradas', obs: 'Aceitou alimentação. Ferida sem secreção.' },
        ],
        medicacoes: [
          { id: 'md-int1', medicamento: 'Meloxicam', dose: '0,1 mg/kg', via: 'SC', intervaloHoras: 24,
            horarios: [{ hora: '16:00', aplicado: true }, { hora: '16:00', aplicado: false }] },
          { id: 'md-int2', medicamento: 'Dipirona', dose: '25 mg/kg', via: 'IV', intervaloHoras: 8,
            horarios: [{ hora: '16:00', aplicado: true }, { hora: '00:00', aplicado: true }, { hora: '08:00', aplicado: true }, { hora: '16:00', aplicado: false }] },
        ],
      },
      {
        id: 'int2', petId: 'p4', petNome: 'Nina', tutorNome: 'Juliana Prado', especie: 'cao',
        box: 'bx4', motivo: 'Gastroenterite com desidratação — fluidoterapia',
        profissional: 'Dra. Helena', entrada: hojeMenos(2), previsaoAlta: hojeMais(1),
        valorDiaria: 180, status: 'internado',
        parametros: [
          { id: 'pc4', data: hojeMenos(2), hora: '10:00', temperatura: 39.6, fc: 120, fr: 40, mucosas: 'Pálidas', obs: 'Desidratação ~7%. Iniciada fluidoterapia.' },
          { id: 'pc5', data: hojeMenos(1), hora: '10:00', temperatura: 39.0, fc: 108, fr: 32, mucosas: 'Levemente pálidas', obs: 'Reduziu vômitos. Segue no soro.' },
          { id: 'pc6', data: hojeMenos(0), hora: '08:00', temperatura: 38.5, fc: 96, fr: 28, mucosas: 'Normocoradas', obs: 'Hidratação recuperada. Aceitando água.' },
        ],
        medicacoes: [
          { id: 'md-int3', medicamento: 'Ringer com lactato', dose: '250 ml', via: 'IV', intervaloHoras: 6,
            horarios: [{ hora: '12:00', aplicado: true }, { hora: '18:00', aplicado: true }, { hora: '00:00', aplicado: true }, { hora: '06:00', aplicado: true }, { hora: '12:00', aplicado: false }] },
          { id: 'md-int4', medicamento: 'Ondansetrona', dose: '0,5 mg/kg', via: 'IV', intervaloHoras: 12,
            horarios: [{ hora: '12:00', aplicado: true }, { hora: '00:00', aplicado: true }, { hora: '12:00', aplicado: false }] },
          { id: 'md-int5', medicamento: 'Omeprazol', dose: '1 mg/kg', via: 'IV', intervaloHoras: 24,
            horarios: [{ hora: '10:00', aplicado: true }, { hora: '10:00', aplicado: false }] },
        ],
      },
      // encerradas (histórico) — datas de alta espalhadas para o filtro por período
      {
        id: 'int3', petId: 'p1', petNome: 'Thor', tutorNome: 'Marina Costa', especie: 'cao',
        box: 'bx1', motivo: 'Observação pós-crise alérgica', profissional: 'Dra. Helena',
        entrada: hojeMenos(6), previsaoAlta: hojeMenos(4), saida: hojeMenos(4),
        valorDiaria: 150, status: 'alta', parametros: [], medicacoes: [],
      },
      {
        id: 'int4', petId: 'p3', petNome: 'Bidu', tutorNome: 'Ricardo Alves', especie: 'cao',
        box: 'bx2', motivo: 'Pós-operatório de cálculo urinário', profissional: 'Dr. Bruno',
        entrada: hojeMenos(38), previsaoAlta: hojeMenos(35), saida: hojeMenos(35),
        valorDiaria: 160, status: 'alta', parametros: [], medicacoes: [],
      },
      {
        id: 'int5', petId: 'p4', petNome: 'Nina', tutorNome: 'Juliana Prado', especie: 'cao',
        box: 'bx4', motivo: 'Parvovirose — isolamento e suporte', profissional: 'Dra. Helena',
        entrada: hojeMenos(102), previsaoAlta: hojeMenos(96), saida: hojeMenos(96),
        valorDiaria: 200, status: 'alta', parametros: [], medicacoes: [],
      },
    ],
    comissao: { incideSobre: 'servicos', base: 'liquido' },
    kpis: { faturamentoMes: 48720, noShowPct: 9, ocupacaoPct: 78, vacinasAtrasadas: 2, agendadosPelaIA: 4, ticketMedio: 187 },
    receitaSemana: [
      { dia: 'Seg', valor: 2100 }, { dia: 'Ter', valor: 2680 }, { dia: 'Qua', valor: 1980 },
      { dia: 'Qui', valor: 3120 }, { dia: 'Sex', valor: 2890 }, { dia: 'Sáb', valor: 1450 },
    ],
  },
  c2: {
    servicos,
    profissionais,
    tutores: [
      {
        id: 't5', nome: 'Carla Menezes', telefone: '47 99555-3321', origem: 'Indicação',
        etapa: 'cliente', desde: '2025-02-17',
        pets: [{
          id: 'p6', nome: 'Pipoca', especie: 'cao', raca: 'Poodle',
          nascimento: '2020-03-08', peso: 9.5, castrado: true,
          vacinas: [{ vacina: 'V10', aplicacao: '2025-08-30', proximaDose: '2026-08-30', situacao: 'em_dia' }],
            atendimentos: [],
        }],
      },
    ],
    agenda: [
      { id: 'a7', data: hojeMais(0), hora: '09:30', pet: 'Pipoca', tutor: 'Carla Menezes', servico: 'Banho e tosa', profissional: 'Equipe banho', status: 'confirmada', canal: 'ia' },
      { id: 'a26', data: hojeMais(2), hora: '11:00', pet: 'Pipoca', tutor: 'Carla Menezes', servico: 'Consulta clínica', profissional: 'Dra. Helena', status: 'pendente', canal: 'recepcao' },
    ],
    estoque: [
      { id: 'inv11', nome: 'Amoxicilina 500mg', categoria: 'medicamento', codigo: 'AMX500', quantidade_estoque: 30, quantidade_minima: 10, quantidade_maxima: 100, data_validade: '2026-11-20', lote: 'LOTE654321', fornecedor_nome: 'FarmaXYZ', fornecedor_contato: '47 3344-5566', preco_custo: 2.50, preco_venda: 8.90, ativo: true },
      { id: 'inv12', nome: 'Vacina V10', categoria: 'vacina', codigo: 'V10-2026', quantidade_estoque: 18, quantidade_minima: 10, quantidade_maxima: 50, data_validade: '2026-10-22', lote: 'VAC456789', fornecedor_nome: 'LaborXYZ', fornecedor_contato: '47 3365-7788', preco_custo: 45.00, preco_venda: 90.00, ativo: true },
      { id: 'inv13', nome: 'Álcool 70%', categoria: 'material', codigo: 'ALC70', quantidade_estoque: 15, quantidade_minima: 5, quantidade_maxima: 30, data_validade: '2027-03-01', lote: 'LOTE888999', fornecedor_nome: 'QualityLab', preco_custo: 0.50, preco_venda: 1.20, ativo: true },
      { id: 'inv14', nome: 'Gaze 10x10cm', categoria: 'material', codigo: 'GAZ1010', quantidade_estoque: 100, quantidade_minima: 50, quantidade_maxima: 500, data_validade: '2027-12-31', lote: 'LOTE000111', fornecedor_nome: 'MedicSupply', preco_custo: 0.15, preco_venda: 0.50, ativo: true },
      { id: 'inv15', nome: 'Seringa 3ml', categoria: 'material', codigo: 'SIR3ML', quantidade_estoque: 80, quantidade_minima: 40, quantidade_maxima: 250, data_validade: '2027-09-15', lote: 'LOTE111222', fornecedor_nome: 'MedicSupply', preco_custo: 0.10, preco_venda: 0.35, ativo: true },
    ],
    exames: [
      { id: 'ex5', pet_id: 'p6', atendimento_id: undefined, tipo: 'Hemograma', data_solicitacao: hojeMenos(3), status: 'solicitado' },
    ],
    protocolos: [
      { id: 'pr6', nome: 'V10', especie: 'cao', reforcoMeses: 12, doseFilhoteDias: 30, ativo: true },
      { id: 'pr7', nome: 'Antirrábica', especie: 'ambos', reforcoMeses: 12, ativo: true },
    ],
    tiposAtendimento: [
      'Consulta genérica', 'Retorno', 'Vacinação', 'Banho e tosa',
    ],
    modelos: [
      { id: 'md4', nome: 'Receita padrão', tipo: 'receita',
        conteudo: 'Uso veterinário\n\nPaciente: {pet} — {especie}, {raca}\nTutor: {tutor}\n\nPrescrição:\n\n' },
    ],
    vendas: [],
    orcamentos: [],
    caixa: null,
    boxes: [
      { id: 'bx6', nome: 'Box 1', especie: 'cao', finalidade: 'comum' },
      { id: 'bx7', nome: 'Box 2', especie: 'gato', finalidade: 'comum' },
      { id: 'bx8', nome: 'Box 3', especie: 'ambos', finalidade: 'isolamento' },
    ],
    internacoes: [],
    lancamentos: [
      { id: 'f9', tipo: 'receber', descricao: 'Banho e tosa', categoria: 'banho_tosa', valor: 80,
        vencimento: hojeMenos(1), pagoEm: hojeMenos(1), formaPagamento: 'debito', tutorNome: 'Carla Menezes', petNome: 'Pipoca' },
      { id: 'f10', tipo: 'pagar', descricao: 'Compra de ração premium', categoria: 'insumo', valor: 890,
        vencimento: hojeMais(9), fornecedorId: 'fo6', fornecedorNome: 'RaçãoBrasil', documento: 'NF 8891' },
    ],
    fornecedores: [
      { id: 'fo6', razaoSocial: 'Ração Brasil Comércio de Alimentos Ltda', nomeFantasia: 'RaçãoBrasil',
        cnpj: '56.789.012/0001-34', contato: 'Marcos Vinícius',
        telefone: '47 3300-4455', email: 'pedidos@racaobrasil.com.br',
        endereco: 'BR-101, km 120 — Tijucas/SC', categoria: 'Alimentos', ativo: true },
      { id: 'fo7', razaoSocial: 'FarmaXYZ Distribuidora de Medicamentos Ltda', nomeFantasia: 'FarmaXYZ',
        cnpj: '12.345.678/0001-90', contato: 'Roberto Lima',
        telefone: '47 3344-5566', email: 'vendas@farmaxyz.com.br',
        endereco: 'Rua Industrial, 800 — Joinville/SC', categoria: 'Medicamentos', ativo: true },
    ],
    comissao: { incideSobre: 'tudo', base: 'liquido' },
    kpis: { faturamentoMes: 15340, noShowPct: 12, ocupacaoPct: 54, vacinasAtrasadas: 0, agendadosPelaIA: 1, ticketMedio: 142 },
    receitaSemana: [
      { dia: 'Seg', valor: 620 }, { dia: 'Ter', valor: 880 }, { dia: 'Qua', valor: 540 },
      { dia: 'Qui', valor: 1100 }, { dia: 'Sex', valor: 960 }, { dia: 'Sáb', valor: 400 },
    ],
  },
}

// helpers
export const idadeDe = (nascimento: string) => {
  const n = new Date(nascimento)
  const meses = (Date.now() - n.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  if (meses < 12) return `${Math.floor(meses)} meses`
  const anos = Math.floor(meses / 12)
  return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
}

export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
