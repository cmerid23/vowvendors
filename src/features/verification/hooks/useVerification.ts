import { useState, useRef } from 'react'
import { generateOTP, sendEmailOTP, sendPhoneOTP, isPhoneVerificationEnabled } from '../otpService'
import { computeVerification } from '../verificationScore'
import { supabase } from '../../../lib/supabase'
import type { VerificationStep, ContactFormValues, VerificationResult } from '../types'

const MAX_ATTEMPTS = 3

interface VerificationState {
  step: VerificationStep
  attempts: number
  locked: boolean
  shaking: boolean
  emailVerified: boolean
  phoneVerified: boolean
  isSubmitting: boolean
}

const INITIAL: VerificationState = {
  step: 'form',
  attempts: 0,
  locked: false,
  shaking: false,
  emailVerified: false,
  phoneVerified: false,
  isSubmitting: false,
}

export function useVerification() {
  const [state, setState] = useState<VerificationState>(INITIAL)
  const [formValues, setFormValues] = useState<ContactFormValues | null>(null)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [result, setResult] = useState<VerificationResult | null>(null)

  const emailOTPRef = useRef('')
  const phoneOTPRef = useRef('')

  const triggerShake = () => {
    setState((s) => ({ ...s, shaking: true }))
    setTimeout(() => setState((s) => ({ ...s, shaking: false })), 650)
  }

  const handleWrongCode = () => {
    setState((s) => {
      const attempts = s.attempts + 1
      return { ...s, attempts, locked: attempts >= MAX_ATTEMPTS }
    })
    triggerShake()
  }

  const finishAndSubmit = async (ev: boolean, pv: boolean, fv: ContactFormValues, vid: string) => {
    setState((s) => ({ ...s, isSubmitting: true }))
    const verification = computeVerification(ev, pv)
    setResult(verification)

    // Try with verification columns first; fall back if they don't exist yet
    const base = {
      from_name: fv.from_name,
      from_email: fv.from_email,
      from_phone: fv.from_phone || null,
      event_date: fv.event_date || null,
      message: fv.message,
      vendor_id: vid,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from('contact_requests').insert({ ...base, email_verified: ev, phone_verified: pv, verification_score: verification.score } as any)
    if (error) {
      await supabase.from('contact_requests').insert(base)
    }

    setState((s) => ({ ...s, isSubmitting: false, step: 'success' }))
  }

  const startVerification = async (values: ContactFormValues, vid: string) => {
    setFormValues(values)
    setVendorId(vid)
    setState({ ...INITIAL, step: 'email-otp' })
    const otp = generateOTP()
    emailOTPRef.current = otp
    await sendEmailOTP(values.from_email, otp)
  }

  const verifyEmailOTP = async (code: string): Promise<boolean> => {
    if (state.locked) return false
    if (code === emailOTPRef.current) {
      setState((s) => ({ ...s, emailVerified: true, attempts: 0 }))
      if (isPhoneVerificationEnabled() && formValues?.from_phone) {
        const otp = generateOTP()
        phoneOTPRef.current = otp
        await sendPhoneOTP(formValues.from_phone, otp)
        setState((s) => ({ ...s, step: 'phone-otp' }))
      } else {
        await finishAndSubmit(true, false, formValues!, vendorId!)
      }
      return true
    }
    handleWrongCode()
    return false
  }

  const verifyPhoneOTP = async (code: string): Promise<boolean> => {
    if (state.locked) return false
    if (code === phoneOTPRef.current) {
      setState((s) => ({ ...s, phoneVerified: true, attempts: 0 }))
      await finishAndSubmit(true, true, formValues!, vendorId!)
      return true
    }
    handleWrongCode()
    return false
  }

  const skipPhone = () => finishAndSubmit(true, false, formValues!, vendorId!)

  const reset = () => {
    setState(INITIAL)
    setFormValues(null)
    setVendorId(null)
    setResult(null)
    emailOTPRef.current = ''
    phoneOTPRef.current = ''
  }

  return { ...state, startVerification, verifyEmailOTP, verifyPhoneOTP, skipPhone, result, formValues, vendorId, reset }
}
