import { useState } from 'react'
import type { DB, Tutor, Pet } from '../data'
import { idadeDe } from '../data'
import type { Acoes } from '../App'
import CarteiraVacina from '../components/CarteiraVacina'
import Prontuario from '../components/Prontuario'
import LinhaDoTempo from '../components/LinhaDoTempo'
import PesoEvolucao from '../components/PesoEvolucao'
import ProtocolosPet from '../components/ProtocolosPet'
import EmitirDocumento from '../components/EmitirDocumento'
import Modal from '../components/Modal'
import { FormTutor, FormEditarTutor, FormEditarPet } from '../components/Formularios'
import { comprovanteVacinacao } from '../lib/imprimir'

const ETAPA: Record<Tutor['etapa'], string> = {
  lead: 'border-s2/40 bg-s2/10 text-s2',
  agendado: 'border-warn/40 bg-warn/10 text-warn',
  cliente: 'border-ok/40 bg-ok/10 text-ok',
  inativo: 'border-line bg-surface-2 text-ink-3',
}

const alerta = (p: Pet) =>
  p.vacinas.some(v => v.situacao === 'atrasada') ? 'atrasada'
  : p.vacinas.some(v => v.situacao === 'proxima') ? 'proxima' : null

export default function Tutores({ data, acoes }: { data: DB; acoes: Acoes }) {
  const [busca, setBusca] = useState('')
  const [sel, setSel] = useState<{ tutor: Tutor; pet: Pet } | null>(null)
  const [cadastrando, setCadastrando] = useState(false)
  const [editandoTutor, setEditandoTutor] = useState<Tutor | null>(null)
  const [editandoPet, setEditandoPet] = useState<Pet | null>(null)

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

        <div className="rounded-xl border border-line bg-surface-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-semibold tracking-tight">{pet.nome}</h2>
              <p className="mt-0.5 text-[13px] text-ink-2">
                {pet.especie === 'cao' ? 'Cão' : 'Gato'} · {pet.raca} · {idadeDe(pet.nascimento)} · {pet.peso} kg
                {pet.castrado && ' · castrado'}
              </p>
              <p className="mt-2 text-[13px] text-ink-3">
                Tutor: <span className="text-ink-2">{tutor.nome}</span> · {tutor.telefone}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => comprovanteVacinacao({
                  clinica: acoes.clinicaNome, tutor: tutor.nome, pet: pet.nome, especie: pet.especie, vacinas: pet.vacinas,
                })}
                className="rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-[13px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
                Comprovante de vacina
              </button>
              <EmitirDocumento pet={pet} tutorNome={tutor.nome} clinica={acoes.clinicaNome} modelos={data.modelos ?? []} />
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

        <PesoEvolucao pet={pet} />

        <LinhaDoTempo pet={pet} exames={(data.exames ?? []).filter(e => e.pet_id === pet.id)}
          onNota={d => acoes.registrarNotaClinica(pet.id, d)} />

        <Prontuario pet={pet} tutorNome={tutor.nome} clinica={acoes.clinicaNome} tipos={data.tiposAtendimento ?? []}
          onNovoAtendimento={d => acoes.registrarAtendimento(pet.id, d)} />

        <ProtocolosPet pet={pet} protocolos={data.protocolos ?? []} />

        <CarteiraVacina vacinas={pet.vacinas} especie={pet.especie} protocolos={data.protocolos ?? []}
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

      <Modal titulo="Cadastrar tutor e pet" aberto={cadastrando} onFechar={() => setCadastrando(false)}>
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
    </div>
  )
}
