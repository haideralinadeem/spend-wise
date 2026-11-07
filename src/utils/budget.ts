import type { Transaction } from '../types'

export const OVERALL = 'Overall'

export interface BudgetStatus { label: string; bar: string; text: string }

// Below 70% normal, 70-89% warning, 90-99% high spending, 100%+ exceeded.
export function budgetStatus(pct: number): BudgetStatus {
  if (pct >= 100) return { label: 'Budget exceeded', bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400' }
  if (pct >= 90) return { label: 'High spending', bar: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' }
  if (pct >= 70) return { label: 'Warning', bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' }
  return { label: 'On track', bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' }
}

// monthRows must already be limited to the budget's month.
export function spentFor(monthRows: Transaction[], category: string): number {
  let spent = 0
  for (const t of monthRows) {
    if (t.type === 'expense' && (category === OVERALL || t.category === category)) spent += t.amount
  }
  return Math.round(spent * 100) / 100
}

export const pctUsed = (spent: number, amount: number) => (amount > 0 ? (spent / amount) * 100 : 0)
export const displayPct = (pct: number) => Math.floor(pct)
