import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import FormField from '../common/FormField'
import Modal from '../common/Modal'
import { useToast } from '../common/Toast'
import { useAuth } from '../../contexts/AuthContext'
import { deleteAccount } from '../../services/profileService'
import { updatePassword } from '../../services/authService'
import { friendlyError } from '../../utils/errors'
import { validatePassword } from '../../utils/validation'

export default function AccountSection() {
  const { signOut } = useAuth()
  const { notify } = useToast()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function handlePassword(e: FormEvent) {
    e.preventDefault()
    if (saving) return
    const next: typeof errors = {}
    const problem = validatePassword(password)
    if (problem) next.password = problem
    if (confirm !== password) next.confirm = 'Passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setSaving(true)
    try {
      await updatePassword(password)
      setPassword('')
      setConfirm('')
      notify('success', 'Password changed.')
    } catch (err) {
      notify('error', friendlyError(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (deleting || typed !== 'DELETE') return
    setDeleting(true)
    try {
      await deleteAccount() // The route guard then returns you to the login page.
      notify('success', 'Your account has been deleted.')
    } catch (err) {
      notify('error', friendlyError(err))
      setDeleting(false)
    }
  }

  return (
    <section className="card">
      <h2 className="font-semibold">Account</h2>
      <form onSubmit={handlePassword} className="mt-4 space-y-4" noValidate>
        <FormField label="New password" type="password" autoComplete="new-password" value={password}
          onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <FormField label="Confirm new password" type="password" autoComplete="new-password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Change password
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-6 dark:border-navy-800">
        <button type="button" className="btn-ghost border border-slate-300 dark:border-navy-700"
          onClick={() => signOut().catch((err) => notify('error', friendlyError(err)))}>
          Sign out
        </button>
        <button type="button" className="btn bg-red-600 text-white hover:bg-red-500" onClick={() => { setTyped(''); setDeleteOpen(true) }}>
          Delete account
        </button>
      </div>

      <Modal open={deleteOpen} title="Delete your account?" onClose={() => !deleting && setDeleteOpen(false)}>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This permanently deletes your account and every transaction, budget and savings goal. It cannot be undone.
        </p>
        <div className="mt-4">
          <FormField label="Type DELETE to confirm" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={() => setDeleteOpen(false)} disabled={deleting}>Cancel</button>
          <button type="button" className="btn bg-red-600 text-white hover:bg-red-500" onClick={handleDelete} disabled={typed !== 'DELETE' || deleting}>
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete my account
          </button>
        </div>
      </Modal>
    </section>
  )
}
