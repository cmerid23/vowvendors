import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { useFavoritesStore } from '../store/useFavoritesStore'

export function useAuthListener() {
  const { setUser, setSession, setProfile, setLoading, reset } = useAuthStore()
  const { loadFromDb, syncToDb } = useFavoritesStore()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(data)
        loadFromDb(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
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

    return () => subscription.unsubscribe()
  }, [setUser, setSession, setProfile, setLoading, reset, loadFromDb, syncToDb])
}
