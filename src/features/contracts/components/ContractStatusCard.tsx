import { useState } from 'react'
import { Edit2, Send, Bell, Download, Eye, Copy, X, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Contract, ContractStatus } from '../../../types/contracts'

interface Props {
  contract: Contract
  onSendReminder: (id: string) => Promise<void>
  onDownloadPDF: (id: string) => Promise<void>
  onCancelContract: (id: string) => Promise<void>
  onDuplicateContract: (id: string) => void
  onSend: (id: string) => Promise<void>
}

const STATUS_STYLES: Record<ContractStatus, { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'bg-ink-100 text-ink-400' },
  sent:      { label: 'Sent',      className: 'bg-blue-100 text-blue-600' },
  viewed:    { label: 'Viewed',    className: 'bg-amber-100 text-amber-600' },
  signed:    { label: 'Signed ✓',  className: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-500' },
}

export function ContractStatusCard({ contract, onSendReminder, onDownloadPDF, onCancelContract, onDuplicateContract, onSend }: Props) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState<string | null>(null)
  const status = STATUS_STYLES[contract.status]

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key)
    try { await fn() } finally { setBusy(null) }
  }

  const formattedDate = contract.wedding_date
    ? new Date(contract.wedding_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  const signedAt = contract.signed_at
    ? new Date(contract.signed_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null

  const viewedAt = contract.viewed_at
    ? new Date(contract.viewed_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <div className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
      {/* Status dot */}
      <div className="sm:w-2 sm:h-auto w-full h-2 rounded-full sm:rounded-lg shrink-0 self-stretch"
        style={{ background: contract.status === 'signed' || contract.status === 'completed' ? '#22c55e' : contract.status === 'sent' || contract.status === 'viewed' ? '#3b82f6' : '#d1d5db' }}
      />

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-display text-lg font-semibold text-ink truncate">{contract.couple_name}</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${status.className}`}>
            {status.label}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm font-body text-ink-400">
          <span>{formattedDate}</span>
          {contract.package_name && <span>{contract.package_name}</span>}
          {contract.package_price && <span>${Number(contract.package_price).toLocaleString()}</span>}
        </div>
        {signedAt && <p className="text-xs font-body text-green-600 mt-1">Signed {signedAt}</p>}
        {viewedAt && contract.status === 'viewed' && (
          <p className="text-xs font-body text-amber-600 mt-1">Opened {viewedAt}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {contract.status === 'draft' && (
          <>
            <ActionBtn icon={<Edit2 size={13} />} label="Edit" onClick={() => navigate(`/vendor/contracts/${contract.id}/edit`)} />
            <ActionBtn
              icon={busy === 'send' ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              label="Send"
              onClick={() => run('send', () => onSend(contract.id))}
              primary
            />
          </>
        )}
        {(contract.status === 'sent' || contract.status === 'viewed') && (
          <>
            <ActionBtn
              icon={busy === 'reminder' ? <Loader2 size={13} className="animate-spin" /> : <Bell size={13} />}
              label="Remind"
              onClick={() => run('reminder', () => onSendReminder(contract.id))}
            />
            <a
              href={`/sign/${contract.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border text-xs font-body text-ink-400 hover:text-brand hover:border-brand transition-colors"
            >
              <Eye size={13} /> Preview
            </a>
            <ActionBtn
              icon={<X size={13} />}
              label="Cancel"
              onClick={() => onCancelContract(contract.id)}
              danger
            />
          </>
        )}
        {(contract.status === 'signed' || contract.status === 'completed') && (
          <>
            <ActionBtn
              icon={busy === 'pdf' ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              label="PDF"
              onClick={() => run('pdf', () => onDownloadPDF(contract.id))}
              primary
            />
            <ActionBtn icon={<Copy size={13} />} label="Duplicate" onClick={() => onDuplicateContract(contract.id)} />
          </>
        )}
      </div>
    </div>
  )
}

function ActionBtn({
  icon,
  label,
  onClick,
  primary,
  danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  primary?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors ${
        primary
          ? 'bg-brand text-white hover:bg-brand/90'
          : danger
            ? 'border border-red-200 text-red-400 hover:text-red-600 hover:border-red-400'
            : 'border border-border text-ink-400 hover:text-ink hover:border-ink-300'
      }`}
    >
      {icon} {label}
    </button>
  )
}
