import { useState } from 'react'
import { ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Lightbulb } from 'lucide-react'
import { useBudgetStore } from '../../../store/useBudgetStore'
import { BUDGET_CATEGORIES } from '../data/categories'
import { VendorMatchCard } from './VendorMatchCard'
import { EmailCaptureModal } from './EmailCaptureModal'
import type { CategoryBudget } from '../lib/calculator'
import type { VendorMatch } from '../lib/vendorMatcher'

interface CategoryRowProps {
  budget: CategoryBudget
  vendorMatches?: VendorMatch[]
}

const TIER_STYLES: Record<string, string> = {
  budget: 'text-blue-700 bg-blue-50 border-blue-200',
  mid: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  premium: 'text-purple-700 bg-purple-50 border-purple-200',
  skip: 'text-gray-500 bg-gray-50 border-gray-200',
}

export function CategoryRow({ budget, vendorMatches = [] }: CategoryRowProps) {
  const cat = BUDGET_CATEGORIES.find((c) => c.id === budget.categoryId)!
  const customAllocations = useBudgetStore((s) => s.customAllocations)
  const setCustomAllocation = useBudgetStore((s) => s.setCustomAllocation)
  const toggleSkipCategory = useBudgetStore((s) => s.toggleSkipCategory)
  const emailCaptured = useBudgetStore((s) => s.emailCaptured)

  const [expanded, setExpanded] = useState(false)
  const [captureFor, setCaptureFor] = useState<{ id: string; name: string } | null>(null)

  const sliderValue = customAllocations[cat.id] ?? cat.defaultPercent
  const isSkipped = budget.tier === 'skip'

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAllocation(cat.id, Number(e.target.value))
  }

  return (
    <>
      <div
        className={`border rounded-xl transition-all duration-200 ${
          budget.isOverBudget ? 'border-red-300 bg-red-50/30' : 'border-border bg-white'
        } ${isSkipped ? 'opacity-50' : ''}`}
      >
        {/* Main row */}
        <div className="flex items-center gap-3 p-3">
          <span className="text-xl shrink-0">{cat.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-text">{cat.name}</span>
              <span className={`px-1.5 py-0.5 rounded-full border text-[10px] font-medium ${TIER_STYLES[budget.tier]}`}>
                {budget.tierLabel}
              </span>
              {budget.isOverBudget && (
                <span className="text-[10px] text-red-600 font-medium">⚠ Tight</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-base font-bold text-text">
                {isSkipped ? '—' : `$${budget.allocatedAmount.toLocaleString()}`}
              </span>
              <span className="text-xs text-text-secondary">
                {isSkipped ? 'Skipped' : `${budget.allocatedPercent.toFixed(0)}%`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {cat.skippable && (
              <button
                onClick={() => toggleSkipCategory(cat.id)}
                className="text-text-secondary hover:text-brand transition-colors"
                title={isSkipped ? 'Include' : 'Skip'}
              >
                {isSkipped ? (
                  <ToggleLeft className="w-5 h-5" />
                ) : (
                  <ToggleRight className="w-5 h-5 text-brand" />
                )}
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-lg hover:bg-surface text-text-secondary transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Slider */}
        {!isSkipped && (
          <div className="px-3 pb-3">
            <input
              type="range"
              min={cat.minPercent}
              max={cat.maxPercent}
              step={0.5}
              value={sliderValue}
              onChange={handleSlider}
              className="w-full accent-brand h-1.5"
              style={{ accentColor: cat.color }}
            />
            <div className="flex justify-between text-[10px] text-text-secondary mt-0.5">
              <span>{cat.minPercent}%</span>
              <span className="text-xs font-medium" style={{ color: cat.color }}>
                {sliderValue.toFixed(0)}%
              </span>
              <span>{cat.maxPercent}%</span>
            </div>
          </div>
        )}

        {/* Expanded section */}
        {expanded && !isSkipped && (
          <div className="border-t border-border px-3 py-3 space-y-3">
            {/* Tips */}
            <div className="space-y-1.5">
              {cat.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary">{tip}</p>
                </div>
              ))}
            </div>

            {/* Vendor matches */}
            {cat.isVowVendorsCategory && vendorMatches.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text mb-2 flex items-center gap-1">
                  📍 Matched vendors
                  <span className="text-text-secondary font-normal">in your area</span>
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {vendorMatches.map((match) => (
                    <VendorMatchCard
                      key={match.vendor.id}
                      match={match}
                      emailCaptured={emailCaptured}
                      onUnlockClick={(id, name) => setCaptureFor({ id, name })}
                    />
                  ))}
                </div>
                {vendorMatches.length === 0 && (
                  <p className="text-xs text-text-secondary italic">
                    No vendors found in your area yet. Search all {cat.name.toLowerCase()} vendors.
                  </p>
                )}
              </div>
            )}

            {cat.isVowVendorsCategory && vendorMatches.length === 0 && (
              <p className="text-xs text-text-secondary italic">
                Select your state to see matched vendors
              </p>
            )}
          </div>
        )}
      </div>

      {captureFor && (
        <EmailCaptureModal
          vendorId={captureFor.id}
          vendorName={captureFor.name}
          onClose={() => setCaptureFor(null)}
        />
      )}
    </>
  )
}
