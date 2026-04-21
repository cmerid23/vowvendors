import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { useFavoritesStore } from '../store/useFavoritesStore'

export function useAuthListener() {
  const { setUser, setSession, setProfile, setLoading } = useAuthStore()
  const { loadFromDb, syncToDb } = useFavoritesStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setSession(session)
        setUser(session?.user ?? null)

        // Silent background events — don't touch loading or profile
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'MFA_CHALLENGE_VERIFIED') {
          return
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(data ?? null)
        } else {
          setProfile(null)
        }

        setLoading(false)

        // Fire and forget — don't block navigation
        if (event === 'SIGNED_IN' && session?.user) {
          syncToDb(session.user.id).catch(() => {})
          loadFromDb(session.user.id).catch(() => {})
        }
      } catch {
        // Always unblock guards even if something fails
        setLoading(false)
      }
    })

    return () => {
      initialized.current = false
      subscription.unsubscribe()
    }
  }, [])
}
