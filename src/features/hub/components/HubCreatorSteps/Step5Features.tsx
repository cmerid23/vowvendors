import type { CreateHubData, HubTheme } from '../../../../types/hub'
import { HUB_THEMES } from '../../../../types/hub'

interface Props {
  data: Partial<CreateHubData>
  onChange: (data: Partial<CreateHubData>) => void
}

const TOGGLES: Array<{ key: keyof CreateHubData; label: string; desc: string }> = [
  { key: 'show_timeline', label: 'View timeline', desc: 'Guests can see the day schedule' },
  { key: 'show_photo_wall', label: 'Upload & view photos', desc: 'Live guest photo wall with real-time uploads' },
  { key: 'show_travel', label: 'Travel & hotels', desc: 'Airport, transport, and hotel recommendations' },
  { key: 'show_things_to_do', label: 'Things to do', desc: 'Local activity suggestions for out-of-town guests' },
  { key: 'show_seating', label: 'Browse seating chart', desc: 'Guests can find their table' },
  { key: 'show_song_requests', label: 'Request songs', desc: 'Guests vote for songs for the DJ' },
  { key: 'show_faq', label: 'FAQ', desc: 'Answers to common guest questions' },
  { key: 'show_vendors', label: 'Discover vendors', desc: 'Guests can follow your vendors' },
]

export function Step5Features({ data, onChange }: Props) {
  const toggle = (key: keyof CreateHubData) => {
    onChange({ ...data, [key]: !data[key] })
  }

  return (
    <div className="space-y-6">
      {/* Feature toggles */}
      <div>
        <p className="font-body text-sm font-semibold text-ink mb-3">Choose what guests can do</p>
        <div className="space-y-2">
          {TOGGLES.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-border hover:border-brand/40 transition-all text-left"
            >
              <div>
                <p className="font-body text-sm font-medium text-ink">{label}</p>
                <p className="font-body text-xs text-ink-400">{desc}</p>
              </div>
              <div className={`w-10 h-6 rounded-full flex items-center transition-all px-0.5 shrink-0 ${
                data[key] !== false ? 'bg-brand' : 'bg-ink-200'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  data[key] !== false ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Color themes */}
      <div>
        <p className="font-body text-sm font-semibold text-ink mb-3">Color theme</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {HUB_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onChange({ ...data, theme: theme.id as HubTheme, accent_color: theme.color })}
              className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                (data.theme || 'romantic') === theme.id
                  ? 'border-[var(--tc)] bg-[var(--tc)]/5'
                  : 'border-border hover:border-[var(--tc)]/50'
              }`}
              style={{ '--tc': theme.color } as React.CSSProperties}
            >
              <div className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: theme.color }} />
              <span className="font-body text-sm text-ink">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
