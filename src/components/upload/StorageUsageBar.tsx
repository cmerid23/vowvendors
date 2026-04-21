import { useEffect } from 'react'
import { Zap } from 'lucide-react'
import { useStorageStore } from '../../store/useStorageStore'
import { useAuthStore } from '../../store/useAuthStore'
import { formatBytes } from '../../lib/clientCompression'

interface Props {
  compact?: boolean
}

export function StorageUsageBar({ compact }: Props) {
  const user = useAuthStore((s) => s.user)
  const { quota, loadingQuota, loadQuota } = useStorageStore()

  useEffect(() => {
    if (user) loadQuota(user.id)
  }, [user, loadQuota])

  if (!user || loadingQuota || !quota) return null
  if (quota.planName === 'standard' && !compact) return null // unlimited — no need to show bar

  const { usedBytes, limitBytes, usedPercent, downloadsThisMonth, downloadLimitMonthly, warningLevel } = quota

  const barColor =
    warningLevel === 'exceeded' ? 'bg-red-500' :
    warningLevel === 'critical' ? 'bg-amber-500' :
    warningLevel === 'warning'  ? 'bg-amber-400' :
    'bg-brand'

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(usedPercent, 100)}%` }} />
        </div>
        <span className="font-body text-xs text-ink-400 whitespace-nowrap">
          {formatBytes(usedBytes)} / {limitBytes ? formatBytes(limitBytes) : '∞'}
        </span>
      </div>
    )
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-body text-sm font-semibold text-ink">Your storage</h3>
        {warningLevel !== 'none' && (
          <span className={`text-xs font-body px-2 py-0.5 rounded-full ${warningLevel === 'exceeded' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
            {warningLevel === 'exceeded' ? 'Storage full' : warningLevel === 'critical' ? 'Almost full' : 'Getting full'}
          </span>
        )}
      </div>

      {/* Storage bar */}
      <div className="space-y-1">
        <div className="h-2.5 bg-ink-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(usedPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs font-body text-ink-400">
          <span>{formatBytes(usedBytes)} used</span>
          <span>{limitBytes ? formatBytes(limitBytes) : 'Unlimited'}</span>
        </div>
      </div>

      {/* Download tracking */}
      {downloadLimitMonthly !== null && (
        <div className="flex items-center justify-between text-xs font-body pt-1 border-t border-border">
          <span className="text-ink-400">Downloads this month</span>
          <span className={`font-medium ${downloadsThisMonth >= downloadLimitMonthly ? 'text-red-500' : 'text-ink'}`}>
            {downloadsThisMonth} / {downloadLimitMonthly}
          </span>
        </div>
      )}

      {/* Upgrade CTA */}
      {(warningLevel === 'warning' || warningLevel === 'critical' || warningLevel === 'exceeded') && (
        <button className="w-full flex items-center justify-center gap-1.5 text-xs font-body font-semibold text-white bg-brand hover:bg-brand/90 py-2 rounded-lg transition-colors">
          <Zap size={12} /> Upgrade to Unlimited — $5/month
        </button>
      )}
    </div>
  )
}
