import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import type { PortfolioImage } from '../../types/database'
import { Button } from '../../components/ui/Button'

export function VendorPortfolioPage() {
  const profile = useAuthStore((s) => s.profile)
  const authLoading = useAuthStore((s) => s.isLoading)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [images, setImages] = useState<PortfolioImage[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (authLoading) return
    if (!profile) return
    supabase.from('vendors').select('id').eq('user_id', profile.id).single().then(({ data: v }) => {
      if (!v) return
      setVendorId(v.id)
      supabase.from('portfolio_images').select('*').eq('vendor_id', v.id).order('display_order').then(({ data }) => setImages(data || []))
    })
  }, [profile, authLoading])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !vendorId) return
    setUploading(true)
    const path = `${vendorId}/${Date.now()}-${file.name}`
    const { data: upload } = await supabase.storage.from('portfolio').upload(path, file)
    if (upload) {
      const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(path)
      const { data: img } = await supabase.from('portfolio_images').insert({
        vendor_id: vendorId,
        image_url: publicUrl,
        source: 'upload',
        display_order: images.length,
      }).select().single()
      if (img) setImages((prev) => [...prev, img])
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDelete = async (id: string, _imageUrl: string) => {
    await supabase.from('portfolio_images').delete().eq('id', id)
    setImages((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-ink font-semibold">Portfolio</h1>
        <Button onClick={() => fileRef.current?.click()} loading={uploading} size="sm">
          <Upload size={14} /> Upload Photo
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {!vendorId && (
        <div className="card p-6 text-center text-ink-400 font-body">
          <p>Set up your vendor profile first before adding portfolio images.</p>
        </div>
      )}

      {images.length === 0 && vendorId && (
        <div className="border-2 border-dashed border-border rounded-card p-16 text-center">
          <Upload className="mx-auto mb-3 text-ink-200" size={40} />
          <p className="font-display text-xl text-ink mb-1">No photos yet</p>
          <p className="text-ink-400 font-body text-sm mb-4">Upload your best wedding photos to attract couples</p>
          <Button onClick={() => fileRef.current?.click()}>
            <Plus size={14} /> Add First Photo
          </Button>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img.id} className="group relative rounded-card overflow-hidden aspect-square">
              <img src={img.image_url} alt={img.caption || ''} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(img.id, img.image_url)}
                  className="text-white bg-red-500 rounded-full p-2 hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
