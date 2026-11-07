import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, Loader2, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import CategoryDonut from '../components/charts/CategoryDonut'
import TrendChart from '../components/charts/TrendChart'
import ProgressBar from '../components/common/ProgressBar'
import InsightList from '../components/dashboard/InsightList'
import SummaryCard from '../components/dashboard/SummaryCard'
import { useAuth } from '../contexts/AuthContext'
import { useLoader } from '../hooks/useLoader'
import { listBudgets } from '../services/budgetService'
import { listGoals } from '../services/goalService'
import { fetchAllTransactions } from '../services/transactionService'
import { buildSeries, expenseBy, inRange, rangeFor, totals, type RangeKey } from '../utils/analytics'
import { OVERALL, budgetStatus, displayPct, pctUsed, spentFor } from '../utils/budget'
import { monthLabel, monthRange } from '../utils/dates'
import { DEFAULT_CURRENCY, formatCurrency, formatDate } from '../utils/format'
import { buildInsights } from '../utils/insights'

const RANGES: [RangeKey, string][] = [['7d', '7 days'], ['30d', '30 days'], ['3m', '3 months'], ['6m', '6 months'], ['12m', '12 months']]

export default function Dashboard() {
  const { profile, user } = useAuth()
  const currency = profile?.currency ?? DEFAULT_CURRENCY
  const dateFormat = profile?.date_format ?? 'DD/MM/YYYY'
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const [range, setRange] = useState<RangeKey>('6m')

  const { data, loading, error, reload } = useLoader(
    () => Promise.all([fetchAllTransactions(), listGoals(), listBudgets(year, month)]),
    [year, month],
  )

  if (loading && !data) {
    return <div className="flex justify-center py-20" role="status" aria-label="Loading"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
  }
  if (error || !data) {
    return (
      <div className="card text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{error ?? 'Could not load your data.'}</p>
        <button type="button" className="btn-primary mt-4" onClick={reload}>Try again</button>
      </div>
    )
  }

  const [transactions, goals, budgets] = data
  const money = (n: number) => formatCurrency(n, currency)
  const firstName = (profile?.full_name || user?.email || '').split(' ')[0]

  const all = totals(transactions)
  const saved = goals.reduce((sum, g) => sum + g.current_amount, 0)
  const cur = monthRange(year, month)
  const monthRows = inRange(transactions, cur.from, cur.to)
  const monthTotals = totals(monthRows)
  const r = rangeFor(range, today)
  const series = buildSeries(inRange(transactions, r.from, r.to), r.from, r.to, r.granularity)
  const categories = expenseBy(monthRows, 'category')
  const overall = budgets.find((b) => b.category === OVERALL)
  const overallSpent = overall ? spentFor(monthRows, OVERALL) : 0
  const overallPct = overall ? pctUsed(overallSpent, overall.amount) : 0
  const status = budgetStatus(overallPct)
  const insights = buildInsights({ transactions, budgets, year, month, today, currency })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome, {firstName}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Here is where your money stands today.</p>
      </div>

      {transactions.length === 0 && (
        <div className="card border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="text-sm">
            You have no transactions yet. <Link to="/transactions" className="font-medium underline">Add your first one</Link>, or
            load sample data from <Link to="/settings" className="font-medium underline">Settings</Link> to explore.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total balance" value={money(all.net)} sub="All income minus all expenses" icon={Wallet} tone="navy" />
        <SummaryCard label="Total income" value={money(all.income)} sub={`This month: ${money(monthTotals.income)}`} icon={TrendingUp} tone="green" />
        <SummaryCard label="Total expenses" value={money(all.expense)} sub={`This month: ${money(monthTotals.expense)}`} icon={TrendingDown} tone="red" />
        <SummaryCard label="Total savings" value={money(saved)} sub={`Across ${goals.length} savings ${goals.length === 1 ? 'goal' : 'goals'}`} icon={PiggyBank} tone="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Income vs expenses</h2>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-navy-800" role="group" aria-label="Time range">
              {RANGES.map(([key, label]) => (
                <button key={key} type="button" aria-pressed={range === key} onClick={() => setRange(key)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${range === key ? 'bg-white shadow-sm dark:bg-navy-700' : 'text-slate-600 dark:text-slate-300'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4"><TrendChart data={series} kind="bar" currency={currency} /></div>
        </section>
        <section className="card">
          <h2 className="font-semibold">Spending by category</h2>
          <p className="mb-3 text-xs text-slate-500">{monthLabel(year, month)}</p>
          <CategoryDonut data={categories} currency={currency} />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent transactions</h2>
            <Link to="/transactions" className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">View all</Link>
          </div>
          {transactions.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Nothing here yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100 dark:divide-navy-800">
              {transactions.slice(0, 8).map((t) => {
                const income = t.type === 'income'
                return (
                  <li key={t.id} className="flex items-center gap-3 py-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${income ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'}`}>
                      {income ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      <span className="sr-only">{income ? 'Income' : 'Expense'}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="truncate text-xs text-slate-500">{t.category} · {formatDate(t.transaction_date, dateFormat)} · {t.payment_method}</p>
                    </div>
                    <p className={`whitespace-nowrap text-sm font-medium tabular-nums ${income ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {income ? '+' : '-'}{money(t.amount)}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="card">
            <h2 className="font-semibold">Budget overview</h2>
            {overall ? (
              <div className="mt-3">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-slate-500">{money(overallSpent)} of {money(overall.amount)}</span>
                  <span className={`font-medium ${status.text}`}>{displayPct(overallPct)}%</span>
                </div>
                <div className="mt-2"><ProgressBar pct={overallPct} label="Monthly budget used" barClass={status.bar} /></div>
                <p className={`mt-2 text-xs font-medium ${status.text}`}>{status.label}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No monthly budget set for {monthLabel(year, month)}. <Link to="/budgets" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">Create one</Link>.
              </p>
            )}
          </section>
          <section className="card">
            <h2 className="font-semibold">Financial insights</h2>
            <p className="mb-3 text-xs text-slate-500">Calculated from your transactions with simple rules.</p>
            <InsightList insights={insights} />
          </section>
        </div>
      </div>
    </div>
  )
}
