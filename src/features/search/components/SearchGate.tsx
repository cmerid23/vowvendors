import { useNavigate } from 'react-router-dom'
import { Lock, ArrowRight, Sparkles } from 'lucide-react'

interface SearchGateProps {
  total: number
  shown: number
}

export function SearchGate({ total, shown }: SearchGateProps) {
  const navigate = useNavigate()
  const hidden = total - shown

  return (
    <div className="relative mt-2">
      {/* Ghost cards behind blur */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 pointer-events-none select-none">
        {Array.from({ length: Math.min(hidden, 3) }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-surface border border-border h-64 animate-pulse opacity-60" />
        ))}
      </div>

      {/* Blur + overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center">
        <div className="text-center px-6 py-8 max-w-sm mx-auto">
          <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-brand" size={22} />
          </div>

          <h3 className="font-display text-xl text-ink font-semibold mb-2">
            {hidden} More Vendor{hidden !== 1 ? 's' : ''} Waiting
          </h3>
          <p className="font-body text-ink-400 text-sm mb-1 leading-relaxed">
            You're seeing {shown} of {total} results. Sign in for free to view full profiles, availability, and pricing.
          </p>

          <div className="inline-flex items-center gap-1.5 text-brand text-xs font-body font-semibold bg-brand/8 px-3 py-1.5 rounded-full mb-5">
            <Sparkles size={11} /> Members get 15% off their first booking
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigate('/register')}
              className="w-full flex items-center justify-center gap-2 bg-brand text-white font-body font-semibold text-sm py-3 rounded-xl hover:bg-brand/90 transition-colors"
            >
              Create Free Account <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full text-center font-body text-sm text-ink-400 hover:text-ink py-2 transition-colors"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
