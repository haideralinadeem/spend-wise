import { supabase } from '../lib/supabase'
import type { SavingsGoal } from '../types'

export type GoalInput = Pick<SavingsGoal, 'title' | 'target_amount' | 'current_amount' | 'target_date' | 'description'>

export async function listGoals(): Promise<SavingsGoal[]> {
  const { data, error } = await supabase.from('savings_goals').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as SavingsGoal[]
}

export async function createGoal(userId: string, input: GoalInput) {
  const { error } = await supabase.from('savings_goals').insert({ ...input, user_id: userId })
  if (error) throw error
}

export async function updateGoal(id: string, input: GoalInput) {
  const { error } = await supabase.from('savings_goals').update(input).eq('id', id)
  if (error) throw error
}

export async function setGoalAmount(id: string, currentAmount: number) {
  const { error } = await supabase.from('savings_goals').update({ current_amount: currentAmount }).eq('id', id)
  if (error) throw error
}

export async function deleteGoal(id: string) {
  const { error } = await supabase.from('savings_goals').delete().eq('id', id)
  if (error) throw error
}
