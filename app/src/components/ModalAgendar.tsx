import { useState } from 'react'
import Modal, { SucessoPanel, inputCls, labelCls } from './Modal'
import { createAppointment } from '../lib/agenda'

type Prof = { id: string; nome: string; especialidade?: string | null }
const vazio = { paciente: '', profId: '', data: '', hora: '', dur: '30', procedimento: '' }

export default function ModalAgendar({
  open,
  onClose,
  profissionais,
  clinicNome,
  pacienteInicial,
  clinicId,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  profissionais: readonly Prof[]
  clinicNome?: string
  pacienteInicial?: string
  clinicId?: string // quando presente, grava de verdade
  onSaved?: () => void
}) {
  const [form, setForm] = useState({ ...vazio, paciente: pacienteInicial ?? '' })
  const [ok, setOk] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const set = (k: keyof typeof vazio) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const profSel = form.profId || profissionais[0]?.id || ''
  const prof = profissionais.find(p => p.id === profSel)

  function fechar() {
    setOk(false)
    setErro(null)
    setSalvando(false)
    setForm({ ...vazio, paciente: pacienteInicial ?? '' })
    onClose()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (clinicId) {
      setSalvando(true)
      try {
        await createAppointment({
          clinic_id: clinicId,
          professional_id: profSel || null,
          paciente_nome: form.paciente,
          data: form.data,
          hora: form.hora,
          duracao_min: Number(form.dur),
          procedimento: form.procedimento,
        })
        onSaved?.()
        setOk(true)
      } catch {
        setErro('Não deu pra salvar o agendamento. Tenta de novo.')
      } finally {
        setSalvando(false)
      }
    } else {
      setOk(true)
    }
  }

  return (
    <Modal open={open} onClose={fechar} title="Novo agendamento" subtitle={clinicNome}>
      {ok ? (
        <SucessoPanel
          titulo={clinicId ? 'Agendamento salvo no banco' : 'Agendamento criado'}
          linhas={[
            { label: 'Paciente', valor: form.paciente },
            { label: 'Profissional', valor: prof?.nome ?? '—' },
            { label: 'Data / hora', valor: `${fmtData(form.data)} · ${form.hora}` },
            { label: 'Procedimento', valor: form.procedimento || '—' },
          ]}
          nota="✦ A Patrícia já vai enviar a confirmação pro paciente no WhatsApp e cobrar resposta 24h antes — reduzindo o no-show automaticamente."
          onClose={fechar}
        />
      ) : (
        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label className={labelCls}>Paciente</label>
            <input required value={form.paciente} onChange={set('paciente')} placeholder="Nome do paciente" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Profissional</label>
            <select value={profSel} onChange={set('profId')} className={inputCls}>
              {profissionais.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                  {p.especialidade ? ` · ${p.especialidade}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className={labelCls}>Data</label>
              <input required type="date" value={form.data} onChange={set('data')} className={inputCls} />
            </div>
            <div className="col-span-1">
              <label className={labelCls}>Hora</label>
              <input required type="time" value={form.hora} onChange={set('hora')} className={inputCls} />
            </div>
            <div className="col-span-1">
              <label className={labelCls}>Duração</label>
              <select value={form.dur} onChange={set('dur')} className={inputCls}>
                {['15', '30', '45', '60', '90', '120'].map(m => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Procedimento</label>
            <input value={form.procedimento} onChange={set('procedimento')} placeholder="Ex: Avaliação de implante" className={inputCls} />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-brand/25 bg-brand/8 px-3 py-2 text-[12px] text-ink-2">
            <span className="text-brand">✦</span> A Patrícia confirma automaticamente com o paciente no WhatsApp.
          </div>

          {erro && <div className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-[12.5px] text-bad">{erro}</div>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={fechar} className="flex-1 rounded-lg border border-line bg-surface-2 px-4 py-2.5 text-[13.5px] font-medium text-ink-2 transition hover:text-ink">
              Cancelar
            </button>
            <button type="submit" disabled={salvando} className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-[13.5px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-60">
              {salvando ? 'Salvando…' : 'Agendar'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

function fmtData(iso: string) {
  if (!iso) return '—'
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}
