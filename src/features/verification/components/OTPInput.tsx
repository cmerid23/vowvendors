import { useRef } from 'react'

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  shaking?: boolean
}

export function OTPInput({ value, onChange, disabled, shaking }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(6, ' ').split('').slice(0, 6)

  const handleChange = (index: number, raw: string) => {
    const char = raw.replace(/\D/g, '').slice(-1)
    const next = digits.map((d, i) => (i === index ? char : d === ' ' ? '' : d))
    onChange(next.join('').trimEnd())
    if (char && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index].trim() && index > 0) {
        const next = digits.map((d, i) => (i === index - 1 ? '' : d === ' ' ? '' : d))
        onChange(next.join('').trimEnd())
        inputRefs.current[index - 1]?.focus()
      } else {
        const next = digits.map((d, i) => (i === index ? '' : d === ' ' ? '' : d))
        onChange(next.join('').trimEnd())
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    const focusIdx = Math.min(pasted.length, 5)
    inputRefs.current[focusIdx]?.focus()
  }

  return (
    <div className={`flex gap-2 justify-center ${shaking ? 'animate-shake' : ''}`}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit.trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className="w-11 h-14 text-center font-display text-2xl text-ink border-2 border-border rounded-xl focus:outline-none focus:border-brand transition-colors disabled:opacity-40 bg-white"
        />
      ))}
    </div>
  )
}
