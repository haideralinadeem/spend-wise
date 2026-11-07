import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

type ToastType = 'success' | 'error'
interface ToastItem {
  id: number
  type: ToastType
  message: string
}

const ToastContext = createContext<{ notify: (type: ToastType, message: string) => void } | null>(null)
let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), [])

  const notify = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId++
      setToasts((all) => [...all, { id, type, message }])
      window.setTimeout(() => dismiss(id), 5000)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg dark:border-navy-700 dark:bg-navy-800"
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            )}
            <p className="flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss message" className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
