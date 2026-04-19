import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthYear, addMonths } from '../../../lib/dateUtils'

interface CalendarHeaderProps {
  year: number
  month: number
  onNavigate: (year: number, month: number) => void
  readOnly?: boolean
}

export function CalendarHeader({ year, month, onNavigate, readOnly }: CalendarHeaderProps) {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const isPrevDisabled = year === currentYear && month === currentMonth

  const handlePrev = () => {
    if (isPrevDisabled) return
    const { year: y, month: m } = addMonths(year, month, -1)
    onNavigate(y, m)
  }

  const handleNext = () => {
    const { year: y, month: m } = addMonths(year, month, 1)
    onNavigate(y, m)
  }

  return (
    <div className="flex items-center justify-between px-1 mb-3">
      <button
        type="button"
        onClick={handlePrev}
        disabled={isPrevDisabled}
        className="p-1.5 rounded-lg hover:bg-surface disabled:opacity-30 disabled:cursor-default transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-4 h-4 text-text-secondary" />
      </button>

      <h3 className="text-sm font-semibold font-heading text-text">
        {formatMonthYear(year, month)}
      </h3>

      {!readOnly && (
        <button
          type="button"
          onClick={handleNext}
          className="p-1.5 rounded-lg hover:bg-surface transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 text-text-secondary" />
        </button>
      )}
      {readOnly && <div className="w-7" />}
    </div>
  )
}
