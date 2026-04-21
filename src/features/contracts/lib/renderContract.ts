export function renderContract(
  templateHtml: string,
  variables: Record<string, string>,
): string {
  const price = parseFloat(variables.package_price || '0')
  const retainer = parseFloat(variables.retainer_amount || '0')
  const vars = {
    ...variables,
    balance_amount: (price - retainer).toFixed(2),
    contract_date: variables.contract_date || new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    }),
  }
  return templateHtml.replace(/\{\{(\w+)\}\}/g, (_, key) => (vars as Record<string, string>)[key] ?? `{{${key}}}`)
}

export function highlightUnfilledVariables(html: string): string {
  return html.replace(
    /\{\{(\w+)\}\}/g,
    '<span style="background:#fcebeb;color:#A32D2D;padding:0 4px;border-radius:3px;font-weight:600">{{$1}}</span>',
  )
}

export function buildVariablesFromForm(
  form: Record<string, string>,
  vendorInfo: { photographer_name?: string; videographer_name?: string; business_name: string; vendor_email: string; vendor_phone: string },
): Record<string, string> {
  return {
    photographer_name: vendorInfo.photographer_name || vendorInfo.business_name,
    videographer_name: vendorInfo.videographer_name || vendorInfo.business_name,
    business_name: vendorInfo.business_name,
    vendor_email: vendorInfo.vendor_email,
    vendor_phone: vendorInfo.vendor_phone,
    couple_name: form.coupleNames || '',
    wedding_date: form.weddingDate ? new Date(form.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
    wedding_venue: form.weddingVenue || '',
    package_name: form.packageName || '',
    package_price: form.packagePrice || '',
    retainer_amount: form.retainerAmount || '',
    retainer_due_date: form.retainerDueDate ? new Date(form.retainerDueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
    balance_due_date: form.balanceDueDate ? new Date(form.balanceDueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
    coverage_hours: form.coverageHours || '',
    deliverables: form.deliverables || '',
    custom_notes: form.customNotes || 'No additional terms.',
    video_format: form.videoFormat || '',
    music_license: form.musicLicense || 'All music will be properly licensed through ASCAP, BMI, or similar royalty-free services.',
    raw_footage_policy: form.rawFootagePolicy || 'Raw, unedited footage is not included in this package and will not be delivered to the client.',
  }
}
