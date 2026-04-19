import { AlertCircle, CalendarX } from 'lucide-react'
import type { DateEntry } from '../../../types/availability'
import { formatShortDate } from '../../../lib/dateUtils'

interface UnavailableBannerProps {
  weddingDate: string
  entry?: DateEntry
}

export function UnavailableBanner({ weddingDate, entry }: UnavailableBannerProps) {
  if (!entry || entry.status === 'available') return null

  const isBooked = entry.status === 'booked'

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
      isBooked
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }`}>
      {isBooked
        ? <CalendarX className="w-5 h-5 shrink-0 mt-0.5" />
        : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
      }
      <div>
        <p className="text-sm font-semibold">
          {isBooked ? 'Not available on your date' : 'Tentatively booked on your date'}
        </p>
        <p className="text-xs mt-0.5 opacity-80">
          {formatShortDate(weddingDate)} — {isBooked
            ? 'This vendor is already booked for your wedding date.'
            : 'This vendor may be booked on your date. Contact them to confirm.'}
        </p>
      </div>
    </div>
  )
}
