import { useAvailabilityStore } from '../../../store/useAvailabilityStore'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function AvailabilitySettings() {
  const settings = useAvailabilityStore((s) => s.settings)
  const setSetting = useAvailabilityStore((s) => s.setSetting)

  const toggleDay = (day: number) => {
    const current = settings.workingDays
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort()
    setSetting('workingDays', next)
  }

  return (
    <div className="border border-border rounded-xl p-4 space-y-4">
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Calendar Settings</p>

      <div>
        <p className="text-sm font-medium text-text mb-2">Working Days</p>
        <div className="flex gap-1.5 flex-wrap">
          {DAY_LABELS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className={`w-9 h-9 rounded-full text-xs font-medium border transition-colors ${
                settings.workingDays.includes(i)
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white text-text-secondary border-border hover:bg-surface'
              }`}
            >
              {label.slice(0, 1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-text mb-2">Default Status</p>
        <div className="flex gap-2">
          {(['available', 'booked', 'tentative'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSetting('defaultStatus', s)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium capitalize transition-colors ${
                settings.defaultStatus === s
                  ? 'bg-brand text-white border-brand'
                  : 'border-border text-text-secondary hover:bg-surface'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
