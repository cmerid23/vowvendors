import { useState } from 'react'
import { DAY_LABELS } from '../../../lib/dateUtils'
import { getMonthDays } from '../../../lib/dateUtils'
import { CalendarHeader } from './CalendarHeader'
import { CalendarDay } from './CalendarDay'
import { useCalendarDrag } from '../hooks/useCalendarDrag'
import type { DateEntry, DateStatus } from '../../../types/availability'

interface AvailabilityCalendarProps {
  entries: Record<string, DateEntry>
  onDayClick?: (date: string) => void
  onRangeSelect?: (dates: string[], status: DateStatus) => void
  onContextMenu?: (date: string, e: React.MouseEvent) => void
  onNavigate?: (year: number, month: number) => void
  selectedDate?: string | null
  highlightedDates?: string[]
  applyStatus?: DateStatus
  readOnly?: boolean
  initialYear?: number
  initialMonth?: number
}

export function AvailabilityCalendar({
  entries,
  onDayClick,
  onRangeSelect,
  onContextMenu,
  onNavigate,
  selectedDate,
  highlightedDates = [],
  applyStatus = 'booked',
  readOnly = false,
  initialYear,
  initialMonth,
}: AvailabilityCalendarProps) {
  const today = new Date()
  const [year, setYear] = useState(initialYear ?? today.getFullYear())
  const [month, setMonth] = useState(initialMonth ?? today.getMonth())

  const cells = getMonthDays(year, month)

  const handleRangeSelect = (dates: string[], status: DateStatus) => {
    onRangeSelect?.(dates, status)
  }

  const {
    dragRange,
    onDayMouseDown,
    onDayMouseEnter,
    onMouseUp,
    onDayTouchStart,
    onDayTouchMove,
    onDayTouchEnd,
  } = useCalendarDrag({ onRangeSelect: handleRangeSelect, applyStatus })

  const dragSet = new Set(dragRange)
  const highlightSet = new Set(highlightedDates)

  return (
    <div
      className="select-none"
      onMouseUp={!readOnly ? onMouseUp : undefined}
      onMouseLeave={!readOnly ? onMouseUp : undefined}
    >
      <CalendarHeader
        year={year}
        month={month}
        onNavigate={(y, m) => { setYear(y); setMonth(m); onNavigate?.(y, m) }}
        readOnly={readOnly}
      />

      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-text-secondary py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((dateKey, i) =>
          dateKey ? (
            <CalendarDay
              key={dateKey}
              dateKey={dateKey}
              entry={entries[dateKey]}
              isSelected={selectedDate === dateKey}
              isDragHighlight={dragSet.has(dateKey)}
              isHighlighted={highlightSet.has(dateKey)}
              readOnly={readOnly}
              onClick={onDayClick}
              onContextMenu={onContextMenu}
              onMouseDown={!readOnly ? onDayMouseDown : undefined}
              onMouseEnter={!readOnly ? onDayMouseEnter : undefined}
              onTouchStart={!readOnly ? onDayTouchStart : undefined}
              onTouchMove={!readOnly ? onDayTouchMove : undefined}
              onTouchEnd={!readOnly ? onDayTouchEnd : undefined}
            />
          ) : (
            <div key={`empty-${i}`} />
          )
        )}
      </div>
    </div>
  )
}
