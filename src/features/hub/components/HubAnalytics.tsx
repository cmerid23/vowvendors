import { Smartphone, Users, Camera, Heart, Music } from 'lucide-react'
import { useHubAnalytics } from '../hooks/useHubAnalytics'

interface Props {
  hubId: string
}

export function HubAnalytics({ hubId }: Props) {
  const { analytics, isLoading } = useHubAnalytics(hubId)

  if (isLoading || !analytics) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card p-4 animate-pulse h-20" />
        ))}
      </div>
    )
  }

  const stats = [
    { icon: Smartphone, label: 'QR Scans', value: analytics.totalScans, sub: 'unique visits' },
    { icon: Users, label: 'Guest Accounts', value: analytics.totalGuestAccounts, sub: 'new signups' },
    { icon: Camera, label: 'Photos', value: analytics.totalPhotos, sub: 'uploaded' },
    { icon: Heart, label: 'Likes', value: analytics.totalLikes, sub: 'across all photos' },
    { icon: Music, label: 'Song Requests', value: analytics.totalSongRequests, sub: 'requested' },
  ]

  return (
    <div className="space-y-4">
      <p className="font-body text-sm font-semibold text-ink">Live Hub Stats</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className="text-brand" />
              <span className="font-body text-xs text-ink-400">{label}</span>
            </div>
            <p className="font-display text-2xl font-semibold text-ink">{value.toLocaleString()}</p>
            <p className="font-body text-xs text-ink-300">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
