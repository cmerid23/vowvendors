import { BUDGET_CATEGORIES } from '../data/categories'

export interface BudgetInput {
  totalBudget: number
  guestCount: number
  weddingDate: string
  state: string
  skippedCategories: string[]
  customAllocations: Record<string, number>
}

export interface CategoryBudget {
  categoryId: string
  allocatedPercent: number
  allocatedAmount: number
  tier: 'budget' | 'mid' | 'premium' | 'skip'
  tierLabel: string
  isOverBudget: boolean
  savingsTip: string
}

export interface BudgetAlert {
  type: 'warning' | 'info' | 'success'
  categoryId?: string
  message: string
}

export interface BudgetScore {
  overall: 'tight' | 'moderate' | 'comfortable' | 'generous'
  label: string
  color: string
  percentage: number
}

export interface BudgetPlan {
  totalBudget: number
  guestCount: number
  perPersonCost: number
  categories: CategoryBudget[]
  alerts: BudgetAlert[]
  score: BudgetScore
  createdAt: string
}

const REGIONAL_MULTIPLIERS: Record<string, number> = {
  NY: 1.45, CA: 1.40, MA: 1.35, WA: 1.25, IL: 1.20,
  NJ: 1.35, CT: 1.30, DC: 1.50, MD: 1.25, VA: 1.10,
  TX: 1.05, FL: 1.05, GA: 1.00, NC: 0.95, TN: 0.90,
  OH: 0.90, MI: 0.88, AZ: 0.95, CO: 1.10, NV: 1.15,
  PA: 1.05, MN: 1.00, WI: 0.90, MO: 0.88, IN: 0.85,
  KY: 0.85, AL: 0.82, MS: 0.80, AR: 0.80, OK: 0.85,
  KS: 0.85, NE: 0.88, IA: 0.85, SD: 0.82, ND: 0.82,
  MT: 0.90, WY: 0.88, ID: 0.92, UT: 0.95, NM: 0.88,
  HI: 1.60, AK: 1.30, OR: 1.15, ME: 1.05, NH: 1.10,
  VT: 1.05, RI: 1.20, DE: 1.10, WV: 0.82, SC: 0.92,
  LA: 0.92,
}

function getSeasonMultiplier(isoDate: string): number {
  if (!isoDate) return 1.0
  const month = new Date(isoDate).getMonth()
  const peakMonths = [4, 5, 8, 9]
  const offPeakMonths = [0, 1, 10, 11]
  if (peakMonths.includes(month)) return 1.15
  if (offPeakMonths.includes(month)) return 0.88
  return 1.0
}

