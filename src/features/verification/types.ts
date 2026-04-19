export type VerificationLevel = 'verified' | 'partial' | 'unverified'
export type VerificationStep = 'form' | 'email-otp' | 'phone-otp' | 'success'

export interface ContactFormValues {
  from_name: string
  from_email: string
  from_phone: string
  event_date: string
  message: string
}

export interface VerificationResult {
  emailVerified: boolean
  phoneVerified: boolean
  score: number
  level: VerificationLevel
}
