export const DEFAULT_CURRENCY = 'PKR'

// Digits use "en-US" grouping so amounts read Rs. 125,000 as in the project spec.
export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  if (currency === 'PKR') {
    return `Rs. ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount)}`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

// Short form for chart axes and calendar cells: 1.5k, 80k, 1.2M.
export function formatCompact(n: number): string {
  const abs = Math.abs(n)
  const trim = (x: number) => String(Math.round(x * 10) / 10)
  if (abs >= 1_000_000) return `${trim(n / 1_000_000)}M`
  if (abs >= 1000) return `${trim(n / 1000)}k`
  return String(Math.round(n))
}

const pad = (n: number) => String(n).padStart(2, '0')

// Today's date as YYYY-MM-DD in the user's own time zone.
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Shows a YYYY-MM-DD date in the format chosen in Settings.
export function formatDate(iso: string, dateFormat: string = 'DD/MM/YYYY'): string {
  const [y, m, d] = iso.split('-')
  if (dateFormat === 'MM/DD/YYYY') return `${m}/${d}/${y}`
  if (dateFormat === 'YYYY-MM-DD') return iso
  return `${d}/${m}/${y}`
}
