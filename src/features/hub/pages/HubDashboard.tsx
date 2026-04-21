import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ExternalLink, Copy, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useHubStore } from '../../../store/useHubStore'
import { HubQRCode } from '../components/HubQRCode'
import { HubAnalytics } from '../components/HubAnalytics'
import { supabase } from '../../../lib/supabase'
import type { HubPhoto } from '../../../types/hub'

type Tab = 'overview' | 'photos' | 'songs' | 'qr'

export function HubDashboard() {
  const { hubId } = useParams<{ hubId: string }>()
  const { hub, songRequests, loadHub, hidePhoto, featurePhoto, approvePhoto, markSongPlayed, updateHub } = useHubStore()
  const [tab, setTab] = useState<Tab>('overview')
  const [copied, setCopied] = useState(false)
  const [allPhotos, setAllPhotos] = useState<HubPhoto[]>([])

  useEffect(() => {
    if (!hubId) return
    // Load by ID: first get access_code then load
    supabase.from('wedding_hubs').select('access_code').eq('id', hubId).single().then(({ data }) => {
      if (data) loadHub(data.access_code)
    })
  }, [hubId, loadHub])

  useEffect(() => {
    if (!hubId) return
    // Load all photos including unapproved for moderation
    supabase.from('hub_photos').select('*').eq('hub_id', hubId).order('created_at', { ascending: false }).then(({ data }) => {
      setAllPhotos((data as HubPhoto[]) || [])
    })
  }, [hubId])

  if (!hub) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
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
    { id: 'photos', label: `Photos (${allPhotos.length})` },
    { id: 'songs', label: `Songs (${songRequests.length})` },
    { id: 'qr', label: 'QR Code' },
  ]

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{coupleNames}</h1>
          <p className="font-body text-sm text-ink-400 mt-0.5">
            {new Date(hub.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {hub.venue_name ? ` · ${hub.venue_name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateHub(hub.id, { is_active: !hub.is_active })}
            className={`text-xs font-body px-3 py-1.5 rounded-full border font-medium transition-all ${
              hub.is_active ? 'border-green-200 text-green-700 bg-green-50' : 'border-border text-ink-400'
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
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 text-sm font-body font-medium text-brand hover:text-brand/80 shrink-0"
        >
          {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 font-body text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-brand text-brand' : 'border-transparent text-ink-400 hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <HubAnalytics hubId={hub.id} />
      )}

      {tab === 'photos' && (
        <div className="space-y-3">
          <p className="font-body text-sm text-ink-400">
            Manage guest-uploaded photos. Hide inappropriate content or feature your favourites at the top.
          </p>
          {allPhotos.length === 0 ? (
            <p className="font-body text-sm text-ink-300 text-center py-8">No photos yet — share your hub link with guests!</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {allPhotos.map((photo) => {
                const url = photo.r2_thumbnail_key
                  ? `${import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || ''}/${photo.r2_thumbnail_key}`
                  : `${import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || ''}/${photo.r2_original_key}`
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
                        title={photo.is_featured ? 'Unfeature' : 'Feature'}
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

      {tab === 'songs' && (
        <div className="space-y-3">
          {songRequests.length === 0 ? (
            <p className="font-body text-sm text-ink-300 text-center py-8">No song requests yet.</p>
          ) : (
            songRequests.map((req) => (
              <div key={req.id} className={`flex items-center gap-3 p-3 rounded-xl border ${req.is_played ? 'border-border opacity-50' : 'border-border'}`}>
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
                    onClick={() => markSongPlayed(req.id)}
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
