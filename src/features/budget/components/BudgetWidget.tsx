import { useNavigate } from 'react-router-dom'
import { ArrowRight, DollarSign, Users, Sparkles } from 'lucide-react'
import { useBudgetStore } from '../../../store/useBudgetStore'
import { useState } from 'react'

export function BudgetWidget() {
  const navigate = useNavigate()
  const totalBudget = useBudgetStore((s) => s.totalBudget)
  const guestCount = useBudgetStore((s) => s.guestCount)
  const setTotalBudget = useBudgetStore((s) => s.setTotalBudget)
  const setGuestCount = useBudgetStore((s) => s.setGuestCount)
  const [localBudget, setLocalBudget] = useState(totalBudget ? String(totalBudget) : '')
  const [localGuests, setLocalGuests] = useState(guestCount ? String(guestCount) : '')

  const handleGo = () => {
    if (localBudget) setTotalBudget(Number(localBudget))
    if (localGuests) setGuestCount(Number(localGuests))
    navigate('/budget-matcher')
  }

  return (
    <div className="bg-gradient-to-br from-brand/5 to-pink-50 border border-brand/20 rounded-2xl p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-brand/10 rounded-xl shrink-0">
          <Sparkles className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h3 className="font-bold font-heading text-text text-base leading-tight">
            Budget Matcher
          </h3>
          <p className="text-sm text-text-secondary mt-0.5">
            Know what you can afford before you fall in love with someone out of your budget.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
          <input
            type="number"
            placeholder="Budget"
            value={localBudget}
            onChange={(e) => setLocalBudget(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGo()}
            className="input-field pl-7 w-full text-sm py-2"
            min={1000}
          />
        </div>
        <div className="relative flex-1">
          <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
          <input
            type="number"
            placeholder="Guests"
            value={localGuests}
            onChange={(e) => setLocalGuests(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGo()}
            className="input-field pl-7 w-full text-sm py-2"
            min={1}
          />
        </div>
      </div>

      <button
        onClick={handleGo}
        className="w-full bg-brand text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-brand/90 transition-colors flex items-center justify-center gap-2"
      >
        See My Budget Plan <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-[11px] text-text-secondary text-center mt-2">
        Free · No login required · Matches real vendors
      </p>
    </div>
  )
}
