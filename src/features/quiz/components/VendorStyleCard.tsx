import { useNavigate } from 'react-router-dom'
import type { Vendor } from '../../../types/database'
import type { StyleProfile } from '../data/profiles'

interface VendorStyleCardProps {
  vendor: Vendor & { style_tags?: string[] }
  matchScore: number
  matchedTags: string[]
  profile: StyleProfile
}

const CATEGORY_LABELS: Record<string, string> = {
  photographer: '📷 Photographer',
  videographer: '🎬 Videographer',
  decor: '💐 Décor',
  music: '🎵 Music',
}

export function VendorStyleCard({ vendor, matchScore, profile }: VendorStyleCardProps) {
  const navigate = useNavigate()

  return (
    <button
      className="card p-4 text-left hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 w-full group"
      onClick={() => navigate(`/vendors/${vendor.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-body text-xs text-ink-300 mb-0.5">
            {CATEGORY_LABELS[vendor.category] ?? vendor.category}
          </p>
          <h4 className="font-display text-base text-ink font-semibold leading-tight group-hover:text-brand transition-colors truncate">
            {vendor.business_name}
          </h4>
          <p className="font-body text-xs text-ink-400 mt-0.5">
            {[vendor.city, vendor.state].filter(Boolean).join(', ')}
          </p>
        </div>

        {matchScore > 0 && (
          <div
            className="shrink-0 text-center px-2.5 py-1.5 rounded-xl"
            style={{ background: `${profile.accentColor}20` }}
          >
            <p className="font-display text-lg font-bold leading-none" style={{ color: profile.accentColor }}>
              {matchScore}
            </p>
            <p className="font-body text-[9px] uppercase tracking-wider mt-0.5" style={{ color: `${profile.accentColor}99` }}>
              match
            </p>
          </div>
        )}
      </div>

      {vendor.starting_price && (
        <p className="font-body text-xs text-ink-400 mt-2.5">
          From <span className="font-semibold text-ink">${vendor.starting_price.toLocaleString()}</span>
          {vendor.price_unit ? ` / ${vendor.price_unit}` : ''}
        </p>
      )}
    </button>
  )
}
