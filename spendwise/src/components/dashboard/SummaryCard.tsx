import type { LucideIcon } from 'lucide-react'

const TONES = {
  navy: 'bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-200',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
}

interface Props {
  label: string
  value: string
  sub: string
  icon: LucideIcon
  tone: keyof typeof TONES
}

export default function SummaryCard({ label, value, sub, icon: Icon, tone }: Props) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${TONES[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 truncate text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  )
}
