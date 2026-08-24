import Modal from './Modal'

// Simula a conversa que a Patrícia conduz no WhatsApp — o coração do produto.
export default function ModalWhatsApp({ open, onClose, nome }: { open: boolean; onClose: () => void; nome: string }) {
  const primeiro = nome.split(' ')[0]
  const msgs: { de: 'patricia' | 'paciente'; txt: string; hora: string }[] = [
    { de: 'patricia', txt: `Oi, ${primeiro}! Aqui é a Patrícia, do Instituto Rodrigo Couto 😊 Tudo bem?`, hora: '09:01' },
    { de: 'patricia', txt: 'Passando pra confirmar sua consulta de amanhã às 09:00 com o Dr. Rodrigo. Posso confirmar?', hora: '09:01' },
    { de: 'paciente', txt: 'Oi! Pode confirmar sim 👍', hora: '09:14' },
    { de: 'patricia', txt: 'Perfeito, tá confirmado ✅ Te espero! Se precisar remarcar é só me chamar por aqui.', hora: '09:14' },
  ]

  return (
    <Modal open={open} onClose={onClose} title="Conversa no WhatsApp" subtitle={`Patrícia ↔ ${nome}`} maxW="max-w-md">
      <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 text-brand">✦</span>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold">Patrícia</div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-ink-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-ok" /> online · atendendo automaticamente
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-line bg-surface-0 p-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.de === 'paciente' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-[12.5px] leading-snug ${
                m.de === 'paciente' ? 'rounded-br-sm bg-brand/15 text-ink' : 'rounded-bl-sm bg-surface-2 text-ink-2'
              }`}
            >
              {m.txt}
              <div className="mt-0.5 text-right text-[10px] text-ink-3">{m.hora}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-brand/25 bg-brand/8 px-3 py-2.5 text-[12px] leading-relaxed text-ink-2">
        ✦ Essa conversa é conduzida pela <span className="font-semibold text-brand">Patrícia</span> sozinha — confirmação, follow-up de
        orçamento e reativação acontecem no WhatsApp sem ninguém do time digitar.
      </div>
    </Modal>
  )
}
