import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useBudgetStore } from '../../store/useBudgetStore'
import { BudgetInputForm } from '../../features/budget/components/BudgetInputForm'
import { BudgetPlanView } from '../../features/budget/components/BudgetPlanView'

export function BudgetMatcherPage() {
  const [searchParams] = useSearchParams()
  const isCalculated = useBudgetStore((s) => s.isCalculated)
  const setTotalBudget = useBudgetStore((s) => s.setTotalBudget)
  const setGuestCount = useBudgetStore((s) => s.setGuestCount)
  const setWeddingDate = useBudgetStore((s) => s.setWeddingDate)
  const setState = useBudgetStore((s) => s.setState)
  const calculate = useBudgetStore((s) => s.calculate)

  // Support deep-link params from widget
  useEffect(() => {
    const budget = searchParams.get('budget')
    const guests = searchParams.get('guests')
    const date = searchParams.get('date')
    const state = searchParams.get('state')
    if (budget) setTotalBudget(Number(budget))
    if (guests) setGuestCount(Number(guests))
    if (date) setWeddingDate(date)
    if (state) setState(state)
    if (budget && guests) calculate()
  }, [])

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero header */}
      <div className="bg-gradient-to-b from-pink-50/60 to-surface border-b border-border px-4 sm:px-6 py-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Budget Matcher
            </div>
            <h1 className="font-display text-4xl sm:text-5xl text-ink font-semibold mb-3 leading-tight">
              Know what you can afford<br className="hidden sm:block" /> before you fall in love.
            </h1>
            <p className="text-ink-400 font-body text-lg max-w-xl mx-auto">
              Enter your budget and guest count — we instantly break it down by category and match you with vendors you can actually afford.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {!isCalculated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="max-w-2xl mx-auto">
              <div className="card p-6 sm:p-8">
                <h2 className="font-display text-2xl text-ink font-semibold mb-1">
                  Start with your numbers
                </h2>
                <p className="text-sm text-ink-400 font-body mb-6">
                  We'll calculate a realistic budget breakdown instantly — based on real US wedding industry averages.
                </p>
                <BudgetInputForm />
              </div>

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                {[
                  { icon: '📊', label: 'Real price data', sub: '2025 US averages' },
                  { icon: '🏪', label: 'Real vendors', sub: 'In your state' },
                  { icon: '🔒', label: 'No login needed', sub: 'Free forever' },
                ].map((item) => (
                  <div key={item.label} className="card p-4">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <p className="text-sm font-semibold text-text">{item.label}</p>
                    <p className="text-xs text-text-secondary">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <BudgetPlanView />
          </motion.div>
        )}
      </div>
    </div>
  )
}
