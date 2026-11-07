import { supabase } from '../lib/supabase'
import type { Budget } from '../types'

export async function listBudgets(year: number, month: number): Promise<Budget[]> {
  const { data, error } = await supabase.from('budgets').select('*').eq('year', year).eq('month', month).order('category')
  if (error) throw error
  return (data ?? []) as Budget[]
}

export async function createBudget(userId: string, category: string, amount: number, year: number, month: number) {
  const { error } = await supabase.from('budgets').insert({ user_id: userId, category, amount, year, month })
  if (error) {
    if (error.code === '23505') throw new Error('You already have a budget for this category in this month.')
    throw error
  }
}

export async function updateBudget(id: string, amount: number) {
  const { error } = await supabase.from('budgets').update({ amount }).eq('id', id)
  if (error) throw error
}

export async function deleteBudget(id: string) {
  const { error } = await supabase.from('budgets').delete().eq('id', id)
  if (error) throw error
}
