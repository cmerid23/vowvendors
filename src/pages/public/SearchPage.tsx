import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { useVendors } from '../../hooks/useVendors'
import { VendorCard, VendorCardSkeleton } from '../../components/vendor/VendorCard'
import { Button } from '../../components/ui/Button'
import { US_STATES, SERVICE_CATEGORIES, PRICE_RANGES } from '../../utils/constants'
import { WeddingDateFilter } from '../../features/availability/components/WeddingDateFilter'
import { BudgetWidget } from '../../features/budget/components/BudgetWidget'
import { SearchGate } from '../../features/search/components/SearchGate'
import { ExitIntentModal } from '../../features/search/components/ExitIntentModal'
import { useExitIntent } from '../../hooks/useExitIntent'
import { useAuthStore } from '../../store/useAuthStore'

const GUEST_PREVIEW_COUNT = 3

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [state, setState] = useState(searchParams.get('state') || '')
  const [priceRange, setPriceRange] = useState(0)
  const [weddingDate, setWeddingDate] = useState(searchParams.get('date') || '')
  const [page, setPage] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)

  const { user } = useAuthStore()
  const isGuest = !user

  useExitIntent(() => setExitOpen(true), isGuest)

  const range = PRICE_RANGES[priceRange]
  const { vendors, loading, total, PAGE_SIZE } = useVendors({
    category, state,
    minPrice: range.min || undefined,
    maxPrice: range.max === Infinity ? undefined : range.max,
    weddingDate: weddingDate || undefined,
    page,
  })

  useEffect(() => {
    const params: Record<string, string> = {}
    if (category) params.category = category
    if (state) params.state = state
    if (weddingDate) params.date = weddingDate
    setSearchParams(params, { replace: true })
    setPage(0)
  }, [category, state, priceRange, weddingDate])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-ink font-semibold">
            {category ? SERVICE_CATEGORIES.find((c) => c.id === category)?.label + 's' : 'All Vendors'}
            {state ? ` in ${state}` : ''}
          </h1>
          {!loading && <p className="text-ink-400 font-body text-sm mt-0.5">{total} vendor{total !== 1 ? 's' : ''} found</p>}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="btn-ghost flex items-center gap-2 sm:hidden"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} sm:block w-full sm:w-56 shrink-0 space-y-5`}>
          <div>
            <p className="font-body font-medium text-sm text-ink mb-2">Category</p>
            <div className="space-y-1">
              <button
                onClick={() => setCategory('')}
                className={`w-full text-left px-3 py-1.5 rounded text-sm font-body transition-colors ${!category ? 'text-brand font-medium bg-brand/5' : 'text-ink-400 hover:text-ink'}`}
              >
                All services
              </button>
              {SERVICE_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(category === c.id ? '' : c.id)}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm font-body transition-colors ${category === c.id ? 'text-brand font-medium bg-brand/5' : 'text-ink-400 hover:text-ink'}`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-body font-medium text-sm text-ink mb-2">State</p>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="input-field text-xs"
            >
              <option value="">All states</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <p className="font-body font-medium text-sm text-ink mb-2">Wedding Date</p>
            <WeddingDateFilter
              value={weddingDate}
              onChange={(d) => { setWeddingDate(d); setPage(0) }}
              onClear={() => { setWeddingDate(''); setPage(0) }}
            />
            {weddingDate && (
              <p className="text-xs text-text-secondary mt-1">Showing vendors available on this date</p>
            )}
          </div>

          <div>
            <p className="font-body font-medium text-sm text-ink mb-2">Starting price</p>
            <div className="space-y-1">
              {PRICE_RANGES.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setPriceRange(i)}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm font-body transition-colors ${priceRange === i ? 'text-brand font-medium bg-brand/5' : 'text-ink-400 hover:text-ink'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <BudgetWidget />
          </div>

          {(category || state || priceRange > 0 || weddingDate) && (
            <button
              onClick={() => { setCategory(''); setState(''); setPriceRange(0); setWeddingDate('') }}
              className="text-xs text-red-400 hover:text-red-600 font-body"
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <VendorCardSkeleton key={i} />)}
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">🔍</p>
              <h2 className="font-display text-2xl text-ink mb-2">No vendors found</h2>
              <p className="text-ink-400 font-body text-sm">Try adjusting your filters or searching in a different state.</p>
            </div>
          ) : (
            <>
              {/* Guest preview: show first N cards, gate the rest */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(isGuest ? vendors.slice(0, GUEST_PREVIEW_COUNT) : vendors).map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>

              {isGuest && total > GUEST_PREVIEW_COUNT && (
                <SearchGate total={total} shown={Math.min(vendors.length, GUEST_PREVIEW_COUNT)} />
              )}

              {/* Pagination — only for logged-in users */}
              {!isGuest && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  {page > 0 && (
                    <Button variant="outline" onClick={() => setPage((p) => p - 1)}>Previous</Button>
                  )}
                  <span className="text-ink-400 font-body text-sm">
                    Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
                  </span>
                  {(page + 1) * PAGE_SIZE < total && (
                    <Button variant="outline" onClick={() => setPage((p) => p + 1)}>Next</Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ExitIntentModal open={exitOpen} onClose={() => setExitOpen(false)} />
    </div>
  )
}
