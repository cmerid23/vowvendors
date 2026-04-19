import { useState } from 'react'
import type { QuizOption } from '../data/questions'

interface QuizOptionCardProps {
  option: QuizOption
  selected: boolean
  onSelect: (option: QuizOption) => void
}

export function QuizOptionCard({ option, selected, onSelect }: QuizOptionCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <button
      className={`relative rounded-xl overflow-hidden cursor-pointer touch-manipulation transition-all duration-200 text-left w-full
        ${selected
          ? 'ring-2 ring-brand scale-[0.97] shadow-lg'
          : 'ring-1 ring-transparent hover:ring-brand/40 hover:scale-[0.98]'
        }`}
      onClick={() => onSelect(option)}
    >
      <div className="aspect-[3/4] relative bg-surface">
        {!imgLoaded && <div className="absolute inset-0 bg-border animate-pulse" />}
        <img
          src={option.imageUrl}
          alt={option.label}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-brand rounded-full flex items-center justify-center shadow-md">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5">
        <p className="font-body text-white text-xs font-medium leading-tight drop-shadow-sm line-clamp-2">
          {option.label}
        </p>
      </div>
    </button>
  )
}
