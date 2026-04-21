import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { ContractBuilder } from '../../features/contracts/components/ContractBuilder'
import type { Contract } from '../../types/contracts'

export function VendorContractBuilderPage() {
  const { contractId } = useParams<{ contractId?: string }>()
  const profile = useAuthStore((s) => s.profile)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [existingContract, setExistingContract] = useState<Contract | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase.from('vendors').select('id').eq('user_id', profile.id).single().then(async ({ data: v }) => {
      if (!v) { setLoading(false); return }
      setVendorId(v.id)
      if (contractId) {
        const { data: c } = await supabase.from('contracts').select('*').eq('id', contractId).eq('vendor_id', v.id).single()
        if (c) setExistingContract(c as Contract)
      }
      setLoading(false)
    })
  }, [profile, contractId])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-ink-50 rounded w-1/3" />
        <div className="h-64 bg-ink-50 rounded-card" />
      </div>
    )
  }

  if (!vendorId) return <p className="font-body text-ink-400">Set up your vendor profile first.</p>

  return <ContractBuilder vendorId={vendorId} existingContract={existingContract} />
}
