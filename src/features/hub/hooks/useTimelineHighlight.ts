import { useEffect, useState } from 'react'
import type { HubTimelineEvent } from '../../../types/hub'

function parseEventTime(timeStr: string, date: Date): Date {
  const parts = timeStr.trim().split(' ')
  const period = parts[1]?.toUpperCase()
  const [hoursStr, minutesStr] = (parts[0] || '12:00').split(':')
  let h = parseInt(hoursStr, 10) || 0
  const m = parseInt(minutesStr, 10) || 0
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  const result = new Date(date)
  result.setHours(h, m, 0, 0)
  return result
}

export function useTimelineHighlight(
  weddingDate: string | Date,
  events: HubTimelineEvent[],
): string | null {
  const [currentEventId, setCurrentEventId] = useState<string | null>(null)

  useEffect(() => {
    if (!events.length) return

    const update = () => {
      const now = new Date()
      const wd = typeof weddingDate === 'string' ? new Date(weddingDate) : weddingDate

      const isWeddingDay = now.toDateString() === wd.toDateString()
      if (!isWeddingDay) { setCurrentEventId(null); return }

      const sorted = [...events].sort((a, b) => {
        return parseEventTime(a.time, wd).getTime() - parseEventTime(b.time, wd).getTime()
      })

      let current: HubTimelineEvent | null = null
      for (const event of sorted) {
        if (parseEventTime(event.time, wd) <= now) current = event
      }
      setCurrentEventId(current?.id ?? null)
    }

    update()
    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [weddingDate, events])

  return currentEventId
}

export function isEventPast(timeStr: string, weddingDate: string | Date): boolean {
  const wd = typeof weddingDate === 'string' ? new Date(weddingDate) : weddingDate
  return parseEventTime(timeStr, wd) < new Date()
}
