import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { useFavoritesStore } from '../store/useFavoritesStore'

export function useAuthListener() {
  const { setUser, setSession, setProfile, setLoading } = useAuthStore()
  const { loadFromDb, syncToDb } = useFavoritesStore()
  const initialized = useRef(false)

  useEffect(() => {
    // Prevent double-subscription when component re-mounts (StrictMode / layout transitions)
    if (initialized.current) return
    initialized.current = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      // Silent background events — don't re-fetch profile or flash loading state
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'MFA_CHALLENGE_VERIFIED') {
        return
      }

      if (event === 'SIGNED_OUT') {
        setProfile(null)
        setLoading(false)
        return
      }

      // INITIAL_SESSION, SIGNED_IN, PASSWORD_RECOVERY
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(data)
        if (event === 'SIGNED_IN') {
          await syncToDb(session.user.id)
          await loadFromDb(session.user.id)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      initialized.current = false
      subscription.unsubscribe()
    }
  }, []) // stable refs — Zustand setters never change
}
