import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AuthShell from '../components/common/AuthShell'
import FormField from '../components/common/FormField'
import { useToast } from '../components/common/Toast'
import { signIn } from '../services/authService'
import { friendlyError } from '../utils/errors'
import { isValidEmail } from '../utils/validation'

export default function Login() {
  const { notify } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    const next: typeof errors = {}
    if (!isValidEmail(email)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Enter your password.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      await signIn(email, password) // The route guard moves you to the dashboard.
    } catch (err) {
      notify('error', friendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Welcome back. Enter your details to open your dashboard.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Email" type="email" autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <FormField label="Password" type="password" autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <div className="text-right text-sm">
          <Link to="/forgot-password" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Forgot password?
          </Link>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        New to SpendWise?{' '}
        <Link to="/register" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
