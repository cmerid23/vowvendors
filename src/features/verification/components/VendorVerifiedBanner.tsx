import { ShieldCheck } from 'lucide-react'

export function VendorVerifiedBanner() {
  return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-card px-4 py-3">
      <ShieldCheck size={20} className="text-green-600 shrink-0" />
      <div>
        <p className="font-body text-sm font-medium text-green-800">
          🛡 Zero Fake Leads — every inquiry is verified
        </p>
        <p className="font-body text-xs text-green-600 mt-0.5">
          No more fake leads. No more ghosting. Just real couples.
        </p>
      </div>
    </div>
  )
}
