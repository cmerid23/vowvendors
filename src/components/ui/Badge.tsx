import { Star, BadgeCheck, Sparkles } from 'lucide-react'

export function FeaturedBadge() {
  return (
    <span className="badge-featured flex items-center gap-1">
      <Sparkles size={10} /> Featured
    </span>
  )
}

export function VerifiedBadge() {
  return (
    <span className="badge-verified flex items-center gap-1">
      <BadgeCheck size={10} /> Verified
    </span>
  )
}

export function CategoryBadge({ category }: { category: string }) {
  return <span className="badge-category">{category}</span>
}

interface StarRatingProps {
  rating: number
  count?: number
  interactive?: boolean
  onChange?: (rating: number) => void
  size?: number
}

export function StarRating({ rating, count, interactive, onChange, size = 14 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${star <= rating ? 'fill-brand text-brand' : 'fill-ink-100 text-ink-200'} ${interactive ? 'cursor-pointer hover:fill-brand hover:text-brand transition-colors' : ''}`}
          onClick={() => interactive && onChange?.(star)}
        />
      ))}
      {count !== undefined && (
        <span className="text-ink-400 text-xs font-body ml-1">({count})</span>
      )}
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded ${className}`} />
}
