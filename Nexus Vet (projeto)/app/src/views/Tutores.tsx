import { useState } from 'react'
import type { DB, Tutor, Pet } from '../data'
import { idadeDe, situacaoVacina, rotuloBeneficio } from '../data'
import type { Acoes } from '../App'
import ConfirmButton from '../components/ConfirmButton'
import Vacinacao from '../components/Vacinacao'
import Prontuario from '../components/Prontuario'
import LinhaDoTempo from '../components/LinhaDoTempo'
import PesoEvolucao from '../components/PesoEvolucao'
import AcoesPet from '../components/AcoesPet'
import Modal from '../components/Modal'
import { FormTutor, FormEditarTutor, FormEditarPet, FormPet } from '../components/Formularios'

const ETAPA: Record<Tutor['etapa'], string> = {
  lead: 'border-s2/40 bg-s2/10 text-s2',
  agendado: 'border-warn/40 bg-warn/10 text-warn',
  cliente: 'border-ok/40 bg-ok/10 text-ok',
  inativo: 'border-line bg-surface-2 text-ink-3',
}

const PORTE_LABEL: Record<string, string> = {
  pequeno: 'pequeno', medio: 'médio', grande: 'grande', gigante: 'gigante',
}

// situação recalculada pela data (não confiar no campo gravado, que envelhece)
const alerta = (p: Pet) =>
  p.vacinas.some(v => situacaoVacina(v.proximaDose) === 'atrasada') ? 'atrasada'
  : p.vacinas.some(v => situacaoVacina(v.proximaDose) === 'proxima') ? 'proxima' : null

