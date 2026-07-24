import { useState } from 'react'

// Hub de suporte da NEXUS ao cliente (clínica). Modo demo: chamados em memória.

const inputCls = 'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] text-ink outline-none transition placeholder:text-ink-3 focus:border-brand/60'

type StatusChamado = 'aberto' | 'andamento' | 'resolvido'
type Chamado = { id: string; protocolo: string; categoria: string; assunto: string; prioridade: string; status: StatusChamado; data: string }

const STATUS: Record<StatusChamado, { label: string; cls: string }> = {
  aberto: { label: 'Aberto', cls: 'border-s2/40 bg-s2/10 text-s2' },
  andamento: { label: 'Em andamento', cls: 'border-warn/40 bg-warn/10 text-warn' },
  resolvido: { label: 'Resolvido', cls: 'border-ok/40 bg-ok/10 text-ok' },
}

const CHAMADOS_DEMO: Chamado[] = [
  { id: 'ch1', protocolo: '#2088', categoria: 'Sugestão', assunto: 'Visão semanal na agenda', prioridade: 'Baixa', status: 'andamento', data: '18/07/2026' },
  { id: 'ch2', protocolo: '#2041', categoria: 'Dúvida', assunto: 'Como reimprimir um recibo', prioridade: 'Média', status: 'resolvido', data: '11/07/2026' },
]

const FAQ = [
  { p: 'Como a Bia agenda sozinha pelo WhatsApp?', r: 'A Bia atende 24h, identifica o tutor, oferece horário e confirma o agendamento — tudo sem a recepção tocar no telefone. Você acompanha em Agenda e Dashboard. Ela nunca dá diagnóstico, dose ou preço fora do que está no sistema.' },
  { p: 'Como registro uma internação?', r: 'Menu Internação → "Internar pet". Escolha o pet, o box, o motivo e a diária. Na ficha você registra parâmetros clínicos e monta o aprazamento (mapa de execução) das medicações. Ao dar alta, as diárias viram lançamento no Financeiro.' },
  { p: 'Como faço uma venda no PDV?', r: 'Vendas → Ponto de venda. Adicione serviços/produtos, escolha o cliente/pet e a forma de pagamento e finalize — o sistema baixa o estoque, lança no financeiro e imprime o cupom. Dá pra salvar como orçamento também.' },
  { p: 'Como exporto relatórios?', r: 'Menu Inteligência. Em cada aba (Produtividade, Vendas, Clientes) há o botão "Exportar CSV" — o arquivo abre direto no Excel em português.' },
  { p: 'Como dou baixa numa conta a receber?', r: 'Em Financeiro (ou Vendas → Saldo dos clientes), clique em "Dar baixa" no lançamento em aberto. Ele passa a constar como recebido.' },
  { p: 'Como configuro os protocolos de vacina?', r: 'Configurações → Protocolos. Defina o intervalo de reforço por vacina/espécie — é isso que a Bia usa para saber quando chamar o pet de volta.' },
]

const NOVIDADES = [
  { data: 'jul/2026', titulo: 'Inteligência / BI', desc: 'Produtividade por profissional, ranking de vendas, novos × recorrentes, sazonalidade e exportação CSV.' },
  { data: 'jul/2026', titulo: 'Internação completa', desc: 'Boxes com ocupação, parâmetros clínicos, mapa de execução (aprazamento) e alta que gera lançamento no financeiro.' },
  { data: 'jul/2026', titulo: 'Comissionamento', desc: '% por profissional, apuração por período e extrato em PDF.' },
  { data: 'jul/2026', titulo: 'Vendas / PDV + Orçamentos', desc: 'Ponto de venda, caixa, saldo dos clientes, ranking, lista de preços e orçamentos que viram venda.' },
]

const SISTEMAS = [
  { nome: 'CRM / Sistema', ok: true },
  { nome: 'Bia · WhatsApp', ok: true },
  { nome: 'Agendamento', ok: true },
  { nome: 'Financeiro', ok: true },
]

