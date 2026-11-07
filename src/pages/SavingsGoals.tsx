import { useState } from 'react'
import { Loader2, Pencil, PiggyBank, Plus, Trash2 } from 'lucide-react'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Modal from '../components/common/Modal'
import ProgressBar from '../components/common/ProgressBar'
import { useToast } from '../components/common/Toast'
import { AddMoneyForm, GoalForm } from '../components/goals/GoalForm'
import { useAuth } from '../contexts/AuthContext'
import { useLoader } from '../hooks/useLoader'
import { createGoal, deleteGoal, listGoals, setGoalAmount, updateGoal, type GoalInput } from '../services/goalService'
import type { SavingsGoal } from '../types'
import { daysBetween } from '../utils/dates'
import { friendlyError } from '../utils/errors'
import { DEFAULT_CURRENCY, formatCurrency, formatDate, todayISO } from '../utils/format'

export default function SavingsGoals() {
  const { user, profile } = useAuth()
  const { notify } = useToast()
  const currency = profile?.currency ?? DEFAULT_CURRENCY
  const dateFormat = profile?.date_format ?? 'DD/MM/YYYY'
  const { data: goals, loading, error, reload } = useLoader(listGoals, [])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SavingsGoal | null>(null)
  const [adding, setAdding] = useState<SavingsGoal | null>(null)
  const [deleting, setDeleting] = useState<SavingsGoal | null>(null)
  const [busy, setBusy] = useState(false)

  async function run(task: () => Promise<void>, message: string, close: () => void) {
    if (busy) return
    setBusy(true)
    try {
      await task()
      notify('success', message)
      close()
      reload()
    } catch (err) {
      notify('error', friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  const handleSave = (input: GoalInput) => {
    if (!user) return
    return run(
      () => (editing ? updateGoal(editing.id, input) : createGoal(user.id, input)),
      editing ? 'Goal updated.' : 'Goal created.',
      () => setFormOpen(false),
    )
  }
  const handleAdd = (amount: number) => {
    if (!adding) return
    const next = Math.round((adding.current_amount + amount) * 100) / 100
    return run(() => setGoalAmount(adding.id, next), 'Money added to your goal.', () => setAdding(null))
  }
  const handleDelete = () => {
    if (!deleting) return
    return run(() => deleteGoal(deleting.id), 'Goal deleted.', () => setDeleting(null))
  }

  const openCreate = () => { setEditing(null); setFormOpen(true) }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Savings goals</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Set a target and track every rupee you put towards it.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}><Plus className="h-4 w-4" /> New goal</button>
      </div>

      {error ? (
        <div className="card text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button type="button" className="btn-primary mt-4" onClick={reload}>Try again</button>
        </div>
      ) : loading && !goals ? (
        <div className="card flex justify-center py-12" role="status" aria-label="Loading"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
      ) : !goals || goals.length === 0 ? (
        <div className="card flex flex-col items-center py-12 text-center">
          <PiggyBank className="h-10 w-10 text-slate-300 dark:text-navy-600" />
          <p className="mt-3 font-medium">No savings goals yet</p>
          <p className="mt-1 text-sm text-slate-500">Start with something like an emergency fund or a new laptop.</p>
          <button type="button" className="btn-primary mt-4" onClick={openCreate}><Plus className="h-4 w-4" /> New goal</button>
        </div>
      ) : (
        <ul className={`grid gap-4 md:grid-cols-2 ${loading ? 'opacity-60' : ''}`}>
          {goals.map((g) => {
            const pct = (g.current_amount / g.target_amount) * 100
            const reached = pct >= 100
            const daysLeft = g.target_date ? daysBetween(todayISO(), g.target_date) - 1 : null
            return (
              <li key={g.id} className="card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium">{g.title}</h3>
                    {g.description && <p className="mt-0.5 text-sm text-slate-500">{g.description}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" className="btn-ghost p-1.5" aria-label={`Edit ${g.title}`} onClick={() => { setEditing(g); setFormOpen(true) }}><Pencil className="h-4 w-4" /></button>
                    <button type="button" className="btn-ghost p-1.5" aria-label={`Delete ${g.title}`} onClick={() => setDeleting(g)}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-4"><ProgressBar pct={pct} label={`${g.title} progress`} barClass={reached ? 'bg-emerald-500' : 'bg-blue-500'} /></div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">{formatCurrency(g.current_amount, currency)} of {formatCurrency(g.target_amount, currency)}</span>
                  <span className="font-medium">{Math.floor(pct)}%</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">
                    {reached ? 'Goal reached' : g.target_date
                      ? `Target ${formatDate(g.target_date, dateFormat)}${daysLeft !== null && daysLeft >= 0 ? ` · ${daysLeft} days left` : ' · date passed'}`
                      : 'No target date'}
                  </p>
                  <button type="button" className="btn-ghost border border-slate-300 py-1 dark:border-navy-700" onClick={() => setAdding(g)}>Add money</button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Modal open={formOpen} title={editing ? 'Edit goal' : 'New savings goal'} onClose={() => !busy && setFormOpen(false)}>
        {formOpen && <GoalForm initial={editing} submitting={busy} onSubmit={handleSave} onCancel={() => setFormOpen(false)} />}
      </Modal>
      <Modal open={adding !== null} title={adding ? `Add money to ${adding.title}` : ''} onClose={() => !busy && setAdding(null)}>
        {adding && <AddMoneyForm submitting={busy} onSubmit={handleAdd} onCancel={() => setAdding(null)} />}
      </Modal>
      <ConfirmDialog open={deleting !== null} busy={busy} title="Delete this goal?" confirmLabel="Delete"
        message={deleting ? `"${deleting.title}" and its progress will be removed permanently.` : ''}
        onConfirm={handleDelete} onCancel={() => !busy && setDeleting(null)} />
    </div>
  )
}
