import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, FileText } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../store/useAuthStore'
import { useContractsStore } from '../../../store/useContractsStore'
import { Button } from '../../../components/ui/Button'
import { ContractStatusCard } from '../components/ContractStatusCard'
import { generateSignedPDF, downloadPDFBlob } from '../components/ContractPDFGenerator'
import { sendContractReminder, sendContractToCouple } from '../lib/emailService'
import type { Contract, ContractStatus } from '../../../types/contracts'

const FILTERS: { value: 'all' | ContractStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'signed', label: 'Signed' },
  { value: 'completed', label: 'Completed' },
]

export function ContractsDashboard() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { contracts, isLoading, filter, loadContracts, setFilter, upsertContract } = useContractsStore()
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [vendorName, setVendorName] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!profile) return
    supabase.from('vendors').select('id,business_name').eq('user_id', profile.id).single().then(({ data: v }) => {
      if (!v) return
      setVendorId(v.id)
      setVendorName(v.business_name)
      loadContracts(v.id)
    })
  }, [profile, loadContracts])

  const filtered = contracts.filter((c) => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        c.couple_name.toLowerCase().includes(q) ||
        c.couple_email.toLowerCase().includes(q) ||
        (c.wedding_date || '').includes(q)
      )
    }
    return true
  })

  const handleSend = async (id: string) => {
    const contract = contracts.find((c) => c.id === id)
    if (!contract) return
    const { data } = await supabase
      .from('contracts')
      .update({ status: 'sent', sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (data) {
      upsertContract(data as Contract)
      await sendContractToCouple(data as Contract, vendorName)
      await supabase.from('contract_audit_log').insert({ contract_id: id, action: 'sent', actor_type: 'vendor', actor_email: profile?.email })
    }
  }

  const handleSendReminder = async (id: string) => {
    const contract = contracts.find((c) => c.id === id)
    if (!contract) return
    await sendContractReminder(contract, vendorName)
    await supabase.from('contract_audit_log').insert({ contract_id: id, action: 'reminder_sent', actor_type: 'vendor', actor_email: profile?.email })
  }

  const handleDownloadPDF = async (id: string) => {
    const contract = contracts.find((c) => c.id === id)
    if (!contract) return
    const blob = await generateSignedPDF(contract.body_html, {
      signerName: contract.signer_name || '',
      signerEmail: contract.couple_email,
      signedAt: contract.signed_at || '',
      ipAddress: contract.signer_ip || '—',
      contractId: contract.id,
    })
    downloadPDFBlob(blob, `contract-${contract.couple_name.replace(/\s+/g, '-')}.pdf`)
    await supabase.from('contract_audit_log').insert({ contract_id: id, action: 'downloaded', actor_type: 'vendor', actor_email: profile?.email })
  }

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this contract? The couple will no longer be able to sign it.')) return
    await supabase.from('contracts').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', id)
    const c = contracts.find((c) => c.id === id)
    if (c) upsertContract({ ...c, status: 'cancelled' })
    await supabase.from('contract_audit_log').insert({ contract_id: id, action: 'cancelled', actor_type: 'vendor', actor_email: profile?.email })
  }

  const handleDuplicate = async (id: string) => {
    const contract = contracts.find((c) => c.id === id)
    if (!contract || !vendorId) return
    const { id: _id, created_at, updated_at, sent_at, viewed_at, signed_at, signer_name, signer_ip, signer_user_agent, signer_user_id, pdf_url, booking_fee_charged, booking_fee_amount, ...rest } = contract
    const { data } = await supabase.from('contracts').insert({
      ...rest,
      vendor_id: vendorId,
      status: 'draft',
      couple_name: `Copy — ${contract.couple_name}`,
    }).select().single()
    if (data) {
      upsertContract(data as Contract)
      navigate(`/vendor/contracts/${data.id}/edit`)
    }
    void _id; void created_at; void updated_at; void sent_at; void viewed_at; void signed_at
    void signer_name; void signer_ip; void signer_user_agent; void signer_user_id
    void pdf_url; void booking_fee_charged; void booking_fee_amount
  }

  const pending = contracts.filter((c) => c.status === 'sent' || c.status === 'viewed').length

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-ink font-semibold">Contracts</h1>
          <p className="font-body text-ink-400 text-sm mt-0.5">
            {pending > 0 ? `${pending} awaiting signature` : 'E-signature contracts for your clients'}
          </p>
        </div>
        {vendorId && (
          <Button onClick={() => navigate('/vendor/contracts/new')} size="sm">
            <Plus size={14} /> New Contract
          </Button>
        )}
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-medium whitespace-nowrap transition-colors ${
                filter === value
                  ? 'bg-brand text-white'
                  : 'bg-ink-50 text-ink-400 hover:text-ink hover:bg-ink-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            className="input-field w-full pl-8 text-sm"
            placeholder="Search couple or date…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-ink-50 rounded-card animate-pulse" />)}
        </div>
      )}

      {!isLoading && !vendorId && (
        <div className="card p-8 text-center">
          <p className="font-body text-ink-400">Set up your vendor profile first.</p>
        </div>
      )}

      {!isLoading && vendorId && filtered.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-card p-16 text-center">
          <FileText size={40} className="mx-auto mb-3 text-ink-200" />
          <h2 className="font-display text-xl text-ink mb-1">No contracts yet</h2>
          <p className="font-body text-ink-400 text-sm mb-5">
            Send professional contracts to couples. The signed contract confirms their booking automatically.
          </p>
          <Button onClick={() => navigate('/vendor/contracts/new')}>
            <Plus size={14} /> Create First Contract
          </Button>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((contract) => (
            <ContractStatusCard
              key={contract.id}
              contract={contract}
              onSend={handleSend}
              onSendReminder={handleSendReminder}
              onDownloadPDF={handleDownloadPDF}
              onCancelContract={handleCancel}
              onDuplicateContract={handleDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
