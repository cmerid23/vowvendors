import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import type { ContactRequest } from '../../types/database'
import { formatDate } from '../../utils/formatters'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  responded: 'bg-blue-100 text-blue-700',
  agreed: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
}

export function CustomerInquiriesPage() {
  const profile = useAuthStore((s) => s.profile)
  const [inquiries, setInquiries] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.email) return
    supabase
      .from('contact_requests')
      .select('*')
      .eq('from_email', profile.email)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setInquiries(data || []); setLoading(false) })
  }, [profile])

  return (
    <div>
      <h1 className="font-display text-3xl text-ink font-semibold mb-6">My Inquiries</h1>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-card" />)}</div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16 text-ink-400 font-body">
          <p className="text-4xl mb-3">💬</p>
          <p>You haven't contacted any vendors yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((req) => (
            <div key={req.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-body font-medium text-ink text-sm">{req.message.slice(0, 80)}...</p>
                  {req.event_date && <p className="text-ink-400 text-xs font-body mt-1">Event: {formatDate(req.event_date)}</p>}
                  <p className="text-ink-300 text-xs font-body mt-1">{formatDate(req.created_at)}</p>
                </div>
                <span className={`text-xs font-body font-medium px-2.5 py-1 rounded-pill capitalize shrink-0 ${STATUS_COLORS[req.status] || 'bg-ink-100 text-ink-500'}`}>
                  {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
