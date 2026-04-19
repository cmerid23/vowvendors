import { useState } from 'react'
import type { PoseCard as PoseCardType } from '../../types'
import { HeartButton } from '../ui/HeartButton'

interface PoseCardProps {
  pose: PoseCardType
  onClick: (pose: PoseCardType) => void
}

export function PoseCard({ pose, onClick }: PoseCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <div
      className="relative group rounded-xl overflow-hidden cursor-pointer wp-card-hover bg-charcoal-50"
      onClick={() => onClick(pose)}
    >
      {!imgLoaded && <div className="wp-skeleton aspect-[3/4] w-full absolute inset-0" />}
      <img
        src={pose.photo.urls.regular}
        alt={pose.photo.alt_description || pose.poseName}
        className={`w-full aspect-[3/4] object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImgLoaded(true)}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <p className="font-body text-xs text-cream font-medium leading-tight">{pose.poseName}</p>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <HeartButton pose={pose} />
      </div>
    </div>
  )
}
