export type DateStatus = 'available' | 'booked' | 'tentative'

export interface DateEntry {
  status: DateStatus
  note?: string
}

export interface AvailabilitySettings {
  workingDays: number[] // 0=Sun, 1=Mon ... 6=Sat
  defaultStatus: DateStatus
}

export interface AvailabilityState {
  entries: Record<string, DateEntry>
  settings: AvailabilitySettings
  vendorId: string | null
}
