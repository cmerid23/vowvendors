import { useState } from 'react'
import { DollarSign, Users, Calendar, MapPin, Calculator } from 'lucide-react'
import { useBudgetStore } from '../../../store/useBudgetStore'
import { US_STATES } from '../../../utils/constants'

interface BudgetInputFormProps {
  onCalculated?: () => void
  compact?: boolean
}

export function BudgetInputForm({ onCalculated, compact }: BudgetInputFormProps) {
  const totalBudget = useBudgetStore((s) => s.totalBudget)
  const guestCount = useBudgetStore((s) => s.guestCount)
  const weddingDate = useBudgetStore((s) => s.weddingDate)
  const state = useBudgetStore((s) => s.state)
  const setTotalBudget = useBudgetStore((s) => s.setTotalBudget)
  const setGuestCount = useBudgetStore((s) => s.setGuestCount)
  const setWeddingDate = useBudgetStore((s) => s.setWeddingDate)
  const setState = useBudgetStore((s) => s.setState)
  const calculate = useBudgetStore((s) => s.calculate)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!totalBudget || totalBudget < 1000) errs.totalBudget = 'Enter a budget of at least $1,000'
    if (!guestCount || guestCount < 1) errs.guestCount = 'Enter guest count'
    return errs
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    calculate()
    onCalculated?.()
  }

  const today = new Date().toISOString().split('T')[0]

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <input
            type="number"
            placeholder="Total budget"
            value={totalBudget ?? ''}
            onChange={(e) => setTotalBudget(Number(e.target.value))}
            className="input-field pl-8 w-full"
            min={1000}
            step={500}
          />
        </div>
        <div className="relative flex-1">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <input
            type="number"
            placeholder="Guests"
            value={guestCount ?? ''}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="input-field pl-8 w-full"
            min={1}
          />
        </div>
        <button
          type="submit"
          className="bg-brand text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors shrink-0 flex items-center gap-1.5"
        >
          <Calculator className="w-4 h-4" />
          Calculate
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Total Wedding Budget
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            <input
              type="number"
              placeholder="e.g. 25000"
              value={totalBudget ?? ''}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
              className={`input-field pl-8 w-full ${errors.totalBudget ? 'border-red-400 focus:border-red-400' : ''}`}
              min={1000}
              step={500}
            />
          </div>
          {errors.totalBudget && (
            <p className="text-xs text-red-500 mt-1">{errors.totalBudget}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Guest Count
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            <input
              type="number"
              placeholder="e.g. 100"
              value={guestCount ?? ''}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className={`input-field pl-8 w-full ${errors.guestCount ? 'border-red-400 focus:border-red-400' : ''}`}
              min={1}
            />
          </div>
          {errors.guestCount && (
            <p className="text-xs text-red-500 mt-1">{errors.guestCount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Wedding Date <span className="text-text-secondary font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            <input
              type="date"
              value={weddingDate}
              min={today}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="input-field pl-8 w-full"
            />
          </div>
          <p className="text-xs text-text-secondary mt-1">Used to estimate peak-season pricing</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            State <span className="text-text-secondary font-normal">(optional)</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="input-field pl-8 w-full"
            >
              <option value="">All states</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-text-secondary mt-1">Adjusts for regional cost differences</p>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-brand text-white py-3 rounded-xl font-semibold text-base hover:bg-brand/90 transition-colors flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        Calculate My Budget Breakdown
      </button>
    </form>
  )
}
