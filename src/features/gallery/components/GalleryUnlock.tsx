import { useState } from 'react'
import { Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '../../../components/ui/Button'
import { verifyPassword } from '../../../lib/galleryUtils'
import { useGalleryStore } from '../../../store/useGalleryStore'

interface Props {
  slug: string
  passwordHash: string
  galleryTitle: string
  coupleNames: string | null
  onUnlocked: () => void
}

export function GalleryUnlock({ slug, passwordHash, galleryTitle, coupleNames, onUnlocked }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const unlock = useGalleryStore((s) => s.unlock)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    setChecking(true)
    setError('')
    const ok = await verifyPassword(password, passwordHash)
    if (ok) {
      unlock(slug)
      onUnlocked()
    } else {
      setError('Incorrect password. Please try again.')
    }
    setChecking(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blush-50 to-surface flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-card p-8 w-full max-w-sm text-center"
      >
        <div className="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Lock size={24} className="text-brand" />
        </div>

        <h1 className="font-display text-2xl font-semibold text-ink mb-1">{galleryTitle}</h1>
        {coupleNames && <p className="font-body text-ink-400 text-sm mb-4">{coupleNames}</p>}
        <p className="font-body text-ink-400 text-sm mb-6">This gallery is password protected.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoFocus
            className="input-field w-full text-center tracking-widest"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm font-body">{error}</p>}
          <Button type="submit" loading={checking} className="w-full justify-center">
            View Gallery
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
