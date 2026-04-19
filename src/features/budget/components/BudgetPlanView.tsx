import { useEffect, useState } from 'react'
import { RefreshCw, Download, Share2 } from 'lucide-react'
import { useBudgetStore } from '../../../store/useBudgetStore'
import { BUDGET_CATEGORIES } from '../data/categories'
import { matchVendorsToCategory } from '../lib/vendorMatcher'
import { BudgetDonutChart } from './BudgetDonutChart'
import { BudgetAlerts } from './BudgetAlerts'
import { CategoryRow } from './CategoryRow'
import { supabase } from '../../../lib/supabase'
import type { Vendor } from '../../../types/database'
import type { VendorMatch } from '../lib/vendorMatcher'

export function BudgetPlanView() {
  const plan = useBudgetStore((s) => s.plan)
  const state = useBudgetStore((s) => s.state)
  const clearPlan = useBudgetStore((s) => s.clearPlan)
  const resetAllocations = useBudgetStore((s) => s.resetAllocations)
  const calculate = useBudgetStore((s) => s.calculate)

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorMatchMap, setVendorMatchMap] = useState<Record<string, VendorMatch[]>>({})

  useEffect(() => {
    if (!plan) return
    const query = supabase
      .from('vendors')
      .select('*')
      .eq('is_active', true)
    if (state) query.eq('state', state)

    query.then(({ data }) => {
      const allVendors = (data as Vendor[]) || []
      setVendors(allVendors)

      const matchMap: Record<string, VendorMatch[]> = {}
      BUDGET_CATEGORIES.filter((c) => c.isVowVendorsCategory).forEach((cat) => {
        const catBudget = plan.categories.find((c) => c.categoryId === cat.id)
        if (!catBudget || catBudget.tier === 'skip') return
        matchMap[cat.id] = matchVendorsToCategory(
          allVendors,
          cat.id,
          catBudget.allocatedAmount,
          state
        )
      })
      setVendorMatchMap(matchMap)
    })
  }, [plan, state])

  // Re-run matches when plan updates (sliders moved)
  useEffect(() => {
    if (!plan || vendors.length === 0) return
    const matchMap: Record<string, VendorMatch[]> = {}
    BUDGET_CATEGORIES.filter((c) => c.isVowVendorsCategory).forEach((cat) => {
      const catBudget = plan.categories.find((c) => c.categoryId === cat.id)
      if (!catBudget || catBudget.tier === 'skip') return
      matchMap[cat.id] = matchVendorsToCategory(
        vendors,
        cat.id,
        catBudget.allocatedAmount,
        state
      )
    })
    setVendorMatchMap(matchMap)
  }, [plan])

  if (!plan) return null

  const scoreColors: Record<string, string> = {
    tight: 'bg-red-50 border-red-200 text-red-800',
    moderate: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    comfortable: 'bg-blue-50 border-blue-200 text-blue-800',
    generous: 'bg-green-50 border-green-200 text-green-800',
  }

  return (
    <div className="space-y-6">
      {/* Score banner */}
      <div className={`flex items-center justify-between px-5 py-3.5 rounded-xl border ${scoreColors[plan.score.overall]}`}>
        <div>
          <p className="font-semibold text-sm">{plan.score.label}</p>
          <p className="text-xs opacity-80 mt-0.5">
            ${plan.totalBudget.toLocaleString()} total · {plan.guestCount} guests · ${plan.perPersonCost.toLocaleString()}/person
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { resetAllocations(); calculate() }}
            className="p-1.5 rounded-lg hover:bg-black/10 transition-colors"
            title="Reset allocations"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={clearPlan}
            className="text-xs font-medium underline underline-offset-2 opacity-70 hover:opacity-100"
          >
            Start over
          </button>
        </div>
      </div>

      {/* Alerts */}
      {plan.alerts.length > 0 && <BudgetAlerts alerts={plan.alerts} />}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Donut */}
        <div className="lg:col-span-2 flex items-center justify-center">
          <BudgetDonutChart
            categories={plan.categories}
            totalBudget={plan.totalBudget}
            perPersonCost={plan.perPersonCost}
          />
        </div>

        {/* Category rows */}
        <div className="lg:col-span-3 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              Drag sliders to redistribute
            </p>
          </div>
          {plan.categories.map((catBudget) => (
            <CategoryRow
              key={catBudget.categoryId}
              budget={catBudget}
              vendorMatches={vendorMatchMap[catBudget.categoryId] ?? []}
            />
          ))}
        </div>
      </div>

      {/* Share / Export row */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'My Wedding Budget Plan', url: window.location.href })
            } else {
              navigator.clipboard.writeText(window.location.href)
            }
          }}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-brand transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" /> Share plan
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-brand transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Print / Save PDF
        </button>
        <p className="text-xs text-text-secondary ml-auto">
          Based on 2025 US wedding industry averages
        </p>
      </div>
    </div>
  )
}
