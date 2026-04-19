import { useState } from 'react'
import { useWedPoseStore } from '../store/useWedPoseStore'
import { PoseCard } from '../components/pose/PoseCard'
import { PoseModal } from '../components/pose/PoseModal'
import type { PoseCard as PoseCardType } from '../types'

export function WedPoseFavorites() {
  const favorites = useWedPoseStore((s) => s.favorites)
  const collections = useWedPoseStore((s) => s.collections)
  const addCollection = useWedPoseStore((s) => s.addCollection)
  const removeCollection = useWedPoseStore((s) => s.removeCollection)
  const addPoseToCollection = useWedPoseStore((s) => s.addPoseToCollection)
  const removePoseFromCollection = useWedPoseStore((s) => s.removePoseFromCollection)

  const [selectedPose, setSelectedPose] = useState<PoseCardType | null>(null)
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null)
  const [newColName, setNewColName] = useState('')
  const [showNewCol, setShowNewCol] = useState(false)
  const [addingToCollectionPoseId, setAddingToCollectionPoseId] = useState<string | null>(null)

  const displayedPoses = activeCollectionId
    ? favorites.filter((f) =>
        collections.find((c) => c.id === activeCollectionId)?.poseIds.includes(f.id)
      )
    : favorites

  const handleCreateCollection = () => {
    if (newColName.trim()) {
      addCollection(newColName.trim())
      setNewColName('')
      setShowNewCol(false)
    }
  }

  const handlePrint = () => window.print()

  if (favorites.length === 0) {
    return (
      <div className="pt-8 text-center animate-fade-in">
        <div className="text-5xl mb-4">♡</div>
        <h1 className="font-display text-2xl text-cream mb-2">No Favorites Yet</h1>
        <p className="text-cream-400 font-body text-sm">
          Tap the heart icon on any pose to save it here.
        </p>
      </div>
    )
  }

  return (
    <div className="pt-2 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl sm:text-3xl text-cream font-semibold">
          Favorites <span className="text-gold text-xl">({favorites.length})</span>
        </h1>
        <button onClick={handlePrint} className="wp-btn-outline text-xs gap-1 flex items-center">
          🖨 Export PDF
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCollectionId(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full font-body text-sm transition-colors
              ${!activeCollectionId ? 'bg-gold text-charcoal font-medium' : 'bg-charcoal-50 text-cream-300 hover:text-cream border border-gold/20'}`}
          >
            All ({favorites.length})
          </button>
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => setActiveCollectionId(col.id === activeCollectionId ? null : col.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full font-body text-sm transition-colors whitespace-nowrap
                ${activeCollectionId === col.id ? 'bg-gold text-charcoal font-medium' : 'bg-charcoal-50 text-cream-300 hover:text-cream border border-gold/20'}`}
            >
              {col.name} ({col.poseIds.length})
            </button>
          ))}
          <button
            onClick={() => setShowNewCol(true)}
            className="shrink-0 px-3 py-1.5 rounded-full font-body text-sm bg-charcoal-50 text-gold border border-gold/30 hover:border-gold/60 transition-colors"
          >
            + New Collection
          </button>
        </div>

        {showNewCol && (
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
              placeholder="Collection name..."
              autoFocus
              className="flex-1 bg-charcoal-50 text-cream text-sm px-3 py-2 rounded-lg border border-gold/20 focus:outline-none focus:border-gold/60 font-body"
            />
            <button onClick={handleCreateCollection} className="wp-btn-gold">Create</button>
            <button onClick={() => setShowNewCol(false)} className="wp-btn-outline">Cancel</button>
          </div>
        )}

        {activeCollectionId && (
          <div className="flex items-center gap-3 mt-3">
            <p className="text-cream-400 text-xs font-body">
              Collection: <span className="text-gold">{collections.find((c) => c.id === activeCollectionId)?.name}</span>
            </p>
            <button
              onClick={() => { removeCollection(activeCollectionId); setActiveCollectionId(null) }}
              className="text-red-400 text-xs hover:underline font-body"
            >
              Delete Collection
            </button>
          </div>
        )}
      </div>

      {displayedPoses.length === 0 ? (
        <p className="text-cream-400 font-body text-sm text-center py-12">
          No poses in this collection yet. Tap ⊕ on any favorite to add it.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayedPoses.map((pose) => (
            <div key={pose.id} className="relative group">
              <PoseCard pose={pose} onClick={setSelectedPose} />
              <button
                onClick={(e) => { e.stopPropagation(); setAddingToCollectionPoseId(pose.id) }}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-black/60 text-white text-xs px-2 py-1 rounded-full transition-opacity font-body"
              >
                + Collection
              </button>
              {addingToCollectionPoseId === pose.id && (
                <div className="absolute inset-0 bg-charcoal-100/95 rounded-xl p-3 flex flex-col gap-1 z-10 animate-fade-in">
                  <p className="text-gold text-xs font-body font-medium mb-1">Add to collection:</p>
                  {collections.map((col) => {
                    const inCol = col.poseIds.includes(pose.id)
                    return (
                      <button
                        key={col.id}
                        onClick={() => inCol ? removePoseFromCollection(col.id, pose.id) : addPoseToCollection(col.id, pose.id)}
                        className={`text-xs font-body px-2 py-1 rounded transition-colors text-left
                          ${inCol ? 'text-gold bg-gold/10' : 'text-cream-300 hover:text-cream'}`}
                      >
                        {inCol ? '✓ ' : '+ '}{col.name}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setAddingToCollectionPoseId(null)}
                    className="text-cream-400 text-xs mt-1 hover:text-cream font-body"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <PoseModal
        pose={selectedPose}
        relatedPoses={favorites.filter((f) => f.id !== selectedPose?.id && f.subcategoryId === selectedPose?.subcategoryId).slice(0, 3)}
        onClose={() => setSelectedPose(null)}
        onSelectRelated={setSelectedPose}
      />
    </div>
  )
}
