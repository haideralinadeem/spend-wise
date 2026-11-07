export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#10b981" />
        <path d="M8 21l5-6 4 3 7-9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`text-lg font-semibold tracking-tight ${light ? 'text-white' : 'text-navy-900 dark:text-white'}`}>
        SpendWise
      </span>
    </div>
  )
}
