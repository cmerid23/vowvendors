import { X } from 'lucide-react'
import { formatShortDate } from '../../../lib/dateUtils'
import type { DateEntry, DateStatus } from '../../../types/availability'

interface DateStatusPickerProps {
  dateKey: string
  entry?: DateEntry
  onSetStatus: (date: string, status: DateStatus | null) => void
  onClose: () => void
}

const OPTIONS: { status: DateStatus; label: string; color: string }[] = [
  { status: 'available', label: 'Available', color: 'bg-green-500' },
  { status: 'booked',    label: 'Booked',    color: 'bg-red-500' },
  { status: 'tentative', label: 'Tentative', color: 'bg-yellow-400' },
]

export function DateStatusPicker({ dateKey, entry, onSetStatus, onClose }: DateStatusPickerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Bottom sheet on mobile, popover feel on desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl p-5 sm:absolute sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-full sm:mt-2 sm:w-56 sm:rounded-xl sm:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-text">{formatShortDate(dateKey)}</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {OPTIONS.map(({ status, label, color }) => (
            <button
              key={status}
              type="button"
              onClick={() => { onSetStatus(dateKey, status); onClose() }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                entry?.status === status
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-border hover:bg-surface text-text'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
              {label}
            </button>
          ))}

          {entry && (
            <button
              type="button"
              onClick={() => { onSetStatus(dateKey, null); onClose() }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border hover:bg-surface text-sm text-text-secondary transition-colors mt-1"
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-gray-300" />
              Clear
            </button>
          )}
        </div>
      </div>
    </>
  )
}
