import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  ArrowLeftRight, BarChart3, CalendarDays, LayoutDashboard, LogOut, Menu, Settings, Target, Wallet, X,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../common/Toast'
import { friendlyError } from '../../utils/errors'
import Avatar from '../common/Avatar'
import Logo from '../common/Logo'
import ThemeToggle from '../common/ThemeToggle'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, end: false },
  { to: '/budgets', label: 'Budgets', icon: Wallet, end: false },
  { to: '/goals', label: 'Savings goals', icon: Target, end: false },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, end: false },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

export default function AppLayout() {
  const { profile, user, signOut } = useAuth()
  const { notify } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)

  const displayName = profile?.full_name || user?.email || ''

  async function handleSignOut() {
    try {
      await signOut()
    } catch (err) {
      notify('error', friendlyError(err))
    }
  }

  return (
    <div className="min-h-screen">
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-navy-950/50 lg:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-navy-800 dark:bg-navy-900 lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo />
          <button className="btn-ghost p-2 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Main">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-navy-800 text-white dark:bg-emerald-600/15 dark:text-emerald-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-800'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-navy-800 dark:bg-navy-900/90 sm:px-6">
          <button className="btn-ghost p-2 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <ThemeToggle />
          <div className="ml-1 flex items-center gap-2">
            <Avatar url={profile?.avatar_url ?? null} name={displayName} size={32} />
            <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:block">{displayName}</span>
          </div>
          <button className="btn-ghost p-2" onClick={handleSignOut} aria-label="Sign out">
            <LogOut className="h-5 w-5" />
          </button>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
