import { useState } from 'react'
import { FileDown, FileText, Loader2 } from 'lucide-react'
import CategoryDonut from '../components/charts/CategoryDonut'
import HorizontalBars from '../components/charts/HorizontalBars'
import TrendChart from '../components/charts/TrendChart'
import FormField from '../components/common/FormField'
import { useToast } from '../components/common/Toast'
import { useAuth } from '../contexts/AuthContext'
import { useLoader } from '../hooks/useLoader'
import { fetchAllTransactions } from '../services/transactionService'
import { averageDaily, buildSeries, expenseBy, inRange, totals } from '../utils/analytics'
import { addDays, daysBetween, monthLabel, monthRange, shiftMonth, toISO } from '../utils/dates'
import { friendlyError } from '../utils/errors'
import { downloadFile, exportReportPdf, transactionsToCsv } from '../utils/export'
import { DEFAULT_CURRENCY, formatCurrency, todayISO } from '../utils/format'
import { isValidDate } from '../utils/validation'

type Preset = 'month' | '30d' | '3m' | '6m' | '12m' | 'custom'
const PRESETS: [Preset, string][] = [['month', 'This month'], ['30d', 'Last 30 days'], ['3m', 'Last 3 months'], ['6m', 'Last 6 months'], ['12m', 'Last 12 months'], ['custom', 'Custom range']]

function presetRange(preset: Exclude<Preset, 'custom'>, today: Date) {
  const to = toISO(today)
  if (preset === 'month') return monthRange(today.getFullYear(), today.getMonth() + 1)
  if (preset === '30d') return { from: toISO(addDays(today, -29)), to }
  const back = preset === '3m' ? 2 : preset === '6m' ? 5 : 11
  const start = shiftMonth(today.getFullYear(), today.getMonth() + 1, -back)
  return { from: monthRange(start.year, start.month).from, to }
}

export default function Analytics() {
  const { profile, user } = useAuth()
  const { notify } = useToast()
  const currency = profile?.currency ?? DEFAULT_CURRENCY
  const dateFormat = profile?.date_format ?? 'DD/MM/YYYY'
  const today = new Date()
  const { data: transactions, loading, error, reload } = useLoader(fetchAllTransactions, [])

  const [preset, setPreset] = useState<Preset>('6m')
  const [customFrom, setCustomFrom] = useState(toISO(addDays(today, -29)))
  const [customTo, setCustomTo] = useState(toISO(today))
  const [exporting, setExporting] = useState(false)

  if (error) {
    return (
      <div className="card text-center">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button type="button" className="btn-primary mt-4" onClick={reload}>Try again</button>
      </div>
    )
  }
  if (loading && !transactions) {
    return <div className="flex justify-center py-20" role="status" aria-label="Loading"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
  }

  const all = transactions ?? []
  const money = (n: number) => formatCurrency(n, currency)
  const { from, to } = preset === 'custom' ? { from: customFrom, to: customTo } : presetRange(preset, today)
  const rangeOk = isValidDate(from) && isValidDate(to) && from <= to
  const rows = rangeOk ? inRange(all, from, to) : []
  const t = totals(rows)
  const avg = rangeOk ? averageDaily(t.expense, from, to, todayISO()) : 0
  const rate = t.income > 0 ? `${Math.round((t.net / t.income) * 100)}%` : 'n/a'
  const series = rangeOk ? buildSeries(rows, from, to, daysBetween(from, to) <= 62 ? 'day' : 'month') : []
  const categories = expenseBy(rows, 'category')
  const methods = expenseBy(rows, 'payment_method')

  // Last six calendar months, whatever range is selected above.
  const months = Array.from({ length: 6 }, (_, i) => shiftMonth(today.getFullYear(), today.getMonth() + 1, i - 5)).map(({ year, month }) => {
    const r = monthRange(year, month)
    return { label: monthLabel(year, month), ...totals(inRange(all, r.from, r.to)) }
  })

  function exportCsv() {
    downloadFile(`spendwise-transactions-${from}-to-${to}.csv`, transactionsToCsv(rows, dateFormat), 'text/csv;charset=utf-8')
  }

  async function exportPdf() {
    if (exporting) return
    setExporting(true)
    try {
      await exportReportPdf({ userName: profile?.full_name || user?.email || 'SpendWise user', from, to, currency, dateFormat, rows })
    } catch (err) {
      notify('error', friendlyError(err))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Trends and breakdowns from your real transactions.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost border border-slate-300 dark:border-navy-700" onClick={exportCsv} disabled={rows.length === 0}>
            <FileDown className="h-4 w-4" /> Export CSV
          </button>
          <button type="button" className="btn-primary" onClick={exportPdf} disabled={rows.length === 0 || exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Monthly report (PDF)
          </button>
        </div>
      </div>

      <div className="card grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="a-range" className="label">Period</label>
          <select id="a-range" className="input" value={preset} onChange={(e) => setPreset(e.target.value as Preset)}>
            {PRESETS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        {preset === 'custom' && (
          <>
            <FormField label="From" type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            <FormField label="To" type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
              error={rangeOk ? undefined : 'Choose valid dates, with From before To.'} />
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[['Income', money(t.income)], ['Expenses', money(t.expense)], ['Net savings', money(t.net)], ['Savings rate', rate], ['Average daily expense', money(avg)]].map(([label, value]) => (
          <div key={label} className="card">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 truncate text-xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <section className="card">
        <h2 className="font-semibold">Income, expense and savings trends</h2>
        <div className="mt-4">
          {rows.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No transactions in this period.</p>
            : <TrendChart data={series} kind="line" currency={currency} showSavings />}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card"><h2 className="mb-3 font-semibold">Category-wise spending</h2><CategoryDonut data={categories} currency={currency} /></section>
        <section className="card"><h2 className="mb-3 font-semibold">Highest spending categories</h2><HorizontalBars items={categories.slice(0, 5)} currency={currency} /></section>
        <section className="card"><h2 className="mb-3 font-semibold">Payment methods</h2><HorizontalBars items={methods} currency={currency} barClass="bg-blue-500" /></section>
      </div>

      <section className="card overflow-hidden p-0">
        <h2 className="p-5 pb-3 font-semibold">Monthly comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-y border-slate-200 text-slate-500 dark:border-navy-800">
              <tr><th className="px-5 py-3 font-medium">Month</th><th className="px-4 py-3 text-right font-medium">Income</th><th className="px-4 py-3 text-right font-medium">Expenses</th><th className="px-4 py-3 text-right font-medium">Savings</th><th className="px-5 py-3 text-right font-medium">Spending change</th></tr>
            </thead>
            <tbody>
              {months.map((m, i) => {
                const before = i > 0 ? months[i - 1].expense : 0
                const change = before > 0 ? Math.round(((m.expense - before) / before) * 100) : null
                return (
                  <tr key={m.label} className="border-b border-slate-100 last:border-0 dark:border-navy-800">
                    <td className="px-5 py-3 font-medium">{m.label}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{money(m.income)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-red-600 dark:text-red-400">{money(m.expense)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(m.net)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{change === null ? '-' : `${change > 0 ? '+' : ''}${change}%`}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
