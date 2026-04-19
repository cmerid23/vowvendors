import { formatShortDate } from '../../../lib/dateUtils'
import type { DateEntry, DateStatus } from '../../../types/availability'

interface UpcomingDatesProps {
  entries: Record<string, DateEntry>
  limit?: number
}

const STATUS_STYLES: Record<DateStatus, string> = {
  available: 'text-green-700 bg-green-50 border-green-200',
  booked:    'text-red-700 bg-red-50 border-red-200',
  tentative: 'text-yellow-700 bg-yellow-50 border-yellow-200',
}

export function UpcomingDates({ entries, limit = 5 }: UpcomingDatesProps) {
  const today = new Date().toISOString().split('T')[0]

  const upcoming = Object.entries(entries)
    .filter(([key]) => key >= today)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, limit)

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-text-secondary">
        No upcoming dates set
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {upcoming.map(([key, entry]) => (
        <div key={key} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-surface">
          <span className="text-sm text-text">{formatShortDate(key)}</span>
          <span className={`px-2 py-0.5 rounded-full border text-xs font-medium capitalize ${STATUS_STYLES[entry.status]}`}>
            {entry.status}
          </span>
        </div>
      ))}
    </div>
  )
}
