import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { fetchProfile } from '../services/profileService'
import { signOut as signOutRequest } from '../services/authService'
import type { Profile } from '../types'

interface AuthValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  isRecovery: boolean
  clearRecovery: () => void
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRecovery, setIsRecovery] = useState(false)

  const user = session?.user ?? null
  const userId = user?.id

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null))
      .finally(() => setLoading(false))

    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      return
    }
    try {
      setProfile(await fetchProfile(userId))
    } catch {
      setProfile(null)
    }
  }, [userId])

  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  const signOut = useCallback(async () => {
    await signOutRequest()
    setProfile(null)
  }, [])

  const clearRecovery = useCallback(() => setIsRecovery(false), [])

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, isRecovery, clearRecovery, refreshProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
