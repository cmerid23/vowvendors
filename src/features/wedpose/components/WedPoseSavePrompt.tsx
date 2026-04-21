import { useState } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../lib/supabase'
import { useWedPoseStore } from '../store/useWedPoseStore'

type Phase = 'form' | 'email-pending' | 'success'

export function WedPoseSavePrompt() {
  const pendingPose = useWedPoseStore((s) => s.pendingFavoritePose)
  const clearPending = useWedPoseStore((s) => s.setPendingFavoritePose)

  const [phase, setPhase] = useState<Phase>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isOpen = !!pendingPose

  const handleClose = () => {
    clearPending(null)
    setPhase('form')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) return
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim(), role: 'vendor' } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user && !data.session) {
      // Email confirmation required
      setPhase('email-pending')
      setLoading(false)
      return
    }

    if (data.user) {
      // Immediate session — create profile + vendor record
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email.trim(),
        full_name: name.trim(),
        role: 'vendor',
      })
      await supabase.from('vendors').insert({
        user_id: data.user.id,
        business_name: name.trim(),
        category: 'photographer',
        state: 'TX',
        is_active: false,
      }).then(() => {})

      // Mark new vendor so WedPoseLayout shows the welcome banner once
      sessionStorage.setItem('vv-wedpose-new-vendor', '1')
    }

    setPhase('success')
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — dim but don't block the poses behind */}
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={handleClose}
          />

          {/* Bottom sheet */}
          <motion.div
            key="save-prompt"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-charcoal-100 rounded-t-2xl shadow-2xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="w-10 h-1 bg-gold/30 rounded-full mx-auto mt-3 mb-4" />

            <div className="px-6 pb-6 max-w-md mx-auto">
              <button
                onClick={handleClose}
                className="absolute top-4 right-5 text-cream-400 hover:text-cream"
              >
                <X size={20} />
              </button>

              {phase === 'form' && (
                <>
                  <div className="mb-5">
                    <h3 className="font-display text-xl text-cream font-semibold">Save your pose favourites</h3>
                    <p className="font-body text-cream-400 text-sm mt-1 leading-relaxed">
                      Create a free account to keep your saved poses, build shot lists, and get found by couples in your state on VowVendors.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-charcoal-50 text-cream font-body text-sm px-4 py-3 rounded-xl border border-gold/20 focus:outline-none focus:border-gold/60 placeholder:text-cream-400"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-charcoal-50 text-cream font-body text-sm px-4 py-3 rounded-xl border border-gold/20 focus:outline-none focus:border-gold/60 placeholder:text-cream-400"
                    />
                    <input
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-charcoal-50 text-cream font-body text-sm px-4 py-3 rounded-xl border border-gold/20 focus:outline-none focus:border-gold/60 placeholder:text-cream-400"
                    />
                    {error && <p className="text-red-400 text-xs font-body">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-gold text-charcoal font-body font-semibold text-sm py-3.5 rounded-xl hover:bg-gold-200 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Creating account…' : <>Create Free Account <ArrowRight size={14} /></>}
                    </button>
                  </form>

                  <p className="text-center text-xs font-body text-cream-400 mt-4">
                    Already have an account?{' '}
                    <a href="/login" className="text-gold hover:underline">Sign in</a>
                  </p>
                  <p className="text-center text-xs font-body text-cream-400 mt-1.5">
                    Free forever for working photographers. No credit card.
                  </p>
                </>
              )}

              {phase === 'email-pending' && (
                <div className="text-center py-4 space-y-3">
                  <div className="text-4xl">📧</div>
                  <h3 className="font-display text-xl text-cream font-semibold">Check your email</h3>
                  <p className="font-body text-cream-400 text-sm leading-relaxed">
                    We sent a confirmation link to <span className="text-gold">{email}</span>. Click it to activate your account — your saved poses will be here when you return.
                  </p>
                  <button onClick={handleClose} className="wp-btn-outline mt-2">
                    Continue Browsing
                  </button>
                </div>
              )}

              {phase === 'success' && (
                <div className="text-center py-4 space-y-3">
                  <div className="text-4xl">✓</div>
                  <h3 className="font-display text-xl text-gold font-semibold">Saved!</h3>
                  <p className="font-body text-cream-400 text-sm leading-relaxed">
                    Your account is ready. Keep browsing — your favourites are saved.
                  </p>
                  <button onClick={handleClose} className="wp-btn-gold mt-2">
                    Continue Browsing →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
