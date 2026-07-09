// Dados FAKE para a casca navegável — nenhum dado real de paciente (LGPD).

export type Clinic = { id: string; nome: string; cidade: string }
export type Dentista = { id: string; nome: string; especialidade: string; cor: string }
export type Consulta = {
  id: string; hora: string; dur: number; paciente: string; procedimento: string
  dentistaId: string; status: 'confirmada' | 'pendente' | 'falta' | 'atendida'
}
export type Paciente = {
  id: string; nome: string; telefone: string; nasc: string; alerta?: string
  ultimaVisita: string; proxima?: string; origem: string; saldo: number
}
export type Orcamento = {
  id: string; paciente: string; procedimento: string; valor: number; criado: string
  status: 'aprovado' | 'aguardando' | 'follow-up' | 'recusado'
  followUps: number; ultimaAcao: string
}
export type Lancamento = {
  id: string; data: string; desc: string; categoria: string
  valor: number; tipo: 'entrada' | 'saida'; forma: string
}

export const clinics: Clinic[] = [
  { id: 'c1', nome: 'Clínica Rodrigo Odonto', cidade: 'Recife/PE' },
  { id: 'c2', nome: 'Clínica Sorriso & Cia', cidade: 'Recife/PE' },
]

const dentistasC1: Dentista[] = [
  { id: 'd1', nome: 'Dr. Rodrigo', especialidade: 'Implantodontia', cor: '#199e70' },
  { id: 'd2', nome: 'Dra. Camila', especialidade: 'Ortodontia', cor: '#3987e5' },
  { id: 'd3', nome: 'Dr. Felipe', especialidade: 'Endodontia', cor: '#c98500' },
  { id: 'd4', nome: 'Dra. Luana', especialidade: 'Clínico geral', cor: '#9085e9' },
  { id: 'd5', nome: 'Dr. Marcos', especialidade: 'Cirurgia', cor: '#199e70' },
  { id: 'd6', nome: 'Dra. Paula', especialidade: 'Odontopediatria', cor: '#3987e5' },
]
const dentistasC2: Dentista[] = [
  { id: 'd7', nome: 'Dra. Fernanda', especialidade: 'Estética / HOF', cor: '#199e70' },
  { id: 'd8', nome: 'Dra. Bianca', especialidade: 'Clínico geral', cor: '#3987e5' },
  { id: 'd9', nome: 'Dr. Túlio', especialidade: 'Ortodontia', cor: '#c98500' },
]

const consultasC1: Consulta[] = [
  { id: 'a1', hora: '08:00', dur: 60, paciente: 'Maria Souza', procedimento: 'Avaliação implante', dentistaId: 'd1', status: 'atendida' },
  { id: 'a2', hora: '09:00', dur: 30, paciente: 'João Pereira', procedimento: 'Manutenção orto', dentistaId: 'd2', status: 'atendida' },
  { id: 'a3', hora: '09:30', dur: 90, paciente: 'Carlos Lima', procedimento: 'Canal — sessão 2', dentistaId: 'd3', status: 'confirmada' },
  { id: 'a4', hora: '10:00', dur: 60, paciente: 'Ana Beatriz', procedimento: 'Limpeza + profilaxia', dentistaId: 'd4', status: 'confirmada' },
  { id: 'a5', hora: '10:30', dur: 60, paciente: 'Pedro Santos', procedimento: 'Extração siso', dentistaId: 'd5', status: 'pendente' },
  { id: 'a6', hora: '11:00', dur: 30, paciente: 'Lívia Rocha (7a)', procedimento: 'Consulta pediátrica', dentistaId: 'd6', status: 'confirmada' },
  { id: 'a7', hora: '13:30', dur: 60, paciente: 'Roberta Nunes', procedimento: 'Instalação implante', dentistaId: 'd1', status: 'confirmada' },
  { id: 'a8', hora: '14:00', dur: 30, paciente: 'Felipe Costa', procedimento: 'Ajuste aparelho', dentistaId: 'd2', status: 'falta' },
  { id: 'a9', hora: '14:30', dur: 60, paciente: 'Bruna Melo', procedimento: 'Restauração 2 dentes', dentistaId: 'd4', status: 'confirmada' },
  { id: 'a10', hora: '15:00', dur: 90, paciente: 'Otávio Ramos', procedimento: 'Canal — sessão 1', dentistaId: 'd3', status: 'pendente' },
  { id: 'a11', hora: '16:00', dur: 60, paciente: 'Sofia Andrade', procedimento: 'Avaliação cirúrgica', dentistaId: 'd5', status: 'confirmada' },
  { id: 'a12', hora: '17:00', dur: 30, paciente: 'Miguel Torres (9a)', procedimento: 'Aplicação flúor', dentistaId: 'd6', status: 'confirmada' },
]
const consultasC2: Consulta[] = [
  { id: 'b1', hora: '08:30', dur: 60, paciente: 'Carla Menezes', procedimento: 'Botox terapêutico', dentistaId: 'd7', status: 'atendida' },
  { id: 'b2', hora: '09:30', dur: 60, paciente: 'Renato Dias', procedimento: 'Limpeza', dentistaId: 'd8', status: 'confirmada' },
  { id: 'b3', hora: '10:30', dur: 45, paciente: 'Patrícia Melo', procedimento: 'Clareamento — sessão 1', dentistaId: 'd7', status: 'confirmada' },
  { id: 'b4', hora: '11:00', dur: 30, paciente: 'Igor Fontes', procedimento: 'Manutenção orto', dentistaId: 'd9', status: 'pendente' },
  { id: 'b5', hora: '14:00', dur: 60, paciente: 'Aline Barros', procedimento: 'Avaliação lentes', dentistaId: 'd7', status: 'confirmada' },
  { id: 'b6', hora: '15:00', dur: 30, paciente: 'Diego Martins', procedimento: 'Restauração', dentistaId: 'd8', status: 'confirmada' },
]

