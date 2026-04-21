import { TIMELINE_ICONS } from '../../../types/hub'
import { useTimelineHighlight, isEventPast } from '../hooks/useTimelineHighlight'
import type { HubTimelineEvent, WeddingHub } from '../../../types/hub'

interface Props {
  hub: WeddingHub
  events: HubTimelineEvent[]
}

export function HubTimeline({ hub, events }: Props) {
  const currentId = useTimelineHighlight(hub.wedding_date, events)

  if (events.length === 0) return null

  return (
    <section id="timeline" className="px-4 py-10 max-w-lg mx-auto">
      <h2 className="font-display text-2xl font-semibold text-ink text-center mb-8">Today&apos;s Schedule</h2>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[68px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-1">
          {events.map((event) => {
            const isCurrent = event.id === currentId
            const isPast = isEventPast(event.time, hub.wedding_date) && !isCurrent

            return (
              <div
                key={event.id}
                className={`relative flex items-start gap-4 px-0 py-3 rounded-xl transition-all ${
                  isCurrent ? 'bg-[var(--ac)]/8 -mx-3 px-3' : ''
                } ${isPast ? 'opacity-50' : ''}`}
                style={{ '--ac': hub.accent_color } as React.CSSProperties}
              >
                {/* Time */}
                <div className="w-16 shrink-0 pt-0.5">
                  <span className={`font-body text-xs font-medium ${isCurrent ? 'text-[var(--ac)]' : 'text-ink-400'}`}
                    style={{ '--ac': hub.accent_color } as React.CSSProperties}
                  >
                    {event.time}
                  </span>
                </div>

                {/* Dot */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-base transition-all ${
                    isCurrent
                      ? 'shadow-lg scale-110'
                      : 'bg-white border border-border'
                  }`}
                  style={isCurrent ? { backgroundColor: hub.accent_color } : {}}
                >
                  {TIMELINE_ICONS[event.icon] || '💛'}
                </div>

                {/* Content */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-body text-sm font-semibold ${isCurrent ? 'text-ink' : 'text-ink'}`}>
                      {event.title}
                    </p>
                    {isCurrent && (
                      <span
                        className="text-xs font-body font-semibold px-2 py-0.5 rounded-full text-white animate-pulse"
                        style={{ backgroundColor: hub.accent_color }}
                      >
                        Now
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="font-body text-xs text-ink-400 mt-0.5">{event.description}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
