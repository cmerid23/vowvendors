import { Link } from 'react-router-dom'
import { MapPin, DollarSign, Heart } from 'lucide-react'
import type { Vendor } from '../../types/database'
import { FeaturedBadge, VerifiedBadge, CategoryBadge, StarRating, Skeleton } from '../ui/Badge'
import { useFavoritesStore } from '../../store/useFavoritesStore'
import { formatPrice } from '../../utils/formatters'

interface VendorCardProps {
  vendor: Vendor
}

export function VendorCard({ vendor }: VendorCardProps) {
  const isFavorite = useFavoritesStore((s) => s.isFavorite)
  const toggle = useFavoritesStore((s) => s.toggle)
  const saved = isFavorite(vendor.id)

  return (
    <Link to={`/vendors/${vendor.id}`} className="card block hover:shadow-card-hover transition-shadow duration-200 group">
      {/* Image placeholder */}
      <div className="relative h-48 bg-blush-100 rounded-t-card overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-blush-200 to-blush-300 flex items-center justify-center">
          <span className="text-4xl opacity-60">
            {vendor.category === 'photographer' ? '📷' :
             vendor.category === 'videographer' ? '🎬' :
             vendor.category === 'decor' ? '🌸' : '🎵'}
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {vendor.is_featured && <FeaturedBadge />}
          {vendor.is_verified && <VerifiedBadge />}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => { e.preventDefault(); toggle(vendor.id) }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all
            ${saved ? 'bg-brand text-white' : 'bg-white/90 text-ink-300 hover:text-brand'}`}
          aria-label="Save to favorites"
        >
          <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-lg text-ink font-semibold leading-tight group-hover:text-brand transition-colors">
            {vendor.business_name}
          </h3>
          <CategoryBadge category={vendor.category} />
        </div>

        <div className="flex items-center gap-1 text-ink-400 text-xs font-body mb-2">
          <MapPin size={11} />
          <span>{vendor.city ? `${vendor.city}, ${vendor.state}` : vendor.state}</span>
        </div>

        {vendor.avg_rating > 0 && (
          <div className="mb-2">
            <StarRating rating={Math.round(vendor.avg_rating)} count={vendor.review_count} />
          </div>
        )}

        {vendor.bio && (
          <p className="text-ink-400 text-xs font-body leading-relaxed mb-3 line-clamp-2">
            {vendor.bio}
          </p>
        )}

        {vendor.starting_price && (
          <div className="flex items-center gap-1 text-brand font-body font-medium text-sm">
            <DollarSign size={13} />
            <span>Starting at {formatPrice(vendor.starting_price)}</span>
            <span className="text-ink-300 font-normal">/ {vendor.price_unit}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export function VendorCardSkeleton() {
  return (
    <div className="card">
      <Skeleton className="h-48 rounded-t-card rounded-b-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}
