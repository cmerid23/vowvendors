import { Share2, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import type { StyleProfile } from '../data/profiles'

interface StyleProfileCardProps {
  profile: StyleProfile
  matchPercent: number
  onRetake: () => void
}

export function StyleProfileCard({ profile, matchPercent, onRetake }: StyleProfileCardProps) {
  const handleShare = async () => {
    const text = `I just discovered my wedding style: ${profile.name} — "${profile.tagline}" ✨ Take the quiz at VowVendors!`
    if (navigator.share) {
      await navigator.share({ title: 'My Wedding Style', text, url: window.location.href }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden shadow-card-hover border border-border"
      style={{ background: profile.bgColor }}
    >
      {/* Header banner */}
      <div
        className="px-6 py-8 text-center"
        style={{ background: `linear-gradient(135deg, ${profile.accentColor}22, ${profile.accentColor}44)` }}
      >
        <div className="text-5xl mb-3">{profile.icon}</div>
        <div
          className="inline-block text-xs font-body font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
          style={{ background: `${profile.accentColor}30`, color: profile.textColor }}
        >
          {matchPercent}% Match
        </div>
        <h2
          className="font-display text-3xl font-semibold mb-1"
          style={{ color: profile.textColor }}
        >
          {profile.name}
        </h2>
        <p className="font-body text-sm font-medium" style={{ color: `${profile.textColor}99` }}>
          {profile.tagline}
        </p>
      </div>

      <div className="px-6 py-5 space-y-5">
        <p className="font-body text-ink-400 text-sm leading-relaxed">{profile.description}</p>

        <div>
          <p className="font-body text-xs uppercase tracking-widest text-ink-300 mb-2.5">Your priorities</p>
          <ul className="space-y-1.5">
            {profile.priorities.map((p) => (
              <li key={p} className="flex items-center gap-2 font-body text-sm text-ink-600">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: profile.accentColor }} />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-body text-xs uppercase tracking-widest text-ink-300 mb-2.5">Vibe references</p>
          <div className="flex flex-wrap gap-2">
            {profile.vibeReferences.map((ref) => (
              <span
                key={ref}
                className="font-body text-xs px-2.5 py-1 rounded-full border"
                style={{ borderColor: `${profile.accentColor}40`, color: profile.textColor }}
              >
                {ref}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-body text-sm font-medium transition-colors hover:bg-surface"
            style={{ borderColor: `${profile.accentColor}60`, color: profile.textColor }}
          >
            <Share2 size={14} /> Share Result
          </button>
          <button
            onClick={onRetake}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-body text-sm font-medium transition-colors hover:bg-surface text-ink-400 border-border"
          >
            <RotateCcw size={14} /> Retake Quiz
          </button>
        </div>
      </div>
    </motion.div>
  )
}
