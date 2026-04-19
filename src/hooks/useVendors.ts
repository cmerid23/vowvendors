import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Vendor } from '../types/database'

interface UseVendorsOptions {
  category?: string
  state?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  weddingDate?: string
}

export function useVendors(options: UseVendorsOptions = {}) {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const PAGE_SIZE = 9

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('vendors')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('avg_rating', { ascending: false })

      if (options.category) query = query.eq('category', options.category)
      if (options.state) query = query.eq('state', options.state)
      if (options.minPrice) query = query.gte('starting_price', options.minPrice)
      if (options.maxPrice && options.maxPrice !== Infinity) query = query.lte('starting_price', options.maxPrice)

      if (options.weddingDate) {
        const { data: unavail } = await supabase
          .from('vendor_availability')
          .select('vendor_id')
          .eq('date', options.weddingDate)
          .in('status', ['booked', 'tentative'])
        const excludeIds = (unavail || []).map((r: { vendor_id: string }) => r.vendor_id)
        if (excludeIds.length > 0) query = query.not('id', 'in', `(${excludeIds.join(',')})`)
      }

      const page = options.page ?? 0
      query = query.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

      const { data, error: err, count } = await query
      if (err) throw err
      setVendors(data || [])
      setTotal(count || 0)
    } catch (err) {
      setError('Failed to load vendors. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [options.category, options.state, options.minPrice, options.maxPrice, options.page, options.weddingDate])

  useEffect(() => { fetch() }, [fetch])

  return { vendors, loading, error, total, refetch: fetch, PAGE_SIZE }
}
