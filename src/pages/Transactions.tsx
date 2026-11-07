import { useEffect, useRef, useState } from 'react'
import {
  ArrowDownLeft, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Loader2, Plus, Receipt,
} from 'lucide-react'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Modal from '../components/common/Modal'
import { useToast } from '../components/common/Toast'
import TransactionDetails from '../components/transactions/TransactionDetails'
import TransactionFilters from '../components/transactions/TransactionFilters'
import TransactionForm from '../components/transactions/TransactionForm'
import { useAuth } from '../contexts/AuthContext'
import { useDebounce } from '../hooks/useDebounce'
import {
  createTransaction, deleteTransaction, listTransactions, updateTransaction,
  type SortKey, type TransactionFilters as Filters, type TransactionInput,
} from '../services/transactionService'
import type { Transaction } from '../types'
import { friendlyError } from '../utils/errors'
import { DEFAULT_CURRENCY, formatCurrency, formatDate } from '../utils/format'

const PAGE_SIZE = 10
const EMPTY_FILTERS: Filters = { search: '', type: 'all', category: '', paymentMethod: '', from: '', to: '' }

function SortHeader(props: { label: string; active: boolean; asc: boolean; right?: boolean; onClick: () => void }) {
  const Icon = props.asc ? ChevronUp : ChevronDown
  return (
    <th className={`px-4 py-3 font-medium ${props.right ? 'text-right' : ''}`} aria-sort={props.active ? (props.asc ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={props.onClick} className={`inline-flex items-center gap-1 hover:text-navy-900 dark:hover:text-white ${props.right ? 'flex-row-reverse' : ''}`}>
        {props.label}
        {props.active && <Icon className="h-4 w-4" />}
      </button>
    </th>
  )
}

export default function Transactions() {
  const { user, profile } = useAuth()
  const { notify } = useToast()
  const currency = profile?.currency ?? DEFAULT_CURRENCY
  const dateFormat = profile?.date_format ?? 'DD/MM/YYYY'

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const debouncedSearch = useDebounce(filters.search, 300)
  const [sortKey, setSortKey] = useState<SortKey>('transaction_date')
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)

  const [rows, setRows] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [viewing, setViewing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const [busy, setBusy] = useState(false)
  const latestRequest = useRef(0)

  useEffect(() => {
    const id = ++latestRequest.current
    setLoading(true)
    listTransactions({ ...filters, search: debouncedSearch, sortKey, sortAsc, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (id !== latestRequest.current) return // a newer request replaced this one
        setRows(res.rows)
        setTotal(res.total)
        setLoadError(null)
      })
      .catch((err) => {
        if (id === latestRequest.current) setLoadError(friendlyError(err))
      })
      .finally(() => {
        if (id === latestRequest.current) setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.category, filters.paymentMethod, filters.from, filters.to, debouncedSearch, sortKey, sortAsc, page, reloadKey])

  const hasFilters = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS)
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function changeFilters(patch: Partial<Filters>) {
    setFilters((f) => ({ ...f, ...patch }))
    setPage(1)
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((a) => !a)
    else {
      setSortKey(key)
      setSortAsc(key === 'title')
    }
    setPage(1)
  }

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(t: Transaction) {
    setViewing(null)
    setEditing(t)
    setFormOpen(true)
  }

  function closeForm() {
    if (!busy) setFormOpen(false)
  }

  async function handleSave(input: TransactionInput) {
    if (!user || busy) return
    setBusy(true)
    try {
      if (editing) await updateTransaction(editing.id, input)
      else await createTransaction(user.id, input)
      notify('success', editing ? 'Transaction updated.' : 'Transaction added.')
      setFormOpen(false)
      setReloadKey((k) => k + 1)
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
      await deleteTransaction(deleting.id)
      notify('success', 'Transaction deleted.')
      if (rows.length === 1 && page > 1) setPage((p) => p - 1)
      setDeleting(null)
      setReloadKey((k) => k + 1)
    } catch (err) {
      notify('error', friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const last = Math.min(page * PAGE_SIZE, total)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Everything you earn and spend, in one list.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add transaction
        </button>
      </div>

      <TransactionFilters filters={filters} active={hasFilters} onChange={changeFilters}
        onClear={() => { setFilters(EMPTY_FILTERS); setPage(1) }} />

      {loadError ? (
        <div className="card text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
          <button type="button" className="btn-primary mt-4" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
        </div>
      ) : loading && rows.length === 0 ? (
        <div className="card flex items-center justify-center gap-2 py-12 text-sm text-slate-500" role="status">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading transactions
        </div>
      ) : rows.length === 0 ? (
        <div className="card flex flex-col items-center py-12 text-center">
          <Receipt className="h-10 w-10 text-slate-300 dark:text-navy-600" />
          <p className="mt-3 font-medium">{hasFilters ? 'No transactions match these filters' : 'No transactions yet'}</p>
          <p className="mt-1 text-sm text-slate-500">
            {hasFilters ? 'Try a different search or clear the filters.' : 'Add your first income or expense to get started.'}
          </p>
          {!hasFilters && (
            <button type="button" className="btn-primary mt-4" onClick={openAdd}><Plus className="h-4 w-4" /> Add transaction</button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-60' : ''}`}>
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-navy-800">
                <tr>
                  <SortHeader label="Title" active={sortKey === 'title'} asc={sortAsc} onClick={() => toggleSort('title')} />
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
                  <SortHeader label="Date" active={sortKey === 'transaction_date'} asc={sortAsc} onClick={() => toggleSort('transaction_date')} />
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Payment</th>
                  <SortHeader label="Amount" right active={sortKey === 'amount'} asc={sortAsc} onClick={() => toggleSort('amount')} />
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => {
                  const income = t.type === 'income'
                  return (
                    <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-navy-800 dark:hover:bg-navy-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${income ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'}`}>
                            {income ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                            <span className="sr-only">{income ? 'Income' : 'Expense'}</span>
                          </span>
                          <button type="button" className="text-left font-medium hover:underline" onClick={() => setViewing(t)}>{t.title}</button>
                          {t.is_demo && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 dark:bg-navy-800">Demo</span>}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 md:table-cell">{t.category}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(t.transaction_date, dateFormat)}</td>
                      <td className="hidden px-4 py-3 text-slate-600 dark:text-slate-300 lg:table-cell">{t.payment_method}</td>
                      <td className={`whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums ${income ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {income ? '+' : '-'}{formatCurrency(t.amount, currency)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-sm dark:border-navy-800">
            <span className="text-slate-500">Showing {first}-{last} of {total}</span>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-ghost p-2" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>Page {page} of {pageCount}</span>
              <button type="button" className="btn-ghost p-2" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal open={formOpen} title={editing ? 'Edit transaction' : 'Add transaction'} onClose={closeForm}>
        {formOpen && <TransactionForm initial={editing} submitting={busy} onSubmit={handleSave} onCancel={closeForm} />}
      </Modal>

      <Modal open={viewing !== null} title="Transaction details" onClose={() => setViewing(null)}>
        {viewing && (
          <TransactionDetails transaction={viewing} currency={currency} dateFormat={dateFormat}
            onEdit={() => openEdit(viewing)} onDelete={() => { setDeleting(viewing); setViewing(null) }} />
        )}
      </Modal>

      <ConfirmDialog open={deleting !== null} title="Delete this transaction?" busy={busy}
        message={deleting ? `"${deleting.title}" will be removed permanently. This cannot be undone.` : ''}
        confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => !busy && setDeleting(null)} />
    </div>
  )
}
