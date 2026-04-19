import { useState } from 'react'
import { useWedPoseStore } from '../store/useWedPoseStore'

export function WedPoseSettings() {
  const unsplashApiKey = useWedPoseStore((s) => s.unsplashApiKey)
  const setUnsplashApiKey = useWedPoseStore((s) => s.setUnsplashApiKey)
  const clearRecentlyViewed = useWedPoseStore((s) => s.clearRecentlyViewed)
  const recentlyViewed = useWedPoseStore((s) => s.recentlyViewed)

  const [keyInput, setKeyInput] = useState(unsplashApiKey)
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const handleSaveKey = () => {
    setUnsplashApiKey(keyInput.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith('wedpose_img_'))
      .forEach((k) => sessionStorage.removeItem(k))
  }

  const handleClearCache = () => {
    clearRecentlyViewed()
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith('wedpose_img_'))
      .forEach((k) => sessionStorage.removeItem(k))
  }

  return (
    <div className="pt-2 animate-fade-in max-w-lg">
      <h1 className="font-display text-2xl sm:text-3xl text-cream font-semibold mb-8">WedPose Settings</h1>

      <section className="mb-8">
        <h2 className="font-display text-lg text-gold mb-1">Unsplash API Key</h2>
        <p className="text-cream-400 font-body text-xs mb-4 leading-relaxed">
          WedPose uses the free Unsplash API to load pose reference images. Get your free Access Key at{' '}
          <a
            href="https://unsplash.com/developers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline"
          >
            unsplash.com/developers
          </a>
          . Free tier allows 50 requests/hour.
        </p>
        <div className="space-y-3">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste your Unsplash Access Key..."
              className="w-full bg-charcoal-50 text-cream font-body text-sm px-4 py-3 pr-12 rounded-xl border border-gold/20 focus:outline-none focus:border-gold/60 placeholder:text-cream-400"
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-400 hover:text-cream text-xs"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <button
            onClick={handleSaveKey}
            className={`wp-btn-gold w-full transition-all ${saved ? 'bg-green-600 text-white' : ''}`}
          >
            {saved ? '✓ Saved!' : 'Save API Key'}
          </button>
          {unsplashApiKey ? (
            <p className="text-green-400 text-xs font-body">✓ Custom API key is set</p>
          ) : import.meta.env.VITE_UNSPLASH_ACCESS_KEY ? (
            <p className="text-green-400 text-xs font-body">✓ Using app-wide API key</p>
          ) : null}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-lg text-gold mb-4">Data & Cache</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-charcoal-50 rounded-xl px-4 py-3 border border-gold/10">
            <div>
              <p className="text-cream font-body text-sm font-medium">Recently Viewed</p>
              <p className="text-cream-400 font-body text-xs mt-0.5">{recentlyViewed.length} poses in history</p>
            </div>
            <button
              onClick={handleClearCache}
              className="text-cream-400 hover:text-red-400 text-xs font-body transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center justify-between bg-charcoal-50 rounded-xl px-4 py-3 border border-gold/10">
            <div>
              <p className="text-cream font-body text-sm font-medium">Image Cache</p>
              <p className="text-cream-400 font-body text-xs mt-0.5">Session cache of loaded images</p>
            </div>
            <button
              onClick={() => {
                Object.keys(sessionStorage)
                  .filter((k) => k.startsWith('wedpose_img_'))
                  .forEach((k) => sessionStorage.removeItem(k))
              }}
              className="text-cream-400 hover:text-red-400 text-xs font-body transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-gold mb-4">About WedPose</h2>
        <div className="bg-charcoal-50 rounded-xl px-4 py-4 border border-gold/10 space-y-1.5">
          <p className="text-cream font-body text-sm">WedPose v1.0</p>
          <p className="text-cream-400 font-body text-xs">Professional posing reference for wedding photographers</p>
          <p className="text-cream-400 font-body text-xs">13 categories · 60+ subcategories · Unsplash-powered imagery</p>
        </div>
      </section>
    </div>
  )
}
