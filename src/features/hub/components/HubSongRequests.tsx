import { useState } from 'react'
import { Music } from 'lucide-react'
import { useHubStore } from '../../../store/useHubStore'
import { getSessionId } from '../hooks/useHubPhotoWall'
import type { WeddingHub } from '../../../types/hub'

interface Props {
  hub: WeddingHub
}

export function HubSongRequests({ hub }: Props) {
  const { songRequests, addSongRequest, voteSong } = useHubStore()
  const [songTitle, setSongTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [message, setMessage] = useState('')
  const [requesterName, setRequesterName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())

  const submit = async () => {
    if (!songTitle.trim()) return
    setSubmitting(true)
    await addSongRequest(hub.id, {
      song_title: songTitle.trim(),
      artist: artist.trim() || undefined,
      message: message.trim() || undefined,
      requester_name: requesterName.trim() || 'Guest',
    })
    setSongTitle(''); setArtist(''); setMessage('')
    setSubmitting(false)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const vote = async (requestId: string) => {
    if (votedIds.has(requestId)) return
    setVotedIds((prev) => new Set([...prev, requestId]))
    await voteSong(requestId, getSessionId())
  }

  return (
    <section id="songs" className="px-4 py-10 max-w-lg mx-auto">
      <h2 className="font-display text-2xl font-semibold text-ink text-center mb-2">Request a Song 🎵</h2>
      <p className="font-body text-sm text-ink-400 text-center mb-6">
        Help fill the dance floor! Request a song for the DJ.
      </p>

      {/* Request form */}
      <div className="card p-4 space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-body text-xs text-ink-400 mb-1">Song title *</label>
            <input
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="September"
              className="input w-full text-sm"
            />
          </div>
          <div>
            <label className="block font-body text-xs text-ink-400 mb-1">Artist</label>
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Earth Wind & Fire"
              className="input w-full text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block font-body text-xs text-ink-400 mb-1">Your name</label>
          <input
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            placeholder="Maria"
            className="input w-full text-sm"
          />
        </div>
        <div>
          <label className="block font-body text-xs text-ink-400 mb-1">Message (optional)</label>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="This is Grandma's favourite!"
            className="input w-full text-sm"
          />
        </div>
        <button
          onClick={submit}
          disabled={!songTitle.trim() || submitting}
          className="w-full btn-primary disabled:opacity-50"
          style={{ backgroundColor: hub.accent_color }}
        >
          {submitted ? '✓ Requested!' : submitting ? 'Requesting…' : 'Request This Song'}
        </button>
      </div>

      {/* Song list */}
      {songRequests.length > 0 && (
        <div className="space-y-2">
          <p className="font-body text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">Top Requests</p>
          {songRequests.map((req) => (
            <div
              key={req.id}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                req.is_played ? 'border-border opacity-50' : 'border-border hover:border-ink-200'
              }`}
            >
              <Music size={14} className="text-ink-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`font-body text-sm font-medium text-ink ${req.is_played ? 'line-through' : ''}`}>
                  {req.song_title}
                  {req.is_played && <span className="ml-2 text-xs text-green-500 font-normal">✓ Played</span>}
                </p>
                {req.artist && <p className="font-body text-xs text-ink-400">{req.artist}</p>}
                {req.message && <p className="font-body text-xs text-ink-300 italic">"{req.message}"</p>}
                {req.requester_name && (
                  <p className="font-body text-xs text-ink-300">— {req.requester_name}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-body text-sm font-medium" style={{ color: hub.accent_color }}>
                  ▲ {req.vote_count}
                </span>
                {!req.is_played && (
                  <button
                    onClick={() => vote(req.id)}
                    disabled={votedIds.has(req.id)}
                    className={`text-xs font-body font-semibold px-2.5 py-1 rounded-full border transition-all ${
                      votedIds.has(req.id)
                        ? 'border-transparent text-white'
                        : 'border-border text-ink hover:border-[var(--ac)] hover:text-[var(--ac)]'
                    }`}
                    style={{
                      '--ac': hub.accent_color,
                      ...(votedIds.has(req.id) ? { backgroundColor: hub.accent_color } : {}),
                    } as React.CSSProperties}
                  >
                    +1
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
