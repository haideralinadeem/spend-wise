import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import AuthShell from '../components/common/AuthShell'
import FormField from '../components/common/FormField'
import { useToast } from '../components/common/Toast'
import { sendPasswordReset } from '../services/authService'
import { friendlyError } from '../utils/errors'
import { isValidEmail } from '../utils/validation'

export default function ForgotPassword() {
  const { notify } = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    setError(undefined)
    setSubmitting(true)
    try {
      await sendPasswordReset(email)
      setSent(true)
    } catch (err) {
      notify('error', friendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we will send you a reset link.">
      {sent ? (
        <div className="card flex items-start gap-3">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            If an account exists for {email.trim()}, a reset link is on its way. Check your inbox.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Email" type="email" autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} error={error} />
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Send reset link
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  )
}
