import { supabase } from './supabase'

// ── Slug ──────────────────────────────────────────────────────────────────────

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 48)
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${suffix}`
}

// ── Password hashing (SHA-256 via browser crypto) ────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(input: string, stored: string): Promise<boolean> {
  return (await hashPassword(input)) === stored
}

// ── Image compression (browser Canvas) ───────────────────────────────────────

export async function compressImage(
  file: File,
  maxPx: number,
  quality = 0.85,
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Canvas toBlob failed')); return }
          resolve({ blob, width: w, height: h })
        },
        'image/jpeg',
        quality,
      )
    }
    img.onerror = reject
    img.src = url
  })
}

// ── Supabase Storage upload helper ───────────────────────────────────────────

export function buildStoragePath(
  vendorId: string,
  galleryId: string,
  variant: 'medium' | 'thumb' | 'original',
  filename: string,
): string {
  return `${vendorId}/${galleryId}/${variant}/${filename}`
}

export async function uploadToStorage(
  path: string,
  blob: Blob,
  mimeType: string,
): Promise<string> {
  const { error } = await supabase.storage
    .from('gallery-media')
    .upload(path, blob, { contentType: mimeType, upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('gallery-media').getPublicUrl(path)
  return data.publicUrl
}

// ── Format helpers ────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function galleryShareUrl(slug: string): string {
  return `${window.location.origin}/gallery/${slug}`
}

// ── Zip download ─────────────────────────────────────────────────────────────

export async function downloadAsZip(
  photos: { url: string; name: string }[],
  zipName: string,
) {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  await Promise.all(
    photos.map(async ({ url, name }) => {
      const res = await fetch(url)
      const blob = await res.blob()
      zip.file(name, blob)
    }),
  )
  const content = await zip.generateAsync({ type: 'blob' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(content)
  a.download = `${zipName}.zip`
  a.click()
  URL.revokeObjectURL(a.href)
}
