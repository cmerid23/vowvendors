import { useState } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/ui/Button'
import { generateSlug, hashPassword } from '../../../lib/galleryUtils'
import type { Gallery } from '../../../types/gallery'

interface Props {
  vendorId: string
  onCreated: (gallery: Gallery) => void
  onClose: () => void
}

export function CreateGalleryModal({ vendorId, onCreated, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [coupleNames, setCoupleNames] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [password, setPassword] = useState('')
  const [allowDownloads, setAllowDownloads] = useState(true)
  const [allowFavourites, setAllowFavourites] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Gallery title is required'); return }
    setSaving(true)
    setError('')
    try {
      const slug = generateSlug(title)
      const password_hash = password ? await hashPassword(password) : null
      const { data, error: dbErr } = await supabase
        .from('galleries')
        .insert({
          vendor_id: vendorId,
          slug,
          title: title.trim(),
          couple_names: coupleNames.trim() || null,
          wedding_date: weddingDate || null,
          password_hash,
          allow_downloads: allowDownloads,
          allow_favourites: allowFavourites,
          is_active: true,
        })
        .select()
        .single()
      if (dbErr) throw dbErr
      onCreated(data as Gallery)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create gallery')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        >
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
            <h2 className="font-display text-xl font-semibold text-ink">New Gallery</h2>
            <button onClick={onClose} className="text-ink-300 hover:text-ink transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-body font-medium text-ink-600 mb-1">Gallery Title *</label>
              <input
                className="input-field w-full"
                placeholder="e.g. Sarah & James Wedding"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-body font-medium text-ink-600 mb-1">Couple Names</label>
              <input
                className="input-field w-full"
                placeholder="e.g. Sarah & James"
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-body font-medium text-ink-600 mb-1">Wedding Date</label>
              <input
                type="date"
                className="input-field w-full"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-body font-medium text-ink-600 mb-1">Password Protection (optional)</label>
              <input
                type="password"
                className="input-field w-full"
                placeholder="Leave blank for open access"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm font-body text-ink-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDownloads}
                  onChange={(e) => setAllowDownloads(e.target.checked)}
                  className="rounded"
                />
                Allow Downloads
              </label>
              <label className="flex items-center gap-2 text-sm font-body text-ink-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowFavourites}
                  onChange={(e) => setAllowFavourites(e.target.checked)}
                  className="rounded"
                />
                Allow Favourites
              </label>
            </div>

            {error && <p className="text-red-500 text-sm font-body">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" loading={saving} className="flex-1">Create Gallery</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