export default function Tutores({ data, acoes }: { data: DB; acoes: Acoes }) {
  const [busca, setBusca] = useState('')
  const [sel, setSel] = useState<{ tutor: Tutor; pet: Pet } | null>(null)
  const [cadastrando, setCadastrando] = useState(false)
  const [editandoTutor, setEditandoTutor] = useState<Tutor | null>(null)
  const [editandoPet, setEditandoPet] = useState<Pet | null>(null)
  const [adicionandoPetEm, setAdicionandoPetEm] = useState<Tutor | null>(null)

  // o pet selecionado precisa vir sempre da lista atual, senão a carteira
  // continua mostrando o estado antigo depois de registrar uma dose
  const petAtual = sel && data.tutores.find(t => t.id === sel.tutor.id)?.pets.find(p => p.id === sel.pet.id)

  const q = busca.trim().toLowerCase()
  const lista = data.tutores.filter(t =>
    !q || t.nome.toLowerCase().includes(q) || t.telefone.includes(q) ||
    t.pets.some(p => p.nome.toLowerCase().includes(q))
  )

  // Pet 360 — a visão consolidada
  if (sel && petAtual) {
    const tutor = sel.tutor
    const pet = petAtual
    return (
      <div className="space-y-4">
        <button onClick={() => setSel(null)} className="text-[13px] text-ink-2 transition hover:text-ink">← Voltar</button>

        <LinhaDoTempo pet={pet} exames={(data.exames ?? []).filter(e => e.pet_id === pet.id)}
          onNota={d => acoes.registrarNotaClinica(pet.id, d)} />

        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-semibold tracking-tight">{pet.nome}</h2>
              <p className="mt-0.5 text-[13px] text-ink-2">
                {pet.especie === 'cao' ? 'Cão' : 'Gato'}
                {pet.sexo && ` · ${pet.sexo === 'macho' ? 'Macho' : 'Fêmea'}`} · {pet.raca} · {idadeDe(pet.nascimento)} · {pet.peso} kg
                {pet.porte && ` · porte ${PORTE_LABEL[pet.porte]}`}
                {pet.pelagem && ` · ${pet.pelagem}`}
                {pet.castrado && ' · castrado'}
                {pet.pedigree && <span className="text-brand"> · com pedigree</span>}
              </p>
              {pet.temperamento && (
                <p className="mt-1 inline-flex items-center gap-1 rounded-md border border-line bg-surface-2 px-2 py-0.5 text-[11.5px] text-ink-2">
                  Temperamento: <span className="font-medium text-ink">{pet.temperamento}</span>
                </p>
              )}
              {(pet.microchip || pet.rga) && (
                <p className="mt-0.5 text-[12px] text-ink-3">
                  {pet.microchip && <>Microchip: <span className="font-mono text-ink-2">{pet.microchip}</span></>}
                  {pet.microchip && pet.rga && ' · '}
                  {pet.rga && <>RGA: <span className="font-mono text-ink-2">{pet.rga}</span></>}
                </p>
              )}
              {pet.observacoes && (
                <p className="mt-1 text-[12px] text-ink-3">📝 {pet.observacoes}</p>
              )}
              <div className="mt-2 space-y-0.5 text-[13px] text-ink-3">
                <p>Tutor: <span className="text-ink-2">{tutor.nome}</span> · {tutor.telefone}</p>
                {tutor.email && <p>✉ {tutor.email}</p>}
                {tutor.endereco && <p>📍 {tutor.endereco}</p>}
                {tutor.nascimento && (
                  <p>🎂 {new Date(tutor.nascimento + 'T00:00:00').toLocaleDateString('pt-BR')} <span className="text-ink-2">({idadeDe(tutor.nascimento)})</span></p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setEditandoPet(pet)}
                className="rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-[13px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                Editar pet
              </button>
            </div>
          </div>

          {pet.alerta && (
            <div className="mt-4 rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-[12.5px] text-bad">
              ⚠ {pet.alerta}
            </div>
          )}
        </div>

        <PlanoDoPet pet={pet} tutorNome={tutor.nome} data={data} acoes={acoes} />

        <AcoesPet pet={pet} tutorNome={tutor.nome} data={data} acoes={acoes} />

        <Prontuario pet={pet} tutorNome={tutor.nome} clinica={acoes.clinicaNome} tipos={data.tiposAtendimento ?? []}
          onNovoAtendimento={d => acoes.registrarAtendimento(pet.id, d)}
          condicoes={pet.condicoes ?? []}
          onAdicionarCondicao={t => acoes.adicionarCondicao(pet.id, t)}
          onRemoverCondicao={i => acoes.removerCondicao(pet.id, i)} />

        <PesoEvolucao pet={pet} />

        <Vacinacao pet={pet} protocolos={data.protocolos ?? []}
          onRegistrarDose={d => acoes.registrarDose(pet.id, d)} />

        <Modal titulo={`Editar ${pet.nome}`} aberto={!!editandoPet} onFechar={() => setEditandoPet(null)}>
          {editandoPet && (
            <FormEditarPet pet={editandoPet} onCancelar={() => setEditandoPet(null)}
              onSalvar={async d => { await acoes.editarPet(editandoPet.id, d); setEditandoPet(null) }} />
          )}
        </Modal>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por tutor, pet ou telefone…"
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface-1 px-3.5 py-2.5 text-[13.5px] text-ink outline-none transition placeholder:text-ink-3 focus:border-brand/60 md:max-w-sm"
        />
        <button onClick={() => setCadastrando(true)}
          className="shrink-0 rounded-lg bg-brand px-3.5 py-2.5 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim">
          + Novo tutor
        </button>
      </div>

      <Modal titulo="Cadastrar tutor e pet" aberto={cadastrando} onFechar={() => setCadastrando(false)} largura="lg">
        <FormTutor onCancelar={() => setCadastrando(false)}
          onSalvar={async d => { await acoes.criarTutorComPet(d); setCadastrando(false) }} />
      </Modal>

      <div className="space-y-3">
        {lista.map(t => (
          <div key={t.id} className="rounded-xl border border-line bg-surface-1 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14.5px] font-semibold">{t.nome}</span>
                  <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-medium capitalize ${ETAPA[t.etapa]}`}>
                    {t.etapa}
                  </span>
                </div>
                <div className="mt-0.5 text-[12px] text-ink-3">{t.telefone} · veio de {t.origem}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] text-ink-3">{t.pets.length} {t.pets.length === 1 ? 'pet' : 'pets'}</span>
                <button onClick={() => setEditandoTutor(t)} aria-label={`Editar ${t.nome}`}
                  className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                  Editar
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {t.pets.map(p => {
                const a = alerta(p)
                return (
                  <button key={p.id} onClick={() => setSel({ tutor: t, pet: p })}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-left transition hover:border-brand/50">
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] font-medium">{p.nome}</div>
                      <div className="truncate text-[11.5px] text-ink-3">
                        {p.especie === 'cao' ? 'Cão' : 'Gato'} · {p.raca} · {idadeDe(p.nascimento)}
                      </div>
                    </div>
                    {a && (
                      <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-medium ${
                        a === 'atrasada' ? 'bg-bad/15 text-bad' : 'bg-warn/15 text-warn'}`}>
                        {a === 'atrasada' ? 'vacina atrasada' : 'vacina perto'}
                      </span>
                    )}
                  </button>
                )
              })}
              <button onClick={() => setAdicionandoPetEm(t)}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-line bg-surface-2/50 px-3 py-2.5 text-[12.5px] font-medium text-ink-3 transition hover:border-brand/50 hover:text-brand">
                <span className="text-[14px] leading-none">+</span> Adicionar pet
              </button>
            </div>
          </div>
        ))}

        {lista.length === 0 && (
          <p className="py-10 text-center text-[13.5px] text-ink-3">Nenhum resultado para "{busca}".</p>
        )}
      </div>

      <Modal titulo="Editar tutor" aberto={!!editandoTutor} onFechar={() => setEditandoTutor(null)}>
        {editandoTutor && (
          <FormEditarTutor tutor={editandoTutor} onCancelar={() => setEditandoTutor(null)}
            onSalvar={async d => { await acoes.editarTutor(editandoTutor.id, d); setEditandoTutor(null) }} />
        )}
      </Modal>

      <Modal titulo={`Adicionar pet a ${adicionandoPetEm?.nome}`} aberto={!!adicionandoPetEm} onFechar={() => setAdicionandoPetEm(null)}>
        {adicionandoPetEm && (
          <FormPet tutorNome={adicionandoPetEm.nome} onCancelar={() => setAdicionandoPetEm(null)}
            onSalvar={async d => { await acoes.adicionarPet(adicionandoPetEm.id, d); setAdicionandoPetEm(null) }} />
        )}
      </Modal>
    </div>
  )
}

