import type { Transaction } from '../types'
import { daysBetween } from './dates'
import { averageDaily, expenseBy, totals } from './analytics'
import { formatCurrency, formatDate, todayISO } from './format'

// A cell starting with = + - @ could run as a formula in Excel, so it gets a leading apostrophe.
const cell = (value: string | number | null) => {
  let text = value === null ? '' : String(value)
  if (/^[=+\-@]/.test(text) && typeof value === 'string') text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export function transactionsToCsv(rows: Transaction[], dateFormat: string): string {
  const header = ['Date', 'Title', 'Type', 'Category', 'Payment method', 'Amount', 'Description', 'Notes']
  const lines = rows.map((t) =>
    [formatDate(t.transaction_date, dateFormat), t.title, t.type, t.category, t.payment_method, t.amount, t.description, t.notes]
      .map(cell).join(','))
  return '\uFEFF' + [header.map(cell).join(','), ...lines].join('\r\n')
}

export function downloadFile(filename: string, content: BlobPart, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

// The built-in PDF font only knows basic Latin characters.
const safe = (s: string) => s.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '?')

interface ReportOptions {
  userName: string
  from: string
  to: string
  currency: string
  dateFormat: string
  rows: Transaction[]
}

export async function exportReportPdf({ userName, from, to, currency, dateFormat, rows }: ReportOptions) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF()
  const money = (n: number) => safe(formatCurrency(n, currency))
  const t = totals(rows)
  const avg = averageDaily(t.expense, from, to, todayISO())
  const rate = t.income > 0 ? `${Math.round((t.net / t.income) * 100)}%` : 'n/a'
  const head = { fillColor: [20, 32, 58] as [number, number, number] }
  const nextY = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  doc.setFontSize(20)
  doc.text('SpendWise financial report', 14, 20)
  doc.setFontSize(10)
  doc.text(safe(`Prepared for ${userName}`), 14, 28)
  doc.text(`Period: ${formatDate(from, dateFormat)} to ${formatDate(to, dateFormat)} (${daysBetween(from, to)} days)`, 14, 34)
  doc.text(`Generated on ${formatDate(todayISO(), dateFormat)}`, 14, 40)

  autoTable(doc, {
    startY: 46, head: [['Summary', 'Amount']], headStyles: head,
    body: [['Total income', money(t.income)], ['Total expenses', money(t.expense)], ['Net savings', money(t.net)],
      ['Savings rate', rate], ['Average daily expense', money(avg)]],
  })
  autoTable(doc, {
    startY: nextY(), head: [['Expense category', 'Amount']], headStyles: head,
    body: expenseBy(rows, 'category').map((x) => [safe(x.name), money(x.value)]),
  })
  autoTable(doc, {
    startY: nextY(), head: [['Payment method', 'Amount spent']], headStyles: head,
    body: expenseBy(rows, 'payment_method').map((x) => [safe(x.name), money(x.value)]),
  })
  autoTable(doc, {
    startY: nextY(), head: [['Date', 'Title', 'Category', 'Payment', 'Type', 'Amount']], headStyles: head,
    body: [...rows].sort((a, b) => a.transaction_date.localeCompare(b.transaction_date)).map((r) => [
      formatDate(r.transaction_date, dateFormat), safe(r.title), safe(r.category), r.payment_method,
      r.type === 'income' ? 'Income' : 'Expense', money(r.amount)]),
    styles: { fontSize: 8 },
  })
  doc.save(`spendwise-report-${from}-to-${to}.pdf`)
}
