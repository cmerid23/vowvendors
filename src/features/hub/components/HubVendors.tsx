import { Globe, ExternalLink } from 'lucide-react'
import type { HubVendor, WeddingHub } from '../../../types/hub'

interface Props {
  hub: WeddingHub
  vendors: HubVendor[]
}

const CATEGORY_ICONS: Record<string, string> = {
  Photographer: '📷',
  Videographer: '🎥',
  Florist: '🌸',
  DJ: '🎧',
  Band: '🎸',
  'Planner / Coordinator': '📋',
  Caterer: '🍽️',
  Cake: '🎂',
  'Hair & Makeup': '💄',
  Officiant: '📜',
  Venue: '🏛️',
  Transportation: '🚗',
  Other: '💛',
}

export function HubVendors({ hub, vendors }: Props) {
  if (vendors.length === 0) return null

  return (
    <section id="vendors" className="px-4 py-10 max-w-2xl mx-auto">
      <h2 className="font-display text-2xl font-semibold text-ink text-center mb-2">The Dream Team 💛</h2>
      <p className="font-body text-sm text-ink-400 text-center mb-6">
        Meet the incredible people who made this day happen. Follow them for your own event.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="card p-4 flex items-start gap-3">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ backgroundColor: `${hub.accent_color}18` }}
            >
              {CATEGORY_ICONS[vendor.vendor_category || 'Other'] || '💛'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-semibold text-ink leading-tight">{vendor.vendor_name}</p>
              {vendor.vendor_category && (
                <p className="font-body text-xs text-ink-400 mb-2">{vendor.vendor_category}</p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {vendor.vendor_vowvendors_slug && (
                  <a
                    href={`/vendors/${vendor.vendor_vowvendors_slug}`}
                    className="inline-flex items-center gap-1 text-xs font-body font-medium px-2.5 py-1 rounded-full text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: hub.accent_color }}
                  >
                    <ExternalLink size={10} /> View on VowVendors
                  </a>
                )}
                {vendor.vendor_instagram && (
                  <a
                    href={`https://instagram.com/${vendor.vendor_instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-body text-ink-400 hover:text-ink transition-colors"
                  >
                    {vendor.vendor_instagram.startsWith('@') ? vendor.vendor_instagram : `@${vendor.vendor_instagram}`}
                  </a>
                )}
                {vendor.vendor_website && (
                  <a
                    href={vendor.vendor_website.startsWith('http') ? vendor.vendor_website : `https://${vendor.vendor_website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-body text-ink-400 hover:text-ink transition-colors"
                  >
                    <Globe size={11} />
                    {vendor.vendor_website.replace(/^https?:\/\//, '').split('/')[0]}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
