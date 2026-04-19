import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Eye, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import type { ContactRequest, Lead } from '../../types/database'
import { formatRelativeTime } from '../../utils/formatters'

export function VendorOverviewPage() {
  const profile = useAuthStore((s) => s.profile)
  const [vendor, setVendor] = useState<{ id: string; business_name: string; review_count: number; avg_rating: number } | null>(null)
  const [inquiries, setInquiries] = useState<ContactRequest[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      supabase.from('vendors').select('id, business_name, review_count, avg_rating').eq('user_id', profile.id).single(),
    ]).then(([v]) => {
      if (v.data) {
        setVendor(v.data)
        Promise.all([
          supabase.from('contact_requests').select('*').eq('vendor_id', v.data.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('leads').select('*').eq('vendor_id', v.data.id).order('created_at', { ascending: false }).limit(5),
        ]).then(([i, l]) => {
          setInquiries(i.data || [])
          setLeads(l.data || [])
        })
      }
      setLoading(false)
    })
  }, [profile])

  const stats = [
    { label: 'Total Inquiries', value: inquiries.length, icon: MessageSquare, color: 'text-brand' },
    { label: 'New Leads', value: leads.filter((l) => l.status === 'new').length, icon: Users, color: 'text-blue-500' },
    { label: 'Reviews', value: vendor?.review_count || 0, icon: TrendingUp, color: 'text-success' },
    { label: 'Avg Rating', value: vendor?.avg_rating ? vendor.avg_rating.toFixed(1) : '—', icon: Eye, color: 'text-amber-500' },
  ]

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-48 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-card" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink font-semibold">
          Welcome back{vendor ? `, ${vendor.business_name}` : ''}
        </h1>
        <p className="text-ink-400 font-body text-sm mt-1">Here's what's happening with your profile</p>
      </div>

      {!vendor && (
        <div className="card p-6 border-brand/30 border bg-brand/5">
          <h2 className="font-display text-xl text-ink mb-2">Complete your profile</h2>
          <p className="text-ink-400 font-body text-sm mb-4">Set up your vendor profile to start receiving inquiries from couples.</p>
          <Link to="/vendor/profile" className="btn-gold inline-flex">Set Up Profile <ArrowRight size={14} /></Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <Icon size={20} className={`${color} mb-2`} />
            <p className="font-display text-3xl text-ink font-semibold">{value}</p>
            <p className="text-ink-400 font-body text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent inquiries */}
      {inquiries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl text-ink">Recent Inquiries</h2>
            <Link to="/vendor/inquiries" className="text-brand text-xs font-body hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {inquiries.slice(0, 3).map((req) => (
              <div key={req.id} className="card p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="font-body font-medium text-ink text-sm">{req.from_name}</p>
                  <p className="text-ink-400 text-xs font-body mt-0.5 line-clamp-1">{req.message}</p>
                </div>
                <span className="text-ink-300 text-xs font-body shrink-0">{formatRelativeTime(req.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
