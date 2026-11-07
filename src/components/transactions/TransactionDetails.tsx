import { Pencil, Trash2 } from 'lucide-react'
import type { Transaction } from '../../types'
import { formatCurrency, formatDate } from '../../utils/format'

interface Props {
  transaction: Transaction
  currency: string
  dateFormat: string
  onEdit: () => void
  onDelete: () => void
}

export default function TransactionDetails({ transaction: t, currency, dateFormat, onEdit, onDelete }: Props) {
  const income = t.type === 'income'
  const rows: [string, string][] = [
    ['Type', income ? 'Income' : 'Expense'],
    ['Category', t.category],
    ['Date', formatDate(t.transaction_date, dateFormat)],
    ['Payment method', t.payment_method],
    ['Description', t.description || 'None'],
    ['Notes', t.notes || 'None'],
  ]
  return (
    <div>
      <p className="text-sm text-slate-500">{t.title}</p>
      <p className={`mt-1 text-3xl font-semibold tabular-nums ${income ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
        {income ? '+' : '-'}{formatCurrency(t.amount, currency)}
      </p>
      <dl className="mt-6 space-y-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 dark:border-navy-800">
            <dt className="text-slate-500">{label}</dt>
            <dd className="max-w-[60%] break-words text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="btn-ghost text-red-600 dark:text-red-400" onClick={onDelete}>
          <Trash2 className="h-4 w-4" /> Delete
        </button>
        <button type="button" className="btn-primary" onClick={onEdit}>
          <Pencil className="h-4 w-4" /> Edit
        </button>
      </div>
    </div>
  )
}
