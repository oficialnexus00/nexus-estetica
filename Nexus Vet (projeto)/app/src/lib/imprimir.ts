// Geração de documentos para impressão / PDF sem dependência externa.
// Escreve um HTML autônomo num iframe oculto e dispara o print() do navegador —
// o usuário escolhe "Salvar como PDF" no diálogo. Funciona em qualquer navegador.

import { brl } from '../data'

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
const fmtLongo = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', {
  day: '2-digit', month: 'long', year: 'numeric',
})

const CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, Segoe UI, Roboto, sans-serif; color: #1a2233; padding: 40px; font-size: 13px; line-height: 1.5; }
  .marca { display: flex; align-items: baseline; gap: 6px; }
  .marca b { font-size: 20px; letter-spacing: -0.5px; }
  .marca .vet { color: #00BFA5; font-weight: 700; }
  .clinica { margin-top: 2px; font-size: 12px; color: #6b7688; }
  .barra { height: 3px; background: linear-gradient(90deg, #DFF7A0, #5CE39A, #00BFA5); border-radius: 3px; margin: 16px 0 24px; }
  h1 { font-size: 17px; margin-bottom: 18px; }
  .dados { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 22px; }
  .dados .rot { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #9099a8; }
  .dados .val { font-size: 14px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #9099a8; border-bottom: 2px solid #e6e9ef; padding: 8px 6px; }
  td { padding: 9px 6px; border-bottom: 1px solid #eef1f5; font-size: 13px; }
  .total { display: flex; justify-content: space-between; align-items: center; background: #f4fbf9; border: 1px solid #cceee7; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; }
  .total .lbl { font-size: 13px; color: #4a5568; }
  .total .vlr { font-size: 22px; font-weight: 700; color: #00998a; }
  .obs { font-size: 12px; color: #6b7688; margin-bottom: 20px; }
  .corpo { white-space: pre-wrap; font-size: 14px; line-height: 1.7; margin-bottom: 24px; min-height: 120px; }
  .assinatura { margin-top: 60px; border-top: 1px solid #333; width: 280px; padding-top: 6px; font-size: 12px; color: #555; }
  .rodape { margin-top: 32px; padding-top: 14px; border-top: 1px solid #eef1f5; font-size: 11px; color: #9099a8; display: flex; justify-content: space-between; }
  @page { margin: 16mm; }
  @media print { body { padding: 0; } }
`

function cabecalho(clinica: string): string {
  return `
    <div class="marca"><b>NEXUS</b><span class="vet">Vet</span></div>
    <div class="clinica">${clinica}</div>
    <div class="barra"></div>`
}

function rodape(): string {
  const agora = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  return `<div class="rodape"><span>Emitido em ${agora}</span><span>Gerado por NEXUS Vet</span></div>`
}

function imprimir(titulo: string, corpo: string): void {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow?.document
  if (!doc) return
  doc.open()
  doc.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${titulo}</title><style>${CSS}</style></head><body>${corpo}${rodape()}</body></html>`)
  doc.close()
  setTimeout(() => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(() => document.body.removeChild(iframe), 1500)
  }, 300)
}

/* -------------------------------------------------- comprovante de vacinação */

export function comprovanteVacinacao(opts: {
  clinica: string; tutor: string; pet: string; especie: 'cao' | 'gato'
  vacinas: { vacina: string; aplicacao: string; proximaDose: string }[]
}): void {
  const linhas = opts.vacinas.length
    ? opts.vacinas.map(v => `<tr><td>${v.vacina}</td><td>${fmt(v.aplicacao)}</td><td>${fmt(v.proximaDose)}</td></tr>`).join('')
    : `<tr><td colspan="3" style="text-align:center;color:#9099a8">Nenhuma dose registrada.</td></tr>`

  const corpo = cabecalho(opts.clinica) + `
    <h1>Comprovante de Vacinação</h1>
    <div class="dados">
      <div><div class="rot">Tutor</div><div class="val">${opts.tutor}</div></div>
      <div><div class="rot">Animal</div><div class="val">${opts.pet} · ${opts.especie === 'cao' ? 'Canino' : 'Felino'}</div></div>
    </div>
    <table>
      <thead><tr><th>Vacina</th><th>Aplicação</th><th>Próxima dose</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
    <p class="obs">Este comprovante reflete as doses registradas no sistema da clínica na data de emissão.
    Mantenha a vacinação em dia conforme o protocolo indicado pelo médico-veterinário.</p>`

  imprimir('Comprovante de Vacinação', corpo)
}

/* -------------------------------------------------------- recibo de pagamento */

export function reciboPagamento(opts: {
  clinica: string; descricao: string; valor: number; data: string
  forma?: string; tutor?: string; pet?: string
}): void {
  const dados = [
    opts.tutor && `<div><div class="rot">Pagante</div><div class="val">${opts.tutor}</div></div>`,
    opts.pet && `<div><div class="rot">Animal</div><div class="val">${opts.pet}</div></div>`,
    `<div><div class="rot">Data</div><div class="val">${fmtLongo(opts.data)}</div></div>`,
    opts.forma && `<div><div class="rot">Forma de pagamento</div><div class="val" style="text-transform:capitalize">${opts.forma}</div></div>`,
  ].filter(Boolean).join('')

  const corpo = cabecalho(opts.clinica) + `
    <h1>Recibo de Pagamento</h1>
    <div class="dados">${dados}</div>
    <table>
      <thead><tr><th>Descrição</th><th style="text-align:right">Valor</th></tr></thead>
      <tbody><tr><td>${opts.descricao}</td><td style="text-align:right">${brl(opts.valor)}</td></tr></tbody>
    </table>
    <div class="total"><span class="lbl">Total pago</span><span class="vlr">${brl(opts.valor)}</span></div>
    <p class="obs">Recebemos a importância acima referente ao serviço descrito. Para maior clareza, firmamos o presente recibo.</p>`

  imprimir('Recibo de Pagamento', corpo)
}

/* -------------------------------------------------- documento de modelo */

const esc = (s: string) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string))

const FORMA_LABEL: Record<string, string> = {
  dinheiro: 'Dinheiro', pix: 'Pix', credito: 'Cartão de crédito',
  debito: 'Cartão de débito', boleto: 'Boleto', outro: 'Outro',
}

export function cupomVenda(opts: {
  clinica: string; data: string
  clienteNome?: string; petNome?: string
  itens: { nome: string; quantidade: number; precoUnit: number }[]
  desconto: number; total: number; formaPagamento: string
}): void {
  const linhas = opts.itens.map(i => `
    <tr>
      <td>${esc(i.nome)}</td>
      <td style="text-align:center">${i.quantidade}</td>
      <td style="text-align:right">${brl(i.precoUnit)}</td>
      <td style="text-align:right">${brl(i.quantidade * i.precoUnit)}</td>
    </tr>`).join('')

  const subtotal = opts.itens.reduce((s, i) => s + i.quantidade * i.precoUnit, 0)
  const dados = [
    opts.clienteNome && `<div><div class="rot">Cliente</div><div class="val">${esc(opts.clienteNome)}</div></div>`,
    opts.petNome && `<div><div class="rot">Animal</div><div class="val">${esc(opts.petNome)}</div></div>`,
    `<div><div class="rot">Data</div><div class="val">${fmtLongo(opts.data)}</div></div>`,
    `<div><div class="rot">Pagamento</div><div class="val">${FORMA_LABEL[opts.formaPagamento] ?? opts.formaPagamento}</div></div>`,
  ].filter(Boolean).join('')

  const html = cabecalho(opts.clinica) + `
    <h1>Cupom de Venda</h1>
    <div class="dados">${dados}</div>
    <table>
      <thead><tr><th>Item</th><th style="text-align:center">Qtd</th><th style="text-align:right">Unit.</th><th style="text-align:right">Subtotal</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
    ${opts.desconto > 0 ? `<p class="obs" style="text-align:right">Subtotal: ${brl(subtotal)} · Desconto: ${brl(opts.desconto)}</p>` : ''}
    <div class="total"><span class="lbl">Total</span><span class="vlr">${brl(opts.total)}</span></div>`

  imprimir('Cupom de Venda', html)
}

export function extratoComissao(opts: {
  clinica: string; profissional: string; pct: number; periodo: string
  linhas: { data: string; descricao: string; base: number; comissao: number }[]
  totalBase: number; totalComissao: number
}): void {
  const linhas = opts.linhas.map(l => `
    <tr>
      <td>${fmtLongo(l.data)}</td>
      <td>${esc(l.descricao)}</td>
      <td style="text-align:right">${brl(l.base)}</td>
      <td style="text-align:right">${brl(l.comissao)}</td>
    </tr>`).join('') || `<tr><td colspan="4" style="text-align:center;color:#9099a8">Nenhuma venda no período.</td></tr>`

  const dados = `
    <div><div class="rot">Profissional</div><div class="val">${esc(opts.profissional)}</div></div>
    <div><div class="rot">Período</div><div class="val">${esc(opts.periodo)}</div></div>
    <div><div class="rot">Percentual</div><div class="val">${opts.pct}%</div></div>
    <div><div class="rot">Base de cálculo</div><div class="val">${brl(opts.totalBase)}</div></div>`

  const html = cabecalho(opts.clinica) + `
    <h1>Extrato de Comissão</h1>
    <div class="dados">${dados}</div>
    <table>
      <thead><tr><th>Data</th><th>Venda</th><th style="text-align:right">Base</th><th style="text-align:right">Comissão</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
    <div class="total"><span class="lbl">Comissão a pagar</span><span class="vlr">${brl(opts.totalComissao)}</span></div>`

  imprimir('Extrato de Comissão', html)
}

export function orcamentoPDF(opts: {
  clinica: string; data: string; validade?: string
  clienteNome?: string; petNome?: string
  itens: { nome: string; quantidade: number; precoUnit: number }[]
  desconto: number; total: number
}): void {
  const linhas = opts.itens.map(i => `
    <tr>
      <td>${esc(i.nome)}</td>
      <td style="text-align:center">${i.quantidade}</td>
      <td style="text-align:right">${brl(i.precoUnit)}</td>
      <td style="text-align:right">${brl(i.quantidade * i.precoUnit)}</td>
    </tr>`).join('')
  const subtotal = opts.itens.reduce((s, i) => s + i.quantidade * i.precoUnit, 0)
  const dados = [
    opts.clienteNome && `<div><div class="rot">Cliente</div><div class="val">${esc(opts.clienteNome)}</div></div>`,
    opts.petNome && `<div><div class="rot">Animal</div><div class="val">${esc(opts.petNome)}</div></div>`,
    `<div><div class="rot">Emitido em</div><div class="val">${fmtLongo(opts.data)}</div></div>`,
    opts.validade && `<div><div class="rot">Válido até</div><div class="val">${fmtLongo(opts.validade)}</div></div>`,
  ].filter(Boolean).join('')

  const html = cabecalho(opts.clinica) + `
    <h1>Orçamento</h1>
    <div class="dados">${dados}</div>
    <table>
      <thead><tr><th>Item</th><th style="text-align:center">Qtd</th><th style="text-align:right">Unit.</th><th style="text-align:right">Subtotal</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
    ${opts.desconto > 0 ? `<p class="obs" style="text-align:right">Subtotal: ${brl(subtotal)} · Desconto: ${brl(opts.desconto)}</p>` : ''}
    <div class="total"><span class="lbl">Total do orçamento</span><span class="vlr">${brl(opts.total)}</span></div>
    <p class="obs">Este orçamento é uma estimativa e não representa cobrança. Valores sujeitos a alteração após a validade.</p>`

  imprimir('Orçamento', html)
}

export function documento(opts: {
  clinica: string; titulo: string; corpo: string
  tutor?: string; pet?: string; profissional?: string
}): void {
  const dados = [
    opts.tutor && `<div><div class="rot">Tutor</div><div class="val">${esc(opts.tutor)}</div></div>`,
    opts.pet && `<div><div class="rot">Animal</div><div class="val">${esc(opts.pet)}</div></div>`,
  ].filter(Boolean).join('')

  const html = cabecalho(opts.clinica) + `
    <h1>${esc(opts.titulo)}</h1>
    ${dados ? `<div class="dados">${dados}</div>` : ''}
    <div class="corpo">${esc(opts.corpo)}</div>
    <div class="assinatura">${esc(opts.profissional ?? '')}<br>Médico(a) Veterinário(a)</div>`

  imprimir(opts.titulo, html)
}
