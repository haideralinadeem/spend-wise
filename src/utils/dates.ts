export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const pad2 = (n: number) => String(n).padStart(2, '0')
export const toISO = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

// month is 1-12
export const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate()

export const monthRange = (year: number, month: number) => ({
  from: `${year}-${pad2(month)}-01`,
  to: `${year}-${pad2(month)}-${pad2(daysInMonth(year, month))}`,
})

export function shiftMonth(year: number, month: number, n: number) {
  const index = year * 12 + (month - 1) + n
  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

export const monthLabel = (year: number, month: number) => `${MONTH_NAMES[month - 1]} ${year}`
export const monthKey = (iso: string) => iso.slice(0, 7)

// Number of days from a to b, counting both ends.
export const daysBetween = (a: string, b: string) =>
  Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 86400000) + 1
