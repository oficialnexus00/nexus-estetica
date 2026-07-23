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
  microchip?: string
  pedigree?: boolean
  alerta?: string
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
  hora: string
  pet: string
  tutor: string
  servico: string
  profissional: string
  status: StatusAgenda
  canal: 'ia' | 'recepcao'
}

export type Servico = { id: string; nome: string; categoria: string; preco: number; duracao: number }

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
  formaPagamento: FormaPagamento
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
export type Box = {
  id: string
  nome: string
  tipo: 'canino' | 'felino' | 'uti' | 'isolamento'
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
}

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
  kpis: { faturamentoMes: number; noShowPct: number; ocupacaoPct: number; vacinasAtrasadas: number; agendadosPelaIA: number; ticketMedio: number }
  receitaSemana: { dia: string; valor: number }[]
}

/** Dias de atraso de um lançamento em aberto (negativo = ainda vai vencer). */
export const diasAtraso = (l: Lancamento) =>
  Math.round((new Date().setHours(0, 0, 0, 0) - new Date(l.vencimento + 'T00:00:00').getTime()) / 86400000)

// datas relativas para a demonstração nunca ficar desatualizada
const desloca = (dias: number) => {
  const d = new Date(); d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}
const hojeMenos = (d: number) => desloca(-d)
const hojeMais = (d: number) => desloca(d)

const servicos: Servico[] = [
  { id: 's1', nome: 'Consulta clínica', categoria: 'consulta', preco: 150, duracao: 30 },
  { id: 's2', nome: 'Vacina V10', categoria: 'vacina', preco: 90, duracao: 15 },
  { id: 's3', nome: 'Vacina antirrábica', categoria: 'vacina', preco: 70, duracao: 15 },
  { id: 's4', nome: 'Banho e tosa', categoria: 'banho_tosa', preco: 80, duracao: 60 },
  { id: 's5', nome: 'Castração', categoria: 'cirurgia', preco: 850, duracao: 120 },
  { id: 's6', nome: 'Hemograma', categoria: 'exame', preco: 120, duracao: 20 },
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
          microchip: '981098201234567', pedigree: true,
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
          vacinas: [{ vacina: 'Tríplice felina', aplicacao: '2026-06-20', proximaDose: '2026-07-20', situacao: 'proxima' }],
            atendimentos: [],
        }],
      },
    ],
    agenda: [
      { id: 'a1', hora: '08:30', pet: 'Thor', tutor: 'Marina Costa', servico: 'Vacina V10', profissional: 'Dra. Helena', status: 'confirmada', canal: 'ia' },
      { id: 'a2', hora: '09:00', pet: 'Mel', tutor: 'Ricardo Alves', servico: 'Consulta clínica', profissional: 'Dra. Helena', status: 'atendida', canal: 'recepcao' },
      { id: 'a3', hora: '10:00', pet: 'Amora', tutor: 'Felipe Moraes', servico: 'Consulta clínica', profissional: 'Dr. Bruno', status: 'confirmada', canal: 'ia' },
      { id: 'a4', hora: '11:00', pet: 'Bidu', tutor: 'Ricardo Alves', servico: 'Banho e tosa', profissional: 'Equipe banho', status: 'pendente', canal: 'ia' },
      { id: 'a5', hora: '14:00', pet: 'Nina', tutor: 'Juliana Prado', servico: 'Consulta clínica', profissional: 'Dr. Bruno', status: 'falta', canal: 'recepcao' },
      { id: 'a6', hora: '15:30', pet: 'Thor', tutor: 'Marina Costa', servico: 'Hemograma', profissional: 'Dra. Helena', status: 'pendente', canal: 'ia' },
    ],
    lancamentos: [
      // a receber — em aberto e vencidos (alimentam a régua de cobrança)
      { id: 'f1', tipo: 'receber', descricao: 'Consulta clínica', categoria: 'consulta', valor: 150,
        vencimento: hojeMenos(23), tutorNome: 'Juliana Prado', petNome: 'Nina' },
      { id: 'f2', tipo: 'receber', descricao: 'Hemograma + consulta', categoria: 'exame', valor: 270,
        vencimento: hojeMenos(9), tutorNome: 'Marina Costa', petNome: 'Thor' },
      { id: 'f3', tipo: 'receber', descricao: 'Banho e tosa', categoria: 'banho_tosa', valor: 80,
        vencimento: hojeMais(4), tutorNome: 'Ricardo Alves', petNome: 'Bidu' },
      // a receber — já pagos
      { id: 'f4', tipo: 'receber', descricao: 'Vacina V10', categoria: 'vacina', valor: 90,
        vencimento: hojeMenos(2), pagoEm: hojeMenos(2), formaPagamento: 'pix', tutorNome: 'Marina Costa', petNome: 'Thor' },
      { id: 'f5', tipo: 'receber', descricao: 'Castração', categoria: 'cirurgia', valor: 850,
        vencimento: hojeMenos(6), pagoEm: hojeMenos(6), formaPagamento: 'credito', tutorNome: 'Ricardo Alves', petNome: 'Mel' },
      // a pagar
      { id: 'f6', tipo: 'pagar', descricao: 'Aluguel da clínica', categoria: 'fixo', valor: 4200, vencimento: hojeMais(6) },
      { id: 'f7', tipo: 'pagar', descricao: 'Fornecedor — vacinas', categoria: 'insumo', valor: 1380, vencimento: hojeMais(2) },
      { id: 'f8', tipo: 'pagar', descricao: 'Energia elétrica', categoria: 'fixo', valor: 640,
        vencimento: hojeMenos(3), pagoEm: hojeMenos(3), formaPagamento: 'boleto' },
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
      { id: 'bx1', nome: 'Canino 1', tipo: 'canino' },
      { id: 'bx2', nome: 'Canino 2', tipo: 'canino' },
      { id: 'bx3', nome: 'Felino 1', tipo: 'felino' },
      { id: 'bx4', nome: 'UTI 1', tipo: 'uti' },
      { id: 'bx5', nome: 'Isolamento', tipo: 'isolamento' },
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
    ],
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
      { id: 'a7', hora: '09:30', pet: 'Pipoca', tutor: 'Carla Menezes', servico: 'Banho e tosa', profissional: 'Equipe banho', status: 'confirmada', canal: 'ia' },
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
      { id: 'bx6', nome: 'Canino 1', tipo: 'canino' },
      { id: 'bx7', nome: 'Felino 1', tipo: 'felino' },
      { id: 'bx8', nome: 'Isolamento', tipo: 'isolamento' },
    ],
    internacoes: [],
    lancamentos: [
      { id: 'f9', tipo: 'receber', descricao: 'Banho e tosa', categoria: 'banho_tosa', valor: 80,
        vencimento: hojeMenos(1), pagoEm: hojeMenos(1), formaPagamento: 'debito', tutorNome: 'Carla Menezes', petNome: 'Pipoca' },
      { id: 'f10', tipo: 'pagar', descricao: 'Fornecedor — ração', categoria: 'insumo', valor: 890, vencimento: hojeMais(9) },
    ],
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
