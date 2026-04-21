import { useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { preCompressImage, validateMediaFile } from '../lib/clientCompression'
import { isR2Configured } from '../lib/r2Client'
import type { UploadFile, UploadContext } from '../types/storage'

// Supabase Storage fallback bucket (when R2 not configured)
const SB_BUCKET = 'gallery-media'

interface UseUploadOptions {
  context: UploadContext
  contextId?: string
  ownerId: string
  onFileReady?: (file: UploadFile) => void
  onAllComplete?: () => void
}

export function useUpload(options: UseUploadOptions) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const abortMap = useRef<Map<string, AbortController>>(new Map())

  const update = useCallback((id: string, patch: Partial<UploadFile>) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f))), [])

  const addFiles = useCallback((newFiles: File[]) => {
    const items: UploadFile[] = newFiles
      .filter((f) => validateMediaFile(f).valid)
      .map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        status: 'queued' as const,
        progress: 0,
        originalBytes: f.size,
        previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
      }))
    setFiles((prev) => [...prev, ...items])
    return items
  }, [])

  const uploadOne = useCallback(async (item: UploadFile) => {
    const { id, file } = item
    const controller = new AbortController()
    abortMap.current.set(id, controller)

    try {
      // 1. Client compression (photos only)
      update(id, { status: 'compressing', progress: 0 })
      let fileToSend = file
      let compressedBytes = file.size
      if (file.type.startsWith('image/')) {
        const result = await preCompressImage(file, (p) => update(id, { progress: Math.round(p * 0.2) }))
        fileToSend = result.file
        compressedBytes = result.compressedBytes
        update(id, { compressedBytes })
      }

      // 2. Upload
      update(id, { status: 'uploading', progress: 20 })

      let mediaFileId: string
      let thumbnailUrl: string | undefined

      if (isR2Configured()) {
        // ── R2 path: get presigned URL from Edge Function ────────
        const { data: urlData, error: urlErr } = await supabase.functions.invoke('get-upload-url', {
          body: {
            filename: file.name,
            contentType: fileToSend.type || 'image/jpeg',
            context: options.context,
            contextId: options.contextId,
            ownerId: options.ownerId,
          },
        })
        if (urlErr) throw new Error(urlErr.message)

        const { presignedUrl, mediaFileId: mfId } = urlData
        mediaFileId = mfId

        await uploadWithProgress(presignedUrl, fileToSend, (p) => update(id, { progress: 20 + Math.round(p * 0.6) }), controller.signal)

        // Trigger server-side processing
        update(id, { status: 'processing', progress: 80 })
        await supabase.functions.invoke('process-upload', {
          body: { mediaFileId, fileType: file.type.startsWith('image/') ? 'photo' : 'video' },
        })

        thumbnailUrl = await pollForReady(mediaFileId, 30)
      } else {
        // ── Supabase Storage fallback ─────────────────────────────
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${options.context}/${options.ownerId}/${options.contextId || 'misc'}/${crypto.randomUUID()}.${ext}`

        const { error: upErr } = await supabase.storage.from(SB_BUCKET).upload(path, fileToSend, { contentType: fileToSend.type, upsert: false })
        if (upErr) throw new Error(upErr.message)

        const { data: pub } = supabase.storage.from(SB_BUCKET).getPublicUrl(path)
        thumbnailUrl = pub.publicUrl

        // Insert media_files record directly
        const { data: mf } = await supabase.from('media_files').insert({
          owner_id: options.ownerId,
          owner_type: 'vendor',
          context: options.context,
          context_id: options.contextId || null,
          original_filename: file.name,
          file_type: file.type.startsWith('image/') ? 'photo' : 'video',
          mime_type: fileToSend.type,
          r2_original_key: path,
          r2_thumbnail_key: path,
          r2_medium_key: path,
          r2_compressed_key: path,
          original_size_bytes: file.size,
          compressed_size_bytes: compressedBytes,
          upload_status: 'ready',
        }).select('id').single()

        mediaFileId = mf?.id || ''
        update(id, { progress: 95 })
      }

      update(id, { status: 'ready', progress: 100, mediaFileId, thumbnailUrl })
      options.onFileReady?.({ ...item, status: 'ready', mediaFileId, thumbnailUrl })
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      update(id, { status: 'error', error: err instanceof Error ? err.message : 'Upload failed' })
    } finally {
      abortMap.current.delete(id)
    }
  }, [options, update])

  const uploadAll = useCallback(async () => {
    setIsUploading(true)
    const queued = files.filter((f) => f.status === 'queued')
    const CONCURRENCY = 3
    for (let i = 0; i < queued.length; i += CONCURRENCY) {
      await Promise.all(queued.slice(i, i + CONCURRENCY).map(uploadOne))
    }
    setIsUploading(false)
    options.onAllComplete?.()
  }, [files, uploadOne, options])

  const cancel = useCallback((id: string) => {
    abortMap.current.get(id)?.abort()
    update(id, { status: 'error', error: 'Cancelled' })
  }, [update])

  const remove = useCallback((id: string) => {
    cancel(id)
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [cancel])

  const retry = useCallback((id: string) => {
    const item = files.find((f) => f.id === id)
    if (!item) return
    update(id, { status: 'queued', progress: 0, error: undefined })
    uploadOne({ ...item, status: 'queued', progress: 0 })
  }, [files, uploadOne, update])

  const clear = useCallback(() => setFiles([]), [])

  const stats = {
    total: files.length,
    queued: files.filter((f) => f.status === 'queued').length,
    active: files.filter((f) => ['compressing', 'uploading', 'processing'].includes(f.status)).length,
    ready: files.filter((f) => f.status === 'ready').length,
    errors: files.filter((f) => f.status === 'error').length,
  }

  return { files, isUploading, addFiles, uploadAll, cancel, remove, retry, clear, stats }
}

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (p: number) => void,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.addEventListener('load', () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: HTTP ${xhr.status}`)))
    xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
    signal.addEventListener('abort', () => { xhr.abort(); reject(new DOMException('AbortError', 'AbortError')) })
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
  })
}

async function pollForReady(mediaFileId: string, maxSeconds: number): Promise<string> {
  const r2Base = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || ''
  for (let i = 0; i < maxSeconds; i++) {
    await new Promise((r) => setTimeout(r, 1000))
    const { data } = await supabase
      .from('media_files')
      .select('upload_status,r2_thumbnail_key')
      .eq('id', mediaFileId)
      .single()
    if (data?.upload_status === 'ready') return `${r2Base}/${data.r2_thumbnail_key}`
    if (data?.upload_status === 'error') throw new Error('Server processing failed')
  }
  throw new Error('Processing timeout — file may still appear shortly')
}
