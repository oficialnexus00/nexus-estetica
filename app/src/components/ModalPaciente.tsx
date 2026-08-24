import { useState } from 'react'
import Modal, { SucessoPanel, inputCls, labelCls } from './Modal'
import { createPatient } from '../lib/patients'

const vazio = { nome: '', telefone: '', nasc: '', origem: 'Instagram Ads', alerta: '' }
const ORIGENS = ['Instagram Ads', 'Indicação', 'Google', 'Fachada', 'WhatsApp', 'Outro']

export default function ModalPaciente({
  open,
  onClose,
  clinicNome,
  clinicId,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  clinicNome: string
  clinicId?: string // quando presente, grava de verdade no Supabase
  onSaved?: () => void
}) {
  const [form, setForm] = useState(vazio)
  const [ok, setOk] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const set = (k: keyof typeof vazio) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function fechar() {
    setOk(false)
    setErro(null)
    setSalvando(false)
    setForm(vazio)
    onClose()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (clinicId) {
      setSalvando(true)
      try {
        await createPatient({
          clinic_id: clinicId,
          nome: form.nome,
          telefone: form.telefone,
          nascimento: form.nasc,
          origem: form.origem,
          alerta_saude: form.alerta,
        })
        onSaved?.()
        setOk(true)
      } catch (err) {
        setErro('Não deu pra salvar. Tenta de novo.')
      } finally {
        setSalvando(false)
      }
    } else {
      setOk(true)
    }
  }

  return (
    <Modal open={open} onClose={fechar} title="Novo paciente" subtitle={clinicNome}>
      {ok ? (
        <SucessoPanel
          titulo={clinicId ? 'Paciente cadastrado no banco' : 'Paciente cadastrado'}
          linhas={[
            { label: 'Nome', valor: form.nome },
            { label: 'Telefone', valor: form.telefone || '—' },
            { label: 'Origem', valor: form.origem },
          ]}
          nota="✦ A Patrícia já pode acionar esse paciente no WhatsApp — confirmação, orçamento e reativação entram no automático."
          onClose={fechar}
        />
      ) : (
        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label className={labelCls}>Nome completo</label>
            <input required value={form.nome} onChange={set('nome')} placeholder="Nome do paciente" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Telefone / WhatsApp</label>
              <input required value={form.telefone} onChange={set('telefone')} placeholder="(81) 9…" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nascimento</label>
              <input type="date" value={form.nasc} onChange={set('nasc')} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Origem do paciente</label>
            <select value={form.origem} onChange={set('origem')} className={inputCls}>
              {ORIGENS.map(o => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Alerta de saúde (opcional)</label>
            <input value={form.alerta} onChange={set('alerta')} placeholder="Ex: hipertenso, alergia a dipirona…" className={inputCls} />
          </div>

          {erro && <div className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-[12.5px] text-bad">{erro}</div>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={fechar} className="flex-1 rounded-lg border border-line bg-surface-2 px-4 py-2.5 text-[13.5px] font-medium text-ink-2 transition hover:text-ink">
              Cancelar
            </button>
            <button type="submit" disabled={salvando} className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-[13.5px] font-semibold text-surface-0 transition hover:bg-brand-dim disabled:opacity-60">
              {salvando ? 'Salvando…' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
