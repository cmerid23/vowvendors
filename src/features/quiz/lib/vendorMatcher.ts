import type { Vendor } from '../../../types/database'
import type { StyleProfile } from '../data/profiles'

export interface StyleVendorMatch {
  vendor: Vendor & { style_tags?: string[] }
  matchScore: number
  matchedTags: string[]
}

export function matchVendorsToProfile(
  vendors: (Vendor & { style_tags?: string[] })[],
  profile: StyleProfile,
): StyleVendorMatch[] {
  return vendors
    .map((vendor) => {
      const tags = vendor.style_tags ?? []
      const matchedTags = tags.filter((t) => profile.vendorTags.includes(t))
      const matchScore = tags.length > 0
        ? Math.round((matchedTags.length / Math.max(profile.vendorTags.length, tags.length)) * 100)
        : 0
      return { vendor, matchScore, matchedTags }
    })
    .filter((m) => m.matchScore > 0 || m.vendor.is_featured)
    .sort((a, b) => b.matchScore - a.matchScore)
}
