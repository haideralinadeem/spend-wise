import type { Budget, Transaction } from '../types'
import { OVERALL, budgetStatus, pctUsed, spentFor } from './budget'
import { daysInMonth, monthRange, shiftMonth } from './dates'
import { expenseBy, inRange, totals } from './analytics'
import { formatCurrency } from './format'

export interface Insight { id: string; tone: 'good' | 'warn' | 'info'; text: string }

interface Options {
  transactions: Transaction[]
  budgets: Budget[] // budgets of the month being analysed
  year: number
  month: number
  today: Date
  currency: string
}

// Plain rule-based calculations on the user's own transactions. This is not AI.
export function buildInsights({ transactions, budgets, year, month, today, currency }: Options): Insight[] {
  const cur = monthRange(year, month)
  const prevMonth = shiftMonth(year, month, -1)
  const prev = monthRange(prevMonth.year, prevMonth.month)
  const isCurrent = today.getFullYear() === year && today.getMonth() + 1 === month
  const total = daysInMonth(year, month)
  const elapsed = isCurrent ? today.getDate() : total

  const curRows = inRange(transactions, cur.from, cur.to)
  if (curRows.length === 0) return []
  // Compare with the same days of last month, so a part-finished month is judged fairly.
  const prevRows = inRange(transactions, prev.from, prev.to).filter((t) => Number(t.transaction_date.slice(8)) <= elapsed)

  const money = (n: number) => formatCurrency(n, currency)
  const c = totals(curRows)
  const p = totals(prevRows)
  const out: Insight[] = []

  if (c.income > 0) {
    out.push(c.net >= 0
      ? { id: 'saved', tone: 'good', text: `You saved ${money(c.net)} this month, ${Math.round((c.net / c.income) * 100)}% of your income.` }
      : { id: 'overspent', tone: 'warn', text: `You have spent ${money(-c.net)} more than you earned this month.` })
  }

  if (p.expense > 0 && c.expense > 0) {
    const change = ((c.expense - p.expense) / p.expense) * 100
    if (Math.abs(change) >= 1) {
      out.push({
        id: 'change',
        tone: change > 0 ? 'warn' : 'good',
        text: `Your spending has ${change > 0 ? 'increased' : 'decreased'} by ${Math.round(Math.abs(change))}% compared with last month.`,
      })
    }
  }

  const categories = expenseBy(curRows, 'category')
  if (categories.length > 0) {
    out.push({ id: 'largest', tone: 'info', text: `Your largest expense category is ${categories[0].name} (${money(categories[0].value)}).` })
  }

  const prevByCategory = new Map(expenseBy(prevRows, 'category').map((x): [string, number] => [x.name, x.value]))
  let biggest: { name: string; pct: number } | null = null
  for (const { name, value } of categories) {
    const before = prevByCategory.get(name)
    if (!before) continue
    const pct = ((value - before) / before) * 100
    if (pct >= 10 && (!biggest || pct > biggest.pct)) biggest = { name, pct }
  }
  if (biggest) {
    out.push({ id: 'category-up', tone: 'warn', text: `Your ${biggest.name} spending increased by ${Math.round(biggest.pct)}% this month.` })
  }

  const monthRows = curRows
  const overall = budgets.find((b) => b.category === OVERALL)
  if (overall) {
    const spent = spentFor(monthRows, OVERALL)
    const pct = pctUsed(spent, overall.amount)
    out.push(pct >= 100
      ? { id: 'budget', tone: 'warn', text: `You have exceeded your monthly budget by ${money(spent - overall.amount)}.` }
      : { id: 'budget', tone: pct >= 90 ? 'warn' : 'info', text: `You have spent ${Math.floor(pct)}% of your monthly budget.` })
  }

  if (isCurrent && elapsed >= 5) {
    let shown = 0
    for (const b of budgets) {
      if (shown >= 2) break
      const spent = spentFor(monthRows, b.category)
      const projected = (spent / elapsed) * total
      if (spent < b.amount && projected > b.amount) {
        const name = b.category === OVERALL ? 'monthly' : b.category
        out.push({ id: `likely-${b.id}`, tone: 'warn', text: `You are likely to exceed your ${name} budget at the current pace.` })
        shown++
      }
    }
  }

  if (c.expense > 0) {
    out.push({ id: 'daily', tone: 'info', text: `Your average daily spending is ${money(c.expense / elapsed)}.` })
  }
  return out
}

export { budgetStatus }
