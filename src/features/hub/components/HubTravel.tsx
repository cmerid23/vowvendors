import { ExternalLink, MapPin } from 'lucide-react'
import type { WeddingHub, HubTravel as HubTravelData, HubHotel } from '../../../types/hub'

interface Props {
  hub: WeddingHub
  travel: HubTravelData | null
  hotels: HubHotel[]
}

export function HubTravel({ hub, travel, hotels }: Props) {
  const hasContent = travel || hotels.length > 0
  if (!hasContent) return null

  const encodedAddress = hub.venue_address ? encodeURIComponent(hub.venue_address) : ''

  return (
    <section id="travel" className="px-4 py-10 max-w-2xl mx-auto">
      <h2 className="font-display text-2xl font-semibold text-ink text-center mb-8">Getting Here ✈️</h2>

      <div className="space-y-6">
        {/* Airport */}
        {(travel?.nearest_airport_name || travel?.airport_distance_text) && (
          <div className="card p-5 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">✈️</span>
              <p className="font-body text-sm font-semibold text-ink uppercase tracking-wider">Airport</p>
            </div>
            {travel.nearest_airport_name && (
              <p className="font-body text-sm font-medium text-ink">{travel.nearest_airport_name}</p>
            )}
            {travel.airport_distance_text && (
              <p className="font-body text-sm text-ink-400">{travel.airport_distance_text}</p>
            )}
            {travel.airport_notes && (
              <p className="font-body text-sm text-ink-400">{travel.airport_notes}</p>
            )}
          </div>
        )}

        {/* Getting Around */}
        {(travel?.transport_notes || travel?.parking_notes) && (
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🚗</span>
              <p className="font-body text-sm font-semibold text-ink uppercase tracking-wider">Getting Around</p>
            </div>
            {travel.transport_notes && (
              <p className="font-body text-sm text-ink-400 leading-relaxed">{travel.transport_notes}</p>
            )}
            {travel.parking_notes && (
              <div className="flex items-start gap-2">
                <span className="text-sm">🅿️</span>
                <p className="font-body text-sm text-ink-400">{travel.parking_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Where to Stay */}
        {(travel?.recommended_area || hotels.length > 0) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏨</span>
              <p className="font-body text-sm font-semibold text-ink uppercase tracking-wider">Where to Stay</p>
            </div>
            {travel?.recommended_area && (
              <p className="font-body text-sm text-ink-400 leading-relaxed">{travel.recommended_area}</p>
            )}

            {/* Hotel cards */}
            {hotels.map((hotel) => (
              <div key={hotel.id} className="card p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-semibold text-ink">{hotel.name}</p>
                    {hotel.address && (
                      <p className="font-body text-xs text-ink-400 mt-0.5">{hotel.address}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {hotel.distance_from_venue && (
                        <span className="font-body text-xs text-ink-400">{hotel.distance_from_venue}</span>
                      )}
                      {hotel.price_range && (
                        <span className="font-body text-xs font-medium" style={{ color: hub.accent_color }}>
                          {hotel.price_range}
                        </span>
                      )}
                    </div>
                    {hotel.notes && (
                      <p className="font-body text-xs text-ink-300 italic mt-1">💡 {hotel.notes}</p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  {hotel.booking_link && (
                    <a
                      href={hotel.booking_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-body font-semibold px-3 py-1.5 rounded-full text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: hub.accent_color }}
                    >
                      <ExternalLink size={11} /> Book Now
                    </a>
                  )}
                  {hotel.address && (
                    <a
                      href={`https://maps.google.com/maps?q=${encodeURIComponent(hotel.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-full border border-border hover:bg-ink-50 transition-colors"
                    >
                      <MapPin size={11} /> Google Maps
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Venue map embed */}
        {encodedAddress && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">📍</span>
              <p className="font-body text-sm font-semibold text-ink uppercase tracking-wider">Venue Location</p>
            </div>
            <div className="rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: 300 }}>
              <iframe
                title="Venue location"
                width="100%"
                height="300"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodedAddress}&output=embed`}
              />
            </div>
            {hub.venue_name && (
              <p className="font-body text-xs text-ink-300 text-center">{hub.venue_name}{hub.venue_address ? `, ${hub.venue_address}` : ''}</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
