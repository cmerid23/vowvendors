import type { StyleDimensions } from '../data/dimensions'
import { BASE_DIMENSIONS, DIMENSION_KEYS } from '../data/dimensions'
import { STYLE_PROFILES, type StyleProfile } from '../data/profiles'
import type { QuizOption } from '../data/questions'

export interface ProfileMatch {
  profile: StyleProfile
  score: number
  matchPercent: number
}

export function calculateDimensions(selectedOptions: QuizOption[]): StyleDimensions {
  const dims = { ...BASE_DIMENSIONS }
  for (const opt of selectedOptions) {
    for (const key of DIMENSION_KEYS) {
      const adj = opt.dimensionAdjustments[key]
      if (adj !== undefined) {
        dims[key] = Math.max(0, Math.min(10, dims[key] + adj))
      }
    }
  }
  return dims
}

function scoreProfileMatch(dims: StyleDimensions, profile: StyleProfile): number {
  let total = 0
  for (const key of DIMENSION_KEYS) {
    const val = dims[key]
    const [min, max] = profile.dimensionRanges[key]
    if (val >= min && val <= max) {
      const center = (min + max) / 2
      const halfRange = Math.max((max - min) / 2, 1)
      // Full point + bonus for being near center
      total += 1 + (1 - Math.abs(val - center) / halfRange) * 0.5
    } else {
      // Partial credit based on proximity to range
      const dist = val < min ? min - val : val - max
      total += Math.max(0, 1 - dist * 0.25)
    }
  }
  // Max possible per dimension is 1.5, so max total is 9
  return total / 9
}

export function matchProfiles(dims: StyleDimensions): ProfileMatch[] {
  return STYLE_PROFILES
    .map((profile) => {
      const score = scoreProfileMatch(dims, profile)
      return { profile, score, matchPercent: Math.round(score * 100) }
    })
    .sort((a, b) => b.score - a.score)
}

export function getPrimaryMatch(selectedOptions: QuizOption[]): ProfileMatch {
  const dims = calculateDimensions(selectedOptions)
  const matches = matchProfiles(dims)
  return matches[0]
}
