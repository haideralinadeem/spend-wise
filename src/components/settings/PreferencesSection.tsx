import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import FormField from '../common/FormField'
import { useToast } from '../common/Toast'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { updateProfile } from '../../services/profileService'
import { CURRENCIES, DATE_FORMATS } from '../../utils/constants'
import { friendlyError } from '../../utils/errors'

export default function PreferencesSection() {
  const { profile, user, refreshProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { notify } = useToast()
  const [currency, setCurrency] = useState(profile?.currency ?? 'PKR')
  const [dateFormat, setDateFormat] = useState(profile?.date_format ?? 'DD/MM/YYYY')
  const [budget, setBudget] = useState(profile?.default_monthly_budget ? String(profile.default_monthly_budget) : '')
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || saving) return
    const value = budget.trim() === '' ? null : Number(budget)
    if (value !== null && (!Number.isFinite(value) || value <= 0 || value >= 1e12)) {
      return setError('Enter an amount greater than zero, or leave this empty.')
    }
    setError(undefined)
    setSaving(true)
    try {
      await updateProfile(user.id, { currency, date_format: dateFormat, default_monthly_budget: value })
      await refreshProfile()
      notify('success', 'Preferences saved.')
    } catch (err) {
      notify('error', friendlyError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card">
      <h2 className="font-semibold">Preferences</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
        <div>
          <label htmlFor="p-currency" className="label">Currency</label>
          <select id="p-currency" className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c === 'PKR' ? 'PKR (Pakistani Rupee, default)' : c}</option>)}
          </select>
          <p className="mt-1 text-sm text-slate-500">This changes how amounts are shown. Existing amounts are not converted.</p>
        </div>
        <div>
          <label htmlFor="p-date" className="label">Date format</label>
          <select id="p-date" className="input" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
            {DATE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="p-theme" className="label">Theme</label>
          <select id="p-theme" className="input" value={theme} onChange={(e) => e.target.value !== theme && toggleTheme()}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <FormField label="Default monthly budget (Rs., optional)" type="number" inputMode="decimal" step="0.01" min="0"
          value={budget} onChange={(e) => setBudget(e.target.value)} error={error}
          hint="Filled in automatically when you create a total monthly budget." />
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save preferences
        </button>
      </form>
    </section>
  )
}
