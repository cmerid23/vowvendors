import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useHubStore } from '../../../store/useHubStore'
import { getSessionId } from '../hooks/useHubPhotoWall'
import { HubHero } from '../components/HubHero'
import { HubNav } from '../components/HubNav'
import { HubTimeline } from '../components/HubTimeline'
import { HubTravel } from '../components/HubTravel'
import { HubThingsToDo } from '../components/HubThingsToDo'
import { HubPhotoWall } from '../components/HubPhotoWall'
import { HubPhotoUpload } from '../components/HubPhotoUpload'
import { HubSeating } from '../components/HubSeating'
import { HubSongRequests } from '../components/HubSongRequests'
import { HubFAQ } from '../components/HubFAQ'
import { HubVendors } from '../components/HubVendors'
import { HubFooter } from '../components/HubFooter'

export function WeddingHubPage() {
  const { accessCode } = useParams<{ accessCode: string }>()
  const { hub, timeline, vendors, seatingTables, travel, hotels, thingsToDo, faqItems, isLoading, loadHub, trackScan } = useHubStore()
  const [activeSection, setActiveSection] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const scanTracked = useRef(false)

  useEffect(() => {
    if (accessCode) loadHub(accessCode)
  }, [accessCode, loadHub])

  // Track scan once per session
  useEffect(() => {
    if (hub && !scanTracked.current) {
      scanTracked.current = true
      trackScan(hub.id, getSessionId())
    }
  }, [hub, trackScan])

  // IntersectionObserver for sticky nav active state
  useEffect(() => {
    const sections = ['timeline', 'travel', 'things-to-do', 'photos', 'seating', 'songs', 'faq', 'vendors']
    const observers: IntersectionObserver[] = []

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { rootMargin: '-40% 0px -50% 0px' },
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [hub])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-t-[#B8860B] border-ink-100 rounded-full animate-spin" />
          <p className="font-body text-sm text-ink-400">Loading your wedding hub…</p>
        </div>
      </div>
    )
  }

  if (!hub) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-4">
          <p className="text-4xl mb-4">💔</p>
          <h1 className="font-display text-2xl font-semibold text-ink mb-2">Hub not found</h1>
          <p className="font-body text-sm text-ink-400">This wedding hub doesn&apos;t exist or is no longer active.</p>
          <a href="/" className="inline-block mt-6 font-body text-sm text-brand hover:underline">Go to VowVendors →</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" style={{ '--accent': hub.accent_color } as React.CSSProperties}>
      {/* Hero */}
      <HubHero hub={hub} />

      {/* Sticky nav */}
      <HubNav hub={hub} activeSection={activeSection} onNavigate={scrollTo} />

      {/* Sections */}
      {hub.show_timeline && timeline.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <HubTimeline hub={hub} events={timeline} />
        </>
      )}

      {hub.show_travel && (travel || hotels.length > 0) && (
        <>
          <div className="h-px bg-border" />
          <HubTravel hub={hub} travel={travel} hotels={hotels} />
        </>
      )}

      {hub.show_things_to_do && thingsToDo.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <HubThingsToDo hub={hub} items={thingsToDo} />
        </>
      )}

      {hub.show_photo_wall && (
        <>
          <div className="h-px bg-border" />
          <HubPhotoWall hub={hub} onUploadClick={() => setShowUpload(true)} />
        </>
      )}

      {hub.show_seating && seatingTables.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <HubSeating tables={seatingTables} accentColor={hub.accent_color} />
        </>
      )}

      {hub.show_song_requests && (
        <>
          <div className="h-px bg-border" />
          <HubSongRequests hub={hub} />
        </>
      )}

      {hub.show_faq && faqItems.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <HubFAQ items={faqItems} />
        </>
      )}

      {hub.show_vendors && vendors.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <HubVendors hub={hub} vendors={vendors} />
        </>
      )}

      <HubFooter />

      {/* Upload sheet */}
      {showUpload && (
        <HubPhotoUpload hub={hub} onClose={() => setShowUpload(false)} />
      )}
    </div>
  )
}
