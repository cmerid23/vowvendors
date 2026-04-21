import { useEffect, useRef, useState } from 'react'
import type { WeddingHub } from '../../../types/hub'

interface NavItem {
  id: string
  emoji: string
  label: string
}

interface Props {
  hub: WeddingHub
  activeSection: string
  onNavigate: (id: string) => void
}

export function HubNav({ hub, activeSection, onNavigate }: Props) {
  const [visible, setVisible] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  const items: NavItem[] = [
    ...(hub.show_timeline ? [{ id: 'timeline', emoji: '📅', label: 'Timeline' }] : []),
    ...(hub.show_photo_wall ? [{ id: 'photos', emoji: '📸', label: 'Photos' }] : []),
    ...(hub.show_seating ? [{ id: 'seating', emoji: '🪑', label: 'Seats' }] : []),
    ...(hub.show_song_requests ? [{ id: 'songs', emoji: '🎵', label: 'Songs' }] : []),
    ...(hub.show_vendors ? [{ id: 'vendors', emoji: '💛', label: 'Vendors' }] : []),
  ]

  useEffect(() => {
    const handleScroll = () => {
      // Show nav after 60vh scroll
      setVisible(window.scrollY > window.innerHeight * 0.5)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (items.length === 0) return null

  return (
    <div
      ref={navRef}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="flex items-center gap-1 px-4 py-3 overflow-x-auto scrollbar-none max-w-2xl mx-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body font-medium whitespace-nowrap transition-all ${
                activeSection === item.id
                  ? 'text-white'
                  : 'text-ink-400 hover:text-ink hover:bg-ink-50'
              }`}
              style={activeSection === item.id ? { backgroundColor: hub.accent_color } : {}}
            >
              <span>{item.emoji}</span> {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
