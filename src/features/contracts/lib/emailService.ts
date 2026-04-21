import type { Contract } from '../../../types/contracts'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined

function log(template: string, params: Record<string, string>) {
  console.log(
    `%c[VowVendors Contracts] EmailJS → ${template}`,
    'color:#B8860B;font-weight:bold;font-size:13px',
    params,
  )
}

async function send(templateId: string, params: Record<string, string>) {
  if (!SERVICE_ID || !PUBLIC_KEY) {
    log(templateId, params)
    return
  }
  try {
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: templateId,
        user_id: PUBLIC_KEY,
        template_params: params,
      }),
    })
  } catch (err) {
    console.error('[VowVendors] EmailJS error:', err)
  }
}

export async function sendContractToCouple(contract: Contract, vendorName: string) {
  await send('template_contract_sent', {
    couple_name: contract.couple_name,
    couple_email: contract.couple_email,
    vendor_name: vendorName,
    wedding_date: contract.wedding_date || '',
    package_name: contract.package_name || '',
    package_price: String(contract.package_price || ''),
    retainer_amount: String(contract.retainer_amount || ''),
    retainer_due_date: contract.retainer_due_date || '',
    sign_url: `${window.location.origin}/sign/${contract.id}`,
    contract_id: contract.id,
  })
}

export async function sendSignedNotificationToVendor(contract: Contract, vendorEmail: string, vendorName: string) {
  await send('template_contract_signed', {
    vendor_email: vendorEmail,
    vendor_name: vendorName,
    couple_name: contract.couple_name,
    wedding_date: contract.wedding_date || '',
    package_name: contract.package_name || '',
    package_price: String(contract.package_price || ''),
    signed_at: contract.signed_at ? new Date(contract.signed_at).toLocaleString() : '',
    contract_url: `${window.location.origin}/vendor/contracts/${contract.id}`,
  })
}

export async function sendSignedCopyToCouple(contract: Contract, vendorName: string) {
  await send('template_contract_signed_copy', {
    couple_email: contract.couple_email,
    couple_name: contract.couple_name,
    vendor_name: vendorName,
    wedding_date: contract.wedding_date || '',
    package_name: contract.package_name || '',
    package_price: String(contract.package_price || ''),
    retainer_amount: String(contract.retainer_amount || ''),
    retainer_due_date: contract.retainer_due_date || '',
    contract_url: `${window.location.origin}/sign/${contract.id}`,
  })
}

export async function sendContractReminder(contract: Contract, vendorName: string) {
  await send('template_contract_reminder', {
    couple_email: contract.couple_email,
    couple_name: contract.couple_name,
    vendor_name: vendorName,
    wedding_date: contract.wedding_date || '',
    sign_url: `${window.location.origin}/sign/${contract.id}`,
  })
}
