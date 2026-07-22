import { useState } from 'react'
import type { DB } from '../data'
import { brl } from '../data'

// Espelha a regra da view v_fila_lembrete_vacina (stack/schema-vet.sql):
// entra quem vence em <= 7 dias OU já está atrasada. A dedup dos "20 dias sem
// lembrete" é do disparo (n8n) — aqui é só a janela de quem precisa voltar.
const JANELA_DIAS = 7

const fmtCurto = (d: string) => {
  const dt = new Date(d + 'T00:00:00')
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`
}

const diasAte = (d: string) =>
  Math.round((new Date(d + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)

type ItemFila = {
  key: string
  petNome: string
  especie: 'cao' | 'gato'
  tutorNome: string
  telefone: string
  vacina: string
  proximaDose: string
  dias: number
  atrasada: boolean
  valor: number
}

function mensagemBia(it: ItemFila) {
  const primeiro = it.tutorNome.trim().split(' ')[0]
  const ola = primeiro.length >= 2 ? `Oi, ${primeiro}!` : 'Oi!'
  const quando = fmtCurto(it.proximaDose)
  if (it.atrasada) {
    return `${ola} Vi aqui que a ${it.vacina} do ${it.petNome} ficou um pouquinho atrasada (era pra ${quando}). `
      + `Sem stress, a gente coloca em dia rapidinho. Quer que eu veja um horário essa semana?`
  }
  return `${ola} Chegando a época da vacina do ${it.petNome}: a ${it.vacina} está prevista pra ${quando}. `
    + `Quer que eu já separe um horário pra ele?`
}

type Filtro = 'todas' | 'atrasadas' | 'semana'

export default function Reativacao({ data }: { data: DB }) {
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [aberto, setAberto] = useState<string | null>(null)

  // Preços das vacinas para estimar a receita parada
  const precosVacina = data.servicos.filter(s => s.categoria === 'vacina')
  const fallback = precosVacina.length
    ? Math.round(precosVacina.reduce((s, v) => s + v.preco, 0) / precosVacina.length)
    : 90
  const precoDaVacina = (nome: string) => {
    const n = nome.toLowerCase()
    const s = precosVacina.find(sv => sv.nome.toLowerCase().includes(n) || n.includes(sv.nome.toLowerCase().replace('vacina', '').trim()))
    return s?.preco ?? fallback
  }

  // Monta a fila a partir dos pets → vacinas
  const fila: ItemFila[] = data.tutores.flatMap(t =>
    t.pets.flatMap(p =>
      p.vacinas
        .map(v => {
          const dias = diasAte(v.proximaDose)
          return { v, dias }
        })
        .filter(({ dias }) => dias <= JANELA_DIAS)
        .map(({ v, dias }) => ({
          key: `${p.id}-${v.vacina}-${v.proximaDose}`,
          petNome: p.nome,
          especie: p.especie,
          tutorNome: t.nome,
          telefone: t.telefone,
          vacina: v.vacina,
          proximaDose: v.proximaDose,
          dias,
          atrasada: dias < 0,
          valor: precoDaVacina(v.vacina),
        }))
    )
  ).sort((a, b) => a.dias - b.dias) // mais atrasadas primeiro

  const atrasadas = fila.filter(i => i.atrasada)
  const daSemana = fila.filter(i => !i.atrasada)
  const receitaParada = fila.reduce((s, i) => s + i.valor, 0)

  const lista = filtro === 'atrasadas' ? atrasadas : filtro === 'semana' ? daSemana : fila

  const filtros: [Filtro, string][] = [
    ['todas', `Todas (${fila.length})`],
    ['atrasadas', `Atrasadas (${atrasadas.length})`],
    ['semana', `Essa semana (${daSemana.length})`],
  ]

  const urgencia = (it: ItemFila) => {
    if (it.atrasada) return { label: `${Math.abs(it.dias)} ${Math.abs(it.dias) === 1 ? 'dia' : 'dias'} em atraso`, cls: 'border-bad/40 bg-bad/10 text-bad' }
    if (it.dias === 0) return { label: 'vence hoje', cls: 'border-warn/40 bg-warn/10 text-warn' }
    return { label: `vence em ${it.dias} ${it.dias === 1 ? 'dia' : 'dias'}`, cls: 'border-s2/40 bg-s2/10 text-s2' }
  }

  const linkWhatsapp = (it: ItemFila) => {
    const digitos = it.telefone.replace(/\D/g, '')
    return `https://wa.me/55${digitos}?text=${encodeURIComponent(mensagemBia(it))}`
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-3">
        <p className="text-[13px] text-ink">
          <span className="font-semibold text-brand">A Bia percorre esta fila sozinha</span> todo dia às 10h (Seg–Sáb)
          e chama pelo WhatsApp. Aqui você acompanha quem ela vai buscar — e pode chamar na mão se quiser.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <div className="text-[11.5px] uppercase tracking-wider text-ink-3">Na fila</div>
          <div className="mt-1.5 text-[24px] font-semibold tabular-nums">{fila.length}</div>
          <div className="mt-0.5 text-[11.5px] text-ink-3">pets para trazer de volta</div>
        </div>
        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <div className="text-[11.5px] uppercase tracking-wider text-ink-3">Atrasadas</div>
          <div className={`mt-1.5 text-[24px] font-semibold tabular-nums ${atrasadas.length > 0 ? 'text-bad' : 'text-ok'}`}>
            {atrasadas.length}
          </div>
          <div className="mt-0.5 text-[11.5px] text-ink-3">já passaram da data</div>
        </div>
        <div className="rounded-xl border border-line bg-surface-1 p-4">
          <div className="text-[11.5px] uppercase tracking-wider text-ink-3">Receita parada</div>
          <div className="mt-1.5 text-[24px] font-semibold tabular-nums text-warn">{brl(receitaParada)}</div>
          <div className="mt-0.5 text-[11.5px] text-ink-3">estimada, esperando um WhatsApp</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filtros.map(([f, rotulo]) => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition ${
              filtro === f ? 'bg-brand/12 text-brand' : 'border border-line bg-surface-2 text-ink-2 hover:text-ink'}`}>
            {rotulo}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {lista.length === 0 ? (
          <p className="py-10 text-center text-[13.5px] text-ink-3">Ninguém para chamar agora. 🐾</p>
        ) : (
          lista.map(it => {
            const u = urgencia(it)
            const expandido = aberto === it.key
            return (
              <div key={it.key} className="rounded-xl border border-line bg-surface-1 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14.5px] font-semibold">{it.petNome}</span>
                      <span className="text-[12px] text-ink-3">· {it.tutorNome}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-line bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-2">
                        {it.vacina}
                      </span>
                      <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-medium ${u.cls}`}>
                        {u.label}
                      </span>
                      <span className="text-[11.5px] text-ink-3">{it.telefone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="mr-1 text-[12px] tabular-nums text-ink-3">{brl(it.valor)}</span>
                    <button onClick={() => setAberto(expandido ? null : it.key)}
                      className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                      Prévia
                    </button>
                    <a href={linkWhatsapp(it)} target="_blank" rel="noopener noreferrer"
                      className="rounded-lg bg-brand px-2.5 py-1 text-[11.5px] font-semibold text-surface-0 transition hover:bg-brand-dim">
                      WhatsApp
                    </a>
                  </div>
                </div>

                {expandido && (
                  <div className="mt-3 rounded-lg border border-line bg-surface-2 px-3 py-2">
                    <div className="text-[11px] text-ink-3">Mensagem que a Bia envia</div>
                    <div className="mt-0.5 text-[13px] text-ink-2">{mensagemBia(it)}</div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
