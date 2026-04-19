import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Globe, Link2, Phone, DollarSign, ArrowLeft, Heart } from 'lucide-react'
import { useVendorProfile } from '../../hooks/useVendorProfile'
import { ContactForm } from '../../components/lead/ContactForm'
import { StarRating, FeaturedBadge, VerifiedBadge, CategoryBadge, Skeleton } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useFavoritesStore } from '../../store/useFavoritesStore'
import { formatPrice, formatDate } from '../../utils/formatters'

export function VendorProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { vendor, portfolio, reviews, loading, error } = useVendorProfile(id)
  const isFavorite = useFavoritesStore((s) => s.isFavorite)
  const toggle = useFavoritesStore((s) => s.toggle)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-64 rounded-card" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-80 rounded-card" />
      </div>
    </div>
  )

  if (error || !vendor) return (
    <div className="text-center py-20">
      <p className="text-ink-400 font-body">{error || 'Vendor not found'}</p>
      <Button onClick={() => navigate('/search')} variant="outline" className="mt-4">Back to Search</Button>
    </div>
  )

  const saved = isFavorite(vendor.id)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <div className="flex flex-wrap gap-2">
                <CategoryBadge category={vendor.category} />
                {vendor.is_featured && <FeaturedBadge />}
                {vendor.is_verified && <VerifiedBadge />}
              </div>
              <button
                onClick={() => toggle(vendor.id)}
                className={`flex items-center gap-1.5 text-sm font-body transition-colors ${saved ? 'text-brand' : 'text-ink-300 hover:text-brand'}`}
              >
                <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>
            <h1 className="font-display text-4xl text-ink font-semibold mb-2">{vendor.business_name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-ink-400 font-body text-sm">
              <span className="flex items-center gap-1"><MapPin size={13} />{vendor.city ? `${vendor.city}, ${vendor.state}` : vendor.state}</span>
              {vendor.avg_rating > 0 && <StarRating rating={Math.round(vendor.avg_rating)} count={vendor.review_count} />}
              {vendor.starting_price && (
                <span className="flex items-center gap-1 text-brand font-medium">
                  <DollarSign size={13} />Starting at {formatPrice(vendor.starting_price)}/{vendor.price_unit}
                </span>
              )}
            </div>
          </div>

          {/* Bio */}
          {vendor.bio && (
            <div>
              <h2 className="font-display text-2xl text-ink mb-3">About</h2>
              <p className="font-body text-ink-500 leading-relaxed">{vendor.bio}</p>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            {vendor.website && (
              <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">
                <Globe size={13} /> Website
              </a>
            )}
            {vendor.instagram_handle && (
              <a href={`https://instagram.com/${vendor.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">
                <Link2 size={13} /> @{vendor.instagram_handle}
              </a>
            )}
            {vendor.phone && (
              <a href={`tel:${vendor.phone}`} className="btn-ghost text-xs">
                <Phone size={13} /> {vendor.phone}
              </a>
            )}
          </div>

          {/* Portfolio */}
          {portfolio.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-ink mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {portfolio.map((img) => (
                  <button key={img.id} onClick={() => setLightboxSrc(img.image_url)} className="group relative rounded-card overflow-hidden aspect-square">
                    <img src={img.image_url} alt={img.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-ink mb-4">Reviews</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-body font-medium text-ink text-sm">{review.reviewer_name}</p>
                      <span className="text-ink-300 text-xs font-body">{formatDate(review.created_at)}</span>
                    </div>
                    <StarRating rating={review.rating} />
                    {review.review_text && <p className="text-ink-500 font-body text-sm mt-2 leading-relaxed">{review.review_text}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — contact form */}
        <div className="lg:sticky lg:top-24 h-fit">
          <ContactForm vendorId={vendor.id} vendorName={vendor.business_name} />
        </div>
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxSrc(null)}>
          <img src={lightboxSrc} alt="" className="max-h-screen max-w-full object-contain rounded-card" />
        </div>
      )}
    </div>
  )
}