export function calculateBudgetPlan(input: BudgetInput): BudgetPlan {
  const regionalMultiplier = REGIONAL_MULTIPLIERS[input.state] ?? 1.0
  const seasonMultiplier = getSeasonMultiplier(input.weddingDate)

  const guestMultiplier =
    input.guestCount > 100
      ? 1 + ((input.guestCount - 100) / 50) * 0.08
      : input.guestCount < 50
      ? 0.75
      : 1.0

  // Build raw allocation weights
  const rawAllocations: Record<string, number> = {}
  let totalWeight = 0

  BUDGET_CATEGORIES.forEach((cat) => {
    if (input.skippedCategories.includes(cat.id)) {
      rawAllocations[cat.id] = 0
    } else {
      rawAllocations[cat.id] = input.customAllocations[cat.id] ?? cat.defaultPercent
    }
    totalWeight += rawAllocations[cat.id]
  })

  // Normalize to 100%
  const normFactor = totalWeight > 0 ? 100 / totalWeight : 1

  const categories: CategoryBudget[] = BUDGET_CATEGORIES.map((cat) => {
    const rawPct = rawAllocations[cat.id] ?? 0
    const normalizedPct = rawPct * normFactor
    let amount = (normalizedPct / 100) * input.totalBudget

    // Scale with guest count where applicable
    if (cat.scalesWithGuests) {
      amount = amount * guestMultiplier
    }

    // Regional + season adjust for display tier comparison only
    const adjustedAmount = amount / (regionalMultiplier * seasonMultiplier)

    let tier: CategoryBudget['tier'] = 'budget'
    let tierLabel = 'Budget-friendly'

    if (normalizedPct === 0) {
      tier = 'skip'
      tierLabel = 'Skipped'
    } else if (adjustedAmount >= cat.premiumTierMin && cat.premiumTierMin > 0) {
      tier = 'premium'
      tierLabel = 'Premium'
    } else if (adjustedAmount >= cat.midTierMin && cat.midTierMin > 0) {
      tier = 'mid'
      tierLabel = 'Mid-range'
    } else {
      tier = 'budget'
      tierLabel = 'Budget-friendly'
    }

    const isOverBudget =
      tier === 'budget' &&
      !cat.skippable &&
      cat.midTierMin > 0 &&
      adjustedAmount < cat.midTierMin * 0.4

    return {
      categoryId: cat.id,
      allocatedPercent: Math.round(normalizedPct * 10) / 10,
      allocatedAmount: Math.round(amount),
      tier,
      tierLabel,
      isOverBudget,
      savingsTip: cat.tips[0],
    }
  })

  // Alerts
  const alerts: BudgetAlert[] = []

  const cateringBudget = categories.find((c) => c.categoryId === 'catering')
  const perPersonCatering = cateringBudget
    ? cateringBudget.allocatedAmount / input.guestCount
    : 0

  if (perPersonCatering > 0 && perPersonCatering < 35) {
    alerts.push({
      type: 'warning',
      categoryId: 'catering',
      message: `Your catering budget works out to $${Math.round(perPersonCatering)}/person. Most caterers require $45+ minimum. Consider reducing guest count or reallocating budget.`,
    })
  }

  const perPersonTotal = input.totalBudget / input.guestCount
  if (perPersonTotal < 150) {
    alerts.push({
      type: 'warning',
      message: `At $${Math.round(perPersonTotal)}/person total, you may need to reduce your guest list. Industry average is $220–$300 per person.`,
    })
  }

  const bufferAmount = categories.find((c) => c.categoryId === 'buffer')?.allocatedAmount ?? 0
  if (bufferAmount < 500) {
    alerts.push({
      type: 'info',
      categoryId: 'buffer',
      message: 'Your buffer fund is under $500. Most couples spend 15–20% more than planned. Consider keeping at least $1,000 in reserve.',
    })
  }

  if (input.guestCount <= 50) {
    alerts.push({
      type: 'success',
      message: 'Intimate weddings under 50 guests unlock micro-wedding packages — many vendors offer 30–40% discounts.',
    })
  }

  if (regionIsExpensive(input.state) && seasonMultiplier > 1) {
    alerts.push({
      type: 'info',
      message: `Wedding costs in ${input.state} run ${Math.round((regionalMultiplier - 1) * 100)}% above national average. Your peak-season date adds another ~15%. Consider an off-peak date to save significantly.`,
    })
  }

  // Score
  const score = computeScore(perPersonTotal)

  return {
    totalBudget: input.totalBudget,
    guestCount: input.guestCount,
    perPersonCost: Math.round(perPersonTotal),
    categories,
    alerts,
    score,
    createdAt: new Date().toISOString(),
  }
}

function regionIsExpensive(state: string): boolean {
  return (REGIONAL_MULTIPLIERS[state] ?? 1.0) >= 1.20
}

function computeScore(perPerson: number): BudgetScore {
  if (perPerson >= 300) {
    return { overall: 'generous', label: 'Generous budget — lots of flexibility', color: '#059669', percentage: 90 }
  }
  if (perPerson >= 200) {
    return { overall: 'comfortable', label: 'Comfortable — good options available', color: '#D97706', percentage: 68 }
  }
  if (perPerson >= 120) {
    return { overall: 'moderate', label: 'Moderate — some trade-offs needed', color: '#F59E0B', percentage: 42 }
  }
  return { overall: 'tight', label: 'Tight — prioritize carefully', color: '#DC2626', percentage: 18 }
}
