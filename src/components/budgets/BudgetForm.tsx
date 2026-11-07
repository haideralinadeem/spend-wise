import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import FormField from '../common/FormField'
import type { Budget } from '../../types'
import { OVERALL } from '../../utils/budget'
import { EXPENSE_CATEGORIES } from '../../utils/constants'

interface Props {
  initial: Budget | null
  takenCategories: string[]
  defaultOverall: number | null
  submitting: boolean
  onSubmit: (category: string, amount: number) => void
  onCancel: () => void
}

export default function BudgetForm({ initial, takenCategories, defaultOverall, submitting, onSubmit, onCancel }: Props) {
  const available = [OVERALL, ...EXPENSE_CATEGORIES].filter((c) => !takenCategories.includes(c))
  const [category, setCategory] = useState(initial?.category ?? available[0] ?? '')
  const [amount, setAmount] = useState(
    initial ? String(initial.amount) : category === OVERALL && defaultOverall ? String(defaultOverall) : '',
  )
  const [errors, setErrors] = useState<{ category?: string; amount?: string }>({})

  function changeCategory(next: string) {
    setCategory(next)
    if (!amount && next === OVERALL && defaultOverall) setAmount(String(defaultOverall))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    const value = Number(amount)
    const next: typeof errors = {}
    if (!category) next.category = 'Choose a category.'
    if (amount.trim() === '' || !Number.isFinite(value) || value <= 0) next.amount = 'Enter an amount greater than zero.'
    else if (value >= 1e12) next.amount = 'This amount is too large.'
    setErrors(next)
    if (Object.keys(next).length === 0) onSubmit(category, Math.round(value * 100) / 100)
  }

  if (!initial && available.length === 0) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Every category already has a budget this month.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="b-category" className="label">Category</label>
        {initial ? (
          <p id="b-category" className="text-sm font-medium">{initial.category === OVERALL ? 'Total monthly budget' : initial.category}</p>
        ) : (
          <>
            <select id="b-category" className="input" value={category} onChange={(e) => changeCategory(e.target.value)}>
              {available.map((c) => <option key={c} value={c}>{c === OVERALL ? 'Total monthly budget' : c}</option>)}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </>
        )}
      </div>
      <FormField label="Budget amount (Rs.)" type="number" inputMode="decimal" step="0.01" min="0" value={amount}
        onChange={(e) => setAmount(e.target.value)} error={errors.amount} placeholder="0.00" />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? 'Save budget' : 'Create budget'}
        </button>
      </div>
    </form>
  )
}
