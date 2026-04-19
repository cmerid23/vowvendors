import { ShieldCheck, Shield, ShieldX } from 'lucide-react'
import type { VerificationLevel } from '../types'

interface LeadVerifiedBadgeProps {
  level: VerificationLevel
  score?: number
  size?: 'sm' | 'md'
}

export function LeadVerifiedBadge({ level, score, size = 'sm' }: LeadVerifiedBadgeProps) {
  const iconSize = size === 'md' ? 14 : 11
  const base = 'inline-flex items-center gap-1 font-body font-medium rounded-pill'
  const padding = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'

  if (level === 'verified') return (
    <span className={`${base} ${padding} bg-green-100 text-green-700`}>
      <ShieldCheck size={iconSize} />
      Verified{score !== undefined ? ` · ${score}pts` : ''}
    </span>
  )

  if (level === 'partial') return (
    <span className={`${base} ${padding} bg-yellow-100 text-yellow-700`}>
      <Shield size={iconSize} />
      Partial{score !== undefined ? ` · ${score}pts` : ''}
    </span>
  )

  return (
    <span className={`${base} ${padding} bg-gray-100 text-gray-400`}>
      <ShieldX size={iconSize} />
      Unverified
    </span>
  )
}
