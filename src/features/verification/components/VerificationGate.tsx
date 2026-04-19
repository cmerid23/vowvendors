import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield, X, Mail, Phone, CheckCircle } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input, Textarea } from '../../../components/ui/Input'
import { OTPInput } from './OTPInput'
import { LeadVerifiedBadge } from './LeadVerifiedBadge'
import { useVerification } from '../hooks/useVerification'

const schema = z.object({
  from_name: z.string().min(2, 'Name is required'),
  from_email: z.string().email('Valid email required'),
  from_phone: z.string(),
  event_date: z.string(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormValues = z.infer<typeof schema>

interface VerificationGateProps {
  vendorId: string
  vendorName: string
}

export function VerificationGate({ vendorId, vendorName }: VerificationGateProps) {
  const v = useVerification()
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState('')

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting: formSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onFormSubmit = async (data: FormValues) => {
    setOtpCode('')
    setOtpError('')
    await v.startVerification(data, vendorId)
  }

  const handleVerifyEmail = async () => {
    setOtpError('')
    const ok = await v.verifyEmailOTP(otpCode)
    if (!ok) {
      setOtpError(v.locked ? 'Too many attempts. Please start over.' : `Wrong code. ${3 - v.attempts} attempt${3 - v.attempts === 1 ? '' : 's'} left.`)
      setOtpCode('')
    }
  }

  const handleVerifyPhone = async () => {
    setOtpError('')
    const ok = await v.verifyPhoneOTP(otpCode)
    if (!ok) {
      setOtpError(v.locked ? 'Too many attempts. Please start over.' : `Wrong code. ${3 - v.attempts} attempt${3 - v.attempts === 1 ? '' : 's'} left.`)
      setOtpCode('')
    }
  }

  if (v.step === 'success' && v.result) {
    return (
      <div className="card p-6 text-center">
        <CheckCircle className="text-success mx-auto mb-3" size={44} />
        <h3 className="font-display text-xl text-ink font-semibold mb-1">You're verified!</h3>
        <p className="text-ink-400 font-body text-sm mb-4">Your inquiry stands out from the crowd.</p>
        <div className="flex justify-center mb-4">
          <LeadVerifiedBadge level={v.result.level} score={v.result.score} size="md" />
        </div>
        <p className="text-ink-300 font-body text-xs">{vendorName} will get back to you shortly.</p>
      </div>
    )
  }

  if (v.step === 'email-otp') {
    const email = getValues('from_email')
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-brand" />
            <h3 className="font-display text-lg text-ink font-semibold">Verify your email</h3>
          </div>
          <button onClick={v.reset} className="text-ink-300 hover:text-ink"><X size={16} /></button>
        </div>
        <p className="text-brand font-body text-xs mb-4">Vendors respond 3x faster to verified leads</p>
        <p className="text-ink-400 font-body text-sm mb-6">
          Enter the 6-digit code sent to <span className="font-medium text-ink">{email}</span>
        </p>
        <div className="mb-4">
          <OTPInput value={otpCode} onChange={setOtpCode} disabled={v.locked} shaking={v.shaking} />
        </div>
        {otpError && (
          <p className="text-red-500 text-xs font-body text-center mb-3">{otpError}</p>
        )}
        {v.attempts > 0 && !v.locked && (
          <p className="text-ink-300 text-xs font-body text-center mb-3">
            Attempt {v.attempts}/3
          </p>
        )}
        <Button
          className="w-full justify-center"
          onClick={handleVerifyEmail}
          loading={v.isSubmitting}
          disabled={otpCode.length < 6 || v.locked}
        >
          Verify Email
        </Button>
        <button
          onClick={v.reset}
          className="w-full text-center text-ink-300 hover:text-ink text-xs font-body mt-3 transition-colors"
        >
          Start over
        </button>
      </div>
    )
  }

  if (v.step === 'phone-otp') {
    const phone = getValues('from_phone')
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-brand" />
            <h3 className="font-display text-lg text-ink font-semibold">Almost there</h3>
          </div>
          <button onClick={v.reset} className="text-ink-300 hover:text-ink"><X size={16} /></button>
        </div>
        <p className="text-brand font-body text-xs mb-4">Almost there — one more step protects vendors from bots</p>
        <p className="text-ink-400 font-body text-sm mb-6">
          Enter the 6-digit code sent to <span className="font-medium text-ink">{phone}</span>
        </p>
        <div className="mb-4">
          <OTPInput value={otpCode} onChange={setOtpCode} disabled={v.locked} shaking={v.shaking} />
        </div>
        {otpError && (
          <p className="text-red-500 text-xs font-body text-center mb-3">{otpError}</p>
        )}
        {v.attempts > 0 && !v.locked && (
          <p className="text-ink-300 text-xs font-body text-center mb-3">
            Attempt {v.attempts}/3
          </p>
        )}
        <Button
          className="w-full justify-center mb-2"
          onClick={handleVerifyPhone}
          loading={v.isSubmitting}
          disabled={otpCode.length < 6 || v.locked}
        >
          Verify Phone
        </Button>
        <button
          onClick={v.skipPhone}
          className="w-full text-center text-ink-300 hover:text-ink text-xs font-body mt-1 transition-colors"
        >
          Skip phone verification
        </button>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-1">
        <Shield size={16} className="text-brand" />
        <h3 className="font-display text-xl text-ink font-semibold">Contact {vendorName}</h3>
      </div>
      <p className="text-ink-400 font-body text-xs mb-4">One quick verification and your message is on its way</p>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3">
        <Input label="Your name" placeholder="Jane Smith" error={errors.from_name?.message} {...register('from_name')} />
        <Input label="Email" type="email" placeholder="jane@example.com" error={errors.from_email?.message} {...register('from_email')} />
        <Input label="Phone (optional)" type="tel" placeholder="(555) 000-0000" {...register('from_phone')} />
        <Input label="Wedding date (optional)" type="date" {...register('event_date')} />
        <Textarea
          label="Your message"
          placeholder="Hi! I'm interested in your services for my wedding..."
          rows={4}
          error={errors.message?.message}
          {...register('message')}
        />
        <Button type="submit" loading={formSubmitting} className="w-full justify-center" size="lg">
          Send Message
        </Button>
      </form>
    </div>
  )
}