/* ---------------------------------------- plano de bem-estar do pet (Pet 360) */

const PLANO_COR: Record<string, string> = { teal: 'bg-brand', blue: 'bg-s2', violet: 'bg-s4' }

function PlanoDoPet({ pet, tutorNome, data, acoes }: { pet: Pet; tutorNome: string; data: DB; acoes: Acoes }) {
  const [sel, setSel] = useState('')
  const assinatura = (data.assinaturas ?? []).find(a => a.petId === pet.id && a.status === 'ativa')
  const plano = assinatura ? (data.planos ?? []).find(p => p.id === assinatura.planoId) : undefined
  const planosAtivos = (data.planos ?? []).filter(p => p.ativo)

  if (assinatura && plano) {
    return (
      <div className="rounded-xl border border-line bg-surface-1 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${PLANO_COR[plano.cor]}`} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[14px] font-semibold">Plano {plano.nome}</h3>
                {assinatura.pagamento === 'atrasada' && (
                  <span className="rounded-md border border-bad/40 bg-bad/10 px-2 py-0.5 text-[10.5px] font-medium text-bad">⚠ Mensalidade atrasada</span>
                )}
              </div>
              <p className="text-[12px] text-ink-3">R$ {plano.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês · desde {new Date(assinatura.inicio + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <ConfirmButton titulo="Cancelar assinatura" mensagem={`Cancelar o plano ${plano.nome} do ${pet.nome}?`}
            confirmLabel="Cancelar plano" danger onConfirm={() => acoes.cancelarAssinatura(assinatura.id)}
            className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[12px] font-medium text-ink-2 transition hover:border-bad/50 hover:text-bad">
            Cancelar
          </ConfirmButton>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {plano.beneficios.map(b => {
            const usado = assinatura.consumo[b.id] ?? 0
            const saldo = b.tipo === 'cota' && b.cota ? `${usado}/${b.cota} usados no ${b.janela === 'mes' ? 'mês' : 'ano'}` : null
            return (
              <div key={b.id} className="rounded-lg border border-line bg-surface-2 px-3 py-2">
                <div className="text-[12.5px] font-medium">✓ {rotuloBeneficio(b)}</div>
                {saldo && <div className="mt-0.5 text-[11px] text-ink-3">{saldo}</div>}
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-[11px] text-ink-3">O benefício é aplicado sozinho no PDV quando você vende um serviço para o {pet.nome}.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold">Plano de bem-estar</h3>
          <p className="text-[12px] text-ink-3">{pet.nome} ainda não é assinante. Ofereça recorrência e desconto ao {tutorNome}.</p>
        </div>
        {planosAtivos.length === 0 ? (
          <span className="text-[12px] text-ink-3">Nenhum plano ativo. Crie em Configurações → Planos.</span>
        ) : (
          <div className="flex items-center gap-2">
            <select value={sel} onChange={e => setSel(e.target.value)}
              className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] outline-none focus:border-brand/60">
              <option value="">Escolher plano…</option>
              {planosAtivos.map(p => <option key={p.id} value={p.id}>{p.nome} — R$ {p.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</option>)}
            </select>
            <button disabled={!sel} onClick={() => { if (sel) { acoes.assinarPet({ petId: pet.id, petNome: pet.nome, tutorNome, planoId: sel }); setSel('') } }}
              className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-50">
              Assinar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
