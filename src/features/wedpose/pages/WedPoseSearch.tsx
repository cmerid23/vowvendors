import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getAllSubcategories, CATEGORIES } from '../data/categories'

type FilterGroup = 'category' | 'setting' | 'subject'

const SETTING_FILTER = ['indoor', 'outdoor']
const SUBJECT_FILTER = ['solo', 'couple', 'group', 'family', 'details']

export function WedPoseSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialQ = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQ)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSetting, setActiveSetting] = useState<string | null>(null)
  const [activeSubject, setActiveSubject] = useState<string | null>(null)

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  const allSubs = useMemo(() => getAllSubcategories(), [])

  const results = useMemo(() => {
    return allSubs.filter((sub) => {
      const q = query.toLowerCase()
      const matchesQuery =
        !q ||
        sub.name.toLowerCase().includes(q) ||
        sub.categoryName.toLowerCase().includes(q) ||
        sub.tags.some((t) => t.includes(q))

      const matchesCategory = !activeCategory || sub.categoryId === activeCategory
      const matchesSetting = !activeSetting || sub.tags.some((t) => t === activeSetting)
      const matchesSubject = !activeSubject || sub.tags.some((t) => t === activeSubject)

      return matchesQuery && matchesCategory && matchesSetting && matchesSubject
    })
  }, [query, activeCategory, activeSetting, activeSubject, allSubs])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams(query ? { q: query } : {})
  }

  const toggleFilter = (type: FilterGroup, value: string) => {
    if (type === 'category') setActiveCategory((v) => (v === value ? null : value))
    if (type === 'setting') setActiveSetting((v) => (v === value ? null : value))
    if (type === 'subject') setActiveSubject((v) => (v === value ? null : value))
  }

  return (
    <div className="pt-2 animate-fade-in">
      <h1 className="font-display text-2xl sm:text-3xl text-cream font-semibold mb-6">Search Poses</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search poses, categories, tags..."
            className="w-full bg-charcoal-50 text-cream font-body text-sm px-5 py-3.5 pr-12 rounded-xl border border-gold/20 focus:outline-none focus:border-gold/60 placeholder:text-cream-400"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      <div className="space-y-3 mb-6">
        <div>
          <p className="text-cream-400 text-xs font-body uppercase tracking-wider mb-2">Category</p>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleFilter('category', cat.id)}
                className={`px-3 py-1.5 rounded-full font-body text-xs transition-colors
                  ${activeCategory === cat.id ? 'bg-gold text-charcoal font-medium' : 'bg-charcoal-50 text-cream-300 border border-gold/20 hover:border-gold/40'}`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <div>
            <p className="text-cream-400 text-xs font-body uppercase tracking-wider mb-2">Setting</p>
            <div className="flex gap-2">
              {SETTING_FILTER.map((v) => (
                <button
                  key={v}
                  onClick={() => toggleFilter('setting', v)}
                  className={`px-3 py-1.5 rounded-full font-body text-xs transition-colors capitalize
                    ${activeSetting === v ? 'bg-gold text-charcoal font-medium' : 'bg-charcoal-50 text-cream-300 border border-gold/20 hover:border-gold/40'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-cream-400 text-xs font-body uppercase tracking-wider mb-2">Subject</p>
            <div className="flex gap-2 flex-wrap">
              {SUBJECT_FILTER.map((v) => (
                <button
                  key={v}
                  onClick={() => toggleFilter('subject', v)}
                  className={`px-3 py-1.5 rounded-full font-body text-xs transition-colors capitalize
                    ${activeSubject === v ? 'bg-gold text-charcoal font-medium' : 'bg-charcoal-50 text-cream-300 border border-gold/20 hover:border-gold/40'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-cream-400 font-body text-sm">
          {results.length} pose{results.length !== 1 ? 's' : ''} found
        </p>
        {(activeCategory || activeSetting || activeSubject) && (
          <button
            onClick={() => { setActiveCategory(null); setActiveSetting(null); setActiveSubject(null) }}
            className="text-gold text-xs font-body hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="space-y-2">
        {results.map((sub) => (
          <button
            key={`${sub.categoryId}-${sub.id}`}
            onClick={() => navigate(`/vendor/wedpose/category/${sub.categoryId}?sub=${sub.id}`)}
            className="w-full bg-charcoal-50 hover:bg-charcoal-100 border border-gold/10 hover:border-gold/30 rounded-xl px-4 py-3 text-left transition-all flex items-center justify-between group"
          >
            <div>
              <p className="font-body text-cream text-sm font-medium group-hover:text-gold transition-colors">
                {sub.name}
              </p>
              <p className="text-cream-400 text-xs font-body mt-0.5">{sub.categoryName}</p>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {sub.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-xs text-cream-400 bg-charcoal px-2 py-0.5 rounded-full border border-gold/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-gold text-lg shrink-0 ml-3">→</span>
          </button>
        ))}
        {results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-cream-400 font-body text-sm">No poses match your search.</p>
            <button
              onClick={() => { setQuery(''); setActiveCategory(null); setActiveSetting(null); setActiveSubject(null) }}
              className="mt-3 wp-btn-outline text-xs"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
