import { useMemo, useState } from 'react'
import type { DB, ConversaBia, MensagemBia, StatusConversa } from '../data'
import { situacaoVacina, diasAteDose } from '../data'

// Central da Bia — o motor roda FORA (GPTMaker/n8n), mas a clínica vê, assume e
// responde de DENTRO do sistema. A Bia é um funcionário supervisionado pela tela.

const STATUS: Record<StatusConversa, { label: string; cls: string; dot: string }> = {
  bia: { label: 'Bia atendendo', cls: 'border-brand/40 bg-brand/10 text-brand', dot: '#00BFA5' },
  humano: { label: 'Com você', cls: 'border-warn/40 bg-warn/10 text-warn', dot: '#e0a63a' },
  resolvida: { label: 'Resolvida', cls: 'border-ok/40 bg-ok/10 text-ok', dot: '#2fbf71' },
}

function Stat({ n, label, tom }: { n: string; label: string; tom?: 'warn' }) {
  return (
    <div className="rounded-xl border border-line bg-surface-1 p-4">
      <div className={`text-[22px] font-semibold tabular-nums tracking-tight ${tom === 'warn' ? 'text-warn' : 'text-brand'}`}>{n}</div>
      <div className="mt-0.5 text-[11.5px] text-ink-3">{label}</div>
    </div>
  )
}

