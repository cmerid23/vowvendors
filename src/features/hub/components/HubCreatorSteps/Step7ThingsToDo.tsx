import { useState } from 'react'
import { Sparkles, Plus, Trash2, Check } from 'lucide-react'
import { THINGS_TO_DO_CATEGORIES } from '../../../../types/hub'
import type { HubThingToDo, ThingsToDoSuggestion } from '../../../../types/hub'
import { CATEGORY_EMOJI } from '../../lib/suggestThingsToDo'

type DraftItem = Omit<HubThingToDo, 'id' | 'hub_id' | 'display_order'>

interface Props {
  items: DraftItem[]
  onChange: (items: DraftItem[]) => void
  onAISuggest: () => Promise<void>
  aiSuggestions: ThingsToDoSuggestion[]
  isLoadingAI: boolean
  city?: string
  state?: string
}

const BLANK: DraftItem = {
  name: '',
  category: 'general',
  description: '',
  address: '',
  distance_from_venue: '',
  website_url: '',
  google_maps_url: '',
  is_ai_generated: false,
}

export function Step7ThingsToDo({ items, onChange, onAISuggest, aiSuggestions, isLoadingAI, city, state }: Props) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<DraftItem>(BLANK)
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<number>>(new Set())
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set())

  const acceptSuggestion = (i: number) => {
    const s = aiSuggestions[i]
    setAcceptedSuggestions((prev) => new Set([...prev, i]))
    onChange([...items, {
      name: s.name,
      category: s.category as DraftItem['category'],
      description: s.description,
      address: '',
      distance_from_venue: s.distance_hint,
      website_url: '',
      google_maps_url: '',
      is_ai_generated: true,
    }])
  }

  const dismissSuggestion = (i: number) => {
    setDismissedSuggestions((prev) => new Set([...prev, i]))
  }

  const saveItem = () => {
    if (!draft.name.trim()) return
    onChange([...items, { ...draft }])
    setDraft(BLANK)
    setAdding(false)
  }

  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  const canSuggest = !!(city && state)

  return (
    <div className="space-y-5">
      <p className="font-body text-sm text-ink-400">
        Help guests discover what to do while they are in town. Add your own picks or let AI suggest based on your city.
      </p>

      {/* AI suggest button */}
      <div>
        {!canSuggest && (
          <p className="font-body text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            Add your city and state in Step 1 to enable AI suggestions.
          </p>
        )}
        <button
          onClick={onAISuggest}
          disabled={!canSuggest || isLoadingAI}
          className="flex items-center gap-2 font-body text-sm font-semibold px-4 py-2.5 rounded-xl border-2 border-brand text-brand hover:bg-brand/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Sparkles size={15} />
          {isLoadingAI ? 'Generating suggestions…' : `✨ Suggest activities for ${city || 'your city'} with AI`}
        </button>
      </div>

      {/* AI suggestions */}
      {isLoadingAI && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-ink-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoadingAI && aiSuggestions.length > 0 && (
        <div className="space-y-2">
          <p className="font-body text-xs font-semibold text-ink-400 uppercase tracking-wider">AI Suggestions — accept or dismiss</p>
          {aiSuggestions.map((s, i) => {
            if (dismissedSuggestions.has(i)) return null
            const accepted = acceptedSuggestions.has(i)
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                  accepted ? 'border-green-200 bg-green-50' : 'border-border'
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">{CATEGORY_EMOJI[s.category] || '📍'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-semibold text-ink">{s.name}</p>
                  <p className="font-body text-xs text-ink-400 mt-0.5 leading-relaxed">{s.description}</p>
                  {s.distance_hint && (
                    <p className="font-body text-xs text-ink-300 mt-1">{s.distance_hint}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {accepted ? (
                    <span className="flex items-center gap-1 text-xs font-body text-green-600 font-medium">
                      <Check size={12} /> Added
                    </span>
                  ) : (
                    <button
                      onClick={() => acceptSuggestion(i)}
                      className="text-xs font-body font-medium text-brand hover:underline whitespace-nowrap"
                    >
                      + Add
                    </button>
                  )}
                  {!accepted && (
                    <button
                      onClick={() => dismissSuggestion(i)}
                      className="text-xs font-body text-ink-300 hover:text-ink"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Added items */}
      {items.length > 0 && (
        <div className="space-y-2">
          <p className="font-body text-xs font-semibold text-ink-400 uppercase tracking-wider">Your list</p>
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-ink-50 rounded-xl px-4 py-3">
              <span className="text-base shrink-0">{CATEGORY_EMOJI[item.category] || '📍'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-medium text-ink">{item.name}</p>
                {item.description && (
                  <p className="font-body text-xs text-ink-400 truncate">{item.description}</p>
                )}
              </div>
              {item.is_ai_generated && (
                <span className="text-xs font-body text-brand shrink-0">AI</span>
              )}
              <button onClick={() => removeItem(i)} className="text-ink-300 hover:text-red-500 shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Manual add */}
      {adding ? (
        <div className="border border-border rounded-xl p-4 space-y-3">
          <p className="font-body text-sm font-semibold text-ink">Add activity</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-xs text-ink-400 mb-1">Name *</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Torchy's Tacos"
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="block font-body text-xs text-ink-400 mb-1">Category</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as DraftItem['category'] })}
                className="input w-full text-sm"
              >
                {THINGS_TO_DO_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-body text-xs text-ink-400 mb-1">Description</label>
            <textarea
              value={draft.description || ''}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={2}
              placeholder="A beloved Austin institution with creative tacos and a lively atmosphere."
              className="input w-full text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-xs text-ink-400 mb-1">Distance from venue</label>
              <input
                value={draft.distance_from_venue || ''}
                onChange={(e) => setDraft({ ...draft, distance_from_venue: e.target.value })}
                placeholder="10 minutes away"
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="block font-body text-xs text-ink-400 mb-1">Website (optional)</label>
              <input
                value={draft.website_url || ''}
                onChange={(e) => setDraft({ ...draft, website_url: e.target.value })}
                placeholder="https://..."
                className="input w-full text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveItem} className="btn-primary text-sm px-4 py-1.5">Add</button>
            <button onClick={() => { setAdding(false); setDraft(BLANK) }} className="btn-ghost text-sm px-4 py-1.5">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm font-body font-medium text-brand hover:text-brand/80 transition-colors"
        >
          <Plus size={16} /> Add your own recommendation
        </button>
      )}
    </div>
  )
}
