import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, Images, CheckCircle } from 'lucide-react'
import { useHubStore } from '../../../store/useHubStore'
import { useAuthStore } from '../../../store/useAuthStore'
import { getSessionId } from '../hooks/useHubPhotoWall'
import { supabase } from '../../../lib/supabase'
import type { WeddingHub } from '../../../types/hub'

interface Props {
  hub: WeddingHub
  onClose: () => void
}

type Phase = 'form' | 'uploading' | 'done' | 'account'

export function HubPhotoUpload({ hub, onClose }: Props) {
  const user = useAuthStore((s) => s.user)
  const { uploadPhoto } = useHubStore()

  const [phase, setPhase] = useState<Phase>('form')
  const [files, setFiles] = useState<File[]>([])
  const [uploaderName, setUploaderName] = useState(user?.email?.split('@')[0] || '')
  const [uploaderEmail, setUploaderEmail] = useState(user?.email || '')
  const [progress, setProgress] = useState(0)
  const [password, setPassword] = useState('')
  const [accountError, setAccountError] = useState('')

  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    setFiles(Array.from(newFiles))
  }

  const upload = useCallback(async () => {
    if (!files.length || !uploaderName.trim()) return
    setPhase('uploading')
    setProgress(0)

    let done = 0
    for (const file of files) {
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const key = `hub-uploads/${hub.id}/${getSessionId()}/${Date.now()}.${ext}`

        const { error: storageErr } = await supabase.storage
          .from('gallery-media')
          .upload(key, file, { contentType: file.type, upsert: false })

        if (!storageErr) {
          await uploadPhoto(hub.id, key, uploaderName.trim(), uploaderEmail || undefined, user?.id)
        }
      } catch (e) {
        console.error(e)
      }
      done++
      setProgress(Math.round((done / files.length) * 100))
    }

    setPhase(uploaderEmail && !user ? 'account' : 'done')
  }, [files, uploaderName, uploaderEmail, hub.id, user, uploadPhoto])

  const createAccount = async () => {
    setAccountError('')
    if (!password || password.length < 6) { setAccountError('Password must be at least 6 characters.'); return }
    const { error } = await supabase.auth.signUp({ email: uploaderEmail, password })
    if (error) { setAccountError(error.message); return }
    setPhase('done')
  }

  const previews = files.slice(0, 6).map((f) => URL.createObjectURL(f))

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Handle */}
          <div className="w-10 h-1 bg-ink-200 rounded-full mx-auto sm:hidden" />

          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">
              {phase === 'done' ? 'Photos uploaded! 🎉' : phase === 'account' ? 'Save your photos' : 'Share Your Photos'}
            </h3>
            <button onClick={onClose} className="text-ink-300 hover:text-ink"><X size={18} /></button>
          </div>

          {phase === 'form' && (
            <>
              {/* Hidden file inputs */}
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple className="hidden"
                onChange={(e) => handleFiles(e.target.files)} />
              <input ref={libraryRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => handleFiles(e.target.files)} />

              {files.length === 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => cameraRef.current?.click()}
                    className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed border-border hover:border-brand hover:bg-brand/5 transition-all"
                  >
                    <Camera size={28} className="text-ink-300" />
                    <span className="font-body text-sm font-medium text-ink">Take a Photo</span>
                    <span className="font-body text-xs text-ink-400">Opens camera</span>
                  </button>
                  <button
                    onClick={() => libraryRef.current?.click()}
                    className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed border-border hover:border-brand hover:bg-brand/5 transition-all"
                  >
                    <Images size={28} className="text-ink-300" />
                    <span className="font-body text-sm font-medium text-ink">From Library</span>
                    <span className="font-body text-xs text-ink-400">Select multiple</span>
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {previews.map((src, i) => (
                      <img key={i} src={src} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    ))}
                    {files.length > 6 && (
                      <div className="w-14 h-14 rounded-lg bg-ink-100 flex items-center justify-center font-body text-xs text-ink-400">
                        +{files.length - 6}
                      </div>
                    )}
                  </div>
                  <p className="font-body text-sm text-ink-400">{files.length} photo{files.length !== 1 ? 's' : ''} selected</p>
                  <button onClick={() => setFiles([])} className="text-xs text-brand hover:underline">Change</button>
                </div>
              )}

              <div>
                <label className="block font-body text-sm font-medium text-ink mb-1.5">
                  Your name (shown on photo) *
                </label>
                <input
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  placeholder="Maria"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block font-body text-sm font-medium text-ink mb-1.5">
                  Email <span className="font-normal text-ink-400">(optional — saves photos to your free account)</span>
                </label>
                <input
                  type="email"
                  value={uploaderEmail}
                  onChange={(e) => setUploaderEmail(e.target.value)}
                  placeholder="maria@email.com"
                  className="input w-full"
                />
              </div>

              <button
                onClick={upload}
                disabled={!files.length || !uploaderName.trim()}
                className="w-full btn-primary disabled:opacity-50"
              >
                Upload Photos
              </button>

              <p className="font-body text-xs text-ink-300 text-center">
                By uploading you agree these photos may be seen by other guests and the couple.
              </p>
            </>
          )}

          {phase === 'uploading' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-t-brand border-ink-100 animate-spin mx-auto" />
              <p className="font-body text-sm text-ink">Uploading {files.length} photo{files.length !== 1 ? 's' : ''}…</p>
              <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="font-body text-xs text-ink-400">{progress}% complete</p>
            </div>
          )}

          {phase === 'account' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3">
                <CheckCircle size={18} className="text-green-500 shrink-0" />
                <p className="font-body text-sm text-green-700">{files.length} photo{files.length !== 1 ? 's' : ''} uploaded successfully!</p>
              </div>
              <div className="bg-ink-50 rounded-xl p-4 space-y-3">
                <p className="font-body text-sm font-medium text-ink">Create a free VowVendors account</p>
                <p className="font-body text-xs text-ink-400">
                  Save your photos and get notified when the couple's full gallery is ready.
                </p>
                <p className="font-body text-sm text-ink">Your email: <span className="font-medium">{uploaderEmail}</span></p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a password"
                  className="input w-full"
                />
                {accountError && <p className="font-body text-xs text-red-500">{accountError}</p>}
                <button onClick={createAccount} className="w-full btn-primary">Save My Photos to My Account</button>
              </div>
              <button onClick={() => setPhase('done')} className="w-full text-center font-body text-sm text-ink-400 hover:text-ink py-1">
                No thanks
              </button>
            </div>
          )}

          {phase === 'done' && (
            <div className="text-center py-6 space-y-4">
              <div className="text-5xl">🎉</div>
              <p className="font-body text-base font-medium text-ink">Your photos are on the wall!</p>
              <p className="font-body text-sm text-ink-400">They will appear for all guests to see and like.</p>
              <button onClick={onClose} className="btn-primary w-full">Done</button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
