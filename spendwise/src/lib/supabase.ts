import { createClient } from '@supabase/supabase-js'

// Keeps only the address part, so a pasted "/rest/v1/" ending does no harm.
function cleanUrl(value: string | undefined): string | undefined {
  try {
    return value ? new URL(value.trim()).origin : undefined
  } catch {
    return undefined
  }
}

const url = cleanUrl(import.meta.env.VITE_SUPABASE_URL as string | undefined)
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

// The app shows a setup screen when these are missing.
export const isSupabaseConfigured = Boolean(url && anonKey)

// Only the public key is used here. It is safe in the browser because
// Row Level Security (see supabase/migrations) protects every table.
export const supabase = createClient(url ?? 'http://localhost:54321', anonKey ?? 'missing-key', {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
