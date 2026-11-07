import type { ReactNode } from 'react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

interface Props {
  title: string
  subtitle: string
  children: ReactNode
}

export default function AuthShell({ title, subtitle, children }: Props) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between bg-navy-900 p-12 lg:flex">
        <Logo light />
        <div className="max-w-md">
          <p className="text-3xl font-semibold leading-tight text-white">Know where every rupee goes.</p>
          <p className="mt-4 text-slate-300">
            Track income and expenses, set budgets in PKR, and work towards your savings goals, all in one place.
          </p>
        </div>
        <p className="text-sm text-slate-400">Your records are private. Only you can see your data.</p>
      </aside>
      <main className="relative flex items-center justify-center px-4 py-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  )
}
