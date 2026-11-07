import { useState } from 'react'
import ConfirmDialog from '../common/ConfirmDialog'
import { useToast } from '../common/Toast'
import { useAuth } from '../../contexts/AuthContext'
import { addDemoData, removeDemoData } from '../../services/demoService'
import { friendlyError } from '../../utils/errors'

export default function DemoDataSection() {
  const { user } = useAuth()
  const { notify } = useToast()
  const [action, setAction] = useState<'add' | 'remove' | null>(null)
  const [busy, setBusy] = useState(false)

  async function confirm() {
    if (!user || busy || !action) return
    setBusy(true)
    try {
      if (action === 'add') await addDemoData(user.id)
      else await removeDemoData()
      notify('success', action === 'add' ? 'Demo data added.' : 'Demo data removed.')
      setAction(null)
    } catch (err) {
      notify('error', friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card">
      <h2 className="font-semibold">Demo data</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Fill your account with sample PKR transactions, budgets and a savings goal to explore the app. Every demo record is
        marked, and you can remove all of them in one click. Your own records are never touched.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-primary" onClick={() => setAction('add')}>Add demo data</button>
        <button type="button" className="btn-ghost border border-slate-300 dark:border-navy-700" onClick={() => setAction('remove')}>Remove demo data</button>
      </div>
      <ConfirmDialog open={action !== null} busy={busy} onCancel={() => !busy && setAction(null)} onConfirm={confirm}
        title={action === 'add' ? 'Add demo data?' : 'Remove demo data?'}
        message={action === 'add'
          ? 'About 40 sample transactions, 5 budgets and 1 savings goal will be added to your account. They are marked as demo.'
          : 'All records marked as demo will be deleted. Your own records stay.'}
        confirmLabel={action === 'add' ? 'Add demo data' : 'Remove demo data'} />
    </section>
  )
}
