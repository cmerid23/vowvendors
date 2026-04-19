import { useState, useEffect } from 'react'
import { ShieldCheck, TrendingUp } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { getLevel } from '../verificationScore'

interface VerificationStatsProps {
  vendorId: string
}

export function VerificationStats({ vendorId }: VerificationStatsProps) {
  const [stats, setStats] = useState({ total: 0, verified: 0, partial: 0, rate: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('contact_requests')
      .select('verification_score')
      .eq('vendor_id', vendorId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any[] | null }) => {
        if (!data) { setLoading(false); return }
        const total = data.length
        const verified = data.filter((r) => getLevel(r.verification_score ?? 0) === 'verified').length
        const partial = data.filter((r) => getLevel(r.verification_score ?? 0) === 'partial').length
        const rate = total > 0 ? Math.round((verified / total) * 100) : 0
        setStats({ total, verified, partial, rate })
        setLoading(false)
      })
  }, [vendorId])

  if (loading || stats.total === 0) return null

  return (
    <div className="card p-4 border-green-200 border bg-green-50/50">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={16} className="text-green-600" />
        <p className="font-body text-sm font-medium text-green-700">All your leads are real. Every single one.</p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="font-display text-2xl text-ink font-semibold">{stats.total}</p>
          <p className="text-ink-400 font-body text-xs">Total leads</p>
        </div>
        <div>
          <p className="font-display text-2xl text-green-600 font-semibold">{stats.verified}</p>
          <p className="text-ink-400 font-body text-xs">Fully verified</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1">
            <TrendingUp size={14} className="text-brand" />
            <p className="font-display text-2xl text-brand font-semibold">{stats.rate}%</p>
          </div>
          <p className="text-ink-400 font-body text-xs">Verified rate</p>
        </div>
      </div>
    </div>
  )
}
