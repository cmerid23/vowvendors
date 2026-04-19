import { useState, useEffect } from 'react'
import { useFavoritesStore } from '../../store/useFavoritesStore'
import { supabase } from '../../lib/supabase'
import { VendorCard, VendorCardSkeleton } from '../../components/vendor/VendorCard'
import type { Vendor } from '../../types/database'

export function CustomerFavoritesPage() {
  const vendorIds = useFavoritesStore((s) => s.vendorIds)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!vendorIds.length) { setLoading(false); setVendors([]); return }
    supabase.from('vendors').select('*').in('id', vendorIds).then(({ data }) => {
      setVendors(data || [])
      setLoading(false)
    })
  }, [vendorIds])

  return (
    <div>
      <h1 className="font-display text-3xl text-ink font-semibold mb-6">Saved Vendors</h1>
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => <VendorCardSkeleton key={i} />)}
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-16 text-ink-400 font-body">
          <p className="text-4xl mb-3">♡</p>
          <p>No saved vendors yet. Tap the heart icon on any vendor to save them here.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {vendors.map((v) => <VendorCard key={v.id} vendor={v} />)}
        </div>
      )}
    </div>
  )
}
