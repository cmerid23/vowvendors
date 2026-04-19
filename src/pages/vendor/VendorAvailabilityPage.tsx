import { useState, useEffect } from 'react'
import { Download, Save, RefreshCw } from 'lucide-react'
import { useAvailabilityStore } from '../../store/useAvailabilityStore'
import { useAuthStore } from '../../store/useAuthStore'
import { supabase } from '../../lib/supabase'
import { AvailabilityCalendar } from '../../features/availability/components/AvailabilityCalendar'
import { BulkActionPanel } from '../../features/availability/components/BulkActionPanel'
import { AvailabilitySettings } from '../../features/availability/components/AvailabilitySettings'
import { UpcomingDates } from '../../features/availability/components/UpcomingDates'
import { DateStatusPicker } from '../../features/availability/components/DateStatusPicker'
import { generateICS, downloadICS } from '../../lib/icsExport'
import type { DateStatus, DateEntry } from '../../types/availability'

export default function VendorAvailabilityPage() {
  const profile = useAuthStore((s) => s.profile)
  const entries = useAvailabilityStore((s) => s.entries)
  const syncing = useAvailabilityStore((s) => s.syncing)
  const setEntry = useAvailabilityStore((s) => s.setEntry)
  const setEntries = useAvailabilityStore((s) => s.setEntries)
  const blockWeekendsInMonth = useAvailabilityStore((s) => s.blockWeekendsInMonth)
  const markWorkingDaysAvailable = useAvailabilityStore((s) => s.markWorkingDaysAvailable)
  const clearMonth = useAvailabilityStore((s) => s.clearMonth)
  const syncToSupabase = useAvailabilityStore((s) => s.syncToSupabase)
  const loadFromSupabase = useAvailabilityStore((s) => s.loadFromSupabase)
  const setVendorId = useAvailabilityStore((s) => s.setVendorId)

  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [applyStatus, setApplyStatus] = useState<DateStatus>('booked')
  const [pickerDate, setPickerDate] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [businessName, setBusinessName] = useState('Vendor')

  useEffect(() => {
    if (!profile?.id) return
    supabase
      .from('vendors')
      .select('id, business_name')
      .eq('user_id', profile.id)
      .single()
      .then(({ data }) => {
        if (!data) return
        setBusinessName(data.business_name)
        setVendorId(data.id)
        loadFromSupabase(data.id)
      })
  }, [profile?.id])

  const handleDayClick = (date: string) => {
    setPickerDate(date)
  }

  const handleSetStatus = (date: string, status: DateStatus | null) => {
    if (status === null) {
      setEntry(date, null)
    } else {
      setEntry(date, { status })
    }
    setPickerDate(null)
  }

  const handleRangeSelect = (dates: string[], status: DateStatus) => {
    const updates: Record<string, DateEntry> = {}
    dates.forEach((d) => { updates[d] = { status } })
    setEntries(updates)
  }

  const handleContextMenu = (date: string) => {
    setPickerDate(date)
  }

  const handleSave = async () => {
    await syncToSupabase()
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  const handleExportICS = () => {
    const content = generateICS(entries, businessName)
    downloadICS(content, `${businessName.replace(/\s+/g, '-').toLowerCase()}-availability.ics`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text">Availability Calendar</h1>
          <p className="text-sm text-text-secondary mt-1">Set your availability so couples know when you're open</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportICS}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-text hover:bg-surface transition-colors"
          >
            <Download className="w-4 h-4" />
            Export .ics
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 disabled:opacity-60 transition-colors"
          >
            {syncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveSuccess ? 'Saved!' : syncing ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="border border-border rounded-xl p-4 relative">
            <AvailabilityCalendar
              entries={entries}
              onDayClick={handleDayClick}
              onRangeSelect={handleRangeSelect}
              onContextMenu={handleContextMenu}
              onNavigate={(y, m) => { setCalYear(y); setCalMonth(m) }}
              applyStatus={applyStatus}
              initialYear={calYear}
              initialMonth={calMonth}
            />
            {pickerDate && (
              <div className="relative">
                <DateStatusPicker
                  dateKey={pickerDate}
                  entry={entries[pickerDate]}
                  onSetStatus={handleSetStatus}
                  onClose={() => setPickerDate(null)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <BulkActionPanel
            year={calYear}
            month={calMonth}
            applyStatus={applyStatus}
            onApplyStatusChange={setApplyStatus}
            onBlockWeekends={() => blockWeekendsInMonth(calYear, calMonth)}
            onMarkWorkdays={() => markWorkingDaysAvailable(calYear, calMonth)}
            onClearMonth={() => clearMonth(calYear, calMonth)}
          />
          <AvailabilitySettings />
          <div className="border border-border rounded-xl p-4">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-3">Upcoming Dates</p>
            <UpcomingDates entries={entries} />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-text-secondary">
        <span className="font-medium text-text">Legend:</span>
        {[
          { color: 'bg-green-500', label: 'Available' },
          { color: 'bg-red-500', label: 'Booked' },
          { color: 'bg-yellow-400', label: 'Tentative' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            {label}
          </span>
        ))}
        <span className="text-text-secondary">· Click a date to set status · Drag to select a range</span>
      </div>
    </div>
  )
}
