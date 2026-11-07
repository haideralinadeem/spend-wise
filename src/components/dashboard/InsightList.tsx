import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type { Insight } from '../../utils/insights'

const STYLE = {
  good: { icon: CheckCircle2, color: 'text-emerald-500' },
  warn: { icon: AlertTriangle, color: 'text-amber-500' },
  info: { icon: Info, color: 'text-blue-500' },
}

export default function InsightList({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return <p className="text-sm text-slate-500">Add some transactions this month and your insights will appear here.</p>
  }
  return (
    <ul className="space-y-3">
      {insights.map((i) => {
        const { icon: Icon, color } = STYLE[i.tone]
        return (
          <li key={i.id} className="flex items-start gap-3 text-sm">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
            <span>{i.text}</span>
          </li>
        )
      })}
    </ul>
  )
}
