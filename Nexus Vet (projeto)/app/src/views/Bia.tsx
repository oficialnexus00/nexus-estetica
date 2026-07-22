const conversa = [
  { de: 'bia', txt: 'Oi, Marina! Chegando a época da vacina do Thor: a V10 está prevista pra 10/07.\nQuer que eu já separe um horário pra ele?' },
  { de: 'tutor', txt: 'Oi! Quero sim. Quanto custa?' },
  { de: 'bia', txt: 'A V10 fica R$ 90. Tenho quinta às 8h30 ou sexta às 10h — qual fica melhor?' },
  { de: 'tutor', txt: 'Quinta 8h30 tá ótimo' },
  { de: 'bia', txt: 'Prontinho! ✅\nAgendei o Thor pra V10 na quinta (10/07) às 8h30, com a Dra. Helena.\nAté lá! 🐾' },
]

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface-1 p-4">
      <div className="text-[22px] font-semibold tabular-nums tracking-tight text-brand">{n}</div>
      <div className="mt-0.5 text-[11.5px] text-ink-3">{label}</div>
    </div>
  )
}

export default function Bia() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
            <h3 className="text-[14px] font-semibold">Bia está atendendo</h3>
          </div>
          <p className="mt-2 text-[13px] text-ink-2">
            Responde no WhatsApp 24h, identifica o tutor, agenda sozinha e chama de volta
            quem está com vacina vencendo.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat n="4" label="agendados hoje" />
          <Stat n="12s" label="1ª resposta" />
          <Stat n="2" label="pets a chamar" />
        </div>

        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <h3 className="mb-3 text-[14px] font-semibold">O que ela nunca faz</h3>
          <ul className="space-y-2 text-[13px] text-ink-2">
            <li>✅ Não dá diagnóstico, dose nem receita — encaminha ao veterinário</li>
            <li>✅ Não inventa preço nem horário — consulta o sistema</li>
            <li>✅ Emergência não vira agendamento: orienta na hora</li>
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface-1 p-5">
        <h3 className="mb-4 text-[14px] font-semibold">Conversa de hoje · lembrete de vacina</h3>
        <div className="space-y-3">
          {conversa.map((m, i) => (
            <div key={i} className={`flex ${m.de === 'bia' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                m.de === 'bia'
                  ? 'rounded-tl-sm border border-line bg-surface-2 text-ink'
                  : 'rounded-tr-sm bg-brand/15 text-ink'}`}>
                {m.txt}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 border-t border-line pt-3 text-[11.5px] text-ink-3">
          Do lembrete ao agendamento confirmado — sem a recepção tocar no telefone.
        </p>
      </div>
    </div>
  )
}
