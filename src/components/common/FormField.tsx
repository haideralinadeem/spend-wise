import { useId, type InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export default function FormField({ label, error, hint, className = '', ...rest }: Props) {
  const id = useId()
  const note = error ?? hint
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        className={`input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : ''} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={note ? `${id}-note` : undefined}
        {...rest}
      />
      {note && (
        <p id={`${id}-note`} className={`mt-1 text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>
          {note}
        </p>
      )}
    </div>
  )
}
