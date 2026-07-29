import { useMemo, useState } from 'react'
import type { DB, PlanoBemEstar, Assinatura } from '../data'
import type { Acoes } from '../App'
import { brl, rotuloBeneficio, diasAtrasoMensalidade, mensagemCobrancaPlano } from '../data'
import Modal from '../components/Modal'
import ConfirmButton from '../components/ConfirmButton'
import FormPlano, { PLANO_DOT } from '../components/FormPlano'

type Aba = 'visao' | 'assinantes' | 'planos' | 'cobranca'

/** Gera e baixa um CSV (separador ";" — abre direto no Excel pt-BR). */
function baixarCSV(nome: string, cabecalho: string[], linhas: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v).replace(/"/g, '""')
    return /[";\n]/.test(s) ? `"${s}"` : s
  }
  const csv = [cabecalho, ...linhas].map(l => l.map(esc).join(';')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nome}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function BotaoCSV({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="shrink-0 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
      ↓ Exportar CSV
    </button>
  )
}

function Kpi({ label, valor, hint, tom }: { label: string; valor: string; hint?: string; tom?: 'ok' | 'warn' | 'bad' }) {
  const cor = tom === 'ok' ? 'text-ok' : tom === 'warn' ? 'text-warn' : tom === 'bad' ? 'text-bad' : 'text-ink'
  return (
    <div className="rounded-xl border border-line bg-surface-1 p-4">
      <div className="text-[11.5px] uppercase tracking-wider text-ink-3">{label}</div>
      <div className={`mt-1.5 text-[24px] font-semibold tabular-nums tracking-tight ${cor}`}>{valor}</div>
      {hint && <div className="mt-0.5 text-[11.5px] text-ink-3">{hint}</div>}
    </div>
  )
}

function BarraRank({ itens }: { itens: { chave: string; rotulo: string; valor: number; sub?: string }[] }) {
  const max = itens.reduce((m, i) => Math.max(m, i.valor), 0) || 1
  return (
    <div className="space-y-3">
      {itens.map((it, i) => (
        <div key={it.chave}>
          <div className="mb-1 flex items-center justify-between gap-3 text-[13px]">
            <span className="min-w-0 truncate font-medium">
              <span className="mr-1.5 tabular-nums text-ink-3">{i + 1}.</span>{it.rotulo}
            </span>
            <span className="shrink-0 tabular-nums text-ink-2">
              {brl(it.valor)}{it.sub && <span className="text-ink-3"> · {it.sub}</span>}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-brand/70" style={{ width: `${(it.valor / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

const fmtData = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

export default function Planos({ data, acoes }: { data: DB; acoes: Acoes }) {
  const [aba, setAba] = useState<Aba>('visao')
  const [editandoPlano, setEditandoPlano] = useState<PlanoBemEstar | null>(null)
  const [adicionandoPlano, setAdicionandoPlano] = useState(false)
  const [cobrados, setCobrados] = useState<Set<string>>(new Set())
  const [avisoCobranca, setAvisoCobranca] = useState<string | null>(null)

  const planos = data.planos ?? []
  const assinaturas = data.assinaturas ?? []
  const planoDe = (id: string) => planos.find(p => p.id === id)
  const precoDe = (id: string) => planoDe(id)?.preco ?? 0

  const ativas = assinaturas.filter(a => a.status === 'ativa')
  const emDia = ativas.filter(a => a.pagamento === 'em_dia')
  const inadimplentes = useMemo(() =>
    ativas
      .filter(a => a.pagamento === 'atrasada')
      .map(a => ({ a, plano: planoDe(a.planoId), valor: precoDe(a.planoId), dias: diasAtrasoMensalidade(a.vencimento) }))
      .sort((x, y) => y.dias - x.dias),
    [assinaturas, planos])

  const mrr = ativas.reduce((s, a) => s + precoDe(a.planoId), 0)
  const arr = mrr * 12
  const arpu = ativas.length ? mrr / ativas.length : 0
  const valorEmAtraso = inadimplentes.reduce((s, i) => s + i.valor, 0)

  const porPlano = planos.map(p => {
    const assin = ativas.filter(a => a.planoId === p.id)
    return { plano: p, n: assin.length, receita: assin.length * p.preco }
  }).sort((a, b) => b.receita - a.receita)

  const nAtivas = (id: string) => ativas.filter(a => a.planoId === id).length
  const cobrar = (id: string) => setCobrados(s => new Set(s).add(id))

  const TABS: [Aba, string][] = [
    ['visao', 'Visão geral'], ['assinantes', 'Assinantes'], ['planos', 'Planos'], ['cobranca', 'Cobrança'],
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[19px] font-semibold tracking-tight">Planos de bem-estar</h1>
        <p className="mt-0.5 text-[13px] text-ink-3">Assinatura da própria clínica — receita recorrente. O benefício se aplica sozinho no atendimento e no PDV; a Bia recupera as mensalidades atrasadas pelo WhatsApp.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map(([id, rotulo]) => (
          <button key={id} onClick={() => setAba(id)}
            className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition ${
              aba === id ? 'bg-brand/12 text-brand' : 'border border-line bg-surface-2 text-ink-2 hover:text-ink'}`}>
            {rotulo}{id === 'cobranca' && inadimplentes.length > 0 && <span className="ml-1 text-warn">({inadimplentes.length})</span>}
          </button>
        ))}
      </div>

      {/* ───────────────────── VISÃO GERAL ───────────────────── */}
      {aba === 'visao' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi label="Receita recorrente (MRR)" valor={brl(mrr)} hint="mensal, planos ativos" />
            <Kpi label="Anual (ARR)" valor={brl(arr)} />
            <Kpi label="Assinantes ativos" valor={String(ativas.length)} hint={`${emDia.length} em dia · ${inadimplentes.length} em atraso`} />
            <Kpi label="Ticket do plano (ARPU)" valor={brl(arpu)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <button onClick={() => setAba('assinantes')} className="rounded-xl border border-line bg-surface-1 p-4 text-left transition hover:border-brand/40">
              <div className="text-[11.5px] uppercase tracking-wider text-ink-3">Planos ativos</div>
              <div className="mt-1.5 text-[22px] font-semibold tabular-nums">{ativas.length}</div>
              <div className="mt-0.5 text-[11.5px] text-ink-3">assinaturas vigentes</div>
            </button>
            <button onClick={() => setAba('assinantes')} className="rounded-xl border border-ok/30 bg-ok/[0.06] p-4 text-left transition hover:border-ok/50">
              <div className="text-[11.5px] uppercase tracking-wider text-ink-3">Mensalidades pagas</div>
              <div className="mt-1.5 text-[22px] font-semibold tabular-nums text-ok">{emDia.length}</div>
              <div className="mt-0.5 text-[11.5px] text-ink-3">em dia neste ciclo</div>
            </button>
            <button onClick={() => setAba('cobranca')} className={`rounded-xl border p-4 text-left transition ${inadimplentes.length > 0 ? 'border-warn/40 bg-warn/[0.07] hover:border-warn/60' : 'border-line bg-surface-1 hover:border-brand/40'}`}>
              <div className="text-[11.5px] uppercase tracking-wider text-ink-3">Mensalidades em atraso</div>
              <div className={`mt-1.5 text-[22px] font-semibold tabular-nums ${inadimplentes.length > 0 ? 'text-warn' : 'text-ink'}`}>{inadimplentes.length}</div>
              <div className="mt-0.5 text-[11.5px] text-ink-3">{inadimplentes.length > 0 ? `${brl(valorEmAtraso)}/mês em risco` : 'nada em aberto'}</div>
            </button>
          </div>

          <div className="rounded-xl border border-line bg-surface-1 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-[14px] font-semibold">Receita por plano</h3>
              {ativas.length > 0 && <BotaoCSV onClick={() => baixarCSV('planos-assinantes',
                ['Pet', 'Tutor', 'Plano', 'Mensalidade', 'Pagamento', 'Vencimento', 'Desde'],
                ativas.map(a => [a.petNome, a.tutorNome, planoDe(a.planoId)?.nome ?? '', precoDe(a.planoId).toFixed(2), a.pagamento === 'em_dia' ? 'Em dia' : 'Atrasada', a.vencimento, a.inicio]))} />}
            </div>
            {porPlano.length === 0 || porPlano.every(x => x.n === 0)
              ? <p className="py-6 text-center text-[13px] text-ink-3">Sem assinantes ainda. Crie planos na aba <b>Planos</b> e assine na ficha do pet (Pet 360).</p>
              : <BarraRank itens={porPlano.filter(x => x.n > 0).map(x => ({ chave: x.plano.id, rotulo: x.plano.nome, valor: x.receita, sub: `${x.n} assinante${x.n === 1 ? '' : 's'}` }))} />}
          </div>
        </div>
      )}

      {/* ───────────────────── ASSINANTES ───────────────────── */}
      {aba === 'assinantes' && <Assinantes assinaturas={assinaturas} planoDe={planoDe} precoDe={precoDe} irCobranca={() => setAba('cobranca')} cancelar={acoes.cancelarAssinatura} />}

      {/* ───────────────────── PLANOS (modelos) ───────────────────── */}
      {aba === 'planos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold">Modelos de plano</h2>
              <p className="mt-0.5 text-[12.5px] text-ink-3">Monte os planos que a clínica oferece. Cada benefício vira desconto ou serviço incluso, aplicado sozinho no atendimento.</p>
            </div>
            <button onClick={() => setAdicionandoPlano(true)}
              className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
              + Novo plano
            </button>
          </div>
          {planos.length === 0 ? (
            <div className="rounded-xl border border-line bg-surface-1 p-6 text-center">
              <p className="text-[13.5px] text-ink-2">Nenhum plano criado ainda.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {planos.map(pl => (
                <div key={pl.id} className="flex flex-col rounded-xl border border-line bg-surface-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${PLANO_DOT[pl.cor]}`} />
                        <h3 className="text-[14.5px] font-semibold">{pl.nome}</h3>
                      </div>
                      <div className="mt-0.5 text-[13px] text-ink-2"><span className="text-[16px] font-semibold text-ink">R$ {pl.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>/mês</div>
                    </div>
                    {!pl.ativo && <span className="rounded-md border border-line bg-surface-2 px-2 py-0.5 text-[10.5px] text-ink-3">inativo</span>}
                  </div>
                  <ul className="mt-3 flex-1 space-y-1 text-[12px] text-ink-2">
                    {pl.beneficios.map(b => <li key={b.id}>✓ {rotuloBeneficio(b)}</li>)}
                  </ul>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                    <span className="text-[11.5px] text-ink-3">{nAtivas(pl.id)} assinante{nAtivas(pl.id) === 1 ? '' : 's'}</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditandoPlano(pl)}
                        className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">Editar</button>
                      <ConfirmButton titulo={`Remover ${pl.nome}`} mensagem={`Remover o plano "${pl.nome}"? As assinaturas ativas serão canceladas.`}
                        confirmLabel="Remover" danger onConfirm={() => acoes.deletarPlano(pl.id)}
                        className="rounded-lg border border-bad/40 bg-bad/10 px-2.5 py-1 text-[11.5px] font-medium text-bad transition hover:border-bad/60 hover:bg-bad/20">Deletar</ConfirmButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────── COBRANÇA (dunning da Bia) ───────────────────── */}
      {aba === 'cobranca' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-surface-1 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-ink-2">
                <span className="font-semibold text-ink">{inadimplentes.length}</span> assinante{inadimplentes.length === 1 ? '' : 's'} com a mensalidade atrasada
                {inadimplentes.length > 0 && <> · <span className="font-medium text-warn">{brl(valorEmAtraso)}/mês em risco</span></>}. A Bia recupera pelo WhatsApp — o motor roda fora, você acompanha por aqui.
              </p>
              {inadimplentes.length > 0 && (
                <button onClick={() => { inadimplentes.forEach(i => cobrar(i.a.id)); setAvisoCobranca(`Cobrança disparada para ${inadimplentes.length} assinante${inadimplentes.length === 1 ? '' : 's'} — lote de ~20, intervalo 40–100s. A Bia envia o link de pagamento e faz o follow-up.`) }}
                  className="shrink-0 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
                  Disparar cobranças
                </button>
              )}
            </div>
            {avisoCobranca && <p className="mt-3 rounded-lg border border-brand/30 bg-brand/[0.07] px-3 py-2 text-[12.5px] text-brand">{avisoCobranca}</p>}
          </div>

          {inadimplentes.length === 0 ? (
            <div className="rounded-xl border border-line bg-surface-1 p-8 text-center">
              <div className="text-[26px]">✅</div>
              <p className="mt-1 text-[13.5px] font-medium text-ink">Nenhuma mensalidade atrasada.</p>
              <p className="mt-0.5 text-[12.5px] text-ink-3">Todas as assinaturas ativas estão em dia.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {inadimplentes.map(({ a, plano, valor, dias }) => {
                const enviado = cobrados.has(a.id)
                const msg = mensagemCobrancaPlano(a.tutorNome, a.petNome, plano?.nome ?? 'bem-estar', valor)
                return (
                  <div key={a.id} className="rounded-xl border border-line bg-surface-1 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-semibold">{a.petNome}</span>
                          <span className="text-[12.5px] text-ink-3">· {a.tutorNome}</span>
                          {plano && <span className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] text-ink-2"><span className={`h-1.5 w-1.5 rounded-full ${PLANO_DOT[plano.cor]}`} />{plano.nome}</span>}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-ink-3">
                          <span className="font-medium text-warn">{dias} dia{dias === 1 ? '' : 's'} em atraso</span>
                          <span>venceu {fmtData(a.vencimento)}</span>
                          <span>mensalidade <span className="tabular-nums text-ink-2">{brl(valor)}</span></span>
                          {a.telefone && <span className="tabular-nums">{a.telefone}</span>}
                        </div>
                      </div>
                      {enviado
                        ? <span className="shrink-0 rounded-lg border border-ok/40 bg-ok/10 px-3 py-1.5 text-[12px] font-medium text-ok">✓ Cobrança enviada</span>
                        : <button onClick={() => cobrar(a.id)} className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-surface-0 transition hover:bg-brand-dim">Cobrar pelo WhatsApp</button>}
                    </div>
                    <div className="mt-3 rounded-lg border border-line bg-surface-2 p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-3"><span className="text-brand">✦</span> Mensagem da Bia</div>
                      <p className="text-[12.5px] leading-relaxed text-ink-2">{msg}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modais de plano */}
      <Modal titulo="Novo plano de bem-estar" aberto={adicionandoPlano} onFechar={() => setAdicionandoPlano(false)}>
        <FormPlano onCancelar={() => setAdicionandoPlano(false)}
          onSalvar={async p => { await acoes.criarPlano(p); setAdicionandoPlano(false) }} />
      </Modal>
      <Modal titulo={`Editar ${editandoPlano?.nome ?? ''}`} aberto={!!editandoPlano} onFechar={() => setEditandoPlano(null)}>
        {editandoPlano && (
          <FormPlano plano={editandoPlano} onCancelar={() => setEditandoPlano(null)}
            onSalvar={async p => { await acoes.atualizarPlano(editandoPlano.id, p); setEditandoPlano(null) }} />
        )}
      </Modal>
    </div>
  )
}

/* ─────────────────────────── ASSINANTES ─────────────────────────── */

type Filtro = 'todos' | 'em_dia' | 'atraso' | 'cancelados'

function Assinantes({ assinaturas, planoDe, precoDe, irCobranca, cancelar }: {
  assinaturas: Assinatura[]
  planoDe: (id: string) => PlanoBemEstar | undefined
  precoDe: (id: string) => number
  irCobranca: () => void
  cancelar: (id: string) => Promise<void>
}) {
  const [filtro, setFiltro] = useState<Filtro>('todos')

  const ativas = assinaturas.filter(a => a.status === 'ativa')
  const contagem: Record<Filtro, number> = {
    todos: ativas.length,
    em_dia: ativas.filter(a => a.pagamento === 'em_dia').length,
    atraso: ativas.filter(a => a.pagamento === 'atrasada').length,
    cancelados: assinaturas.filter(a => a.status !== 'ativa').length,
  }
  const lista = (
    filtro === 'todos' ? ativas
    : filtro === 'em_dia' ? ativas.filter(a => a.pagamento === 'em_dia')
    : filtro === 'atraso' ? ativas.filter(a => a.pagamento === 'atrasada')
    : assinaturas.filter(a => a.status !== 'ativa')
  ).slice().sort((a, b) => a.petNome.localeCompare(b.petNome))

  const FILTROS: [Filtro, string][] = [
    ['todos', 'Todos'], ['em_dia', 'Em dia'], ['atraso', 'Em atraso'], ['cancelados', 'Cancelados'],
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {FILTROS.map(([id, rotulo]) => (
          <button key={id} onClick={() => setFiltro(id)}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
              filtro === id ? 'bg-brand/12 text-brand' : 'border border-line bg-surface-2 text-ink-2 hover:text-ink'}`}>
            {rotulo} <span className="tabular-nums text-ink-3">({contagem[id]})</span>
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface-1 p-8 text-center">
          <p className="text-[13.5px] text-ink-2">Nenhuma assinatura {filtro === 'em_dia' ? 'em dia' : filtro === 'atraso' ? 'em atraso' : filtro === 'cancelados' ? 'cancelada' : ''} por aqui.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line text-[11.5px] uppercase tracking-wider text-ink-3">
                <th className="px-4 py-3 font-medium">Pet · Tutor</th>
                <th className="px-3 py-3 font-medium">Plano</th>
                <th className="px-3 py-3 text-right font-medium">Mensalidade</th>
                <th className="px-3 py-3 font-medium">Vencimento</th>
                <th className="px-3 py-3 font-medium">Situação</th>
                <th className="px-4 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody className="text-[13.5px]">
              {lista.map(a => {
                const plano = planoDe(a.planoId)
                const dias = diasAtrasoMensalidade(a.vencimento)
                const atrasada = a.status === 'ativa' && a.pagamento === 'atrasada'
                return (
                  <tr key={a.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3 font-medium">{a.petNome}<span className="block text-[11px] font-normal text-ink-3">{a.tutorNome}</span></td>
                    <td className="px-3 py-3">
                      {plano
                        ? <span className="inline-flex items-center gap-1.5 text-ink-2"><span className={`h-1.5 w-1.5 rounded-full ${PLANO_DOT[plano.cor]}`} />{plano.nome}</span>
                        : <span className="text-ink-3">—</span>}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{brl(precoDe(a.planoId))}</td>
                    <td className="px-3 py-3 tabular-nums text-ink-3">{fmtData(a.vencimento)}</td>
                    <td className="px-3 py-3">
                      {a.status !== 'ativa'
                        ? <span className="rounded-md border border-line bg-surface-2 px-2 py-0.5 text-[11px] text-ink-3">{a.status === 'cancelada' ? 'Cancelada' : 'Suspensa'}</span>
                        : atrasada
                          ? <span className="rounded-md border border-warn/40 bg-warn/10 px-2 py-0.5 text-[11px] font-medium text-warn">⚠ Atrasada · {dias}d</span>
                          : <span className="rounded-md border border-ok/40 bg-ok/10 px-2 py-0.5 text-[11px] font-medium text-ok">Em dia</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {atrasada
                        ? <button onClick={irCobranca} className="rounded-lg border border-warn/40 bg-warn/10 px-2.5 py-1 text-[11.5px] font-medium text-warn transition hover:bg-warn/20">Cobrar</button>
                        : a.status === 'ativa'
                          ? <ConfirmButton titulo={`Cancelar plano de ${a.petNome}`} mensagem={`Cancelar a assinatura de ${a.petNome} (${a.tutorNome})?`}
                              confirmLabel="Cancelar plano" danger onConfirm={() => cancelar(a.id)}
                              className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-3 transition hover:border-bad/50 hover:text-bad">Cancelar</ConfirmButton>
                          : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
