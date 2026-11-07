import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AuthShell from '../components/common/AuthShell'
import FormField from '../components/common/FormField'
import { FullPageSpinner } from '../components/common/Spinner'
import { useToast } from '../components/common/Toast'
import { useAuth } from '../contexts/AuthContext'
import { updatePassword } from '../services/authService'
import { friendlyError } from '../utils/errors'
import { validatePassword } from '../utils/validation'

export default function ResetPassword() {
  const { session, loading, clearRecovery } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <FullPageSpinner />

  // The reset link signs you in briefly. No session means the link is invalid or old.
  if (!session) {
    return (
      <AuthShell title="This link has expired" subtitle="Reset links work once and stop working after a while.">
        <Link to="/forgot-password" className="btn-primary w-full">Request a new link</Link>
      </AuthShell>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    const next: typeof errors = {}
    const passwordError = validatePassword(password)
    if (passwordError) next.password = passwordError
    if (confirm !== password) next.confirm = 'Passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      await updatePassword(password)
      clearRecovery()
      notify('success', 'Password updated.')
      navigate('/', { replace: true })
    } catch (err) {
      notify('error', friendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Use at least 8 characters, with a letter and a number.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="New password" type="password" autoComplete="new-password" value={password}
          onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <FormField label="Confirm new password" type="password" autoComplete="new-password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Update password
        </button>
      </form>
    </AuthShell>
  )
}
