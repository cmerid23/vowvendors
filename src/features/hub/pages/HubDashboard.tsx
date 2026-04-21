import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ExternalLink, Copy, EyeOff, Eye, CheckCircle } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { HubQRCode } from '../components/HubQRCode'
import { HubAnalytics } from '../components/HubAnalytics'
import type { WeddingHub, HubPhoto, HubSongRequest } from '../../../types/hub'

type Tab = 'overview' | 'photos' | 'songs' | 'qr'

export function HubDashboard() {
  const { hubId } = useParams<{ hubId: string }>()
  const [hub, setHub] = useState<WeddingHub | null>(null)
  const [photos, setPhotos] = useState<HubPhoto[]>([])
  const [songs, setSongs] = useState<HubSongRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!hubId) return
    setLoading(true)

    Promise.all([
      supabase.from('wedding_hubs').select('*').eq('id', hubId).single(),
      supabase.from('hub_photos').select('*').eq('hub_id', hubId).order('created_at', { ascending: false }),
      supabase.from('hub_song_requests').select('*').eq('hub_id', hubId).order('vote_count', { ascending: false }),
    ]).then(([hubRes, photosRes, songsRes]) => {
      if (hubRes.error) { setError(hubRes.error.message); setLoading(false); return }
      setHub(hubRes.data as WeddingHub)
      setPhotos((photosRes.data as HubPhoto[]) || [])
      setSongs((songsRes.data as HubSongRequest[]) || [])
      setLoading(false)
    })
  }, [hubId])

  const toggleActive = async () => {
    if (!hub) return
    const next = !hub.is_active
    await supabase.from('wedding_hubs').update({ is_active: next }).eq('id', hub.id)
    setHub({ ...hub, is_active: next })
  }

  const hidePhoto = async (photoId: string) => {
    await supabase.from('hub_photos').update({ is_approved: false }).eq('id', photoId)
    setPhotos((prev) => prev.map((p) => p.id === photoId ? { ...p, is_approved: false } : p))
  }

  const approvePhoto = async (photoId: string) => {
    await supabase.from('hub_photos').update({ is_approved: true }).eq('id', photoId)
    setPhotos((prev) => prev.map((p) => p.id === photoId ? { ...p, is_approved: true } : p))
  }

  const featurePhoto = async (photoId: string, featured: boolean) => {
    await supabase.from('hub_photos').update({ is_featured: featured }).eq('id', photoId)
    setPhotos((prev) => prev.map((p) => p.id === photoId ? { ...p, is_featured: featured } : p))
  }

  const markPlayed = async (songId: string) => {
    await supabase.from('hub_song_requests').update({ is_played: true }).eq('id', songId)
    setSongs((prev) => prev.map((s) => s.id === songId ? { ...s, is_played: true } : s))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !hub) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-body text-sm text-red-500">{error || 'Hub not found'}</p>
      </div>
    )
  }

  const hubUrl = `${window.location.origin}/wedding/${hub.access_code}`
  const coupleNames = `${hub.partner_one_name} & ${hub.partner_two_name}`

  const copyLink = () => {
    navigator.clipboard.writeText(hubUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'photos', label: `Photos (${photos.length})` },
    { id: 'songs', label: `Songs (${songs.length})` },
    { id: 'qr', label: 'QR Code' },
  ]

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{coupleNames}</h1>
          <p className="font-body text-sm text-ink-400 mt-0.5">
            {new Date(hub.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {hub.venue_name ? ` · ${hub.venue_name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleActive}
            className={`text-xs font-body px-3 py-1.5 rounded-full border font-medium transition-all ${
              hub.is_active ? 'border-green-200 text-green-700 bg-green-50' : 'border-border text-ink-400 hover:bg-ink-50'
            }`}
          >
            {hub.is_active ? 'Active' : 'Inactive'}
          </button>
          <a href={hubUrl} target="_blank" rel="noreferrer" className="btn-ghost text-xs flex items-center gap-1.5 py-1.5">
            <ExternalLink size={13} /> View Hub
          </a>
        </div>
      </div>

      {/* Share bar */}
      <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-body text-xs text-ink-400 mb-0.5">Hub link</p>
          <p className="font-body text-sm text-ink truncate">{hubUrl}</p>
        </div>
        <button onClick={copyLink} className="flex items-center gap-1.5 text-sm font-body font-medium text-brand hover:text-brand/80 shrink-0">
          {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 font-body text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === t.id ? 'border-brand text-brand' : 'border-transparent text-ink-400 hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && <HubAnalytics hubId={hub.id} />}

      {/* Photos */}
      {tab === 'photos' && (
        <div className="space-y-3">
          <p className="font-body text-sm text-ink-400">
            Manage guest-uploaded photos. Hide inappropriate content or feature your favourites at the top.
          </p>
          {photos.length === 0 ? (
            <p className="font-body text-sm text-ink-300 text-center py-8">No photos yet — share your hub link with guests!</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {photos.map((photo) => {
                const r2Base = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || ''
                const url = `${r2Base}/${photo.r2_thumbnail_key || photo.r2_original_key}`
                return (
                  <div key={photo.id} className="relative group aspect-square bg-ink-100 rounded-lg overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {!photo.is_approved && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-body">Hidden</span>
                      </div>
                    )}
                    {photo.is_featured && (
                      <div className="absolute top-1 left-1 bg-brand text-white text-xs px-1.5 py-0.5 rounded font-body">★</div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      {photo.is_approved ? (
                        <button onClick={() => hidePhoto(photo.id)} title="Hide" className="bg-white/90 rounded p-1 hover:bg-white">
                          <EyeOff size={12} />
                        </button>
                      ) : (
                        <button onClick={() => approvePhoto(photo.id)} title="Show" className="bg-white/90 rounded p-1 hover:bg-white">
                          <Eye size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => featurePhoto(photo.id, !photo.is_featured)}
                        className={`rounded p-1 text-xs ${photo.is_featured ? 'bg-brand text-white' : 'bg-white/90'}`}
                      >
                        ★
                      </button>
                    </div>
                    <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs font-body px-1.5 py-1 truncate">
                      {photo.uploader_name || 'Guest'}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Songs */}
      {tab === 'songs' && (
        <div className="space-y-3">
          {songs.length === 0 ? (
            <p className="font-body text-sm text-ink-300 text-center py-8">No song requests yet.</p>
          ) : (
            songs.map((req) => (
              <div key={req.id} className={`flex items-center gap-3 p-3 rounded-xl border border-border ${req.is_played ? 'opacity-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <p className={`font-body text-sm font-medium text-ink ${req.is_played ? 'line-through' : ''}`}>
                    {req.song_title}
                  </p>
                  {req.artist && <p className="font-body text-xs text-ink-400">{req.artist}</p>}
                  {req.message && <p className="font-body text-xs text-ink-300 italic">"{req.message}"</p>}
                </div>
                <span className="font-body text-sm font-medium text-brand shrink-0">▲ {req.vote_count}</span>
                {!req.is_played && (
                  <button
                    onClick={() => markPlayed(req.id)}
                    className="text-xs font-body text-ink-400 hover:text-ink border border-border rounded-full px-2 py-0.5 shrink-0"
                  >
                    Mark played
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* QR Code */}
      {tab === 'qr' && (
        <div className="flex flex-col items-center py-4">
          <HubQRCode
            accessCode={hub.access_code}
            coupleName={`${hub.partner_one_name}-${hub.partner_two_name}`}
            size={280}
          />
        </div>
      )}
    </div>
  )
}
