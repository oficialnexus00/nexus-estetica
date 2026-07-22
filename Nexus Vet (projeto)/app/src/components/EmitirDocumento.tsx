import { useState } from 'react'
import type { Pet, ModeloDocumento } from '../data'
import { idadeDe } from '../data'
import Modal from './Modal'
import { documento } from '../lib/imprimir'

// Emissão de documento a partir de modelo — inspirado no "Documento/Receita a
// partir de modelo" do SimplesVet. Escolhe o modelo, preenche os marcadores com
// os dados do pet/tutor/clínica, permite ajustar o texto e imprime (PDF).

const hoje = () => new Date().toLocaleDateString('pt-BR')

function preencher(conteudo: string, pet: Pet, tutor: string, clinica: string): string {
  const mapa: Record<string, string> = {
    '{pet}': pet.nome,
    '{tutor}': tutor,
    '{especie}': pet.especie === 'cao' ? 'Cão' : 'Gato',
    '{raca}': pet.raca,
    '{idade}': idadeDe(pet.nascimento),
    '{data}': hoje(),
    '{clinica}': clinica,
  }
  return conteudo.replace(/\{pet\}|\{tutor\}|\{especie\}|\{raca\}|\{idade\}|\{data\}|\{clinica\}/g, m => mapa[m] ?? m)
}

export default function EmitirDocumento({ pet, tutorNome, clinica, modelos, profissional }: {
  pet: Pet; tutorNome: string; clinica: string; modelos: ModeloDocumento[]; profissional?: string
}) {
  const [aberto, setAberto] = useState(false)
  const [modeloId, setModeloId] = useState(modelos[0]?.id ?? '')
  const [texto, setTexto] = useState('')

  const modelo = modelos.find(m => m.id === modeloId)

  const abrir = () => {
    const primeiro = modelos[0]
    setModeloId(primeiro?.id ?? '')
    setTexto(primeiro ? preencher(primeiro.conteudo, pet, tutorNome, clinica) : '')
    setAberto(true)
  }

  const trocarModelo = (id: string) => {
    setModeloId(id)
    const m = modelos.find(x => x.id === id)
    setTexto(m ? preencher(m.conteudo, pet, tutorNome, clinica) : '')
  }

  const imprimir = () => {
    if (!modelo) return
    documento({ clinica, titulo: modelo.nome, corpo: texto, tutor: tutorNome, pet: pet.nome, profissional })
    setAberto(false)
  }

  if (modelos.length === 0) return null

  return (
    <>
      <button onClick={abrir}
        className="rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-[13px] font-medium text-ink-2 transition hover:border-brand/50 hover:text-ink">
        Emitir documento
      </button>

      <Modal titulo="Emitir documento" aberto={aberto} onFechar={() => setAberto(false)}>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[12.5px] font-medium text-ink-2">Modelo</label>
            <select value={modeloId} onChange={e => trocarModelo(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] outline-none focus:border-brand/60">
              {modelos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[12.5px] font-medium text-ink-2">Conteúdo (ajuste se precisar)</label>
            <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={9}
              className="w-full resize-y rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] outline-none focus:border-brand/60" />
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setAberto(false)}
              className="rounded-lg border border-line bg-surface-2 px-3.5 py-2 text-[13px] font-medium text-ink-2 transition hover:text-ink">
              Cancelar
            </button>
            <button onClick={imprimir} disabled={!texto.trim()}
              className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-60">
              Imprimir
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
