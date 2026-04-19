import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Vendor, PortfolioImage, Review } from '../types/database'

export function useVendorProfile(vendorId: string | undefined) {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!vendorId) return
    setLoading(true)
    Promise.all([
      supabase.from('vendors').select('*').eq('id', vendorId).single(),
      supabase.from('portfolio_images').select('*').eq('vendor_id', vendorId).order('display_order'),
      supabase.from('reviews').select('*').eq('vendor_id', vendorId).order('created_at', { ascending: false }),
    ]).then(([v, p, r]) => {
      if (v.error) { setError('Vendor not found'); return }
      setVendor(v.data)
      setPortfolio(p.data || [])
      setReviews(r.data || [])
    }).finally(() => setLoading(false))
  }, [vendorId])

  return { vendor, portfolio, reviews, loading, error }
}
