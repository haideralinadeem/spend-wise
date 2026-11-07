export default function ComingSoon({ title, stage }: { title: string; stage: number }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="card mt-6 max-w-xl">
        <p className="text-sm text-slate-600 dark:text-slate-400">This page is built in Stage {stage} of the project.</p>
      </div>
    </div>
  )
}
