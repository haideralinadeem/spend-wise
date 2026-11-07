import { Search, X } from 'lucide-react'
import type { TransactionFilters as Filters } from '../../services/transactionService'
import { ALL_CATEGORIES, PAYMENT_METHODS } from '../../utils/constants'

interface Props {
  filters: Filters
  active: boolean
  onChange: (patch: Partial<Filters>) => void
  onClear: () => void
}

export default function TransactionFilters({ filters, active, onChange, onClear }: Props) {
  return (
    <div className="card mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <div className="sm:col-span-2">
        <label htmlFor="f-search" className="label">Search</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input id="f-search" className="input pl-9" placeholder="Title, description or notes" value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })} />
        </div>
      </div>
      <div>
        <label htmlFor="f-type" className="label">Type</label>
        <select id="f-type" className="input" value={filters.type}
          onChange={(e) => onChange({ type: e.target.value as Filters['type'] })}>
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expenses</option>
        </select>
      </div>
      <div>
        <label htmlFor="f-category" className="label">Category</label>
        <select id="f-category" className="input" value={filters.category} onChange={(e) => onChange({ category: e.target.value })}>
          <option value="">All</option>
          {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="f-method" className="label">Payment method</label>
        <select id="f-method" className="input" value={filters.paymentMethod} onChange={(e) => onChange({ paymentMethod: e.target.value })}>
          <option value="">All</option>
          {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="f-from" className="label">From</label>
        <input id="f-from" type="date" className="input" value={filters.from} onChange={(e) => onChange({ from: e.target.value })} />
      </div>
      <div>
        <label htmlFor="f-to" className="label">To</label>
        <input id="f-to" type="date" className="input" value={filters.to} onChange={(e) => onChange({ to: e.target.value })} />
      </div>
      {active && (
        <div className="flex items-end">
          <button type="button" className="btn-ghost" onClick={onClear}>
            <X className="h-4 w-4" /> Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
