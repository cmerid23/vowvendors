const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatMonthYear(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`
}

export function formatShortDate(key: string): string {
  const d = fromDateKey(key)
  return `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export function isPastDate(key: string): boolean {
  const today = toDateKey(new Date())
  return key < today
}

export function isToday(key: string): boolean {
  return key === toDateKey(new Date())
}

export function getMonthDays(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (string | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toDateKey(new Date(year, month, d)))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function getWeekendDatesInMonth(year: number, month: number): string[] {
  const result: string[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const day = date.getDay()
    if (day === 0 || day === 6) result.push(toDateKey(date))
  }
  return result
}

export function getDatesInMonth(year: number, month: number): string[] {
  const result: string[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    result.push(toDateKey(new Date(year, month, d)))
  }
  return result
}

export function getWorkingDaysInMonth(year: number, month: number, workingDays: number[]): string[] {
  return getDatesInMonth(year, month).filter((key) => {
    const date = fromDateKey(key)
    return workingDays.includes(date.getDay())
  })
}

export function getDatesInRange(start: string, end: string): string[] {
  const result: string[] = []
  const s = fromDateKey(start < end ? start : end)
  const e = fromDateKey(start < end ? end : start)
  const cur = new Date(s)
  while (cur <= e) {
    result.push(toDateKey(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return result
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(year, month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}

export const DAY_LABELS = DAY_NAMES
export const MONTH_LABELS = MONTH_NAMES
