import type { WeddingHub } from '../../../types/hub'

interface Props {
  hub: WeddingHub
}

export function HubHero({ hub }: Props) {
  const date = new Date(hub.wedding_date + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Cover photo or gradient background */}
      {hub.cover_photo_url ? (
        <>
          <img
            src={hub.cover_photo_url}
            alt="Wedding cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${hub.accent_color}33, ${hub.accent_color}11)` }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 px-6 py-16 max-w-lg mx-auto">
        <p className="font-body text-sm font-medium tracking-widest uppercase mb-4"
          style={{ color: hub.cover_photo_url ? 'rgba(255,255,255,0.8)' : hub.accent_color }}
        >
          {date}
        </p>
        <h1
          className="font-display text-4xl sm:text-5xl font-semibold mb-3 leading-tight"
          style={{ color: hub.cover_photo_url ? 'white' : '#1a1a1a' }}
        >
          {hub.partner_one_name} &amp; {hub.partner_two_name}
        </h1>
        {(hub.venue_name || hub.venue_address) && (
          <p className="font-body text-base mb-4"
            style={{ color: hub.cover_photo_url ? 'rgba(255,255,255,0.85)' : '#6b7280' }}
          >
            {[hub.venue_name, hub.venue_address].filter(Boolean).join(', ')}
          </p>
        )}
        {hub.welcome_message && (
          <p
            className="font-body text-sm italic leading-relaxed"
            style={{ color: hub.cover_photo_url ? 'rgba(255,255,255,0.75)' : '#9ca3af' }}
          >
            &ldquo;{hub.welcome_message}&rdquo;
          </p>
        )}
      </div>

      {/* Powered by */}
      <div className="absolute bottom-4 right-4 z-10">
        <a
          href="/"
          className="font-body text-xs opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: hub.cover_photo_url ? 'white' : '#6b7280' }}
        >
          Powered by VowVendors
        </a>
      </div>
    </div>
  )
}
