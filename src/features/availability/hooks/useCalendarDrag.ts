import { useState, useCallback, useRef } from 'react'
import { getDatesInRange } from '../../../lib/dateUtils'

interface UseCalendarDragOptions {
  onRangeSelect: (dates: string[], status: 'booked' | 'available' | 'tentative') => void
  applyStatus: 'booked' | 'available' | 'tentative'
}

export function useCalendarDrag({ onRangeSelect, applyStatus }: UseCalendarDragOptions) {
  const [dragStart, setDragStart] = useState<string | null>(null)
  const [dragEnd, setDragEnd] = useState<string | null>(null)
  const isDragging = useRef(false)

  const dragRange = dragStart && dragEnd ? getDatesInRange(dragStart, dragEnd) : []

  const onDayMouseDown = useCallback((date: string) => {
    isDragging.current = true
    setDragStart(date)
    setDragEnd(date)
  }, [])

  const onDayMouseEnter = useCallback((date: string) => {
    if (isDragging.current) setDragEnd(date)
  }, [])

  const onMouseUp = useCallback(() => {
    if (isDragging.current && dragStart && dragEnd) {
      const range = getDatesInRange(dragStart, dragEnd)
      if (range.length > 1) onRangeSelect(range, applyStatus)
    }
    isDragging.current = false
    setDragStart(null)
    setDragEnd(null)
  }, [dragStart, dragEnd, applyStatus, onRangeSelect])

  // Touch support
  const touchStartDate = useRef<string | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onDayTouchStart = useCallback((date: string) => {
    touchStartDate.current = date
    longPressTimer.current = setTimeout(() => {
      isDragging.current = true
      setDragStart(date)
      setDragEnd(date)
    }, 400)
  }, [])

  const onDayTouchMove = useCallback((date: string) => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
    if (isDragging.current) setDragEnd(date)
  }, [])

  const onDayTouchEnd = useCallback(() => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
    if (isDragging.current && dragStart && dragEnd) {
      const range = getDatesInRange(dragStart, dragEnd)
      if (range.length > 1) onRangeSelect(range, applyStatus)
    }
    isDragging.current = false
    setDragStart(null)
    setDragEnd(null)
  }, [dragStart, dragEnd, applyStatus, onRangeSelect])

  return {
    dragRange,
    isDragging: isDragging.current,
    onDayMouseDown,
    onDayMouseEnter,
    onMouseUp,
    onDayTouchStart,
    onDayTouchMove,
    onDayTouchEnd,
  }
}
