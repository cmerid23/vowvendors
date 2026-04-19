import { useState } from 'react'
import { Mail, ShieldCheck, X } from 'lucide-react'
import { useBudgetStore } from '../../../store/useBudgetStore'

interface EmailCaptureModalProps {
  vendorId: string
  vendorName: string
  onClose: () => void
}

export function EmailCaptureModal({ vendorId, vendorName, onClose }: EmailCaptureModalProps) {
  const captureEmail = useBudgetStore((s) => s.captureEmail)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address')
      return
    }
    setSubmitting(true)
    await captureEmail(email, vendorId, vendorName)
    setSubmitting(false)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface text-text-secondary"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand/10 mb-4 mx-auto">
            <Mail className="w-6 h-6 text-brand" />
          </div>

          <h2 className="text-lg font-bold font-heading text-text text-center mb-1">
            One step to see contact info
          </h2>
          <p className="text-sm text-text-secondary text-center mb-5">
            Enter your email to unlock <strong>{vendorName}</strong>'s contact details — and all other matched vendors.
          </p>

          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-3 mb-5">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-green-800">
              We'll email you a copy of your budget plan. No spam. Unsubscribe anytime.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              className={`input-field w-full mb-2 ${error ? 'border-red-400' : ''}`}
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand/90 disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Saving…' : 'Unlock Contact Info'}
            </button>
          </form>

          <p className="text-[11px] text-text-secondary text-center mt-3">
            By continuing you agree to our privacy policy.
          </p>
        </div>
      </div>
    </>
  )
}