export default function Bia({ data }: { data: DB }) {
  const [aba, setAba] = useState<'conversas' | 'recorrencia'>('conversas')

  // conversas em estado local (o app é demo; em produção vêm do GPTMaker/Evolution)
  const [conversas, setConversas] = useState<ConversaBia[]>(() =>
    [...(data.conversas ?? [])].sort((a, b) => {
      const rank = (c: ConversaBia) => c.precisaHumano ? 0 : c.status === 'bia' ? 1 : 2
      return rank(a) - rank(b) || b.ultimaHora.localeCompare(a.ultimaHora)
    }))
  const [selId, setSelId] = useState<string | null>(conversas[0]?.id ?? null)
  const [draft, setDraft] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)

  const sel = conversas.find(c => c.id === selId) ?? null
  const aguardando = conversas.filter(c => c.precisaHumano).length

  const atualizar = (id: string, patch: Partial<ConversaBia>) =>
    setConversas(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c))

  const assumir = (id: string) => atualizar(id, { status: 'humano', precisaHumano: false })
  const devolver = (id: string) => atualizar(id, { status: 'bia' })
  const enviar = () => {
    if (!sel || !draft.trim()) return
    const msg: MensagemBia = { de: 'humano', txt: draft.trim(), hora: 'agora' }
    atualizar(sel.id, { status: 'humano', precisaHumano: false, mensagens: [...sel.mensagens, msg], ultimaHora: 'agora' })
    setDraft('')
  }

  // fila de recorrência: pets com vacina atrasada ou vencendo (o que a Bia vai puxar de volta)
  const fila = useMemo(() => {
    const itens: { tutor: string; pet: string; vacina: string; sit: 'atrasada' | 'proxima'; dias: number }[] = []
    for (const t of data.tutores) for (const p of t.pets) for (const v of p.vacinas) {
      const sit = situacaoVacina(v.proximaDose)
      if (sit === 'atrasada' || sit === 'proxima') itens.push({ tutor: t.nome, pet: p.nome, vacina: v.vacina, sit, dias: diasAteDose(v.proximaDose) })
    }
    return itens.sort((a, b) => a.dias - b.dias)
  }, [data])
  const atrasados = fila.filter(f => f.sit === 'atrasada').length

  return (
    <div className="space-y-4">
      {/* status + indicadores */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
          <div>
            <h3 className="text-[14px] font-semibold">Bia está atendendo no WhatsApp</h3>
            <p className="text-[11.5px] text-ink-3">O atendimento roda 24h por fora — você acompanha, assume e responde por aqui.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['conversas', 'recorrencia'] as const).map(t => (
            <button key={t} onClick={() => setAba(t)}
              className={`rounded-lg px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                aba === t ? 'bg-brand/12 text-brand' : 'border border-line bg-surface-2 text-ink-2 hover:text-ink'}`}>
              {t === 'conversas' ? 'Conversas' : 'Central de recorrência'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat n={String(data.kpis?.agendadosPelaIA ?? 0)} label="agendados pela Bia hoje" />
        <Stat n="12s" label="1ª resposta média" />
        <Stat n={String(aguardando)} label="aguardando você" tom={aguardando > 0 ? 'warn' : undefined} />
        <Stat n={String(fila.length)} label="na fila de recorrência" />
      </div>

      {aba === 'conversas' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
          {/* inbox */}
          <div className="rounded-xl border border-line bg-surface-1 p-2">
            <div className="px-2 py-1.5 text-[11.5px] uppercase tracking-wider text-ink-3">Conversas ({conversas.length})</div>
            <div className="space-y-1">
              {conversas.map(c => {
                const st = STATUS[c.status]
                const ultima = c.mensagens[c.mensagens.length - 1]
                return (
                  <button key={c.id} onClick={() => setSelId(c.id)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                      selId === c.id ? 'border-brand/50 bg-brand/8' : 'border-transparent hover:bg-surface-2'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 truncate text-[13.5px] font-medium">
                        {c.precisaHumano && <span className="text-warn">●</span>}{c.tutorNome}
                        {c.petNome && <span className="text-[11.5px] font-normal text-ink-3">· {c.petNome}</span>}
                      </span>
                      <span className="shrink-0 text-[10.5px] text-ink-3">{c.ultimaHora}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[11.5px] text-ink-3">{ultima?.txt}</div>
                    <span className={`mt-1.5 inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${st.cls}`}>{st.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* thread */}
          <div className="flex min-h-[420px] flex-col rounded-xl border border-line bg-surface-1">
            {!sel ? (
              <div className="flex flex-1 items-center justify-center text-[13px] text-ink-3">Selecione uma conversa.</div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold">{sel.tutorNome}{sel.petNome ? ` · ${sel.petNome}` : ''}</div>
                    <div className="text-[11.5px] text-ink-3">{sel.telefone} · {sel.motivo}</div>
                  </div>
                  <div className="flex gap-2">
                    {sel.status === 'bia'
                      ? <button onClick={() => assumir(sel.id)} className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-surface-0 transition hover:bg-brand-dim">Assumir conversa</button>
                      : sel.status === 'humano'
                        ? <button onClick={() => devolver(sel.id)} className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[12px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">Devolver à Bia</button>
                        : null}
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {sel.mensagens.map((m, i) => (
                    <div key={i} className={`flex ${m.de === 'tutor' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                        m.de === 'tutor' ? 'rounded-tr-sm bg-brand/15 text-ink'
                        : m.de === 'humano' ? 'rounded-tl-sm border border-warn/40 bg-warn/10 text-ink'
                        : 'rounded-tl-sm border border-line bg-surface-2 text-ink'}`}>
                        {m.de === 'humano' && <div className="mb-0.5 text-[10px] font-medium text-warn">Você (equipe)</div>}
                        {m.de === 'bia' && <div className="mb-0.5 text-[10px] font-medium text-brand">Bia</div>}
                        {m.txt}
                        <div className="mt-1 text-right text-[10px] text-ink-3">{m.hora}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-line p-3">
                  <div className="flex gap-2">
                    <input value={draft} onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') enviar() }}
                      placeholder={sel.status === 'resolvida' ? 'Conversa resolvida — reabrir respondendo…' : 'Responder como equipe (assume a conversa)…'}
                      className="flex-1 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] outline-none focus:border-brand/60" />
                    <button onClick={enviar} disabled={!draft.trim()}
                      className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-50">Enviar</button>
                  </div>
                  <p className="mt-1.5 text-[10.5px] text-ink-3">Guardrail: dúvida clínica e emergência a Bia encaminha para a equipe — ela nunca dá diagnóstico, dose ou receita.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {aba === 'recorrencia' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/40 bg-brand/8 px-4 py-3">
            <div className="text-[12.5px] text-ink-2">
              A Bia vai puxar de volta <span className="font-semibold text-ink">{fila.length} pets</span> com vacina vencendo ou atrasada
              {atrasados > 0 && <> (<span className="font-medium text-warn">{atrasados} já atrasados</span>)</>}. Você aprova e ela dispara no WhatsApp.
            </div>
            <button onClick={() => setAviso(`Disparo agendado para ${fila.length} pets — lote de ~20, com intervalo aleatório de 40–100s (jeito Kaian). A Bia envia pelo WhatsApp.`)}
              className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
              Disparar lembretes agora
            </button>
          </div>
          {aviso && <p className="rounded-lg border border-ok/40 bg-ok/10 px-3 py-2 text-[12px] text-ok">✅ {aviso}</p>}

          <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-line text-[11.5px] uppercase tracking-wider text-ink-3">
                  <th className="px-3 py-2.5 font-medium">Pet · Tutor</th>
                  <th className="px-3 py-2.5 font-medium">Vacina</th>
                  <th className="px-3 py-2.5 font-medium">Situação</th>
                  <th className="px-3 py-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-[13.5px]">
                {fila.length === 0
                  ? <tr><td colSpan={4} className="py-8 text-center text-[13px] text-ink-3">Ninguém na fila — recorrência em dia. 🐾</td></tr>
                  : fila.map((f, i) => (
                    <tr key={i} className="border-b border-line/60 last:border-0">
                      <td className="px-3 py-2.5 font-medium">{f.pet}<span className="block text-[11px] font-normal text-ink-3">{f.tutor}</span></td>
                      <td className="px-3 py-2.5 text-ink-2">{f.vacina}</td>
                      <td className="px-3 py-2.5">
                        {f.sit === 'atrasada'
                          ? <span className="rounded-md border border-bad/40 bg-bad/10 px-2 py-0.5 text-[11px] font-medium text-bad">{Math.abs(f.dias)} dias em atraso</span>
                          : <span className="rounded-md border border-warn/40 bg-warn/10 px-2 py-0.5 text-[11px] font-medium text-warn">vence em {f.dias} dias</span>}
                      </td>
                      <td className="px-3 py-2.5 text-right text-[11.5px] text-brand">na fila da Bia</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-line bg-surface-1 p-4">
            <h3 className="mb-2 text-[13.5px] font-semibold">O que a Bia nunca faz</h3>
            <ul className="space-y-1.5 text-[12.5px] text-ink-2">
              <li>✅ Não dá diagnóstico, dose nem receita — encaminha ao veterinário</li>
              <li>✅ Não inventa preço nem horário — consulta o sistema</li>
              <li>✅ Emergência não vira agendamento: orienta e encaminha na hora</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
