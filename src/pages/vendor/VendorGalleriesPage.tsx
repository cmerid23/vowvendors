import { useState, useEffect } from 'react'
import { Plus, Images } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { Button } from '../../components/ui/Button'
import { GalleryCard } from '../../features/gallery/components/GalleryCard'
import { CreateGalleryModal } from '../../features/gallery/components/CreateGalleryModal'
import type { Gallery } from '../../types/gallery'

export function VendorGalleriesPage() {
  const profile = useAuthStore((s) => s.profile)
  const authLoading = useAuthStore((s) => s.isLoading)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!profile) { setLoading(false); return }
    supabase
      .from('vendors')
      .select('id')
      .eq('user_id', profile.id)
      .single()
      .then(({ data: v }) => {
        if (!v) { setLoading(false); return }
        setVendorId(v.id)
        supabase
          .from('galleries')
          .select('*')
          .eq('vendor_id', v.id)
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            setGalleries((data as Gallery[]) || [])
            setLoading(false)
          })
      })
  }, [profile, authLoading])

  const handleCreated = (gallery: Gallery) => {
    setGalleries((prev) => [gallery, ...prev])
    setShowCreate(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-ink font-semibold">Client Galleries</h1>
          <p className="font-body text-ink-400 text-sm mt-0.5">Password-protected photo delivery for each wedding</p>
        </div>
        {vendorId && (
          <Button onClick={() => setShowCreate(true)} size="sm">
            <Plus size={14} /> New Gallery
          </Button>
        )}
      </div>

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-video bg-ink-50" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-ink-50 rounded w-3/4" />
                <div className="h-3 bg-ink-50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !vendorId && (
        <div className="card p-8 text-center">
          <p className="font-body text-ink-400">Complete your vendor profile before creating galleries.</p>
        </div>
      )}

      {!loading && vendorId && galleries.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-card p-16 text-center">
          <Images size={40} className="mx-auto mb-3 text-ink-200" />
          <h2 className="font-display text-xl text-ink mb-1">No galleries yet</h2>
          <p className="font-body text-ink-400 text-sm mb-5">
            Create a gallery for each wedding. Share a private link so couples can view, heart, and download their photos.
          </p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Create First Gallery
          </Button>
        </div>
      )}

      {!loading && galleries.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleries.map((g) => (
            <GalleryCard key={g.id} gallery={g} />
          ))}
        </div>
      )}

      {showCreate && vendorId && (
        <CreateGalleryModal
          vendorId={vendorId}
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}
