import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import type { ContactRequest } from '../../types/database'
import { formatDate, formatRelativeTime } from '../../utils/formatters'
import { MessageSquare } from 'lucide-react'
import { Button } from '../../components/ui/Button'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  responded: 'bg-blue-100 text-blue-700',
  agreed: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
}

export function VendorInquiriesPage() {
  const profile = useAuthStore((s) => s.profile)
  const navigate = useNavigate()
  const [inquiries, setInquiries] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase.from('vendors').select('id').eq('user_id', profile.id).single().then(({ data: v }) => {
      if (!v) { setLoading(false); return }
      supabase
        .from('contact_requests')
        .select('*')
        .eq('vendor_id', v.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => { setInquiries(data || []); setLoading(false) })
    })
  }, [profile])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('contact_requests').update({ status }).eq('id', id)
    setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, status } : i))
  }

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-card" />)}</div>

  return (
    <div>
      <h1 className="font-display text-3xl text-ink font-semibold mb-6">Inquiries</h1>
      {inquiries.length === 0 ? (
        <div className="text-center py-16 text-ink-400 font-body">
          <MessageSquare className="mx-auto mb-3 text-ink-200" size={40} />
          <p>No inquiries yet. Make sure your profile is complete so couples can find you.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((req) => (
            <div key={req.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-body font-semibold text-ink">{req.from_name}</p>
                  <p className="text-ink-400 text-xs font-body">{req.from_email}{req.from_phone && ` · ${req.from_phone}`}</p>
                  {req.event_date && <p className="text-brand text-xs font-body mt-0.5">Event: {formatDate(req.event_date)}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-body font-medium px-2.5 py-1 rounded-pill capitalize ${STATUS_COLORS[req.status] || ''}`}>{req.status}</span>
                  <span className="text-ink-300 text-xs font-body">{formatRelativeTime(req.created_at)}</span>
                </div>
              </div>
              <p className="text-ink-500 font-body text-sm leading-relaxed mb-4">{req.message}</p>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => navigate(`/vendor/chat/${req.id}`)}>
                  <MessageSquare size={13} /> Reply
                </Button>
                {req.status === 'pending' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(req.id, 'responded')}>Mark Responded</Button>
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(req.id, 'declined')}>Decline</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
