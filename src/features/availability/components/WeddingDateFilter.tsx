import { Calendar, X } from 'lucide-react'

interface WeddingDateFilterProps {
  value: string
  onChange: (date: string) => void
  onClear: () => void
}

export function WeddingDateFilter({ value, onChange, onClear }: WeddingDateFilterProps) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
        <input
          type="date"
          value={value}
          min={today}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          placeholder="Filter by wedding date"
        />
      </div>
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="p-2 rounded-lg border border-border hover:bg-surface text-text-secondary transition-colors"
          aria-label="Clear date filter"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