const pacientesC1: Paciente[] = [
  { id: 'p1', nome: 'Maria Souza', telefone: '(81) 99xxx-1234', nasc: '12/03/1985', ultimaVisita: '02/07/2026', proxima: '15/07/2026', origem: 'Instagram Ads', saldo: 0 },
  { id: 'p2', nome: 'João Pereira', telefone: '(81) 98xxx-5678', nasc: '25/09/1998', ultimaVisita: '02/07/2026', proxima: '02/08/2026', origem: 'Indicação', saldo: 0 },
  { id: 'p3', nome: 'Carlos Lima', telefone: '(81) 97xxx-9012', nasc: '07/01/1972', alerta: 'Hipertenso — verificar PA', ultimaVisita: '25/06/2026', proxima: '02/07/2026', origem: 'Google', saldo: -450 },
  { id: 'p4', nome: 'Ana Beatriz', telefone: '(81) 96xxx-3456', nasc: '18/11/1990', ultimaVisita: '10/06/2026', proxima: '02/07/2026', origem: 'Instagram Ads', saldo: 0 },
  { id: 'p5', nome: 'Pedro Santos', telefone: '(81) 95xxx-7890', nasc: '30/05/2001', alerta: 'Alergia a dipirona', ultimaVisita: '—', proxima: '02/07/2026', origem: 'Instagram Ads', saldo: 0 },
  { id: 'p6', nome: 'Roberta Nunes', telefone: '(81) 94xxx-2345', nasc: '14/02/1979', ultimaVisita: '20/05/2026', proxima: '02/07/2026', origem: 'Indicação', saldo: -2400 },
  { id: 'p7', nome: 'Bruna Melo', telefone: '(81) 93xxx-6789', nasc: '09/08/1995', ultimaVisita: '15/04/2026', proxima: '02/07/2026', origem: 'Google', saldo: 0 },
  { id: 'p8', nome: 'Otávio Ramos', telefone: '(81) 92xxx-0123', nasc: '22/12/1968', alerta: 'Diabético tipo 2', ultimaVisita: '28/06/2026', proxima: '02/07/2026', origem: 'Fachada', saldo: -890 },
]
const pacientesC2: Paciente[] = [
  { id: 'q1', nome: 'Carla Menezes', telefone: '(81) 99xxx-4321', nasc: '03/06/1988', ultimaVisita: '02/07/2026', proxima: '02/10/2026', origem: 'Instagram Ads', saldo: 0 },
  { id: 'q2', nome: 'Renato Dias', telefone: '(81) 98xxx-8765', nasc: '17/04/1993', ultimaVisita: '02/01/2026', proxima: '02/07/2026', origem: 'Indicação', saldo: 0 },
  { id: 'q3', nome: 'Patrícia Melo', telefone: '(81) 97xxx-2109', nasc: '28/10/1982', ultimaVisita: '18/06/2026', proxima: '02/07/2026', origem: 'Instagram Ads', saldo: -600 },
  { id: 'q4', nome: 'Aline Barros', telefone: '(81) 96xxx-6543', nasc: '05/07/1996', alerta: 'Gestante — 2º trimestre', ultimaVisita: '—', proxima: '02/07/2026', origem: 'Instagram Ads', saldo: 0 },
]

