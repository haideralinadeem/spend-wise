import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import FormField from '../common/FormField'
import type { Transaction, TransactionType } from '../../types'
import type { TransactionInput } from '../../services/transactionService'
import { PAYMENT_METHODS, categoriesFor } from '../../utils/constants'
import { todayISO } from '../../utils/format'
import { isValidDate } from '../../utils/validation'

interface Props {
  initial: Transaction | null
  submitting: boolean
  onSubmit: (input: TransactionInput) => void
  onCancel: () => void
}

export default function TransactionForm({ initial, submitting, onSubmit, onCancel }: Props) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [date, setDate] = useState(initial?.transaction_date ?? todayISO())
  const [method, setMethod] = useState(initial?.payment_method ?? PAYMENT_METHODS[0])
  const [description, setDescription] = useState(initial?.description ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function changeType(next: TransactionType) {
    setType(next)
    if (!categoriesFor(next).includes(category)) setCategory('')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    const next: Record<string, string> = {}
    const value = Number(amount)
    if (!title.trim()) next.title = 'Enter a title.'
    if (amount.trim() === '' || !Number.isFinite(value) || value <= 0) {
      next.amount = 'Enter an amount greater than zero.'
    } else if (value >= 1e12) {
      next.amount = 'This amount is too large.'
    }
    if (!category) next.category = 'Choose a category.'
    if (!isValidDate(date)) next.date = 'Enter a valid date.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    onSubmit({
      title: title.trim(),
      amount: Math.round(value * 100) / 100,
      type,
      category,
      payment_method: method,
      transaction_date: date,
      description: description.trim() || null,
      notes: notes.trim() || null,
    })
  }

  const typeButton = (value: TransactionType, label: string, active: string) => (
    <button
      type="button"
      aria-pressed={type === value}
      onClick={() => changeType(value)}
      className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        type === value ? active : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-navy-700'
      }`}
    >
      {label}
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-navy-800">
        {typeButton('expense', 'Expense', 'bg-red-600 text-white')}
        {typeButton('income', 'Income', 'bg-emerald-600 text-white')}
      </div>

      <FormField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title}
        placeholder="For example, Lunch at work" maxLength={120} />
      <FormField label="Amount (Rs.)" type="number" inputMode="decimal" step="0.01" min="0" value={amount}
        onChange={(e) => setAmount(e.target.value)} error={errors.amount} placeholder="0.00" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tx-category" className="label">Category</label>
          <select id="tx-category" className="input" value={category} onChange={(e) => setCategory(e.target.value)}
            aria-invalid={Boolean(errors.category)}>
            <option value="">Choose a category</option>
            {categoriesFor(type).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
        </div>
        <FormField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
      </div>

      <div>
        <label htmlFor="tx-method" className="label">Payment method</label>
        <select id="tx-method" className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
          {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="tx-description" className="label">Description (optional)</label>
        <textarea id="tx-description" rows={2} maxLength={500} className="input" value={description}
          onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label htmlFor="tx-notes" className="label">Notes (optional)</label>
        <textarea id="tx-notes" rows={2} maxLength={1000} className="input" value={notes}
          onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? 'Save changes' : 'Add transaction'}
        </button>
      </div>
    </form>
  )
}
