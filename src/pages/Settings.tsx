import AccountSection from '../components/settings/AccountSection'
import DemoDataSection from '../components/settings/DemoDataSection'
import PreferencesSection from '../components/settings/PreferencesSection'
import ProfileSection from '../components/settings/ProfileSection'
import { FullPageSpinner } from '../components/common/Spinner'
import { useAuth } from '../contexts/AuthContext'

export default function Settings() {
  const { profile } = useAuth()
  // The sections start with the saved values, so wait until the profile is loaded.
  if (!profile) return <FullPageSpinner />
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <ProfileSection />
      <PreferencesSection />
      <DemoDataSection />
      <AccountSection />
    </div>
  )
}
