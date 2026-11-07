import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SeriesPoint } from '../../utils/analytics'
import { formatCompact, formatCurrency } from '../../utils/format'

interface Props {
  data: SeriesPoint[]
  kind: 'bar' | 'line'
  currency: string
  showSavings?: boolean
}

const tick = { fill: 'currentColor', fontSize: 12 }
const COLORS = { income: '#10b981', expense: '#ef4444', savings: '#3b82f6' }

export default function TrendChart({ data, kind, currency, showSavings = false }: Props) {
  // Recharts needs these as a plain array, not wrapped in a Fragment.
  const shared = [
    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.12} vertical={false} />,
    <XAxis key="x" dataKey="label" tick={tick} tickLine={false} axisLine={false} minTickGap={16} />,
    <YAxis key="y" tick={tick} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => formatCompact(v)} />,
    <Tooltip key="tip" formatter={(value) => formatCurrency(Number(value), currency)} contentStyle={{ borderRadius: 8, color: '#14203a' }} />,
    <Legend key="legend" />,
  ]
  const margin = { top: 8, right: 8, left: 0, bottom: 0 }

  return (
    <div className="h-72 w-full text-slate-500 dark:text-slate-400">
      <ResponsiveContainer width="100%" height="100%">
        {kind === 'bar' ? (
          <BarChart data={data} margin={margin}>
            {shared}
            <Bar dataKey="income" name="Income" fill={COLORS.income} radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expenses" fill={COLORS.expense} radius={[4, 4, 0, 0]} />
            {showSavings && <Bar dataKey="savings" name="Savings" fill={COLORS.savings} radius={[4, 4, 0, 0]} />}
          </BarChart>
        ) : (
          <LineChart data={data} margin={margin}>
            {shared}
            <Line type="monotone" dataKey="income" name="Income" stroke={COLORS.income} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="expense" name="Expenses" stroke={COLORS.expense} strokeWidth={2} dot={false} />
            {showSavings && <Line type="monotone" dataKey="savings" name="Savings" stroke={COLORS.savings} strokeWidth={2} dot={false} />}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
