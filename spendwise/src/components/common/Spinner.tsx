import { Loader2 } from 'lucide-react'

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Loading">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  )
}
