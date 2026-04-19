import { useNavigate } from 'react-router-dom'
import { ExternalLink, Phone, Lock, Star } from 'lucide-react'
import type { VendorMatch } from '../lib/vendorMatcher'

interface VendorMatchCardProps {
  match: VendorMatch
  emailCaptured: boolean
  onUnlockClick: (vendorId: string, vendorName: string) => void
}

export function VendorMatchCard({ match, emailCaptured, onUnlockClick }: VendorMatchCardProps) {
  const { vendor, matchLabel, matchColor, priceDiff } = match
  const navigate = useNavigate()

  const diffLabel =
    priceDiff === 0
      ? 'exact match'
      : priceDiff > 0
      ? `+$${Math.abs(priceDiff).toLocaleString()} over`
      : `-$${Math.abs(priceDiff).toLocaleString()} under`

  return (
    <div className="border border-border rounded-xl p-3 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <button
            onClick={() => navigate(`/vendors/${vendor.id}`)}
            className="text-sm font-semibold text-text hover:text-brand transition-colors text-left leading-tight line-clamp-1"
          >
            {vendor.business_name}
          </button>
          <p className="text-xs text-text-secondary mt-0.5">
            {vendor.city ? `${vendor.city}, ` : ''}{vendor.state}
          </p>
        </div>
        <span
          className="shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: matchColor }}
        >
          {matchLabel}
        </span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-base font-bold text-text">
            {vendor.starting_price ? `$${vendor.starting_price.toLocaleString()}` : 'Contact for price'}
          </span>
          {vendor.price_unit && (
            <span className="text-xs text-text-secondary ml-1">/{vendor.price_unit}</span>
          )}
        </div>
        <span className="text-xs text-text-secondary">{diffLabel}</span>
      </div>

      {vendor.avg_rating > 0 && (
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium text-text">{vendor.avg_rating.toFixed(1)}</span>
          <span className="text-xs text-text-secondary">({vendor.review_count})</span>
        </div>
      )}

      {/* Contact info gate */}
      {emailCaptured ? (
        <div className="flex gap-2 pt-2 border-t border-border">
          {vendor.phone && (
            <a
              href={`tel:${vendor.phone}`}
              className="flex items-center gap-1 text-xs text-brand hover:underline"
            >
              <Phone className="w-3 h-3" /> {vendor.phone}
            </a>
          )}
          {vendor.website && (
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-brand hover:underline ml-auto"
            >
              Website <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            onClick={() => navigate(`/vendors/${vendor.id}`)}
            className="text-xs font-medium text-brand hover:underline ml-auto"
          >
            View profile →
          </button>
        </div>
      ) : (
        <button
          onClick={() => onUnlockClick(vendor.id, vendor.business_name)}
          className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-brand/40 text-xs font-medium text-brand hover:bg-brand/5 transition-colors"
        >
          <Lock className="w-3 h-3" /> Unlock contact info
        </button>
      )}
    </div>
  )
}
