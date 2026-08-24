import { useState } from 'react'
import Modal, { SucessoPanel, inputCls, labelCls } from './Modal'
import { fmt } from '../data'
import { createBudget } from '../lib/budgets'

export default function ModalOrcamento({
  open,
  onClose,
  clinicNome,
  clinicId,
  pacientes,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  clinicNome: string
  clinicId?: string // quando presente, grava de verdade
  pacientes: { id: string; nome: string }[]
  onSaved?: () => void
}) {
  const [form, setForm] = useState({ patientId: '', procedimento: '', valor: '' })
  const [ok, setOk] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const nomePaciente = pacientes.find(p => p.id === form.patientId)?.nome ?? 'Sem paciente vinculado'
  const valorNum = Number(form.valor) || 0

  function fechar() {
    setOk(false)
    setErro(null)
    setSalvando(false)
    setForm({ patientId: '', procedimento: '', valor: '' })
    onClose()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (clinicId) {
      setSalvando(true)
      try {
        await createBudget({
          clinic_id: clinicId,
          patient_id: form.patientId || null,
          procedimento: form.procedimento,
          valor: valorNum,
        })
        onSaved?.()
        setOk(true)
      } catch {
        setErro('Não deu pra salvar. Tenta de novo.')
      } finally {
        setSalvando(false)
      }
    } else {
      setOk(true)
    }
  }

  return (
    <Modal open={open} onClose={fechar} title="Novo orçamento" subtitle={clinicNome}>
      {ok ? (
        <SucessoPanel
          titulo={clinicId ? 'Orçamento criado no banco' : 'Orçamento criado'}
          linhas={[
            { label: 'Paciente', valor: nomePaciente },
            { label: 'Tratamento', valor: form.procedimento },
            { label: 'Valor', valor: fmt(valorNum) },
          ]}
          nota="💰 Sem resposta em 48h, esse orçamento entra automaticamente no follow-up da Patrícia — ela retoma no WhatsApp, responde objeção e avisa o time quando o paciente esquenta."
          onClose={fechar}
        />
      ) : (
        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label className={labelCls}>Paciente</label>
            <select value={form.patientId} onChange={set('patientId')} className={inputCls}>
              <option value="">Sem paciente vinculado</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Plano de tratamento</label>
            <input required value={form.procedimento} onChange={set('procedimento')} placeholder="Ex: Implante unitário + coroa" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Valor (R$)</label>
            <input required type="number" min="0" step="0.01" value={form.valor} onChange={set('valor')} placeholder="0,00" className={inputCls} />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-brand/25 bg-brand/8 px-3 py-2 text-[12px] text-ink-2">
            <span className="text-brand">💰</span> Ao criar, a Patrícia assume o follow-up no WhatsApp sozinha.
          </div>

          {erro && <div className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-[12.5px] text-bad">{erro}</div>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={fechar} className="flex-1 rounded-lg border border-line bg-surface-2 px-4 py-2.5 text-[13.5px] font-medium text-ink-2 transition hover:text-ink">
              Cancelar
            </button>
            <button type="submit" disabled={salvando} className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-[13.5px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-60">
              {salvando ? 'Salvando…' : 'Criar orçamento'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
