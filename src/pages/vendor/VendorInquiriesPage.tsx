import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import type { ContactRequest } from '../../types/database'
import { formatDate, formatRelativeTime } from '../../utils/formatters'
import { MessageSquare, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { LeadVerifiedBadge } from '../../features/verification/components/LeadVerifiedBadge'
import { VerificationStats } from '../../features/verification/components/VerificationStats'
import { getLevel } from '../../features/verification/verificationScore'

interface BudgetLead {
  id: string
  name: string
  email: string
  state: string | null
  event_date: string | null
  message: string | null
  service_interest: string[] | null
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  responded: 'bg-blue-100 text-blue-700',
  agreed: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
}

export function VendorInquiriesPage() {
  const profile = useAuthStore((s) => s.profile)
  const navigate = useNavigate()
  const [vendorId, setVendorId] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [inquiries, setInquiries] = useState<(ContactRequest & { verification_score?: number })[]>([])
  const [budgetLeads, setBudgetLeads] = useState<BudgetLead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase.from('vendors').select('id').eq('user_id', profile.id).single().then(({ data: v }) => {
      if (!v) { setLoading(false); return }
      setVendorId(v.id)
      Promise.all([
        supabase
          .from('contact_requests')
          .select('*')
          .eq('vendor_id', v.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('leads')
          .select('id, name, email, state, event_date, message, service_interest, created_at')
          .eq('vendor_id', v.id)
          .eq('source', 'budget-matcher')
          .order('created_at', { ascending: false }),
      ]).then(([inq, leads]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setInquiries((inq.data as any) || [])
        setBudgetLeads((leads.data as BudgetLead[]) || [])
        setLoading(false)
      })
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

      {vendorId && <div className="mb-6"><VerificationStats vendorId={vendorId} /></div>}

      {budgetLeads.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-brand" />
            <h2 className="font-semibold text-text">Budget Matched Leads</h2>
            <span className="bg-brand text-white text-xs font-bold px-2 py-0.5 rounded-full">{budgetLeads.length}</span>
          </div>
          <div className="space-y-3">
            {budgetLeads.map((lead) => (
              <div key={lead.id} className="card p-4 border-brand/20 bg-brand/5">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text text-sm">{lead.email}</p>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-bold">
                        <Sparkles className="w-3 h-3" /> Budget Matched
                      </span>
                    </div>
                    {lead.state && <p className="text-xs text-text-secondary">{lead.state}</p>}
                  </div>
                  <span className="text-xs text-text-secondary shrink-0">{formatRelativeTime(lead.created_at)}</span>
                </div>
                {lead.event_date && (
                  <p className="text-xs text-brand">Event: {formatDate(lead.event_date)}</p>
                )}
                {lead.message && (
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{lead.message}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {inquiries.length === 0 ? (
        <div className="text-center py-16 text-ink-400 font-body">
          <MessageSquare className="mx-auto mb-3 text-ink-200" size={40} />
          <p>No inquiries yet. Make sure your profile is complete so couples can find you.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((req) => {
            const score = req.verification_score ?? 0
            const level = getLevel(score)
            return (
              <div key={req.id} className="card p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-body font-semibold text-ink">{req.from_name}</p>
                      <LeadVerifiedBadge level={level} score={score > 0 ? score : undefined} />
                    </div>
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
            )
          })}
        </div>
      )}
    </div>
  )
}
