import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Save, Eye, Send, Camera, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../store/useAuthStore'
import { useContractsStore } from '../../../store/useContractsStore'
import { Button } from '../../../components/ui/Button'
import { ContractPreview } from './ContractPreview'
import { renderContract, buildVariablesFromForm } from '../lib/renderContract'
import { sendContractToCouple } from '../lib/emailService'
import type { ContractTemplate, Contract, ContractFormData } from '../../../types/contracts'

const EMPTY_FORM: ContractFormData = {
  templateId: '',
  coupleNames: '',
  coupleEmail: '',
  couplePhone: '',
  weddingDate: '',
  weddingVenue: '',
  packageName: '',
  packagePrice: '',
  retainerAmount: '',
  retainerDueDate: '',
  balanceDueDate: '',
  coverageHours: '',
  deliverables: '',
  customNotes: '',
  videoFormat: 'Full HD 1080p + 4K highlight reel',
  musicLicense: 'All music will be properly licensed through ASCAP, BMI, or similar royalty-free services.',
  rawFootagePolicy: 'Raw, unedited footage is not included in this package and will not be delivered to the client.',
}

interface Props {
  existingContract?: Contract
  vendorId: string
  onSaved?: (contract: Contract) => void
}

export function ContractBuilder({ existingContract, vendorId, onSaved }: Props) {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const upsertContract = useContractsStore((s) => s.upsertContract)
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [vendorInfo, setVendorInfo] = useState({ business_name: '', vendor_email: '', vendor_phone: '', category: '' })
  const [form, setForm] = useState<ContractFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [previewOnly, setPreviewOnly] = useState(false)

  useEffect(() => {
    supabase.from('contract_templates').select('*').eq('is_active', true).order('display_order').then(({ data }) => {
      if (data) setTemplates(data as ContractTemplate[])
    })
  }, [])

  useEffect(() => {
    if (!profile) return
    supabase.from('vendors').select('business_name,phone,category').eq('user_id', profile.id).single().then(({ data: v }) => {
      if (v) {
        setVendorInfo({
          business_name: v.business_name || '',
          vendor_email: profile.email || '',
          vendor_phone: v.phone || '',
          category: v.category || '',
        })
        // Auto-select template by vendor category
        if (!form.templateId) {
          const cat = v.category as string
          const defaultTemplate = templates.find((t) => t.vendor_type === cat || t.vendor_type === 'both')
          if (defaultTemplate) setForm((f) => ({ ...f, templateId: defaultTemplate.id }))
        }
      }
    })
  }, [profile, templates]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (existingContract) {
      setForm({
        templateId: existingContract.template_id || '',
        coupleNames: existingContract.couple_name,
        coupleEmail: existingContract.couple_email,
        couplePhone: existingContract.couple_phone || '',
        weddingDate: existingContract.wedding_date?.slice(0, 10) || '',
        weddingVenue: existingContract.wedding_venue || '',
        packageName: existingContract.package_name || '',
        packagePrice: String(existingContract.package_price || ''),
        retainerAmount: String(existingContract.retainer_amount || ''),
        retainerDueDate: existingContract.retainer_due_date?.slice(0, 10) || '',
        balanceDueDate: existingContract.balance_due_date?.slice(0, 10) || '',
        coverageHours: String(existingContract.coverage_hours || ''),
        deliverables: existingContract.deliverables || '',
        customNotes: existingContract.custom_notes || '',
      })
    }
  }, [existingContract])

  const selectedTemplate = templates.find((t) => t.id === form.templateId)

  const renderedHtml = useMemo(() => {
    if (!selectedTemplate) return ''
    const vars = buildVariablesFromForm(form as unknown as Record<string, string>, vendorInfo)
    return renderContract(selectedTemplate.body_html, vars)
  }, [form, selectedTemplate, vendorInfo])

  const set = (key: keyof ContractFormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSaveDraft = async () => {
    if (!form.templateId || !form.coupleNames || !form.coupleEmail) {
      alert('Template, couple name, and email are required.')
      return
    }
    setSaving(true)
    const payload = {
      vendor_id: vendorId,
      template_id: form.templateId || null,
      couple_name: form.coupleNames,
      couple_email: form.coupleEmail,
      couple_phone: form.couplePhone || null,
      wedding_date: form.weddingDate || null,
      wedding_venue: form.weddingVenue || null,
      package_name: form.packageName || null,
      package_price: form.packagePrice ? parseFloat(form.packagePrice) : null,
      retainer_amount: form.retainerAmount ? parseFloat(form.retainerAmount) : null,
      retainer_due_date: form.retainerDueDate || null,
      balance_due_date: form.balanceDueDate || null,
      coverage_hours: form.coverageHours ? parseInt(form.coverageHours) : null,
      deliverables: form.deliverables || null,
      custom_notes: form.customNotes || null,
      body_html: renderedHtml,
      status: 'draft' as const,
      updated_at: new Date().toISOString(),
    }

    let result: Contract | null = null
    if (existingContract) {
      const { data } = await supabase.from('contracts').update(payload).eq('id', existingContract.id).select().single()
      result = data as Contract
    } else {
      const { data } = await supabase.from('contracts').insert(payload).select().single()
      result = data as Contract
      if (result) {
        await supabase.from('contract_audit_log').insert({
          contract_id: result.id,
          action: 'created',
          actor_type: 'vendor',
          actor_email: vendorInfo.vendor_email,
        })
      }
    }

    if (result) {
      upsertContract(result)
      onSaved?.(result)
    }
    setSaving(false)
    if (!existingContract && result) navigate(`/vendor/contracts/${result.id}/edit`)
  }

  const handleSend = async () => {
    if (!form.coupleEmail) { alert('Couple email is required to send.'); return }
    setSending(true)
    let contractToSend = existingContract
    if (!contractToSend) {
      await handleSaveDraft()
    }
    // Re-fetch if just created
    if (!contractToSend) {
      const { data } = await supabase.from('contracts').select('*').eq('vendor_id', vendorId).eq('couple_email', form.coupleEmail).order('created_at', { ascending: false }).limit(1).single()
      contractToSend = data as Contract
    }
    if (!contractToSend) { setSending(false); return }

    const { data: updated } = await supabase
      .from('contracts')
      .update({ status: 'sent', sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', contractToSend.id)
      .select()
      .single()

    if (updated) {
      await supabase.from('contract_audit_log').insert({
        contract_id: updated.id, action: 'sent', actor_type: 'vendor', actor_email: vendorInfo.vendor_email,
      })
      upsertContract(updated as Contract)
      await sendContractToCouple(updated as Contract, vendorInfo.business_name)
    }

    setSending(false)
    navigate('/vendor/contracts')
  }

  const isPhotography = selectedTemplate?.vendor_type === 'photographer'
  const isVideography = selectedTemplate?.vendor_type === 'videographer'

  if (previewOnly) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setPreviewOnly(false)} className="text-ink-300 hover:text-ink"><ArrowLeft size={20} /></button>
          <h2 className="font-display text-xl font-semibold text-ink">Contract Preview</h2>
        </div>
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-card p-2">
          <ContractPreview html={renderedHtml} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-0">
      {/* ── Left: Form ── */}
      <div className="lg:w-[42%] shrink-0 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/vendor/contracts')} className="text-ink-300 hover:text-ink"><ArrowLeft size={20} /></button>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {existingContract ? 'Edit Contract' : 'New Contract'}
          </h1>
        </div>

        {/* Step 1: Template */}
        <section className="card p-5 space-y-3">
          <h2 className="font-display text-base font-semibold text-ink">1. Choose template</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => set('templateId', t.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                  form.templateId === t.id
                    ? 'border-brand bg-brand/5'
                    : 'border-border hover:border-brand/40'
                }`}
              >
                <span className="text-2xl">{t.vendor_type === 'photographer' ? '📷' : '🎬'}</span>
                <div>
                  <p className="font-body text-sm font-semibold text-ink leading-tight">{t.name}</p>
                  <p className="font-body text-xs text-ink-400 mt-0.5 leading-snug">{t.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: Couple details */}
        <section className="card p-5 space-y-3">
          <h2 className="font-display text-base font-semibold text-ink">2. Couple details</h2>
          <Field label="Couple names *" placeholder="Sarah Johnson & Michael Torres" value={form.coupleNames} onChange={(v) => set('coupleNames', v)} />
          <Field label="Email address *" type="email" placeholder="sarah@email.com" value={form.coupleEmail} onChange={(v) => set('coupleEmail', v)} />
          <Field label="Phone (optional)" placeholder="555-123-4567" value={form.couplePhone} onChange={(v) => set('couplePhone', v)} />
          <Field label="Wedding date *" type="date" value={form.weddingDate} onChange={(v) => set('weddingDate', v)} />
          <Field label="Wedding venue *" placeholder="The Grand Estate, Austin TX" value={form.weddingVenue} onChange={(v) => set('weddingVenue', v)} />
        </section>

        {/* Step 3: Package */}
        <section className="card p-5 space-y-3">
          <h2 className="font-display text-base font-semibold text-ink">3. Package & payment</h2>
          <Field label="Package name" placeholder="Full Day Coverage" value={form.packageName} onChange={(v) => set('packageName', v)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total price ($) *" type="number" placeholder="2800" value={form.packagePrice} onChange={(v) => set('packagePrice', v)} />
            <Field label="Retainer ($) *" type="number" placeholder="700" value={form.retainerAmount} onChange={(v) => set('retainerAmount', v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Retainer due" type="date" value={form.retainerDueDate} onChange={(v) => set('retainerDueDate', v)} />
            <Field label="Balance due" type="date" value={form.balanceDueDate} onChange={(v) => set('balanceDueDate', v)} />
          </div>
          <Field label="Coverage hours" type="number" placeholder="10" value={form.coverageHours} onChange={(v) => set('coverageHours', v)} />
          <TextArea label="Deliverables" placeholder="400+ edited photos, online gallery, print release, 2 photographers" value={form.deliverables} onChange={(v) => set('deliverables', v)} />
        </section>

        {/* Video-specific fields */}
        {isVideography && (
          <section className="card p-5 space-y-3">
            <h2 className="font-display text-base font-semibold text-ink flex items-center gap-2"><Video size={15} /> Video options</h2>
            <Field label="Video format" placeholder="Full HD 1080p + 4K highlight reel" value={form.videoFormat || ''} onChange={(v) => set('videoFormat', v)} />
            <TextArea label="Music license policy" value={form.musicLicense || ''} onChange={(v) => set('musicLicense', v)} />
            <TextArea label="Raw footage policy" value={form.rawFootagePolicy || ''} onChange={(v) => set('rawFootagePolicy', v)} />
          </section>
        )}

        {/* Step 4: Additional terms */}
        <section className="card p-5 space-y-3">
          <h2 className="font-display text-base font-semibold text-ink flex items-center gap-2">
            {isPhotography ? <Camera size={15} /> : <Video size={15} />}
            4. Additional terms (optional)
          </h2>
          <TextArea label="Custom notes or clauses" placeholder="Add any custom terms, travel fees, overtime rates, etc." value={form.customNotes} onChange={(v) => set('customNotes', v)} rows={4} />
        </section>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pb-8">
          <Button type="button" variant="outline" onClick={handleSaveDraft} loading={saving}>
            <Save size={14} /> Save Draft
          </Button>
          <Button type="button" variant="ghost" onClick={() => setPreviewOnly(true)}>
            <Eye size={14} /> Preview
          </Button>
          <Button type="button" onClick={handleSend} loading={sending} className="ml-auto">
            <Send size={14} /> Send to Couple
          </Button>
        </div>
      </div>

      {/* ── Right: Live preview ── */}
      <div className="flex-1 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-card min-h-96">
          {!selectedTemplate ? (
            <div className="flex items-center justify-center h-64 text-ink-200">
              <p className="font-body text-sm">Choose a template to see the preview</p>
            </div>
          ) : (
            <ContractPreview html={renderedHtml} />
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-body font-medium text-ink-600 mb-1">{label}</label>
      <input
        type={type}
        className="input-field w-full text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <div>
      <label className="block text-xs font-body font-medium text-ink-600 mb-1">{label}</label>
      <textarea
        rows={rows}
        className="input-field w-full text-sm resize-y"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
