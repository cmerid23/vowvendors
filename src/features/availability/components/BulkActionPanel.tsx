import { CalendarDays, Sun, Trash2 } from 'lucide-react'
import type { DateStatus } from '../../../types/availability'
import { MONTH_LABELS } from '../../../lib/dateUtils'

interface BulkActionPanelProps {
  year: number
  month: number
  onBlockWeekends: () => void
  onMarkWorkdays: () => void
  onClearMonth: () => void
  applyStatus: DateStatus
  onApplyStatusChange: (s: DateStatus) => void
}

const STATUS_OPTIONS: { value: DateStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: 'text-green-700 bg-green-50 border-green-200' },
  { value: 'booked',    label: 'Booked',    color: 'text-red-700 bg-red-50 border-red-200' },
  { value: 'tentative', label: 'Tentative', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
]

export function BulkActionPanel({
  year, month,
  onBlockWeekends, onMarkWorkdays, onClearMonth,
  applyStatus, onApplyStatusChange,
}: BulkActionPanelProps) {
  return (
    <div className="border border-border rounded-xl p-4 space-y-3">
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Bulk Actions — {MONTH_LABELS[month]} {year}</p>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map(({ value, label, color }) => (
          <button
            key={value}
            type="button"
            onClick={() => onApplyStatusChange(value)}
            className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${
              applyStatus === value ? color : 'border-border text-text-secondary hover:bg-surface'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onMarkWorkdays}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text hover:bg-surface transition-colors"
        >
          <Sun className="w-3.5 h-3.5 text-yellow-500" />
          Mark workdays {applyStatus}
        </button>
        <button
          type="button"
          onClick={onBlockWeekends}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text hover:bg-surface transition-colors"
        >
          <CalendarDays className="w-3.5 h-3.5 text-text-secondary" />
          Block weekends
        </button>
        <button
          type="button"
          onClick={onClearMonth}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear month
        </button>
      </div>
    </div>
  )
}
