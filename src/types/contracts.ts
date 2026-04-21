export type ContractStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'completed' | 'cancelled'

export interface ContractTemplate {
  id: string
  name: string
  vendor_type: 'photographer' | 'videographer' | 'both'
  description: string | null
  body_html: string
  variables: string[]
  is_active: boolean
  display_order: number
  created_at: string
}

export interface Contract {
  id: string
  vendor_id: string
  template_id: string | null
  couple_name: string
  couple_email: string
  couple_phone: string | null
  wedding_date: string | null
  wedding_venue: string | null
  package_name: string | null
  package_price: number | null
  retainer_amount: number | null
  retainer_due_date: string | null
  balance_due_date: string | null
  coverage_hours: number | null
  deliverables: string | null
  custom_notes: string | null
  body_html: string
  status: ContractStatus
  sent_at: string | null
  viewed_at: string | null
  signed_at: string | null
  signer_name: string | null
  signer_ip: string | null
  signer_user_agent: string | null
  signer_user_id: string | null
  pdf_url: string | null
  booking_fee_charged: boolean
  booking_fee_amount: number | null
  created_at: string
  updated_at: string
}

export interface ContractAuditEntry {
  id: string
  contract_id: string
  action: string
  actor_type: 'vendor' | 'couple' | 'system'
  actor_id: string | null
  actor_email: string | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface ContractFormData {
  templateId: string
  coupleNames: string
  coupleEmail: string
  couplePhone: string
  weddingDate: string
  weddingVenue: string
  packageName: string
  packagePrice: string
  retainerAmount: string
  retainerDueDate: string
  balanceDueDate: string
  coverageHours: string
  deliverables: string
  customNotes: string
  // video-specific
  videoFormat?: string
  musicLicense?: string
  rawFootagePolicy?: string
}
