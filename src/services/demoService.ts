import { supabase } from '../lib/supabase'
import { daysInMonth, pad2, shiftMonth } from '../utils/dates'

type Item = [title: string, amount: number, type: 'income' | 'expense', category: string, method: string, day: number]

// One realistic month in PKR. Last month is generated slightly lower so comparisons have something to show.
const ITEMS: Item[] = [
  ['Salary', 80000, 'income', 'Salary', 'Bank Transfer', 1],
  ['Freelance website project', 12000, 'income', 'Freelancing', 'Mobile Wallet', 14],
  ['Electricity bill', 4200, 'expense', 'Bills & Utilities', 'Bank Transfer', 5],
  ['Internet bill', 2300, 'expense', 'Bills & Utilities', 'Debit Card', 6],
  ['Semester books', 4500, 'expense', 'Education', 'Cash', 3],
  ['Online course', 5500, 'expense', 'Education', 'Credit Card', 9],
  ['Grocery run', 3800, 'expense', 'Groceries', 'Cash', 4],
  ['Weekly groceries', 3200, 'expense', 'Groceries', 'Cash', 11],
  ['Lunch with friends', 2400, 'expense', 'Food & Dining', 'Cash', 7],
  ['Dinner out', 3100, 'expense', 'Food & Dining', 'Debit Card', 13],
  ['Pizza night', 2200, 'expense', 'Food & Dining', 'Mobile Wallet', 18],
  ['Cafe snacks', 1300, 'expense', 'Food & Dining', 'Cash', 20],
  ['Family dinner', 3000, 'expense', 'Food & Dining', 'Cash', 22],
  ['Fuel', 2500, 'expense', 'Transportation', 'Cash', 8],
  ['Ride bookings', 1500, 'expense', 'Transportation', 'Mobile Wallet', 15],
  ['Bus card top-up', 1000, 'expense', 'Transportation', 'Cash', 19],
  ['New sneakers', 5500, 'expense', 'Shopping', 'Debit Card', 10],
  ['Clothes', 2500, 'expense', 'Shopping', 'Credit Card', 21],
  ['Movie night', 1200, 'expense', 'Entertainment', 'Cash', 16],
  ['Game subscription', 1800, 'expense', 'Entertainment', 'Credit Card', 17],
  ['Doctor visit', 2000, 'expense', 'Health', 'Cash', 12],
]

const BUDGETS: [string, number][] = [
  ['Overall', 50000], ['Food & Dining', 10000], ['Transportation', 5000], ['Shopping', 8000], ['Education', 7000],
]

export async function addDemoData(userId: string) {
  const now = new Date()
  const rows = []
  for (const offset of [0, -1]) {
    const { year, month } = shiftMonth(now.getFullYear(), now.getMonth() + 1, offset)
    const lastDay = offset === 0 ? now.getDate() : daysInMonth(year, month)
    for (const [title, amount, type, category, method, day] of ITEMS) {
      if (offset === -1 && title === 'Freelance website project') continue
      const factor = offset === 0 || type === 'income' ? 1 : category === 'Food & Dining' ? 0.85 : 0.9
      rows.push({
        user_id: userId, title, type, category, payment_method: method,
        amount: Math.round((amount * factor) / 10) * 10,
        transaction_date: `${year}-${pad2(month)}-${pad2(Math.min(day, lastDay))}`,
        notes: 'Demo data', is_demo: true,
      })
    }
  }
  const tx = await supabase.from('transactions').insert(rows)
  if (tx.error) throw tx.error

  // Existing budgets for this month are kept as they are.
  const budgets = await supabase.from('budgets').upsert(
    BUDGETS.map(([category, amount]) => ({
      user_id: userId, category, amount, month: now.getMonth() + 1, year: now.getFullYear(), is_demo: true,
    })),
    { onConflict: 'user_id,category,month,year', ignoreDuplicates: true },
  )
  if (budgets.error) throw budgets.error

  const target = shiftMonth(now.getFullYear(), now.getMonth() + 1, 6)
  const goal = await supabase.from('savings_goals').insert({
    user_id: userId, title: 'Buy a laptop', target_amount: 150000, current_amount: 45000,
    target_date: `${target.year}-${pad2(target.month)}-01`, description: 'Demo goal', is_demo: true,
  })
  if (goal.error) throw goal.error
}

export async function removeDemoData() {
  for (const table of ['transactions', 'budgets', 'savings_goals']) {
    const { error } = await supabase.from(table).delete().eq('is_demo', true)
    if (error) throw error
  }
}
