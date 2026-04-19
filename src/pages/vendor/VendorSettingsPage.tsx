import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { Button } from '../../components/ui/Button'
import { useNavigate } from 'react-router-dom'

export function VendorSettingsPage() {
  const { profile, reset } = useAuthStore()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    reset()
    navigate('/')
  }

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="font-display text-3xl text-ink font-semibold">Settings</h1>

      <div className="card p-6 space-y-4">
        <h2 className="font-display text-xl text-ink">Account</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm font-medium text-ink">{profile?.full_name || 'Vendor'}</p>
            <p className="text-ink-400 text-xs font-body">{profile?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </div>

      <div className="card p-6 border-red-200 space-y-3">
        <h2 className="font-display text-xl text-red-600">Danger Zone</h2>
        <p className="text-ink-400 font-body text-sm">Deactivating your profile will hide it from search results.</p>
        {!confirm ? (
          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => setConfirm(true)}>
            Deactivate Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" loading={deleting} onClick={async () => {
              setDeleting(true)
              if (profile) {
                const { data: v } = await supabase.from('vendors').select('id').eq('user_id', profile.id).single()
                if (v) await supabase.from('vendors').update({ is_active: false }).eq('id', v.id)
              }
              setDeleting(false)
              setConfirm(false)
            }}>
              Confirm Deactivate
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>Cancel</Button>
          </div>
        )}
      </div>
    </div>
  )
}
