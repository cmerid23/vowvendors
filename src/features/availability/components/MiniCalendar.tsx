import { useState } from 'react'
import { DAY_LABELS, getMonthDays, addMonths, formatMonthYear } from '../../../lib/dateUtils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { DateEntry, DateStatus } from '../../../types/availability'

interface MiniCalendarProps {
  entries: Record<string, DateEntry>
  highlightedDates?: string[]
}

const STATUS_BG: Record<DateStatus, string> = {
  available: 'bg-green-100 text-green-800',
  booked:    'bg-red-100 text-red-800',
  tentative: 'bg-yellow-100 text-yellow-800',
}

export function MiniCalendar({ entries, highlightedDates = [] }: MiniCalendarProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const cells = getMonthDays(year, month)
  const highlightSet = new Set(highlightedDates)

  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const isPrevDisabled = year === currentYear && month === currentMonth

  const navigate = (delta: number) => {
    const { year: y, month: m } = addMonths(year, month, delta)
    setYear(y)
    setMonth(m)
  }

  return (
    <div className="text-xs">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={isPrevDisabled}
          className="p-0.5 rounded hover:bg-surface disabled:opacity-30 disabled:cursor-default"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-text-secondary" />
        </button>
        <span className="font-medium text-text text-xs">{formatMonthYear(year, month)}</span>
        <button
          type="button"
          onClick={() => navigate(1)}
          className="p-0.5 rounded hover:bg-surface"
        >
          <ChevronRight className="w-3.5 h-3.5 text-text-secondary" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-0.5">
        {DAY_LABELS.map((l) => (
          <div key={l} className="text-center text-[10px] text-text-secondary py-0.5">{l.slice(0, 1)}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {cells.map((dateKey, i) => {
          if (!dateKey) return <div key={`e-${i}`} />
          const entry = entries[dateKey]
          const isHighlighted = highlightSet.has(dateKey)
          const todayKey = new Date().toISOString().split('T')[0]
          const isPast = dateKey < todayKey
          const isToday = dateKey === todayKey

          let cls = 'aspect-square flex items-center justify-center rounded text-[11px] '
          if (isPast) cls += 'opacity-30 '
          if (isHighlighted) cls += 'ring-1 ring-purple-400 bg-purple-100 text-purple-800 font-semibold '
          else if (entry) cls += STATUS_BG[entry.status] + ' '
          else cls += 'text-text '
          if (isToday) cls += 'font-bold ring-1 ring-brand/40 '

          return (
            <div key={dateKey} className={cls}>
              {parseInt(dateKey.split('-')[2], 10)}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {[
          { status: 'available', label: 'Avail', color: 'bg-green-400' },
          { status: 'booked',    label: 'Booked', color: 'bg-red-400' },
          { status: 'tentative', label: 'Maybe', color: 'bg-yellow-400' },
        ].map(({ status, label, color }) => (
          <span key={status} className="flex items-center gap-1 text-[10px] text-text-secondary">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
