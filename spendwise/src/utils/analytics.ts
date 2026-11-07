import type { Transaction } from '../types'
import { MONTH_NAMES, addDays, daysBetween, monthKey, pad2, parseISO, shiftMonth, toISO } from './dates'

const round2 = (n: number) => Math.round(n * 100) / 100

export interface Totals { income: number; expense: number; net: number }
export interface NameValue { name: string; value: number }
export interface SeriesPoint { label: string; income: number; expense: number; savings: number }
export type Granularity = 'day' | 'month'
export type RangeKey = '7d' | '30d' | '3m' | '6m' | '12m'

export function totals(rows: Transaction[]): Totals {
  let income = 0
  let expense = 0
  for (const t of rows) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  return { income: round2(income), expense: round2(expense), net: round2(income - expense) }
}

export const inRange = (rows: Transaction[], from: string, to: string) =>
  rows.filter((t) => t.transaction_date >= from && t.transaction_date <= to)

export function expenseBy(rows: Transaction[], key: 'category' | 'payment_method'): NameValue[] {
  const map = new Map<string, number>()
  for (const t of rows) {
    if (t.type === 'expense') map.set(t[key], (map.get(t[key]) ?? 0) + t.amount)
  }
  return Array.from(map, ([name, value]) => ({ name, value: round2(value) })).sort((a, b) => b.value - a.value)
}

export function buildSeries(rows: Transaction[], from: string, to: string, granularity: Granularity): SeriesPoint[] {
  const points = new Map<string, SeriesPoint>()
  const blank = (label: string): SeriesPoint => ({ label, income: 0, expense: 0, savings: 0 })

  if (granularity === 'day') {
    for (let d = parseISO(from); toISO(d) <= to; d = addDays(d, 1)) {
      points.set(toISO(d), blank(`${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`))
    }
  } else {
    const start = parseISO(from)
    const end = parseISO(to)
    let year = start.getFullYear()
    let month = start.getMonth() + 1
    while (year < end.getFullYear() || (year === end.getFullYear() && month <= end.getMonth() + 1)) {
      points.set(`${year}-${pad2(month)}`, blank(`${MONTH_NAMES[month - 1].slice(0, 3)} ${String(year).slice(2)}`))
      const next = shiftMonth(year, month, 1)
      year = next.year
      month = next.month
    }
  }

  for (const t of rows) {
    const point = points.get(granularity === 'day' ? t.transaction_date : monthKey(t.transaction_date))
    if (!point) continue
    if (t.type === 'income') point.income += t.amount
    else point.expense += t.amount
  }
  return Array.from(points.values()).map((p) => ({
    ...p,
    income: round2(p.income),
    expense: round2(p.expense),
    savings: round2(p.income - p.expense),
  }))
}

export function rangeFor(key: RangeKey, today: Date = new Date()): { from: string; to: string; granularity: Granularity } {
  const to = toISO(today)
  if (key === '7d') return { from: toISO(addDays(today, -6)), to, granularity: 'day' }
  if (key === '30d') return { from: toISO(addDays(today, -29)), to, granularity: 'day' }
  const months = key === '3m' ? 3 : key === '6m' ? 6 : 12
  const start = shiftMonth(today.getFullYear(), today.getMonth() + 1, -(months - 1))
  return { from: `${start.year}-${pad2(start.month)}-01`, to, granularity: 'month' }
}

// Average spent per day between from and to (a future end date is cut at today).
export function averageDaily(expense: number, from: string, to: string, today: string): number {
  const end = to > today ? today : to
  return expense / Math.max(1, daysBetween(from, end))
}