const orcamentosC1: Orcamento[] = [
  { id: 'o1', paciente: 'Roberta Nunes', procedimento: 'Implante unitário + coroa', valor: 4800, criado: '20/05/2026', status: 'aprovado', followUps: 1, ultimaAcao: 'Aprovado após 1 follow-up da Bia' },
  { id: 'o2', paciente: 'Carlos Lima', procedimento: 'Tratamento de canal + coroa', valor: 2350, criado: '25/06/2026', status: 'follow-up', followUps: 2, ultimaAcao: 'Bia enviou 2º follow-up ontem 18:40' },
  { id: 'o3', paciente: 'Sofia Andrade', procedimento: 'Extração + enxerto ósseo', valor: 3200, criado: '28/06/2026', status: 'aguardando', followUps: 0, ultimaAcao: 'Follow-up da Bia agendado p/ hoje 19h' },
  { id: 'o4', paciente: 'Bruna Melo', procedimento: 'Faceta resina (4 dentes)', valor: 1900, criado: '15/06/2026', status: 'follow-up', followUps: 1, ultimaAcao: 'Paciente pediu parcelamento — Cayan notificado' },
  { id: 'o5', paciente: 'Felipe Costa', procedimento: 'Contenção + clareamento', valor: 950, criado: '10/06/2026', status: 'recusado', followUps: 3, ultimaAcao: 'Recusou após 3 follow-ups — motivo: preço' },
  { id: 'o6', paciente: 'Otávio Ramos', procedimento: 'Prótese parcial removível', valor: 2750, criado: '30/06/2026', status: 'aguardando', followUps: 0, ultimaAcao: 'Orçamento entregue na consulta' },
]
const orcamentosC2: Orcamento[] = [
  { id: 'u1', paciente: 'Patrícia Melo', procedimento: 'Clareamento + 6 lentes', valor: 7200, criado: '18/06/2026', status: 'follow-up', followUps: 1, ultimaAcao: 'Bia reenviou simulação ontem' },
  { id: 'u2', paciente: 'Carla Menezes', procedimento: 'Protocolo HOF completo', valor: 2900, criado: '02/07/2026', status: 'aprovado', followUps: 0, ultimaAcao: 'Aprovado na hora' },
  { id: 'u3', paciente: 'Aline Barros', procedimento: 'Lentes de contato (10)', valor: 11000, criado: '01/07/2026', status: 'aguardando', followUps: 0, ultimaAcao: 'Follow-up da Bia agendado' },
]

