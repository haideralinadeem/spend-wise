import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import FormField from '../common/FormField'
import type { SavingsGoal } from '../../types'
import type { GoalInput } from '../../services/goalService'
import { isValidDate } from '../../utils/validation'

const validAmount = (text: string, allowZero: boolean) => {
  const n = Number(text)
  return text.trim() !== '' && Number.isFinite(n) && (allowZero ? n >= 0 : n > 0) && n < 1e12
}

interface Props {
  initial: SavingsGoal | null
  submitting: boolean
  onSubmit: (input: GoalInput) => void
  onCancel: () => void
}

export function GoalForm({ initial, submitting, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [target, setTarget] = useState(initial ? String(initial.target_amount) : '')
  const [current, setCurrent] = useState(initial ? String(initial.current_amount) : '0')
  const [date, setDate] = useState(initial?.target_date ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    const next: Record<string, string> = {}
    if (!title.trim()) next.title = 'Enter a goal name.'
    if (!validAmount(target, false)) next.target = 'Enter a target greater than zero.'
    if (!validAmount(current, true)) next.current = 'Enter zero or more.'
    if (date && !isValidDate(date)) next.date = 'Enter a valid date.'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    onSubmit({
      title: title.trim(),
      target_amount: Math.round(Number(target) * 100) / 100,
      current_amount: Math.round(Number(current) * 100) / 100,
      target_date: date || null,
      description: description.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormField label="Goal name" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title}
        placeholder="For example, Emergency fund" maxLength={100} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Target amount (Rs.)" type="number" inputMode="decimal" step="0.01" min="0" value={target}
          onChange={(e) => setTarget(e.target.value)} error={errors.target} />
        <FormField label="Saved so far (Rs.)" type="number" inputMode="decimal" step="0.01" min="0" value={current}
          onChange={(e) => setCurrent(e.target.value)} error={errors.current} />
      </div>
      <FormField label="Target date (optional)" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
      <div>
        <label htmlFor="g-description" className="label">Description (optional)</label>
        <textarea id="g-description" rows={2} maxLength={500} className="input" value={description}
          onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? 'Save goal' : 'Create goal'}
        </button>
      </div>
    </form>
  )
}

export function AddMoneyForm({ submitting, onSubmit, onCancel }: {
  submitting: boolean
  onSubmit: (amount: number) => void
  onCancel: () => void
}) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string>()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    if (!validAmount(amount, false)) {
      setError('Enter an amount greater than zero.')
      return
    }
    onSubmit(Math.round(Number(amount) * 100) / 100)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormField label="Amount to add (Rs.)" type="number" inputMode="decimal" step="0.01" min="0" value={amount}
        onChange={(e) => setAmount(e.target.value)} error={error} autoFocus />
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Add money
        </button>
      </div>
    </form>
  )
}
