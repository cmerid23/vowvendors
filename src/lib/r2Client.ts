// ── R2 Storage client ─────────────────────────────────────────────────────────
// Public URL helper — safe to use in the browser
// All write operations (presigned URLs, delete) happen in Edge Functions only

const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL as string | undefined

// ── Key structure ─────────────────────────────────────────────────────────────
// galleries/{vendor_id}/{gallery_id}/original/{uuid}.jpg
// galleries/{vendor_id}/{gallery_id}/compressed/{uuid}.webp
// galleries/{vendor_id}/{gallery_id}/medium/{uuid}.webp
// galleries/{vendor_id}/{gallery_id}/thumbnail/{uuid}.webp
// portfolios/{vendor_id}/original/{uuid}.jpg
// portfolios/{vendor_id}/thumbnail/{uuid}.webp
// guests/{gallery_id}/original/{uuid}.jpg
// guests/{gallery_id}/thumbnail/{uuid}.webp
// profiles/{user_id}/avatar.webp

export function buildR2Key(params: {
  context: string
  ownerId: string
  contextId?: string
  variant: 'original' | 'compressed' | 'medium' | 'thumbnail'
  filename: string
}): string {
  const { context, ownerId, contextId, variant, filename } = params
  if (contextId) return `${context}/${ownerId}/${contextId}/${variant}/${filename}`
  return `${context}/${ownerId}/${variant}/${filename}`
}

export function getR2PublicUrl(key: string): string {
  const base = R2_PUBLIC_URL || 'https://media.vowvendors.com'
  return `${base}/${key}`
}

export function isR2Configured(): boolean {
  return Boolean(R2_PUBLIC_URL && import.meta.env.VITE_CLOUDFLARE_R2_ACCOUNT_ID)
}
