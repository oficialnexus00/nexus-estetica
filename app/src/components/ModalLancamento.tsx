import { useState } from 'react'
import Modal, { SucessoPanel, inputCls, labelCls } from './Modal'
import { fmt } from '../data'

const vazio = { tipo: 'entrada' as 'entrada' | 'saida', desc: '', categoria: '', valor: '', forma: 'Pix', data: '' }
const FORMAS = ['Pix', 'Cartão', 'Boleto', 'Dinheiro', 'Transferência']

export default function ModalLancamento({
  open,
  onClose,
  clinicNome,
}: {
  open: boolean
  onClose: () => void
  clinicNome: string
}) {
  const [form, setForm] = useState(vazio)
  const [ok, setOk] = useState(false)

  const set = (k: keyof typeof vazio) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function fechar() {
    setOk(false)
    setForm(vazio)
    onClose()
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setOk(true)
  }

  const valorNum = Number(form.valor) || 0

  return (
    <Modal open={open} onClose={fechar} title="Novo lançamento" subtitle={clinicNome}>
      {ok ? (
        <SucessoPanel
          titulo="Lançamento registrado"
          linhas={[
            { label: 'Tipo', valor: form.tipo === 'entrada' ? 'Entrada' : 'Saída' },
            { label: 'Descrição', valor: form.desc },
            { label: 'Valor', valor: `${form.tipo === 'entrada' ? '+' : '−'} ${fmt(valorNum)}` },
            { label: 'Forma', valor: form.forma },
          ]}
          nota="Na v1 completa isso entra no fluxo de caixa, no repasse por dentista e na conciliação automática."
          onClose={fechar}
        />
      ) : (
        <form onSubmit={submit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2">
            {(['entrada', 'saida'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(f => ({ ...f, tipo: t }))}
                className={`rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition ${
                  form.tipo === t
                    ? t === 'entrada'
                      ? 'border-ok/40 bg-ok/12 text-ok'
                      : 'border-bad/40 bg-bad/12 text-bad'
                    : 'border-line bg-surface-2 text-ink-2 hover:text-ink'
                }`}
              >
                {t === 'entrada' ? '↓ Entrada' : '↑ Saída'}
              </button>
            ))}
          </div>

          <div>
            <label className={labelCls}>Descrição</label>
            <input required value={form.desc} onChange={set('desc')} placeholder="Ex: Roberta Nunes — implante (2/4)" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Valor (R$)</label>
              <input required type="number" min="0" step="0.01" value={form.valor} onChange={set('valor')} placeholder="0,00" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Categoria</label>
              <input value={form.categoria} onChange={set('categoria')} placeholder="Ex: Procedimento" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Forma</label>
              <select value={form.forma} onChange={set('forma')} className={inputCls}>
                {FORMAS.map(f => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Data</label>
              <input required type="date" value={form.data} onChange={set('data')} className={inputCls} />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={fechar} className="flex-1 rounded-lg border border-line bg-surface-2 px-4 py-2.5 text-[13.5px] font-medium text-ink-2 transition hover:text-ink">
              Cancelar
            </button>
            <button type="submit" className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-[13.5px] font-semibold text-surface-0 transition hover:bg-brand-dim">
              Salvar lançamento
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
