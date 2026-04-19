import type { DateEntry } from '../../../types/availability'
import { isPastDate, isToday } from '../../../lib/dateUtils'

interface CalendarDayProps {
  dateKey: string
  entry?: DateEntry
  isSelected?: boolean
  isDragHighlight?: boolean
  isHighlighted?: boolean
  readOnly?: boolean
  onClick?: (date: string) => void
  onContextMenu?: (date: string, e: React.MouseEvent) => void
  onMouseDown?: (date: string) => void
  onMouseEnter?: (date: string) => void
  onTouchStart?: (date: string) => void
  onTouchMove?: (date: string, e: React.TouchEvent) => void
  onTouchEnd?: (date: string) => void
}

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-green-50 text-green-800 border-green-200',
  booked:    'bg-red-50 text-red-800 border-red-200',
  tentative: 'bg-yellow-50 text-yellow-800 border-yellow-200',
}

const STATUS_DOT: Record<string, string> = {
  available: 'bg-green-500',
  booked:    'bg-red-500',
  tentative: 'bg-yellow-400',
}

export function CalendarDay({
  dateKey, entry, isSelected, isDragHighlight, isHighlighted,
  readOnly, onClick, onContextMenu, onMouseDown, onMouseEnter,
  onTouchStart, onTouchMove, onTouchEnd,
}: CalendarDayProps) {
  const day = parseInt(dateKey.split('-')[2], 10)
  const past = isPastDate(dateKey)
  const today = isToday(dateKey)

  let baseClass = 'relative w-full aspect-square flex flex-col items-center justify-center rounded-lg border text-sm font-body select-none transition-colors duration-100 '

  if (past) {
    baseClass += 'opacity-30 cursor-default border-transparent '
  } else if (readOnly) {
    baseClass += 'cursor-default '
  } else {
    baseClass += 'cursor-pointer '
  }

  if (isDragHighlight) {
    baseClass += 'ring-2 ring-brand bg-brand/10 border-brand/30 '
  } else if (isHighlighted) {
    baseClass += 'ring-2 ring-purple-400 bg-purple-50 border-purple-200 '
  } else if (entry) {
    baseClass += STATUS_STYLES[entry.status] + ' '
  } else {
    baseClass += 'bg-white border-border hover:bg-surface '
  }

  if (today) baseClass += 'font-semibold ring-1 ring-brand/40 '

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    const dateAttr = el?.closest('[data-date]')?.getAttribute('data-date')
    if (dateAttr && onTouchMove) onTouchMove(dateAttr, e)
  }

  return (
    <button
      data-date={dateKey}
      className={baseClass}
      disabled={past && !readOnly}
      onClick={!past && !readOnly ? () => onClick?.(dateKey) : undefined}
      onContextMenu={!past && !readOnly ? (e) => { e.preventDefault(); onContextMenu?.(dateKey, e) } : undefined}
      onMouseDown={!past && !readOnly ? () => onMouseDown?.(dateKey) : undefined}
      onMouseEnter={!past && !readOnly ? () => onMouseEnter?.(dateKey) : undefined}
      onTouchStart={!past && !readOnly ? () => onTouchStart?.(dateKey) : undefined}
      onTouchMove={!past && !readOnly ? handleTouchMove : undefined}
      onTouchEnd={!past && !readOnly ? () => onTouchEnd?.(dateKey) : undefined}
    >
      <span className="text-xs leading-none">{day}</span>
      {entry && !isDragHighlight && (
        <span className={`absolute bottom-1 w-1 h-1 rounded-full ${STATUS_DOT[entry.status]}`} />
      )}
      {isSelected && (
        <span className="absolute inset-0 rounded-lg ring-2 ring-brand pointer-events-none" />
      )}
    </button>
  )
}
