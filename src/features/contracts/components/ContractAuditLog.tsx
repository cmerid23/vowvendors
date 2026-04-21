import { useEffect, useState } from 'react'
import { CheckCircle, Send, Eye, FileText, X, Download, RefreshCw } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { ContractAuditEntry } from '../../../types/contracts'

interface Props {
  contractId: string
}

const ACTION_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  created:    { icon: <FileText size={13} />, label: 'Contract created', color: 'text-ink-400' },
  sent:       { icon: <Send size={13} />, label: 'Sent to couple', color: 'text-blue-500' },
  opened:     { icon: <Eye size={13} />, label: 'Link opened', color: 'text-amber-500' },
  viewed:     { icon: <Eye size={13} />, label: 'Contract viewed', color: 'text-amber-500' },
  signed:     { icon: <CheckCircle size={13} />, label: 'Signed by couple', color: 'text-green-500' },
  downloaded: { icon: <Download size={13} />, label: 'PDF downloaded', color: 'text-brand' },
  cancelled:  { icon: <X size={13} />, label: 'Contract cancelled', color: 'text-red-500' },
  reminder_sent: { icon: <RefreshCw size={13} />, label: 'Reminder sent', color: 'text-ink-400' },
}

export function ContractAuditLog({ contractId }: Props) {
  const [entries, setEntries] = useState<ContractAuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('contract_audit_log')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setEntries((data as ContractAuditEntry[]) || [])
        setLoading(false)
      })
  }, [contractId])

  if (loading) return <div className="h-24 bg-ink-50 rounded-xl animate-pulse" />

  if (entries.length === 0) {
    return <p className="font-body text-sm text-ink-400 text-center py-4">No activity yet.</p>
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, idx) => {
        const meta = ACTION_META[entry.action] || { icon: <FileText size={13} />, label: entry.action, color: 'text-ink-400' }
        const isLast = idx === entries.length - 1
        return (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center shrink-0 ${meta.color}`}>
                {meta.icon}
              </div>
              {!isLast && <div className="w-px flex-1 bg-border my-1" />}
            </div>
            <div className="pb-4 min-w-0">
              <p className="font-body text-sm font-medium text-ink">{meta.label}</p>
              {entry.actor_email && (
                <p className="font-body text-xs text-ink-300">{entry.actor_email}</p>
              )}
              <p className="font-body text-xs text-ink-300">
                {new Date(entry.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
