import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ExternalLink, QrCode } from 'lucide-react'
import { useAuthStore } from '../../../store/useAuthStore'
import { supabase } from '../../../lib/supabase'
import type { WeddingHub } from '../../../types/hub'

export function VendorHubsPage() {
  const user = useAuthStore((s) => s.user)
  const [hubs, setHubs] = useState<WeddingHub[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    supabase
      .from('wedding_hubs')
      .select('*')
      .or(`couple_id.eq.${user.id},created_by.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setHubs((data as WeddingHub[]) || [])
        setLoading(false)
      })
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="font-body text-sm text-red-500">{error}</p>
      </div>
    )
  }

  if (hubs.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="text-5xl">💍</div>
        <h1 className="font-display text-2xl font-semibold text-ink">Wedding Hubs</h1>
        <p className="font-body text-sm text-ink-400 max-w-sm mx-auto">
          Create a personalised QR code hub for your couple — timeline, travel, photo wall, song requests and more.
        </p>
        <Link to="/vendor/hub/new" className="btn-primary inline-flex items-center gap-2 mt-2">
          <Plus size={16} /> Create Your First Hub
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Wedding Hubs</h1>
          <p className="font-body text-sm text-ink-400 mt-0.5">{hubs.length} hub{hubs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/vendor/hub/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> New Hub
        </Link>
      </div>

      <div className="space-y-3">
        {hubs.map((hub) => {
          const hubUrl = `${window.location.origin}/wedding/${hub.access_code}`
          const date = new Date(hub.wedding_date).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          })
          return (
            <div key={hub.id} className="card p-5 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-display font-semibold"
                style={{ backgroundColor: hub.accent_color }}
              >
                {hub.partner_one_name[0]}{hub.partner_two_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold text-ink">
                  {hub.partner_one_name} & {hub.partner_two_name}
                </p>
                <p className="font-body text-xs text-ink-400">
                  {date}{hub.venue_name ? ` · ${hub.venue_name}` : ''}
                </p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className={`text-xs font-body px-2 py-0.5 rounded-full ${hub.is_active ? 'bg-green-50 text-green-700' : 'bg-ink-100 text-ink-400'}`}>
                    {hub.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs font-body text-ink-400">{hub.total_scans} scans</span>
                  <span className="text-xs font-body text-ink-400">{hub.total_photos_uploaded} photos</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={hubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-ink-400 hover:text-ink hover:bg-ink-50 rounded-lg transition-colors"
                  title="View live hub"
                >
                  <ExternalLink size={15} />
                </a>
                <Link
                  to={`/vendor/hub/${hub.id}`}
                  className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"
                >
                  <QrCode size={14} /> Manage
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
