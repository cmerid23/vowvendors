import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { ProfileMatch } from '../lib/profileMatcher'
import type { Vendor } from '../../../types/database'
import { matchVendorsToProfile } from '../lib/vendorMatcher'
import { StyleProfileCard } from './StyleProfileCard'
import { VendorStyleCard } from './VendorStyleCard'

interface QuizResultScreenProps {
  topMatches: ProfileMatch[]
  onRetake: () => void
}

export function QuizResultScreen({ topMatches, onRetake }: QuizResultScreenProps) {
  const navigate = useNavigate()
  const primary = topMatches[0]
  const runners = topMatches.slice(1, 4)
  const [vendors, setVendors] = useState<(Vendor & { style_tags?: string[] })[]>([])

  useEffect(() => {
    if (!primary) return
    supabase
      .from('vendors')
      .select('*')
      .eq('is_active', true)
      .limit(20)
      .then(({ data }) => {
        if (data) setVendors(data as (Vendor & { style_tags?: string[] })[])
      })
  }, [primary?.profile.id])

  if (!primary) return null

  const { profile, matchPercent } = primary
  const vendorMatches = matchVendorsToProfile(vendors, profile).slice(0, 6)

  return (
    <div className="space-y-8 pb-16">
      {/* Confetti-style header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-4"
      >
        <div className="inline-flex items-center gap-2 bg-blush-50 text-brand px-3 py-1.5 rounded-full text-xs font-body font-medium uppercase tracking-widest mb-4">
          <Sparkles size={12} /> Your Style Profile
        </div>
        <p className="font-body text-ink-400 text-sm">Based on your 8 answers</p>
      </motion.div>

      {/* Primary profile card */}
      <StyleProfileCard profile={profile} matchPercent={matchPercent} onRetake={onRetake} />

      {/* Runner-up profiles */}
      {runners.length > 0 && (
        <div>
          <h3 className="font-display text-xl text-ink font-semibold mb-4">Also resonates with you</h3>
          <div className="space-y-3">
            {runners.map(({ profile: p, matchPercent: pct }) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-white"
              >
                <span className="text-2xl">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base font-semibold text-ink truncate">{p.name}</p>
                  <p className="font-body text-xs text-ink-400 truncate">{p.tagline}</p>
                </div>
                <div
                  className="shrink-0 font-body text-sm font-semibold px-2.5 py-1 rounded-lg"
                  style={{ background: `${p.accentColor}20`, color: p.textColor }}
                >
                  {pct}%
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Vendor matches */}
      {vendorMatches.length > 0 && (
        <div>
          <h3 className="font-display text-xl text-ink font-semibold mb-1">Vendors who match your style</h3>
          <p className="font-body text-ink-400 text-sm mb-4">
            These vendors' portfolios align with the {profile.name} aesthetic
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {vendorMatches.map(({ vendor, matchScore, matchedTags }) => (
              <VendorStyleCard
                key={vendor.id}
                vendor={vendor}
                matchScore={matchScore}
                matchedTags={matchedTags}
                profile={profile}
              />
            ))}
          </div>
        </div>
      )}

      {/* CTA to search */}
      <div className="bg-ink text-white rounded-2xl p-6 text-center">
        <p className="font-display text-xl font-semibold mb-2">Ready to find your team?</p>
        <p className="font-body text-ink-300 text-sm mb-5">
          Browse all vendors and filter by your style tags
        </p>
        <button
          onClick={() => navigate('/search')}
          className="inline-flex items-center gap-2 bg-brand text-white font-body text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-brand/90 transition-colors"
        >
          Browse Vendors <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
