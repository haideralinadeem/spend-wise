import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import Avatar from '../common/Avatar'
import FormField from '../common/FormField'
import { useToast } from '../common/Toast'
import { useAuth } from '../../contexts/AuthContext'
import { updateProfile } from '../../services/profileService'
import { friendlyError } from '../../utils/errors'
import { resizeImage } from '../../utils/image'

export default function ProfileSection() {
  const { profile, user, refreshProfile } = useAuth()
  const { notify } = useToast()
  const [name, setName] = useState(profile?.full_name ?? '')
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  async function save(patch: Parameters<typeof updateProfile>[1], message: string) {
    if (!user || saving) return
    setSaving(true)
    try {
      await updateProfile(user.id, patch)
      await refreshProfile()
      notify('success', message)
    } catch (err) {
      notify('error', friendlyError(err))
    } finally {
      setSaving(false)
    }
  }

  function handleName(e: FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2) return setError('Enter your full name.')
    setError(undefined)
    void save({ full_name: name.trim() }, 'Profile updated.')
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      return notify('error', 'Choose an image file smaller than 5 MB.')
    }
    try {
      await save({ avatar_url: await resizeImage(file) }, 'Profile picture updated.')
    } catch (err) {
      notify('error', friendlyError(err))
    }
  }

  return (
    <section className="card">
      <h2 className="font-semibold">Profile</h2>
      <div className="mt-4 flex items-center gap-4">
        <Avatar url={profile?.avatar_url ?? null} name={profile?.full_name || user?.email || '?'} size={64} />
        <div className="flex flex-wrap gap-2">
          <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button type="button" className="btn-ghost border border-slate-300 dark:border-navy-700" onClick={() => fileInput.current?.click()} disabled={saving}>
            Upload picture
          </button>
          {profile?.avatar_url && (
            <button type="button" className="btn-ghost" onClick={() => void save({ avatar_url: null }, 'Profile picture removed.')} disabled={saving}>
              Remove
            </button>
          )}
        </div>
      </div>
      <form onSubmit={handleName} className="mt-5 space-y-4" noValidate>
        <FormField label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={error} />
        <FormField label="Email" value={profile?.email ?? user?.email ?? ''} readOnly
          hint="Your email is used to sign in and cannot be changed here." />
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save profile
        </button>
      </form>
    </section>
  )
}
