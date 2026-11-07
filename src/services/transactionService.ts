import { supabase } from '../lib/supabase'
import type { Transaction, TransactionType } from '../types'

export interface TransactionFilters {
  search: string
  type: 'all' | TransactionType
  category: string
  paymentMethod: string
  from: string
  to: string
}

export type SortKey = 'transaction_date' | 'amount' | 'title'

export interface TransactionQuery extends TransactionFilters {
  sortKey: SortKey
  sortAsc: boolean
  page: number
  pageSize: number
}

export type TransactionInput = Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_demo'>

export async function listTransactions(q: TransactionQuery): Promise<{ rows: Transaction[]; total: number }> {
  let query = supabase.from('transactions').select('*', { count: 'exact' })

  if (q.type !== 'all') query = query.eq('type', q.type)
  if (q.category) query = query.eq('category', q.category)
  if (q.paymentMethod) query = query.eq('payment_method', q.paymentMethod)
  if (q.from) query = query.gte('transaction_date', q.from)
  if (q.to) query = query.lte('transaction_date', q.to)

  const term = q.search.trim().replace(/[%,()]/g, ' ')
  if (term) {
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,notes.ilike.%${term}%`)
  }

  const start = (q.page - 1) * q.pageSize
  const { data, error, count } = await query
    .order(q.sortKey, { ascending: q.sortAsc })
    .order('created_at', { ascending: false })
    .range(start, start + q.pageSize - 1)

  if (error) throw error
  return { rows: (data ?? []) as Transaction[], total: count ?? 0 }
}

export async function createTransaction(userId: string, input: TransactionInput) {
  const { error } = await supabase.from('transactions').insert({ ...input, user_id: userId })
  if (error) throw error
}

export async function updateTransaction(id: string, input: TransactionInput) {
  const { error } = await supabase.from('transactions').update(input).eq('id', id)
  if (error) throw error
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}

// Loads every matching transaction, 1000 rows at a time (the most Supabase returns per request).
async function fetchPaged(from?: string, to?: string): Promise<Transaction[]> {
  const all: Transaction[] = []
  const size = 1000
  for (let start = 0; start < 50000; start += size) {
    let query = supabase.from('transactions').select('*')
    if (from) query = query.gte('transaction_date', from)
    if (to) query = query.lte('transaction_date', to)
    const { data, error } = await query
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id')
      .range(start, start + size - 1)
    if (error) throw error
    const batch = (data ?? []) as Transaction[]
    all.push(...batch)
    if (batch.length < size) break
  }
  return all
}

export const fetchAllTransactions = () => fetchPaged()
export const fetchTransactionsInRange = (from: string, to: string) => fetchPaged(from, to)
