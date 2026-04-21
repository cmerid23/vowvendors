import { supabase } from '../../../lib/supabase'
import { sendSignedNotificationToVendor, sendSignedCopyToCouple } from './emailService'
import type { Contract } from '../../../types/contracts'

function getBookingFeeAmount(): number {
  return 0 // Stripe integration deferred — fee will be charged here
}

export async function onContractSigned(
  contract: Contract,
  vendorEmail: string,
  vendorName: string,
) {
  const actions: string[] = []

  // 1. Block wedding date in availability calendar
  if (contract.wedding_date) {
    await supabase.from('vendor_availability').upsert({
      vendor_id: contract.vendor_id,
      date: contract.wedding_date,
      status: 'booked',
    })
    actions.push('calendar_blocked')
  }

  // 2. Update contact_request to 'agreed' if one exists
  if (contract.couple_email) {
    await supabase
      .from('contact_requests')
      .update({ status: 'agreed' })
      .eq('vendor_id', contract.vendor_id)
      .eq('from_email', contract.couple_email)
      .in('status', ['pending', 'read', 'replied'])
    actions.push('contact_request_updated')
  }

  // 3. Record booking fee (Stripe deferred)
  const feeAmount = getBookingFeeAmount()
  await supabase
    .from('contracts')
    .update({ booking_fee_charged: feeAmount === 0, booking_fee_amount: feeAmount })
    .eq('id', contract.id)
  actions.push('booking_fee_queued')

  // 4. Send email notifications
  await Promise.allSettled([
    sendSignedNotificationToVendor(contract, vendorEmail, vendorName),
    sendSignedCopyToCouple(contract, vendorName),
  ])
  actions.push('emails_sent')

  // 5. Audit log
  await supabase.from('contract_audit_log').insert({
    contract_id: contract.id,
    action: 'signed',
    actor_type: 'system',
    actor_email: contract.couple_email,
    metadata: { auto_actions: actions },
  })
}
