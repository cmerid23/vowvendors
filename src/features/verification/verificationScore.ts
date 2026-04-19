import type { VerificationLevel, VerificationResult } from './types'

const EMAIL_POINTS = 30
const PHONE_POINTS = 30

export function computeScore(emailVerified: boolean, phoneVerified: boolean): number {
  return (emailVerified ? EMAIL_POINTS : 0) + (phoneVerified ? PHONE_POINTS : 0)
}

export function getLevel(score: number): VerificationLevel {
  if (score >= 60) return 'verified'
  if (score >= 30) return 'partial'
  return 'unverified'
}

export function computeVerification(emailVerified: boolean, phoneVerified: boolean): VerificationResult {
  const score = computeScore(emailVerified, phoneVerified)
  return { score, level: getLevel(score), emailVerified, phoneVerified }
}

export function computeVerificationRate(inquiries: { verification_score?: number | null }[]): number {
  if (!inquiries.length) return 0
  const verified = inquiries.filter((i) => (i.verification_score ?? 0) >= 60).length
  return Math.round((verified / inquiries.length) * 100)
}
