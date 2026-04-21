import { useState } from 'react'
import { Plus, FolderOpen } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { GalleryAlbum } from '../../../types/gallery'

interface Props {
  galleryId: string
  albums: GalleryAlbum[]
  selectedAlbumId: string | null
  onSelect: (albumId: string | null) => void
  onAlbumCreated: (album: GalleryAlbum) => void
  readOnly?: boolean
}

export function AlbumNav({ galleryId, albums, selectedAlbumId, onSelect, onAlbumCreated, readOnly }: Props) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    const { data } = await supabase
      .from('gallery_albums')
      .insert({ gallery_id: galleryId, name: newName.trim(), display_order: albums.length })
      .select()
      .single()
    if (data) onAlbumCreated(data as GalleryAlbum)
    setNewName('')
    setCreating(false)
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-1.5 rounded-full text-sm font-body font-medium transition-colors ${
          selectedAlbumId === null
            ? 'bg-brand text-white'
            : 'bg-ink-50 text-ink-400 hover:text-ink hover:bg-ink-100'
        }`}
      >
        All Photos
      </button>

      {albums.map((album) => (
        <button
          key={album.id}
          onClick={() => onSelect(album.id)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-body font-medium transition-colors ${
            selectedAlbumId === album.id
              ? 'bg-brand text-white'
              : 'bg-ink-50 text-ink-400 hover:text-ink hover:bg-ink-100'
          }`}
        >
          <FolderOpen size={12} />
          {album.name}
          <span className="opacity-60 text-xs">({album.photo_count})</span>
        </button>
      ))}

      {!readOnly && (
        creating ? (
          <form onSubmit={handleCreate} className="flex items-center gap-1.5">
            <input
              autoFocus
              className="border border-border rounded-full px-3 py-1 text-sm font-body text-ink outline-none focus:border-brand"
              placeholder="Album name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setCreating(false)}
            />
            <button
              type="submit"
              disabled={saving}
              className="text-xs font-body text-brand hover:text-brand/80 font-medium"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="text-xs font-body text-ink-300 hover:text-ink"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-body text-ink-300 hover:text-brand hover:bg-brand/5 transition-colors border border-dashed border-ink-200 hover:border-brand/50"
          >
            <Plus size={12} /> Album
          </button>
        )
      )}
    </div>
  )
}
