import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLoader } from '../hooks/useLoader'
import { fetchTransactionsInRange } from '../services/transactionService'
import type { Transaction } from '../types'
import { totals } from '../utils/analytics'
import { MONTH_NAMES, daysInMonth, monthLabel, monthRange, pad2, shiftMonth } from '../utils/dates'
import { DEFAULT_CURRENCY, formatCompact, formatCurrency, formatDate, todayISO } from '../utils/format'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Calendar() {
  const { profile } = useAuth()
  const currency = profile?.currency ?? DEFAULT_CURRENCY
  const dateFormat = profile?.date_format ?? 'DD/MM/YYYY'
  const today = todayISO()
  const now = new Date()
  const [period, setPeriod] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 })
  const [selected, setSelected] = useState(today)
  const { year, month } = period

  const { data, loading, error, reload } = useLoader(() => {
    const { from, to } = monthRange(year, month)
    return fetchTransactionsInRange(from, to)
  }, [year, month])

  const rows = data ?? []
  const byDay = new Map<string, Transaction[]>()
  for (const t of rows) byDay.set(t.transaction_date, [...(byDay.get(t.transaction_date) ?? []), t])

  const lead = (new Date(year, month - 1, 1).getDay() + 6) % 7 // Monday first
  const dayCount = daysInMonth(year, month)
  const cells = Array.from({ length: Math.ceil((lead + dayCount) / 7) * 7 }, (_, i) => (i >= lead && i < lead + dayCount ? i - lead + 1 : null))
  const money = (n: number) => formatCurrency(n, currency)
  const monthTotals = totals(rows)
  const selectedRows = byDay.get(selected) ?? []
  const selectedTotals = totals(selectedRows)

  function move(n: number) {
    const next = shiftMonth(year, month, n)
    setPeriod(next)
    setSelected(`${next.year}-${pad2(next.month)}-01`)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">See what came in and went out, day by day.</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" className="btn-ghost p-2" aria-label="Previous month" onClick={() => move(-1)}><ChevronLeft className="h-5 w-5" /></button>
          <h2 className="min-w-[10rem] text-center font-medium">{monthLabel(year, month)}</h2>
          <button type="button" className="btn-ghost p-2" aria-label="Next month" onClick={() => move(1)}><ChevronRight className="h-5 w-5" /></button>
          <button type="button" className="btn-ghost border border-slate-300 py-1 dark:border-navy-700" onClick={() => { setPeriod({ year: now.getFullYear(), month: now.getMonth() + 1 }); setSelected(today) }}>Today</button>
        </div>
        <p className="text-sm">
          <span className="text-emerald-600 dark:text-emerald-400">Income {money(monthTotals.income)}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span className="text-red-600 dark:text-red-400">Expenses {money(monthTotals.expense)}</span>
        </p>
      </div>

      {error ? (
        <div className="card mt-4 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button type="button" className="btn-primary mt-4" onClick={reload}>Try again</button>
        </div>
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className={`card p-3 ${loading ? 'opacity-60' : ''}`}>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
              {WEEKDAYS.map((d) => <div key={d} className="py-1">{d}</div>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (day === null) return <div key={i} />
                const iso = `${year}-${pad2(month)}-${pad2(day)}`
                const dayTotals = totals(byDay.get(iso) ?? [])
                const isSelected = iso === selected
                return (
                  <button key={iso} type="button" onClick={() => setSelected(iso)} aria-pressed={isSelected}
                    aria-label={`${day} ${MONTH_NAMES[month - 1]}: income ${money(dayTotals.income)}, expenses ${money(dayTotals.expense)}`}
                    className={`flex min-h-[3.75rem] flex-col items-center rounded-lg border p-1 text-xs transition-colors sm:min-h-[4.5rem] sm:items-start sm:p-1.5 ${
                      isSelected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-transparent hover:bg-slate-100 dark:hover:bg-navy-800'}`}>
                    <span className={`font-medium ${iso === today ? 'flex h-5 w-5 items-center justify-center rounded-full bg-navy-800 text-white dark:bg-emerald-600' : ''}`}>{day}</span>
                    <span className="mt-1 flex gap-1 sm:hidden">
                      {dayTotals.income > 0 && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                      {dayTotals.expense > 0 && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                    </span>
                    <span className="mt-1 hidden w-full space-y-0.5 text-left sm:block">
                      {dayTotals.income > 0 && <span className="block truncate text-emerald-600 dark:text-emerald-400">+{formatCompact(dayTotals.income)}</span>}
                      {dayTotals.expense > 0 && <span className="block truncate text-red-600 dark:text-red-400">-{formatCompact(dayTotals.expense)}</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <section className="card self-start">
            <h2 className="font-semibold">{formatDate(selected, dateFormat)}</h2>
            <p className="mt-1 text-sm">
              <span className="text-emerald-600 dark:text-emerald-400">Income {money(selectedTotals.income)}</span>
              <span className="mx-2 text-slate-300">|</span>
              <span className="text-red-600 dark:text-red-400">Expenses {money(selectedTotals.expense)}</span>
            </p>
            {loading && !data ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-500" role="status"><Loader2 className="h-4 w-4 animate-spin" /> Loading</p>
            ) : selectedRows.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No transactions on this day.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100 dark:divide-navy-800">
                {selectedRows.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.title}</p>
                      <p className="truncate text-xs text-slate-500">{t.category} · {t.payment_method}</p>
                    </div>
                    <span className={`whitespace-nowrap font-medium tabular-nums ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{money(t.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
