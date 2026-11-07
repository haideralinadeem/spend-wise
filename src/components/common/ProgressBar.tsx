interface Props {
  pct: number
  label: string
  barClass?: string
}

export default function ProgressBar({ pct, label, barClass = 'bg-emerald-500' }: Props) {
  const width = Math.max(0, Math.min(100, pct))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
      className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-navy-800"
    >
      <div className={`h-full rounded-full transition-all ${barClass}`} style={{ width: `${width}%` }} />
    </div>
  )
}