const financeiroC1: Lancamento[] = [
  { id: 'f1', data: '02/07', desc: 'Roberta Nunes — implante (2/4)', categoria: 'Procedimento', valor: 1200, tipo: 'entrada', forma: 'Pix' },
  { id: 'f2', data: '02/07', desc: 'Maria Souza — avaliação', categoria: 'Consulta', valor: 180, tipo: 'entrada', forma: 'Cartão' },
  { id: 'f3', data: '02/07', desc: 'João Pereira — manutenção orto', categoria: 'Ortodontia', valor: 220, tipo: 'entrada', forma: 'Pix' },
  { id: 'f4', data: '01/07', desc: 'Dental Cremer — material', categoria: 'Insumos', valor: 1840, tipo: 'saida', forma: 'Boleto' },
  { id: 'f5', data: '01/07', desc: 'Ana Beatriz — limpeza', categoria: 'Prevenção', valor: 250, tipo: 'entrada', forma: 'Cartão' },
  { id: 'f6', data: '30/06', desc: 'Aluguel da sala', categoria: 'Fixo', valor: 4500, tipo: 'saida', forma: 'Transferência' },
  { id: 'f7', data: '30/06', desc: 'Carlos Lima — canal (1/3)', categoria: 'Endodontia', valor: 780, tipo: 'entrada', forma: 'Pix' },
  { id: 'f8', data: '29/06', desc: 'Protético — 2 coroas', categoria: 'Laboratório', valor: 960, tipo: 'saida', forma: 'Pix' },
]
const financeiroC2: Lancamento[] = [
  { id: 'g1', data: '02/07', desc: 'Carla Menezes — HOF (1/2)', categoria: 'Estética', valor: 1450, tipo: 'entrada', forma: 'Cartão' },
  { id: 'g2', data: '01/07', desc: 'Patrícia Melo — clareamento (1/2)', categoria: 'Estética', valor: 600, tipo: 'entrada', forma: 'Pix' },
  { id: 'g3', data: '30/06', desc: 'Aluguel da sala', categoria: 'Fixo', valor: 3200, tipo: 'saida', forma: 'Transferência' },
  { id: 'g4', data: '30/06', desc: 'Renato Dias — limpeza', categoria: 'Prevenção', valor: 230, tipo: 'entrada', forma: 'Pix' },
]

// Série semanal de recebimentos (últimas 8 semanas), por clínica
const recebimentosC1 = [18400, 21200, 17800, 24600, 22900, 26800, 25100, 28400]
const recebimentosC2 = [9200, 8700, 11400, 10800, 12600, 11900, 13800, 14600]

// Produção do mês por dentista (R$)
const producaoC1 = [
  { nome: 'Dr. Rodrigo', valor: 32400 }, { nome: 'Dra. Camila', valor: 18700 },
  { nome: 'Dr. Felipe', valor: 15200 }, { nome: 'Dra. Luana', valor: 12800 },
  { nome: 'Dr. Marcos', valor: 11300 }, { nome: 'Dra. Paula', valor: 8900 },
]
const producaoC2 = [
  { nome: 'Dra. Fernanda', valor: 21600 }, { nome: 'Dra. Bianca', valor: 9800 },
  { nome: 'Dr. Túlio', valor: 8200 },
]

const biaFeedC1 = [
  { hora: '10:42', texto: 'Confirmou a consulta de Sofia Andrade (16:00) ✅' },
  { hora: '10:15', texto: 'Follow-up de orçamento: Carlos Lima respondeu "vou fechar essa semana"' },
  { hora: '09:58', texto: 'Novo lead do Instagram qualificado → avaliação agendada p/ sexta 14h' },
  { hora: '09:30', texto: 'Reativação: paciente sumido há 8 meses (Marcos T.) agendou limpeza' },
  { hora: '08:45', texto: 'Felipe Costa faltou — Bia já ofereceu 3 horários de reencaixe' },
]
const biaFeedC2 = [
  { hora: '10:20', texto: 'Follow-up: Patrícia Melo pediu pra falar com a Dra. Fernanda — Cayan avisado' },
  { hora: '09:40', texto: 'Novo lead (lentes) qualificado → avaliação sábado 10h ✅' },
  { hora: '08:55', texto: 'Confirmou 100% da agenda de amanhã (6 consultas)' },
]

export const db = {
  c1: {
    dentistas: dentistasC1, consultas: consultasC1, pacientes: pacientesC1,
    orcamentos: orcamentosC1, financeiro: financeiroC1,
    recebimentos: recebimentosC1, producao: producaoC1, biaFeed: biaFeedC1,
    kpis: { recebidoMes: 96400, consultasHoje: 12, noShow30d: 6.4, orcAberto: 8300, orcAbertoQtd: 3, taxaAprovacao: 62 },
  },
  c2: {
    dentistas: dentistasC2, consultas: consultasC2, pacientes: pacientesC2,
    orcamentos: orcamentosC2, financeiro: financeiroC2,
    recebimentos: recebimentosC2, producao: producaoC2, biaFeed: biaFeedC2,
    kpis: { recebidoMes: 41300, consultasHoje: 6, noShow30d: 4.1, orcAberto: 18200, orcAbertoQtd: 2, taxaAprovacao: 58 },
  },
} as const

export const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
