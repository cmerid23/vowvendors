import { highlightUnfilledVariables } from '../lib/renderContract'

interface Props {
  html: string
  showUnfilled?: boolean
  signerName?: string
  signedAt?: string
}

export function ContractPreview({ html, showUnfilled = true, signerName, signedAt }: Props) {
  const rendered = showUnfilled ? highlightUnfilledVariables(html) : html

  return (
    <div className="contract-preview font-body" style={{ fontFamily: "'Jost', sans-serif" }}>
      <style>{`
        .contract-preview .contract-body {
          max-width: 640px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          line-height: 1.8;
          color: #1a1a2e;
        }
        .contract-preview h1 {
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          color: #0f0f1a;
          text-align: center;
        }
        .contract-preview h2 {
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 1.75rem;
          margin-bottom: 0.5rem;
          color: #0f0f1a;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.25rem;
        }
        .contract-preview p {
          margin-bottom: 0.75rem;
          font-size: 0.925rem;
        }
        .contract-preview ul {
          margin: 0.5rem 0 0.75rem 1.25rem;
          list-style: disc;
        }
        .contract-preview li {
          margin-bottom: 0.25rem;
          font-size: 0.925rem;
        }
        .contract-preview strong {
          font-weight: 600;
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: rendered }} />

      {(signerName || signedAt) && (
        <div style={{
          maxWidth: 640,
          margin: '2rem auto',
          padding: '1.25rem 1.5rem',
          borderTop: '2px solid #0f0f1a',
          backgroundColor: '#f9f9f9',
        }}>
          <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Electronic Signature
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            <strong>Signed by:</strong> {signerName}
          </p>
          {signedAt && (
            <p style={{ fontSize: '0.875rem' }}>
              <strong>Date:</strong> {new Date(signedAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
