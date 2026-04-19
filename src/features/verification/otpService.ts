const PHONE_ENABLED = import.meta.env.VITE_PHONE_VERIFICATION_ENABLED === 'true'

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function isPhoneVerificationEnabled(): boolean {
  return PHONE_ENABLED
}

export async function sendEmailOTP(email: string, otp: string): Promise<void> {
  if (!import.meta.env.VITE_EMAILJS_SERVICE_ID) {
    console.log(
      `%c[VowVendors] Email OTP → ${email} : ${otp}`,
      'color:#B8860B;font-weight:bold;font-size:14px'
    )
    return
  }
  // Production: wire EmailJS here
  // await emailjs.send(serviceId, templateId, { to_email: email, otp }, publicKey)
}

export async function sendPhoneOTP(phone: string, otp: string): Promise<void> {
  if (!PHONE_ENABLED) {
    console.log(
      `%c[VowVendors] SMS OTP → ${phone} : ${otp}`,
      'color:#B8860B;font-weight:bold;font-size:14px'
    )
    return
  }
  // Production: call Supabase edge function → Twilio
  // await supabase.functions.invoke('send-sms-otp', { body: { phone, otp } })
}
