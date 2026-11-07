import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Trash2, Wallet } from 'lucide-react'
import BudgetForm from '../components/budgets/BudgetForm'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Modal from '../components/common/Modal'
import ProgressBar from '../components/common/ProgressBar'
import { useToast } from '../components/common/Toast'
import { useAuth } from '../contexts/AuthContext'
import { useLoader } from '../hooks/useLoader'
import { createBudget, deleteBudget, listBudgets, updateBudget } from '../services/budgetService'
import { fetchTransactionsInRange } from '../services/transactionService'
import type { Budget } from '../types'
import { OVERALL, budgetStatus, displayPct, pctUsed, spentFor } from '../utils/budget'
import { monthLabel, monthRange, shiftMonth } from '../utils/dates'
import { friendlyError } from '../utils/errors'
import { DEFAULT_CURRENCY, formatCurrency } from '../utils/format'

export default function Budgets() {
  const { user, profile } = useAuth()
  const { notify } = useToast()
  const currency = profile?.currency ?? DEFAULT_CURRENCY
  const now = new Date()
  const [period, setPeriod] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 })
  const { year, month } = period

  const { data, loading, error, reload } = useLoader(() => {
    const { from, to } = monthRange(year, month)
    return Promise.all([listBudgets(year, month), fetchTransactionsInRange(from, to)])
  }, [year, month])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Budget | null>(null)
  const [deleting, setDeleting] = useState<Budget | null>(null)
  const [busy, setBusy] = useState(false)

  const money = (n: number) => formatCurrency(n, currency)
  const budgets = [...(data?.[0] ?? [])].sort((a, b) =>
    a.category === OVERALL ? -1 : b.category === OVERALL ? 1 : a.category.localeCompare(b.category))
  const monthRows = data?.[1] ?? []

  async function handleSave(category: string, amount: number) {
    if (!user || busy) return
    setBusy(true)
    try {
      if (editing) await updateBudget(editing.id, amount)
      else await createBudget(user.id, category, amount, year, month)
      notify('success', editing ? 'Budget updated.' : 'Budget created.')
      setFormOpen(false)
      reload()
    } catch (err) {
      notify('error', friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!deleting || busy) return
    setBusy(true)
    try {
      await deleteBudget(deleting.id)
      notify('success', 'Budget deleted.')
      setDeleting(null)
      reload()
    } catch (err) {
      notify('error', friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Spending is counted automatically from your transactions.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true) }}>
          <Plus className="h-4 w-4" /> Add budget
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <button type="button" className="btn-ghost p-2" aria-label="Previous month" onClick={() => setPeriod((p) => shiftMonth(p.year, p.month, -1))}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="min-w-[10rem] text-center font-medium">{monthLabel(year, month)}</h2>
        <button type="button" className="btn-ghost p-2" aria-label="Next month" onClick={() => setPeriod((p) => shiftMonth(p.year, p.month, 1))}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {error ? (
        <div className="card text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button type="button" className="btn-primary mt-4" onClick={reload}>Try again</button>
        </div>
      ) : loading && !data ? (
        <div className="card flex justify-center py-12" role="status" aria-label="Loading"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
      ) : budgets.length === 0 ? (
        <div className="card flex flex-col items-center py-12 text-center">
          <Wallet className="h-10 w-10 text-slate-300 dark:text-navy-600" />
          <p className="mt-3 font-medium">No budgets for {monthLabel(year, month)}</p>
          <p className="mt-1 text-sm text-slate-500">Set a total monthly budget, then add limits for single categories.</p>
          <button type="button" className="btn-primary mt-4" onClick={() => { setEditing(null); setFormOpen(true) }}><Plus className="h-4 w-4" /> Add budget</button>
        </div>
      ) : (
        <ul className={`grid gap-4 md:grid-cols-2 ${loading ? 'opacity-60' : ''}`}>
          {budgets.map((b) => {
            const spent = spentFor(monthRows, b.category)
            const pct = pctUsed(spent, b.amount)
            const status = budgetStatus(pct)
            const remaining = b.amount - spent
            const name = b.category === OVERALL ? 'Total monthly budget' : b.category
            return (
              <li key={b.id} className="card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{name}</h3>
                    <p className={`text-xs font-medium ${status.text}`}>{status.label}</p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" className="btn-ghost p-1.5" aria-label={`Edit ${name}`} onClick={() => { setEditing(b); setFormOpen(true) }}><Pencil className="h-4 w-4" /></button>
                    <button type="button" className="btn-ghost p-1.5" aria-label={`Delete ${name}`} onClick={() => setDeleting(b)}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-4"><ProgressBar pct={pct} label={`${name} used`} barClass={status.bar} /></div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">{money(spent)} of {money(b.amount)}</span>
                  <span className={`font-medium ${status.text}`}>{displayPct(pct)}%</span>
                </div>
                <p className="mt-1 text-sm">{remaining >= 0 ? `${money(remaining)} remaining` : `${money(-remaining)} over budget`}</p>
              </li>
            )
          })}
        </ul>
      )}

      <Modal open={formOpen} title={editing ? 'Edit budget' : 'Add budget'} onClose={() => !busy && setFormOpen(false)}>
        {formOpen && (
          <BudgetForm initial={editing} takenCategories={budgets.map((b) => b.category)}
            defaultOverall={profile?.default_monthly_budget ?? null} submitting={busy}
            onSubmit={handleSave} onCancel={() => setFormOpen(false)} />
        )}
      </Modal>
      <ConfirmDialog open={deleting !== null} busy={busy} title="Delete this budget?" confirmLabel="Delete"
        message="Your transactions are not affected. Only the budget limit is removed."
        onConfirm={handleDelete} onCancel={() => !busy && setDeleting(null)} />
    </div>
  )
}
