import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { NameValue } from '../../utils/analytics'
import { formatCurrency } from '../../utils/format'

const COLORS = ['#456394', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#64748b']

export default function CategoryDonut({ data, currency }: { data: NameValue[]; currency: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return <p className="py-10 text-center text-sm text-slate-500">No expenses to show yet.</p>

  return (
    <div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2} stroke="none">
              {data.map((d, i) => <Cell key={d.name} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} contentStyle={{ borderRadius: 8, color: '#14203a' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {data.slice(0, 6).map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="flex-1 truncate">{d.name}</span>
            <span className="text-slate-500">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
