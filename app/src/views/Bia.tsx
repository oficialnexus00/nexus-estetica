import { useState } from 'react'

type Msg = { de: 'bia' | 'paciente'; texto: string; hora: string }

type Conversa = {
  id: string; nome: string; ini: string; tag: string
  tagCls: string; previa: string; msgs: Msg[]
}

const CONVERSAS: Conversa[] = [
  {
    id: 'c1', nome: 'Carlos Lima', ini: 'CL', tag: 'Follow-up orçamento',
    tagCls: 'bg-brand/15 text-brand', previa: 'Fechado! Pode marcar pra terça 👍',
    msgs: [
      { de: 'bia', hora: '18:40', texto: 'Oi Carlos, tudo bem? 😊 Aqui é a Bia, da Clínica Rodrigo Odonto. Passando pra saber se você conseguiu pensar no seu tratamento de canal + coroa que o Dr. Felipe passou.' },
      { de: 'paciente', hora: '19:02', texto: 'oi, tava sim mas achei o valor um pouco puxado' },
      { de: 'bia', hora: '19:03', texto: 'Entendo perfeitamente! O valor total é R$ 2.350, mas a gente parcela em até 10x no cartão — daria R$ 235/mês. E olha, adiar canal costuma sair mais caro lá na frente, viu? 🦷' },
      { de: 'bia', hora: '19:03', texto: 'Quer que eu já deixe reservado um horário essa semana pra você conversar sem compromisso?' },
      { de: 'paciente', hora: '19:15', texto: 'assim fica melhor sim. pode ser terça?' },
      { de: 'bia', hora: '19:15', texto: 'Fechei! Terça (08/07) às 09h30 com o Dr. Felipe ✅ Vou te mandar um lembrete no dia anterior. Qualquer coisa é só chamar aqui 💚' },
      { de: 'paciente', hora: '19:16', texto: 'Fechado! Pode marcar pra terça 👍' },
    ],
  },
  {
    id: 'c2', nome: 'Roberta Nunes', ini: 'RN', tag: 'Confirmação',
    tagCls: 'bg-ok/15 text-ok', previa: 'Confirmado, estarei aí às 13h30',
    msgs: [
      { de: 'bia', hora: '10:30', texto: 'Bom dia, Roberta! 😊 Passando pra confirmar sua consulta de instalação do implante amanhã (02/07) às 13h30 com o Dr. Rodrigo. Posso confirmar?' },
      { de: 'paciente', hora: '10:44', texto: 'Confirmado, estarei aí às 13h30' },
      { de: 'bia', hora: '10:44', texto: 'Perfeito! 💚 Só uma dica: evite comer nas 2h antes. Te espero amanhã!' },
    ],
  },
  {
    id: 'c3', nome: 'Lead novo (Instagram)', ini: 'IG', tag: 'Qualificação',
    tagCls: 'bg-s2/20 text-s2', previa: 'Perfeito, sexta 14h então!',
    msgs: [
      { de: 'paciente', hora: '09:50', texto: 'oi vi o anuncio de vcs sobre implante, queria saber o valor' },
      { de: 'bia', hora: '09:50', texto: 'Oii! Que ótimo que você chegou até a gente 😊 Sou a Bia, da Clínica Rodrigo Odonto. O valor do implante depende de uma avaliação do seu caso — cada boca é única. A boa notícia: a avaliação com o Dr. Rodrigo é gratuita 🎉' },
      { de: 'bia', hora: '09:51', texto: 'Me conta rapidinho: é pra repor 1 dente só ou mais de um?' },
      { de: 'paciente', hora: '09:58', texto: 'é 1 dente da frente que perdi' },
      { de: 'bia', hora: '09:58', texto: 'Entendi! Dente da frente a gente resolve muito bem, inclusive com estética. Você prefere manhã ou tarde pra avaliação? Tenho sexta às 14h ou sábado às 10h 🗓️' },
      { de: 'paciente', hora: '10:05', texto: 'sexta 14h ta otimo' },
      { de: 'bia', hora: '10:05', texto: 'Agendado! Sexta (04/07) às 14h ✅ Vou precisar só do seu nome completo pra registrar. E fica tranquilo(a), qualquer dúvida antes é só me chamar 💚' },
      { de: 'paciente', hora: '10:06', texto: 'Perfeito, sexta 14h então!' },
    ],
  },
]

export default function Bia() {
  const [ativa, setAtiva] = useState(CONVERSAS[0])

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-brand/25 bg-brand/8 px-4 py-3 text-[13px] text-ink-2">
        🤖 <span className="font-semibold text-brand">Estas conversas são reais do fluxo da Bia</span> — ela atende, qualifica,
        confirma e faz follow-up sozinha no WhatsApp. Tudo isso já roda hoje na NEXUS.
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        {/* Lista de conversas */}
        <div className="overflow-hidden rounded-xl border border-line bg-surface-1">
          <div className="border-b border-line px-4 py-3 text-[13px] font-semibold">Conversas · hoje</div>
          {CONVERSAS.map(c => (
            <button key={c.id} onClick={() => setAtiva(c)}
              className={`flex w-full items-center gap-3 border-b border-line/50 px-4 py-3 text-left transition last:border-b-0 hover:bg-surface-2 ${ativa.id === c.id ? 'bg-surface-2' : ''}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-[13px] font-semibold text-brand">{c.ini}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13.5px] font-medium">{c.nome}</span>
                </div>
                <div className="truncate text-[12px] text-ink-3">{c.previa}</div>
                <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10.5px] font-medium ${c.tagCls}`}>{c.tag}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Janela do chat */}
        <div className="flex min-h-[560px] flex-col overflow-hidden rounded-xl border border-line bg-surface-1">
          <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-[12px] font-semibold text-brand">{ativa.ini}</div>
            <div>
              <div className="text-[13.5px] font-semibold">{ativa.nome}</div>
              <div className="text-[11.5px] text-ok">● online — atendido pela Bia</div>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-4"
            style={{ background: 'linear-gradient(180deg, #070d17, #0b1220)' }}>
            {ativa.msgs.map((m, i) => (
              <div key={i} className={`flex ${m.de === 'bia' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-sm
                  ${m.de === 'bia'
                    ? 'rounded-br-sm bg-brand/90 text-surface-0'
                    : 'rounded-bl-sm bg-surface-3 text-ink'}`}>
                  {m.texto}
                  <div className={`mt-1 text-right text-[10px] ${m.de === 'bia' ? 'text-surface-0/60' : 'text-ink-3'}`}>{m.hora}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-line px-4 py-3">
            <div className="flex-1 rounded-full border border-line bg-surface-2 px-4 py-2 text-[13px] text-ink-3">
              A Bia responde automaticamente…
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-surface-0">➤</div>
          </div>
        </div>
      </div>
    </div>
  )
}
