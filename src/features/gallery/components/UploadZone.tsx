import { useRef, useState, useCallback } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useGalleryStore } from '../../../store/useGalleryStore'
import { compressImage, buildStoragePath, uploadToStorage, formatBytes } from '../../../lib/galleryUtils'
import { supabase } from '../../../lib/supabase'
import type { UploadItem } from '../../../types/gallery'

const MEDIUM_MAX_PX = 2400
const THUMB_MAX_PX = 400

interface Props {
  galleryId: string
  vendorId: string
  albumId?: string | null
  onUploaded?: () => void
}

export function UploadZone({ galleryId, vendorId, albumId, onUploaded }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const { uploads, addUploads, updateUpload, clearUploads } = useGalleryStore()

  const processFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'))
    if (!imageFiles.length) return

    const items: UploadItem[] = imageFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      status: 'pending',
      progress: 0,
      previewUrl: URL.createObjectURL(file),
    }))
    addUploads(items)

    for (const item of items) {
      try {
        updateUpload(item.id, { status: 'compressing' })
        const baseName = `${Date.now()}-${item.file.name.replace(/[^a-z0-9.]/gi, '_')}`
        const [medium, thumb] = await Promise.all([
          compressImage(item.file, MEDIUM_MAX_PX),
          compressImage(item.file, THUMB_MAX_PX, 0.75),
        ])

        updateUpload(item.id, { status: 'uploading', progress: 10 })

        const mediumPath = buildStoragePath(vendorId, galleryId, 'medium', baseName)
        const thumbPath = buildStoragePath(vendorId, galleryId, 'thumb', baseName)
        const originalPath = buildStoragePath(vendorId, galleryId, 'original', baseName)

        const [mediumUrl, thumbUrl] = await Promise.all([
          uploadToStorage(mediumPath, medium.blob, 'image/jpeg'),
          uploadToStorage(thumbPath, thumb.blob, 'image/jpeg'),
          uploadToStorage(originalPath, item.file, item.file.type),
        ])

        updateUpload(item.id, { progress: 80 })

        await supabase.from('gallery_media').insert({
          gallery_id: galleryId,
          album_id: albumId || null,
          vendor_id: vendorId,
          file_name: item.file.name,
          file_type: 'photo',
          mime_type: 'image/jpeg',
          storage_path: mediumPath,
          thumb_path: thumbPath,
          medium_path: mediumPath,
          original_size_bytes: item.file.size,
          compressed_size_bytes: medium.blob.size,
          width: medium.width,
          height: medium.height,
          display_order: 0,
        })

        updateUpload(item.id, { status: 'done', progress: 100 })
        void mediumUrl
        void thumbUrl
      } catch (err) {
        updateUpload(item.id, { status: 'error', error: err instanceof Error ? err.message : 'Upload failed' })
      }
    }

    onUploaded?.()
  }, [galleryId, vendorId, albumId, addUploads, updateUpload, onUploaded])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(Array.from(e.dataTransfer.files))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  const allDone = uploads.length > 0 && uploads.every((u) => u.status === 'done' || u.status === 'error')

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-card p-10 text-center cursor-pointer transition-colors ${
          dragging ? 'border-brand bg-brand/5' : 'border-border hover:border-brand/50 hover:bg-ink-50/50'
        }`}
      >
        <Upload size={32} className={`mx-auto mb-3 ${dragging ? 'text-brand' : 'text-ink-200'}`} />
        <p className="font-display text-lg text-ink mb-1">Drop photos here</p>
        <p className="font-body text-ink-400 text-sm">or click to browse — JPG, PNG, HEIC</p>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm font-medium text-ink-600">{uploads.length} photo{uploads.length !== 1 ? 's' : ''}</p>
            {allDone && (
              <button onClick={clearUploads} className="text-xs font-body text-ink-300 hover:text-ink transition-colors">
                Clear
              </button>
            )}
          </div>
          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
            {uploads.map((u) => (
              <UploadRow key={u.id} item={u} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function UploadRow({ item }: { item: UploadItem }) {
  const icon = {
    pending: <Loader2 size={14} className="text-ink-300 animate-spin" />,
    compressing: <Loader2 size={14} className="text-amber-500 animate-spin" />,
    uploading: <Loader2 size={14} className="text-brand animate-spin" />,
    done: <CheckCircle size={14} className="text-green-500" />,
    error: <AlertCircle size={14} className="text-red-500" />,
  }[item.status]

  return (
    <div className="flex items-center gap-3 bg-ink-50/50 rounded-lg px-3 py-2">
      <img src={item.previewUrl} alt="" className="w-8 h-8 object-cover rounded" />
      <div className="flex-1 min-w-0">
        <p className="font-body text-xs text-ink truncate">{item.file.name}</p>
        <p className="font-body text-xs text-ink-300">{formatBytes(item.file.size)}</p>
        {item.status === 'uploading' && (
          <div className="h-1 bg-ink-100 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${item.progress}%` }} />
          </div>
        )}
        {item.error && <p className="font-body text-xs text-red-500 truncate">{item.error}</p>}
      </div>
      <div className="shrink-0">{icon}</div>
    </div>
  )
}
