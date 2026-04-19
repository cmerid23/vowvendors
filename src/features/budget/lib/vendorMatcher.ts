import type { Vendor } from '../../../types/database'

export interface VendorMatch {
  vendor: Vendor
  matchType: 'perfect' | 'stretch' | 'save' | 'over'
  matchLabel: string
  matchColor: string
  priceDiff: number
  priceDiffPercent: number
}

const CAT_TO_TYPE: Record<string, Vendor['category']> = {
  photography: 'photographer',
  videography: 'videographer',
  decor: 'decor',
  music: 'music',
}

export function matchVendorsToCategory(
  vendors: Vendor[],
  categoryId: string,
  allocatedAmount: number,
  _state: string
): VendorMatch[] {
  const vendorType = CAT_TO_TYPE[categoryId]
  if (!vendorType) return []

  return vendors
    .filter(
      (v) => v.category === vendorType && v.is_active && v.starting_price !== null
    )
    .map((v) => {
      const price = v.starting_price ?? 0
      const diff = price - allocatedAmount
      const diffPercent = allocatedAmount > 0 ? (diff / allocatedAmount) * 100 : 0

      let matchType: VendorMatch['matchType']
      let matchLabel: string
      let matchColor: string

      if (diffPercent <= 10 && diffPercent >= -20) {
        matchType = 'perfect'
        matchLabel = 'Within budget'
        matchColor = '#059669'
      } else if (diffPercent > 10 && diffPercent <= 30) {
        matchType = 'stretch'
        matchLabel = 'Slight stretch'
        matchColor = '#D97706'
      } else if (diffPercent < -20) {
        matchType = 'save'
        matchLabel = 'Great value'
        matchColor = '#2563EB'
      } else {
        matchType = 'over'
        matchLabel = 'Over budget'
        matchColor = '#DC2626'
      }

      return {
        vendor: v,
        matchType,
        matchLabel,
        matchColor,
        priceDiff: Math.round(diff),
        priceDiffPercent: Math.round(diffPercent),
      }
    })
    .sort((a, b) => {
      const order = { perfect: 0, save: 1, stretch: 2, over: 3 }
      return order[a.matchType] - order[b.matchType]
    })
    .slice(0, 6)
}
