import { supabase } from '../lib/supabase'

// Where Supabase sends people after they click an email link.
const siteUrl = () => `${window.location.origin}${import.meta.env.BASE_URL}`

export async function signUp(fullName: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { full_name: fullName.trim() }, emailRedirectTo: siteUrl() },
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: siteUrl() })
  if (error) throw error
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}
