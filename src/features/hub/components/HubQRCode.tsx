import { useRef } from 'react'
import { QRCodeCanvas as QRCode } from 'qrcode.react'
import { Download } from 'lucide-react'

interface Props {
  accessCode: string
  coupleName: string
  size?: number
}

export function HubQRCode({ accessCode, coupleName, size = 256 }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const hubUrl = `${window.location.origin}/wedding/${accessCode}`

  const downloadPng = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${coupleName}-wedding-hub-qr.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const downloadPdf = async () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    try {
      const { jsPDF } = await import('jspdf')
      const imgData = canvas.toDataURL('image/png')
      const doc = new jsPDF({ unit: 'mm', format: 'a5' })
      const pageW = doc.internal.pageSize.getWidth()
      const qrMm = 80
      const x = (pageW - qrMm) / 2
      const y = 30

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text(coupleName.replace('-', ' & '), pageW / 2, 20, { align: 'center' })

      doc.addImage(imgData, 'PNG', x, y, qrMm, qrMm)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(100)
      doc.text(hubUrl, pageW / 2, y + qrMm + 10, { align: 'center' })
      doc.text('Scan with your phone camera — no app needed', pageW / 2, y + qrMm + 16, { align: 'center' })

      doc.save(`${coupleName}-wedding-hub-qr.pdf`)
    } catch (e) {
      console.error('PDF generation failed', e)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={canvasRef}>
        <QRCode
          value={hubUrl}
          size={size}
          level="H"
          includeMargin
          imageSettings={{
            src: '/favicon.ico',
            height: Math.round(size * 0.15),
            width: Math.round(size * 0.15),
            excavate: true,
          }}
        />
      </div>

      <p className="font-body text-xs text-center text-ink-400 max-w-xs break-all">{hubUrl}</p>

      <div className="flex gap-2">
        <button
          onClick={downloadPng}
          className="flex items-center gap-1.5 text-sm font-body font-medium text-ink border border-border rounded-full px-4 py-2 hover:bg-ink-50 transition-colors"
        >
          <Download size={14} /> PNG
        </button>
        <button
          onClick={downloadPdf}
          className="flex items-center gap-1.5 text-sm font-body font-medium text-ink border border-border rounded-full px-4 py-2 hover:bg-ink-50 transition-colors"
        >
          <Download size={14} /> Print PDF
        </button>
      </div>

      <p className="font-body text-xs text-ink-300 text-center max-w-xs">
        Print and place on each guest table, at the entrance, and in ceremony programs. Guests scan with their phone camera — no app needed.
      </p>
    </div>
  )
}
