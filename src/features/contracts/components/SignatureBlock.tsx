import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

interface Props {
  onSign: (name: string) => Promise<void>
  disabled?: boolean
}

export function SignatureBlock({ onSign, disabled }: Props) {
  const [agreed, setAgreed] = useState(false)
  const [name, setName] = useState('')
  const [signing, setSigning] = useState(false)
  const [error, setError] = useState('')

  const nameWords = name.trim().split(/\s+/).filter(Boolean)
  const nameValid = nameWords.length >= 2

  const handleSign = async () => {
    if (!nameValid) { setError('Please enter your full legal name (first and last).'); return }
    if (!agreed) { setError('Please check the agreement box before signing.'); return }
    setSigning(true)
    setError('')
    try {
      await onSign(name.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign. Please try again.')
      setSigning(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 space-y-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck size={18} className="text-brand" />
        <h3 className="font-display text-xl font-semibold text-ink">Sign this contract</h3>
      </div>

      <p className="font-body text-sm text-ink-400">
        Type your full legal name below to sign. Under the ESIGN Act, your typed name is a legally
        binding electronic signature.
      </p>

      {/* Agreement checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 rounded border-border accent-brand"
          />
        </div>
        <span className="font-body text-sm text-ink-600 group-hover:text-ink transition-colors">
          I have read and agree to the terms of this contract
        </span>
      </label>

      {/* Signature input */}
      <div className={`transition-all duration-300 ${agreed ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <label className="block text-sm font-body font-medium text-ink-600 mb-1.5">
          Your full legal name
        </label>
        <input
          className="input-field w-full text-lg"
          style={{ fontFamily: "'Dancing Script', cursive, 'Cormorant Garamond', serif", fontSize: '1.25rem', letterSpacing: '0.02em' }}
          placeholder="e.g. Sarah Johnson"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          disabled={!agreed}
          autoComplete="name"
        />
        {name && (
          <p className="text-xs font-body text-ink-300 mt-1">
            Your signature: <span style={{ fontFamily: 'Georgia, serif', fontSize: '1rem' }}>{name}</span>
          </p>
        )}
      </div>

      {/* Legal notice */}
      <div className="bg-ink-50/50 rounded-xl px-4 py-3 space-y-1">
        {[
          'This is a legally binding agreement',
          'Your typed name constitutes your electronic signature',
          'This agreement has the same force as a handwritten signature',
          'Your signature, timestamp, and IP address are recorded',
        ].map((item) => (
          <p key={item} className="font-body text-xs text-ink-400 flex items-start gap-1.5">
            <span className="text-brand mt-0.5">•</span> {item}
          </p>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm font-body">{error}</p>}

      <Button
        onClick={handleSign}
        loading={signing}
        disabled={disabled || !agreed || !nameValid || signing}
        className="w-full justify-center"
        size="lg"
      >
        Sign Contract
      </Button>
    </div>
  )
}
