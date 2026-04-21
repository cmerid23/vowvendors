import { useState } from 'react'
import { ExternalLink, MapPin } from 'lucide-react'
import type { WeddingHub, HubThingToDo } from '../../../types/hub'
import { THINGS_TO_DO_CATEGORIES } from '../../../types/hub'
import { CATEGORY_EMOJI } from '../lib/suggestThingsToDo'

interface Props {
  hub: WeddingHub
  items: HubThingToDo[]
}

export function HubThingsToDo({ hub, items }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('all')

  if (items.length === 0) return null

  const filtered = activeFilter === 'all' ? items : items.filter((i) => i.category === activeFilter)

  const usedCategories = ['all', ...THINGS_TO_DO_CATEGORIES.filter((c) => items.some((i) => i.category === c.id)).map((c) => c.id)]

  return (
    <section id="things-to-do" className="px-4 py-10 max-w-2xl mx-auto">
      <h2 className="font-display text-2xl font-semibold text-ink text-center mb-8">Things To Do 📍</h2>

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
        {usedCategories.map((catId) => {
          const cat = THINGS_TO_DO_CATEGORIES.find((c) => c.id === catId)
          const label = catId === 'all' ? 'All' : (cat?.label ?? catId)
          const emoji = catId === 'all' ? '✨' : (cat?.emoji ?? '📍')
          const isActive = activeFilter === catId
          return (
            <button
              key={catId}
              onClick={() => setActiveFilter(catId)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-body font-medium whitespace-nowrap shrink-0 transition-all ${isActive ? '' : 'bg-ink-50 text-ink-400 hover:bg-ink-100'}`}
              style={isActive ? { backgroundColor: hub.accent_color, color: '#fff' } : {}}
            >
              {emoji} {label}
            </button>
          )
        })}
      </div>

      {/* Activity grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map((item) => (
          <div key={item.id} className="card p-4 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <span className="text-xl shrink-0">{CATEGORY_EMOJI[item.category] || '📍'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold text-ink leading-snug">{item.name}</p>
                {item.distance_from_venue && (
                  <p className="font-body text-xs text-ink-400 mt-0.5">{item.distance_from_venue}</p>
                )}
              </div>
            </div>

            {item.description && (
              <p className="font-body text-xs text-ink-400 leading-relaxed line-clamp-3">{item.description}</p>
            )}

            {/* Action buttons */}
            <div className="flex gap-1.5 flex-wrap mt-auto pt-1">
              {item.website_url && (
                <a
                  href={item.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1 rounded-full text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: hub.accent_color }}
                >
                  <ExternalLink size={10} /> Website
                </a>
              )}
              {(item.address || item.google_maps_url) && (
                <a
                  href={item.google_maps_url || `https://maps.google.com/maps?q=${encodeURIComponent(item.address || item.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-body font-medium px-2.5 py-1 rounded-full border border-border hover:bg-ink-50 transition-colors"
                >
                  <MapPin size={10} /> Directions
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
