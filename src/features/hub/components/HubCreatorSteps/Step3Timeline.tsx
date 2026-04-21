import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { TIMELINE_ICONS, TIMELINE_PRESETS } from '../../../../types/hub'
import type { CreateTimelineEvent } from '../../../../types/hub'

interface Props {
  events: CreateTimelineEvent[]
  onChange: (events: CreateTimelineEvent[]) => void
}

const BLANK: CreateTimelineEvent = { time: '', title: '', description: '', icon: 'heart', display_order: 0 }

export function Step3Timeline({ events, onChange }: Props) {
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState<CreateTimelineEvent>(BLANK)

  const addPreset = (preset: typeof TIMELINE_PRESETS[0]) => {
    if (events.some((e) => e.title === preset.title)) return
    onChange([...events, { ...preset, display_order: events.length }])
  }

  const startEdit = (i: number) => {
    setDraft({ ...events[i] })
    setEditing(i)
  }

  const saveEdit = () => {
    if (!draft.title || !draft.time) return
    if (editing === -1) {
      onChange([...events, { ...draft, display_order: events.length }])
    } else if (editing !== null) {
      onChange(events.map((e, i) => i === editing ? draft : e))
    }
    setEditing(null)
    setDraft(BLANK)
  }

  const remove = (i: number) => {
    onChange(events.filter((_, idx) => idx !== i))
    if (editing === i) setEditing(null)
  }

  return (
    <div className="space-y-5">
      <p className="font-body text-sm text-ink-400">
        Build your wedding day schedule. Guests see what is happening and when.
        The current event is highlighted automatically on the wedding day.
      </p>

      {/* Presets */}
      <div>
        <p className="font-body text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">Quick add</p>
        <div className="flex flex-wrap gap-2">
          {TIMELINE_PRESETS.map((p) => {
            const added = events.some((e) => e.title === p.title)
            return (
              <button
                key={p.title}
                onClick={() => addPreset(p)}
                disabled={added}
                className={`text-xs font-body px-3 py-1.5 rounded-full border transition-all ${
                  added
                    ? 'border-brand/30 bg-brand/10 text-brand cursor-default'
                    : 'border-border hover:border-brand hover:text-brand'
                }`}
              >
                {TIMELINE_ICONS[p.icon]} {p.title}
              </button>
            )
          })}
        </div>
      </div>

      {/* Events list */}
      {events.length > 0 && (
        <div className="space-y-2">
          {events.map((event, i) => (
            <div key={i} className="flex items-center gap-3 bg-ink-50 rounded-xl px-4 py-3">
              <GripVertical size={14} className="text-ink-200 shrink-0" />
              <span className="font-body text-xs text-ink-400 w-16 shrink-0">{event.time}</span>
              <span className="text-base">{TIMELINE_ICONS[event.icon || 'heart']}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-ink truncate">{event.title}</p>
                {event.description && (
                  <p className="font-body text-xs text-ink-400 truncate">{event.description}</p>
                )}
              </div>
              <button onClick={() => startEdit(i)} className="text-xs text-brand hover:underline shrink-0">Edit</button>
              <button onClick={() => remove(i)} className="text-ink-300 hover:text-red-500 shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit form */}
      {editing !== null ? (
        <div className="border border-border rounded-xl p-4 space-y-3">
          <p className="font-body text-sm font-semibold text-ink">
            {editing === -1 ? 'Add event' : 'Edit event'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-xs text-ink-400 mb-1">Time *</label>
              <input
                value={draft.time}
                onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                placeholder="3:00 PM"
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="block font-body text-xs text-ink-400 mb-1">Icon</label>
              <select
                value={draft.icon}
                onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                className="input w-full text-sm"
              >
                {Object.entries(TIMELINE_ICONS).map(([key, emoji]) => (
                  <option key={key} value={key}>{emoji} {key}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-body text-xs text-ink-400 mb-1">Title *</label>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Ceremony Begins"
              className="input w-full text-sm"
            />
          </div>
          <div>
            <label className="block font-body text-xs text-ink-400 mb-1">Notes (optional)</label>
            <input
              value={draft.description || ''}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Please be seated by 2:45 PM"
              className="input w-full text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit} className="btn-primary text-sm px-4 py-1.5">Save</button>
            <button onClick={() => { setEditing(null); setDraft(BLANK) }} className="btn-ghost text-sm px-4 py-1.5">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(BLANK); setEditing(-1) }}
          className="flex items-center gap-2 text-sm font-body font-medium text-brand hover:text-brand/80 transition-colors"
        >
          <Plus size={16} /> Add custom event
        </button>
      )}
    </div>
  )
}
