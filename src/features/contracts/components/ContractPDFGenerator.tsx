export interface SignatureRecord {
  signerName: string
  signerEmail: string
  signedAt: string
  ipAddress: string
  contractId: string
}

export async function generateSignedPDF(
  contractHtml: string,
  signatureRecord: SignatureRecord,
): Promise<Blob> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])

  // Build full HTML document for capture
  const container = document.createElement('div')
  container.style.cssText = `
    position:fixed;left:-9999px;top:0;
    width:794px;background:white;padding:60px;
    font-family:'Jost',sans-serif;font-size:14px;
    line-height:1.8;color:#1a1a2e;
  `
  container.innerHTML = `
    <style>
      h1{font-family:Georgia,serif;font-size:26px;font-weight:600;margin-bottom:20px;text-align:center;}
      h2{font-family:Georgia,serif;font-size:16px;font-weight:600;margin-top:28px;margin-bottom:8px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;}
      p{margin-bottom:12px;}ul{margin:8px 0 12px 20px;list-style:disc;}
      li{margin-bottom:4px;}strong{font-weight:600;}
    </style>
    ${contractHtml}
    <div style="margin-top:48px;padding:24px;border-top:2px solid #0f0f1a;background:#f9f9f9;border-radius:8px;">
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:16px;">
        Electronic Signature Record
      </p>
      <table style="font-size:12px;line-height:1.9;width:100%;border-collapse:collapse;">
        <tr><td style="width:200px;font-weight:600;">Signer name:</td><td>${signatureRecord.signerName}</td></tr>
        <tr><td style="font-weight:600;">Signer email:</td><td>${signatureRecord.signerEmail}</td></tr>
        <tr><td style="font-weight:600;">Signed at:</td><td>${new Date(signatureRecord.signedAt).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' })}</td></tr>
        <tr><td style="font-weight:600;">IP address:</td><td>${signatureRecord.ipAddress}</td></tr>
        <tr><td style="font-weight:600;">Contract ID:</td><td style="font-family:monospace;font-size:11px;">${signatureRecord.contractId}</td></tr>
      </table>
      <p style="font-size:11px;margin-top:16px;color:#666;">
        This document was signed electronically via VowVendors (vowvendors.com) in compliance with the
        Electronic Signatures in Global and National Commerce Act (ESIGN Act) and the Uniform Electronic
        Transactions Act (UETA). This typed signature is legally binding in all 50 U.S. states.
      </p>
    </div>
  `
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      width: 794,
    })
    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    const pdf = new jsPDF({ unit: 'px', format: 'a4', orientation: 'portrait' })
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = pdf.internal.pageSize.getHeight()
    const imgW = canvas.width
    const imgH = canvas.height
    const ratio = pdfW / imgW
    const totalH = imgH * ratio
    let yOffset = 0
    let page = 0

    while (yOffset < totalH) {
      if (page > 0) pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfW, totalH)
      yOffset += pdfH
      page++
    }

    return pdf.output('blob')
  } finally {
    document.body.removeChild(container)
  }
}

export function downloadPDFBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
