import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { WedPoseHome } from '../../features/wedpose/pages/WedPoseHome'
import { WedPoseCategory } from '../../features/wedpose/pages/WedPoseCategory'
import { WedPoseFavorites } from '../../features/wedpose/pages/WedPoseFavorites'
import { WedPoseSearch } from '../../features/wedpose/pages/WedPoseSearch'
import { WedPoseSettings } from '../../features/wedpose/pages/WedPoseSettings'

function InspirationBoard() {
  return (
    <div className="text-center py-20">
      <Camera className="mx-auto mb-4 text-brand" size={48} />
      <h2 className="font-display text-2xl text-ink font-semibold mb-2">Inspiration Board</h2>
      <p className="text-ink-400 font-body text-sm max-w-sm mx-auto leading-relaxed">
        The full WedPose posing reference tool is available for photographers and videographers.
        Browse our vendor directory for posing inspiration tailored to your category.
      </p>
    </div>
  )
}

export function VendorWedPosePage() {
  const profile = useAuthStore((s) => s.profile)
  const authLoading = useAuthStore((s) => s.isLoading)
  const [vendorCategory, setVendorCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!profile) { setLoading(false); return }
    supabase
      .from('vendors')
      .select('category')
      .eq('user_id', profile.id)
      .single()
      .then(({ data }) => {
        setVendorCategory(data?.category ?? null)
        setLoading(false)
      })
  }, [profile, authLoading])

  if (loading || authLoading) return <div className="skeleton h-64 rounded-card" />

  // Only restrict if category is explicitly set to a non-photo/video category
  const isRestricted = vendorCategory !== null &&
    vendorCategory !== 'photographer' &&
    vendorCategory !== 'videographer'
  if (isRestricted) return <InspirationBoard />

  return (
    <div className="wedpose-embedded">
      <Routes>
        <Route index element={<WedPoseHome />} />
        <Route path="category/:categoryId" element={<WedPoseCategory />} />
        <Route path="favorites" element={<WedPoseFavorites />} />
        <Route path="search" element={<WedPoseSearch />} />
        <Route path="settings" element={<WedPoseSettings />} />
      </Routes>
    </div>
  )
}
