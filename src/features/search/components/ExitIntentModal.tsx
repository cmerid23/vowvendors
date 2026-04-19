import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Tag, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../lib/supabase'

const PROMO_CODE = 'FIRST15'
const DISCOUNT = 15

interface ExitIntentModalProps {
  open: boolean
  onClose: () => void
}

export function ExitIntentModal({ open, onClose }: ExitIntentModalProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [copying, setCopying] = useState(false)

  const handleClaim = async () => {
    if (email) {
      await supabase.from('leads').insert({
        name: 'Guest',
        email,
        source: 'exit-intent',
        message: `Claimed ${DISCOUNT}% off promo code ${PROMO_CODE}`,
        status: 'new',
      }).then(() => {})
    }
    setSubmitted(true)
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(PROMO_CODE)
    setCopying(true)
    setTimeout(() => setCopying(false), 1800)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner */}
            <div className="bg-ink px-6 pt-7 pb-5 text-center relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white/60 hover:text-white p-1"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="inline-flex items-center gap-2 bg-brand/20 text-brand px-3 py-1 rounded-full text-xs font-body font-semibold uppercase tracking-widest mb-3">
                <Tag size={11} /> Limited Offer
              </div>
              <h2 className="font-display text-3xl text-white font-semibold leading-tight">
                {DISCOUNT}% Off
              </h2>
              <p className="font-display text-lg text-white/80 mt-0.5">Your First Booking</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              {!submitted ? (
                <>
                  <p className="font-body text-ink-400 text-sm text-center leading-relaxed">
                    Don't leave without your exclusive discount. Drop your email and we'll send you the code — plus personalized vendor picks.
                  </p>

                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field w-full text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && email && handleClaim()}
                  />

                  <button
                    disabled={!email}
                    onClick={handleClaim}
                    className="w-full flex items-center justify-center gap-2 bg-brand text-white font-body font-semibold text-sm py-3 rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Claim My {DISCOUNT}% Off <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={() => { onClose(); navigate('/login') }}
                    className="w-full text-center text-xs font-body text-ink-300 hover:text-ink transition-colors"
                  >
                    Already have an account? Sign in
                  </button>
                </>
              ) : (
                <div className="text-center space-y-4 py-2">
                  <div className="text-4xl">🎉</div>
                  <div>
                    <p className="font-display text-xl text-ink font-semibold mb-1">You're all set!</p>
                    <p className="font-body text-ink-400 text-sm">Use this code when booking your first vendor:</p>
                  </div>

                  <button
                    onClick={copyCode}
                    className="w-full flex items-center justify-center gap-3 bg-surface border-2 border-dashed border-brand/40 rounded-xl py-3.5 group hover:border-brand transition-colors"
                  >
                    <span className="font-display text-2xl font-bold text-brand tracking-widest">{PROMO_CODE}</span>
                    <span className="font-body text-xs text-ink-400 group-hover:text-brand transition-colors">
                      {copying ? '✓ Copied!' : 'Tap to copy'}
                    </span>
                  </button>

                  <p className="font-body text-xs text-ink-300">Valid for new accounts · One use per customer</p>

                  <button
                    onClick={() => { onClose(); navigate('/register') }}
                    className="w-full flex items-center justify-center gap-2 bg-brand text-white font-body font-semibold text-sm py-3 rounded-xl hover:bg-brand/90 transition-colors"
                  >
                    Create Account & Save Code <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
