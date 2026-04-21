import { useState } from 'react'
import { Copy, Check, ExternalLink, Trash2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../../components/ui/Button'
import { hashPassword, galleryShareUrl } from '../../../lib/galleryUtils'
import type { Gallery } from '../../../types/gallery'

interface Props {
  gallery: Gallery
  onUpdated: (patch: Partial<Gallery>) => void
  onDelete?: () => void
}

export function GallerySettings({ gallery, onUpdated, onDelete }: Props) {
  const [title, setTitle] = useState(gallery.title)
  const [coupleNames, setCoupleNames] = useState(gallery.couple_names || '')
  const [weddingDate, setWeddingDate] = useState(gallery.wedding_date?.slice(0, 10) || '')
  const [newPassword, setNewPassword] = useState('')
  const [allowDownloads, setAllowDownloads] = useState(gallery.allow_downloads)
  const [allowFavourites, setAllowFavourites] = useState(gallery.allow_favourites)
  const [isActive, setIsActive] = useState(gallery.is_active)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const shareUrl = galleryShareUrl(gallery.slug)

  const handleSave = async () => {
    setSaving(true)
    const patch: Partial<Gallery> & Record<string, unknown> = {
      title: title.trim(),
      couple_names: coupleNames.trim() || null,
      wedding_date: weddingDate || null,
      allow_downloads: allowDownloads,
      allow_favourites: allowFavourites,
      is_active: isActive,
    }
    if (newPassword) {
      patch.password_hash = await hashPassword(newPassword)
    }
    await supabase.from('galleries').update(patch).eq('id', gallery.id)
    onUpdated(patch as Partial<Gallery>)
    setNewPassword('')
    setSaving(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete gallery "${gallery.title}" and all its photos? This cannot be undone.`)) return
    setDeleting(true)
    await supabase.from('galleries').delete().eq('id', gallery.id)
    onDelete?.()
  }

  return (
    <div className="space-y-6">
      {/* Share link */}
      <div className="card p-5">
        <h3 className="font-display text-base font-semibold text-ink mb-3">Share Link</h3>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={shareUrl}
            className="input-field flex-1 text-sm text-ink-400 bg-ink-50"
          />
          <button
            onClick={handleCopy}
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-ink-400 hover:text-brand hover:border-brand transition-colors shrink-0"
          >
            {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-ink-400 hover:text-brand hover:border-brand transition-colors shrink-0"
          >
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      {/* Basic info */}
      <div className="card p-5 space-y-4">
        <h3 className="font-display text-base font-semibold text-ink">Gallery Info</h3>

        <div>
          <label className="block text-sm font-body font-medium text-ink-600 mb-1">Title</label>
          <input className="input-field w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-body font-medium text-ink-600 mb-1">Couple Names</label>
          <input className="input-field w-full" value={coupleNames} onChange={(e) => setCoupleNames(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-body font-medium text-ink-600 mb-1">Wedding Date</label>
          <input type="date" className="input-field w-full" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} />
        </div>
      </div>

      {/* Permissions */}
      <div className="card p-5 space-y-4">
        <h3 className="font-display text-base font-semibold text-ink">Permissions</h3>
        <div className="space-y-3">
          {[
            { label: 'Gallery is published (visible to clients)', value: isActive, setter: setIsActive },
            { label: 'Allow clients to download photos', value: allowDownloads, setter: setAllowDownloads },
            { label: 'Allow clients to heart favourites', value: allowFavourites, setter: setAllowFavourites },
          ].map(({ label, value, setter }) => (
            <label key={label} className="flex items-center justify-between cursor-pointer">
              <span className="font-body text-sm text-ink-600">{label}</span>
              <div
                onClick={() => setter(!value)}
                className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-brand' : 'bg-ink-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Password */}
      <div className="card p-5">
        <h3 className="font-display text-base font-semibold text-ink mb-1">Password Protection</h3>
        <p className="font-body text-sm text-ink-400 mb-3">
          {gallery.password_hash ? 'Gallery is password protected.' : 'Gallery is open access.'}
        </p>
        <input
          type="password"
          className="input-field w-full"
          placeholder={gallery.password_hash ? 'Set new password to change' : 'Add a password (optional)'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {gallery.password_hash && !newPassword && (
          <button
            onClick={async () => {
              await supabase.from('galleries').update({ password_hash: null }).eq('id', gallery.id)
              onUpdated({ password_hash: null })
            }}
            className="mt-2 text-sm font-body text-red-400 hover:text-red-600 transition-colors"
          >
            Remove password protection
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 text-sm font-body text-red-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={14} /> Delete Gallery
        </button>
        <Button onClick={handleSave} loading={saving}>Save Changes</Button>
      </div>
    </div>
  )
}
