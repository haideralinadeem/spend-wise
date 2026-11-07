import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import AuthShell from '../components/common/AuthShell'
import FormField from '../components/common/FormField'
import { useToast } from '../components/common/Toast'
import { signUp } from '../services/authService'
import { friendlyError } from '../utils/errors'
import { isValidEmail, validatePassword } from '../utils/validation'

type Form = { fullName: string; email: string; password: string; confirm: string }

export default function Register() {
  const { notify } = useToast()
  const [form, setForm] = useState<Form>({ fullName: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Partial<Form>>({})
  const [submitting, setSubmitting] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  const update = (key: keyof Form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    const next: Partial<Form> = {}
    if (form.fullName.trim().length < 2) next.fullName = 'Enter your full name.'
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.'
    const passwordError = validatePassword(form.password)
    if (passwordError) next.password = passwordError
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      const data = await signUp(form.fullName, form.email, form.password)
      if (data.session) {
        // Signed in straight away: the route guard opens the dashboard.
        notify('success', `Welcome to SpendWise, ${form.fullName.trim().split(' ')[0]}!`)
      } else {
        setAwaitingConfirmation(true) // Email confirmation is switched on in Supabase.
      }
    } catch (err) {
      notify('error', friendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (awaitingConfirmation) {
    return (
      <AuthShell title="Check your email" subtitle={`We sent a confirmation link to ${form.email.trim()}.`}>
        <div className="card flex items-start gap-3">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Open the link in that email to activate your account, then sign in.
          </p>
        </div>
        <Link to="/login" className="btn-primary mt-6 w-full">Go to sign in</Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your account" subtitle="It takes less than a minute.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Full name" autoComplete="name" value={form.fullName}
          onChange={update('fullName')} error={errors.fullName} />
        <FormField label="Email" type="email" autoComplete="email" value={form.email}
          onChange={update('email')} error={errors.email} />
        <FormField label="Password" type="password" autoComplete="new-password" value={form.password}
          onChange={update('password')} error={errors.password}
          hint="At least 8 characters, with a letter and a number." />
        <FormField label="Confirm password" type="password" autoComplete="new-password" value={form.confirm}
          onChange={update('confirm')} error={errors.confirm} />
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
