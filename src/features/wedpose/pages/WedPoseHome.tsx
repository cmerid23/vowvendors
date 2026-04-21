import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import { useWedPoseStore } from '../store/useWedPoseStore'
import { PoseCard } from '../components/pose/PoseCard'
import { PoseModal } from '../components/pose/PoseModal'
import type { PoseCard as PoseCardType } from '../types'

interface WedPoseHomeProps {
  basePath?: string
}

export function WedPoseHome({ basePath = '/vendor/wedpose' }: WedPoseHomeProps) {
  const navigate = useNavigate()
  const recentlyViewed = useWedPoseStore((s) => s.recentlyViewed)
  const favorites = useWedPoseStore((s) => s.favorites)
  const [selectedPose, setSelectedPose] = useState<PoseCardType | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = searchQuery
    ? CATEGORIES.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.subcategories.some((s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : CATEGORIES

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`${basePath}/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="pt-2 animate-fade-in">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-2xl">💍</span>
          <h1 className="font-display text-3xl sm:text-4xl text-cream font-semibold">WedPose</h1>
        </div>
        <p className="text-cream-400 font-body text-sm max-w-md mx-auto">
          Professional posing reference for wedding photographers
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8 max-w-lg mx-auto">
        <div className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search poses, categories..."
            className="w-full bg-charcoal-50 text-cream font-body text-sm px-5 py-3.5 pr-12 rounded-xl border border-gold/20 focus:outline-none focus:border-gold/60 placeholder:text-cream-400 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gold hover:text-gold-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      <section className="mb-10">
        <h2 className="font-display text-lg text-cream mb-4">
          {searchQuery ? `Results for "${searchQuery}"` : 'Categories'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`${basePath}/category/${cat.id}`)}
              className="bg-charcoal-50 hover:bg-charcoal-100 border border-gold/10 hover:border-gold/40 rounded-xl p-4 text-left transition-all duration-200 wp-card-hover group"
            >
              <span className="text-2xl mb-2 block">{cat.icon}</span>
              <p className="font-display text-cream text-sm font-semibold group-hover:text-gold transition-colors leading-tight">
                {cat.name}
              </p>
              <p className="font-body text-cream-400 text-xs mt-1">
                {cat.subcategories.length} subcategories
              </p>
            </button>
          ))}
        </div>
        {filteredCategories.length === 0 && (
          <p className="text-cream-400 font-body text-sm text-center py-8">
            No categories match "{searchQuery}"
          </p>
        )}
      </section>

      {recentlyViewed.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-cream">Recently Viewed</h2>
            <button
              onClick={() => navigate(`${basePath}/favorites`)}
              className="text-gold text-xs font-body hover:underline"
            >
              See all →
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentlyViewed.slice(0, 6).map((pose) => (
              <PoseCard key={pose.id} pose={pose} onClick={setSelectedPose} />
            ))}
          </div>
        </section>
      )}

      {favorites.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-cream">Favorites</h2>
            <button
              onClick={() => navigate(`${basePath}/favorites`)}
              className="text-gold text-xs font-body hover:underline"
            >
              View all {favorites.length} →
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {favorites.slice(0, 6).map((pose) => (
              <PoseCard key={pose.id} pose={pose} onClick={setSelectedPose} />
            ))}
          </div>
        </section>
      )}

      <PoseModal
        pose={selectedPose}
        relatedPoses={[]}
        onClose={() => setSelectedPose(null)}
        onSelectRelated={setSelectedPose}
      />
    </div>
  )
}
