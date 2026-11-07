import type { TransactionType } from '../types'

export const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Education', 'Entertainment', 'Health',
  'Bills & Utilities', 'Rent', 'Travel', 'Personal Care', 'Groceries', 'Other',
]
export const INCOME_CATEGORIES = ['Salary', 'Freelancing', 'Business', 'Investments', 'Allowance', 'Other']
export const ALL_CATEGORIES = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]))

export const PAYMENT_METHODS = ['Cash', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Mobile Wallet', 'Other']

export const categoriesFor = (type: TransactionType) =>
  type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

export const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR', 'CAD', 'AUD']
export const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
