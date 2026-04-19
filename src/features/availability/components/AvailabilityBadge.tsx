import { Calendar } from 'lucide-react'
import type { DateEntry } from '../../../types/availability'

interface AvailabilityBadgeProps {
  entries: Record<string, DateEntry>
  weddingDate?: string | null
  size?: 'sm' | 'md'
}

function getStatus(entries: Record<string, DateEntry>, weddingDate?: string | null) {
  if (weddingDate) {
    const entry = entries[weddingDate]
    if (!entry) return { label: 'Date unset', color: 'text-gray-500 bg-gray-50 border-gray-200' }
    if (entry.status === 'available') return { label: 'Available your date', color: 'text-green-700 bg-green-50 border-green-200' }
    if (entry.status === 'booked') return { label: 'Booked your date', color: 'text-red-700 bg-red-50 border-red-200' }
    return { label: 'Tentative your date', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' }
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = Object.entries(entries).filter(([k]) => k >= today)
  const availCount = upcoming.filter(([, e]) => e.status === 'available').length
  const total = upcoming.length

  if (total === 0) return { label: 'No dates set', color: 'text-gray-500 bg-gray-50 border-gray-200' }
  if (availCount === 0) return { label: 'Fully booked', color: 'text-red-700 bg-red-50 border-red-200' }
  return { label: `${availCount} dates open`, color: 'text-green-700 bg-green-50 border-green-200' }
}

export function AvailabilityBadge({ entries, weddingDate, size = 'sm' }: AvailabilityBadgeProps) {
  const { label, color } = getStatus(entries, weddingDate)
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${textSize} font-medium ${color}`}>
      <Calendar className={iconSize} />
      {label}
    </span>
  )
}
