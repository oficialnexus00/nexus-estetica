import type { Pet, ProtocoloVacina } from '../data'

// Protocolos aplicáveis ao pet — inspirado na aba "Protocolos" do Pet 360 do
// SimplesVet. Cruza os protocolos de vacina da clínica (por espécie) com a
// carteira do pet e mostra a adesão: em dia, vencendo, atrasada ou nunca aplicada.

const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

const descreveReforco = (p: ProtocoloVacina) =>
  p.reforcoMeses % 12 === 0
    ? `reforço a cada ${p.reforcoMeses / 12} ano${p.reforcoMeses > 12 ? 's' : ''}`
    : `reforço a cada ${p.reforcoMeses} meses`

export default function ProtocolosPet({ pet, protocolos }: { pet: Pet; protocolos: ProtocoloVacina[] }) {
  const aplicaveis = protocolos.filter(p => p.ativo && (p.especie === pet.especie || p.especie === 'ambos'))

  const statusDe = (nome: string) => {
    const v = pet.vacinas.find(x => x.vacina === nome)
    if (!v) return { label: 'Nunca aplicada', cls: 'border-warn/40 bg-warn/10 text-warn', detalhe: null as string | null }
    switch (v.situacao) {
      case 'em_dia': return { label: 'Em dia', cls: 'border-ok/40 bg-ok/10 text-ok', detalhe: `próxima em ${fmt(v.proximaDose)}` }
      case 'proxima': return { label: 'Vence em breve', cls: 'border-s2/40 bg-s2/10 text-s2', detalhe: `próxima em ${fmt(v.proximaDose)}` }
      case 'atrasada': return { label: 'Atrasada', cls: 'border-bad/40 bg-bad/10 text-bad', detalhe: `venceu em ${fmt(v.proximaDose)}` }
    }
  }

  const pendentes = aplicaveis.filter(p => {
    const v = pet.vacinas.find(x => x.vacina === p.nome)
    return !v || v.situacao !== 'em_dia'
  }).length

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[14px] font-semibold">Protocolo de vacinação</h3>
        {pendentes > 0 && (
          <span className="rounded-md border border-warn/40 bg-warn/10 px-2 py-0.5 text-[11px] font-medium text-warn">
            {pendentes} pendente{pendentes > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {aplicaveis.length === 0 ? (
        <p className="py-4 text-center text-[13px] text-ink-3">
          Nenhum protocolo cadastrado para {pet.especie === 'cao' ? 'cães' : 'gatos'}.
        </p>
      ) : (
        <div className="space-y-2">
          {aplicaveis.map(p => {
            const s = statusDe(p.nome)
            return (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2">
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium">{p.nome}</div>
                  <div className="text-[11.5px] text-ink-3">
                    {descreveReforco(p)}{s.detalhe ? ` · ${s.detalhe}` : ''}
                  </div>
                </div>
                <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10.5px] font-medium ${s.cls}`}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
