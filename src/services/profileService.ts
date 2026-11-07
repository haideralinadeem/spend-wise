import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data as Profile | null
}

export type ProfilePatch = Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'currency' | 'date_format' | 'default_monthly_budget'>>

export async function updateProfile(userId: string, patch: ProfilePatch) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
  if (error) throw error
}

// Removes the account and all its data (see delete_my_account in the SQL).
export async function deleteAccount() {
  const { error } = await supabase.rpc('delete_my_account')
  if (error) throw error
  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch {
    /* the account is gone; the local session is cleared either way */
  }
}
