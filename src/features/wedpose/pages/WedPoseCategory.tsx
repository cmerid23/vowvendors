import { useState, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { getCategoryById } from '../data/categories'
import { useUnsplash } from '../hooks/useUnsplash'
import { PoseCard } from '../components/pose/PoseCard'
import { PoseModal } from '../components/pose/PoseModal'
import { SkeletonCard } from '../components/ui/SkeletonCard'
import { ErrorState } from '../components/ui/ErrorState'
import type { PoseCard as PoseCardType, UnsplashPhoto } from '../types'

function SubcategoryView({
  categoryId,
  subcategoryId,
  query,
  orientation,
  poseName,
  onPoseClick,
}: {
  categoryId: string
  subcategoryId: string
  query: string
  orientation: 'landscape' | 'portrait' | 'squarish'
  poseName: string
  onPoseClick: (pose: PoseCardType) => void
}) {
  const { photos, loading, error, loadMore, hasMore } = useUnsplash(query, orientation)

  const poses: PoseCardType[] = useMemo(
    () =>
      photos.map((photo: UnsplashPhoto) => ({
        id: `${subcategoryId}-${photo.id}`,
        poseId: photo.id,
        subcategoryId,
        categoryId,
        photo,
        poseName,
      })),
    [photos, subcategoryId, categoryId, poseName]
  )

  if (error) return <ErrorState message={error} />

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {poses.map((pose) => (
          <PoseCard key={pose.id} pose={pose} onClick={onPoseClick} />
        ))}
        {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      {!loading && hasMore && poses.length > 0 && (
        <div className="text-center mt-8">
          <button onClick={loadMore} className="wp-btn-outline">
            Load More
          </button>
        </div>
      )}
    </>
  )
}

interface WedPoseCategoryProps {
  basePath?: string
}

export function WedPoseCategory({ basePath = '/vendor/wedpose' }: WedPoseCategoryProps) {
  const { categoryId } = useParams<{ categoryId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const category = getCategoryById(categoryId || '')
  const [selectedPose, setSelectedPose] = useState<PoseCardType | null>(null)
  const [allPhotos, setAllPhotos] = useState<PoseCardType[]>([])

  const activeSubId = searchParams.get('sub') || category?.subcategories[0]?.id || ''

  if (!category) {
    return (
      <div className="pt-8 text-center">
        <p className="text-cream-400">Category not found.</p>
        <button onClick={() => navigate(basePath)} className="wp-btn-gold mt-4">Go Home</button>
      </div>
    )
  }

  const activeSub = category.subcategories.find((s) => s.id === activeSubId) || category.subcategories[0]

  const handlePoseClick = (pose: PoseCardType) => {
    setAllPhotos((prev) => {
      const existing = prev.find((p) => p.id === pose.id)
      return existing ? prev : [...prev, pose]
    })
    setSelectedPose(pose)
  }

  const relatedPoses = allPhotos
    .filter((p) => p.id !== selectedPose?.id && p.subcategoryId === selectedPose?.subcategoryId)
    .slice(0, 3)

  return (
    <div className="pt-2 animate-fade-in">
      <div className="mb-6">
        <button onClick={() => navigate(basePath)} className="text-gold text-sm font-body hover:underline mb-3 flex items-center gap-1">
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{category.icon}</span>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-cream font-semibold">{category.name}</h1>
            <p className="text-cream-400 font-body text-sm">{category.description}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {category.subcategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSearchParams({ sub: sub.id })}
            className={`shrink-0 px-4 py-2 rounded-full font-body text-sm transition-colors duration-200 whitespace-nowrap
              ${activeSubId === sub.id
                ? 'bg-gold text-charcoal font-medium'
                : 'bg-charcoal-50 text-cream-300 hover:text-cream border border-gold/20'
              }`}
          >
            {sub.name}
          </button>
        ))}
      </div>

      {activeSub && (
        <SubcategoryView
          key={activeSub.id}
          categoryId={category.id}
          subcategoryId={activeSub.id}
          query={activeSub.query}
          orientation={activeSub.orientation}
          poseName={activeSub.name}
          onPoseClick={handlePoseClick}
        />
      )}

      <PoseModal
        pose={selectedPose}
        relatedPoses={relatedPoses}
        onClose={() => setSelectedPose(null)}
        onSelectRelated={setSelectedPose}
      />
    </div>
  )
}
