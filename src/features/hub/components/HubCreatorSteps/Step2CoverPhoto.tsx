import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Image, Upload, X } from 'lucide-react'
import type { CreateHubData } from '../../../../types/hub'
import { supabase } from '../../../../lib/supabase'

interface Props {
  data: Partial<CreateHubData>
  onChange: (data: Partial<CreateHubData>) => void
  userId: string
}

export function Step2CoverPhoto({ data, onChange, userId }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(data.cover_photo_url || null)

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setUploading(true)
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `hub-covers/${userId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage
        .from('gallery-media')
        .upload(path, file, { contentType: file.type, upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('gallery-media').getPublicUrl(path)
      onChange({ ...data, cover_photo_url: publicUrl })
    } catch (e) {
      console.error(e)
    } finally {
      setUploading(false)
    }
  }, [data, onChange, userId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    maxFiles: 1,
    disabled: uploading,
  })

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-ink-400">
        This photo appears as the full-width hero at the top of your wedding hub.
        Landscape orientation (16:9) works best.
      </p>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden aspect-video bg-ink-100">
          <img src={preview} alt="Cover" className="w-full h-full object-cover" />
          <button
            onClick={() => { setPreview(null); onChange({ ...data, cover_photo_url: undefined }) }}
            className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
          >
            <X size={16} />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-white font-body text-sm">Uploading…</div>
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-brand bg-brand/5' : 'border-border hover:border-brand/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            {isDragActive ? (
              <Upload size={32} className="text-brand animate-bounce" />
            ) : (
              <Image size={32} className="text-ink-200" />
            )}
            <div>
              <p className="font-body text-sm text-ink">
                {isDragActive ? 'Drop to upload' : 'Drop your cover photo here'}
              </p>
              <p className="font-body text-xs text-ink-400 mt-0.5">
                or <span className="text-brand underline">click to browse</span> — JPG, PNG, WebP
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="font-body text-xs text-ink-300">
        You can skip this step and add a cover photo later from your hub dashboard.
      </p>
    </div>
  )
}
