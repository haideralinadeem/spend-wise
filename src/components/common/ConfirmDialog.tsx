import { Loader2 } from 'lucide-react'
import Modal from './Modal'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ open, title, message, confirmLabel, busy, onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="button" className="btn bg-red-600 text-white hover:bg-red-500" onClick={onConfirm} disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