export default function Suporte() {
  const [chamados, setChamados] = useState<Chamado[]>(CHAMADOS_DEMO)
  const [categoria, setCategoria] = useState('Dúvida')
  const [assunto, setAssunto] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState('Média')
  const [enviado, setEnviado] = useState<string | null>(null)

  const [busca, setBusca] = useState('')
  const [aberta, setAberta] = useState<number | null>(0)

  const abrirChamado = () => {
    if (!assunto.trim()) return
    const proto = '#' + (2100 + chamados.length + Math.floor((assunto.length * 7) % 89))
    const novo: Chamado = {
      id: 'ch' + (chamados.length + 1), protocolo: proto, categoria, assunto: assunto.trim(),
      prioridade, status: 'aberto', data: new Date().toLocaleDateString('pt-BR'),
    }
    setChamados([novo, ...chamados])
    setAssunto(''); setDescricao(''); setCategoria('Dúvida'); setPrioridade('Média')
    setEnviado(`Chamado ${proto} aberto! A equipe responde em breve.`)
    setTimeout(() => setEnviado(null), 4000)
  }

  const faqFiltrado = FAQ.filter(f =>
    !busca.trim() || (f.p + f.r).toLowerCase().includes(busca.toLowerCase()))

  return (
    <div className="space-y-4">
      {/* Falar com o suporte + Status */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-brand/30 bg-brand/5 p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-ok" />
            <span className="text-[12px] font-medium text-ok">Suporte online agora</span>
          </div>
          <h3 className="mt-2 text-[16px] font-semibold">Fale com o time da NEXUS</h3>
          <p className="mt-1 text-[13px] text-ink-2">
            Atendimento humano de seg. a sex., 8h–18h. Tempo médio de resposta: <b className="text-ink">4 min</b> no WhatsApp.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="https://wa.me/5547900000000" target="_blank" rel="noreferrer"
              className="rounded-lg bg-brand px-4 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
              💬 Falar no WhatsApp
            </a>
            <a href="mailto:suporte@nexushealth.com.br"
              className="rounded-lg border border-line bg-surface-2 px-4 py-2 text-[13px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
              ✉️ suporte@nexushealth.com.br
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <h3 className="mb-3 text-[14px] font-semibold">Status do sistema</h3>
          <div className="space-y-2">
            {SISTEMAS.map(s => (
              <div key={s.nome} className="flex items-center justify-between text-[13px]">
                <span className="text-ink-2">{s.nome}</span>
                <span className="flex items-center gap-1.5 font-medium text-ok">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-ok" /> Operacional
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-line pt-2 text-[11.5px] text-ink-3">Todos os serviços normais.</div>
        </div>
      </div>

      {/* Abrir chamado + Meus chamados */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <h3 className="mb-3 text-[14px] font-semibold">Abrir chamado</h3>
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <select value={categoria} onChange={e => setCategoria(e.target.value)} className={inputCls}>
                {['Dúvida', 'Problema', 'Sugestão', 'Financeiro'].map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={prioridade} onChange={e => setPrioridade(e.target.value)} className={inputCls}>
                {['Baixa', 'Média', 'Alta', 'Urgente'].map(pr => <option key={pr}>{pr}</option>)}
              </select>
            </div>
            <input value={assunto} onChange={e => setAssunto(e.target.value)} placeholder="Assunto" className={inputCls} />
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descreva o que está acontecendo…"
              rows={3} className={inputCls + ' resize-none'} />
            <button onClick={abrirChamado} disabled={!assunto.trim()}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-[13.5px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-50">
              Abrir chamado
            </button>
            {enviado && <p className="rounded-lg border border-ok/30 bg-ok/10 px-3 py-2 text-[12.5px] text-ok">{enviado}</p>}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <h3 className="mb-3 text-[14px] font-semibold">Meus chamados</h3>
          <div className="space-y-2">
            {chamados.map(c => {
              const s = STATUS[c.status]
              return (
                <div key={c.id} className="rounded-lg border border-line bg-surface-2 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium">{c.assunto}</span>
                    <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10.5px] font-medium ${s.cls}`}>{s.label}</span>
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-ink-3">
                    {c.protocolo} · {c.categoria} · prioridade {c.prioridade} · {c.data}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Central de ajuda */}
      <div className="rounded-xl border border-line bg-surface-1 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[14px] font-semibold">Central de ajuda</h3>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar ajuda…"
            className={inputCls + ' max-w-[240px]'} />
        </div>
        {faqFiltrado.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-ink-3">Nada encontrado. Abra um chamado que a gente ajuda. 🐾</p>
        ) : (
          <div className="space-y-1.5">
            {faqFiltrado.map((f, i) => (
              <div key={f.p} className="overflow-hidden rounded-lg border border-line bg-surface-2">
                <button onClick={() => setAberta(aberta === i ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-[13px] font-medium transition hover:text-brand">
                  {f.p}
                  <span className="shrink-0 text-ink-3">{aberta === i ? '−' : '+'}</span>
                </button>
                {aberta === i && <div className="border-t border-line px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-2">{f.r}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Novidades */}
      <div className="rounded-xl border border-line bg-surface-1 p-5">
        <h3 className="mb-3 text-[14px] font-semibold">Novidades <span className="font-normal text-ink-3">· o que chegou de novo</span></h3>
        <div className="space-y-2.5">
          {NOVIDADES.map(n => (
            <div key={n.titulo} className="flex gap-3">
              <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-brand" />
              <div>
                <div className="text-[13px] font-medium">{n.titulo} <span className="ml-1 text-[11px] font-normal text-ink-3">{n.data}</span></div>
                <div className="text-[12.5px] text-ink-2">{n.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
