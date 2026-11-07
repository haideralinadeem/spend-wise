import type { NameValue } from '../../utils/analytics'
import { formatCurrency } from '../../utils/format'
import ProgressBar from '../common/ProgressBar'

interface Props {
  items: NameValue[]
  currency: string
  barClass?: string
}

export default function HorizontalBars({ items, currency, barClass = 'bg-navy-500' }: Props) {
  if (items.length === 0) return <p className="py-6 text-center text-sm text-slate-500">No expenses in this period.</p>
  const max = Math.max(...items.map((i) => i.value))
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.name}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{item.name}</span>
            <span className="font-medium tabular-nums">{formatCurrency(item.value, currency)}</span>
          </div>
          <ProgressBar pct={(item.value / max) * 100} label={item.name} barClass={barClass} />
        </li>
      ))}
    </ul>
  )
}
