import type { DateEntry } from '../types/availability'
import { fromDateKey } from './dateUtils'

function icsDate(key: string): string {
  const d = fromDateKey(key)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export function generateICS(entries: Record<string, DateEntry>, vendorName: string): string {
  const now = new Date()
  const stamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const events = Object.entries(entries)
    .filter(([, e]) => e.status === 'booked' || e.status === 'tentative')
    .map(([key, entry]) => {
      const dateStr = icsDate(key)
      const nextDay = new Date(fromDateKey(key))
      nextDay.setDate(nextDay.getDate() + 1)
      const endDateStr = icsDate(
        `${nextDay.getFullYear()}-${String(nextDay.getMonth()+1).padStart(2,'0')}-${String(nextDay.getDate()).padStart(2,'0')}`
      )
      const status = entry.status === 'booked' ? 'CONFIRMED' : 'TENTATIVE'
      const summary = entry.status === 'booked' ? `${vendorName} — Booked` : `${vendorName} — Tentative`
      const uid = `${key}-${vendorName.replace(/\s+/g, '')}-vowvendors`
      return [
        'BEGIN:VEVENT',
        `UID:${escapeICS(uid)}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${endDateStr}`,
        `SUMMARY:${escapeICS(summary)}`,
        `STATUS:${status}`,
        entry.note ? `DESCRIPTION:${escapeICS(entry.note)}` : '',
        'END:VEVENT',
      ].filter(Boolean).join('\r\n')
    })

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VowVendors//Availability//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(vendorName)} Availability`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
