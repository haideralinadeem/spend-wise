export type TransactionType = 'income' | 'expense'

export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  currency: string
  date_format: string
  default_monthly_budget: number | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  title: string
  amount: number
  type: TransactionType
  category: string
  payment_method: string
  transaction_date: string
  description: string | null
  notes: string | null
  is_demo: boolean
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  category: string
  amount: number
  month: number
  year: number
  is_demo: boolean
  created_at: string
}

export interface SavingsGoal {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  target_date: string | null
  description: string | null
  is_demo: boolean
  created_at: string
}
