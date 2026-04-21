import { Link } from 'react-router-dom'
import { Images, Lock, Eye, Download, Calendar } from 'lucide-react'
import type { Gallery } from '../../../types/gallery'
import { formatBytes } from '../../../lib/galleryUtils'

interface Props {
  gallery: Gallery
}

export function GalleryCard({ gallery }: Props) {
  const date = gallery.wedding_date
    ? new Date(gallery.wedding_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <Link
      to={`/vendor/galleries/${gallery.id}`}
      className="card overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 block group"
    >
      {/* Cover */}
      <div className="aspect-video bg-ink-50 relative overflow-hidden">
        {gallery.cover_photo_url ? (
          <img
            src={gallery.cover_photo_url}
            alt={gallery.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Images size={36} className="text-ink-200" />
          </div>
        )}
        {gallery.password_hash && (
          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs font-body px-2 py-0.5 rounded-full flex items-center gap-1">
            <Lock size={10} /> Protected
          </span>
        )}
        {!gallery.is_active && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-body px-2 py-0.5 rounded-full">
            Draft
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-display text-lg text-ink font-semibold leading-snug mb-0.5 truncate">{gallery.title}</h3>
        {gallery.couple_names && (
          <p className="font-body text-ink-400 text-sm truncate">{gallery.couple_names}</p>
        )}
        {date && (
          <p className="font-body text-ink-300 text-xs flex items-center gap-1 mt-1">
            <Calendar size={11} /> {date}
          </p>
        )}

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-ink-400 text-xs font-body">
          <span className="flex items-center gap-1"><Images size={11} /> {gallery.total_photos}</span>
          <span className="flex items-center gap-1"><Eye size={11} /> {gallery.view_count}</span>
          <span className="flex items-center gap-1"><Download size={11} /> {gallery.download_count}</span>
          <span className="ml-auto">{formatBytes(gallery.total_size_bytes)}</span>
        </div>
      </div>
    </Link>
  )
}
