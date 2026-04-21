import imageCompression from 'browser-image-compression'

const SKIP_BELOW_BYTES = 500 * 1024 // skip compression if < 500 KB

export interface CompressionResult {
  file: File
  originalBytes: number
  compressedBytes: number
  savedPercent: number
}

export async function preCompressImage(
  file: File,
  onProgress?: (p: number) => void,
): Promise<CompressionResult> {
  const originalBytes = file.size

  if (originalBytes < SKIP_BELOW_BYTES) {
    return { file, originalBytes, compressedBytes: originalBytes, savedPercent: 0 }
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: 8,
      maxWidthOrHeight: 4000,
      useWebWorker: true,
      fileType: 'image/jpeg',
      onProgress,
    })
    const compressedBytes = compressed.size
    const savedPercent = Math.round((1 - compressedBytes / originalBytes) * 100)
    return { file: compressed, originalBytes, compressedBytes, savedPercent }
  } catch {
    return { file, originalBytes, compressedBytes: originalBytes, savedPercent: 0 }
  }
}

export function validateMediaFile(file: File): { valid: boolean; error?: string } {
  const allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  const allowedVideos = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
  const all = [...allowedImages, ...allowedVideos]

  if (!all.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|heic|heif|mp4|mov|avi)$/i)) {
    return { valid: false, error: `Unsupported file type: ${file.type || file.name.split('.').pop()}` }
  }
  if (file.type.startsWith('video/') && file.size > 3 * 1024 * 1024 * 1024) {
    return { valid: false, error: `Video too large (${(file.size / 1024 / 1024 / 1024).toFixed(1)} GB). Max 3 GB.` }
  }
  if (file.type.startsWith('image/') && file.size > 100 * 1024 * 1024) {
    return { valid: false, error: 'Image too large. Max 100 MB.' }
  }
  return { valid: true }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export function estimateUploadSeconds(bytes: number, mbps = 10): number {
  return (bytes * 8) / (mbps * 1_000_000)
}
