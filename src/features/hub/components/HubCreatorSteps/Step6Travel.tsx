import { useState } from 'react'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import type { HubTravel, HubHotel } from '../../../../types/hub'

interface Props {
  travel: Partial<HubTravel>
  hotels: Omit<HubHotel, 'id' | 'hub_id' | 'display_order'>[]
  venueAddress?: string
  onTravelChange: (data: Partial<HubTravel>) => void
  onHotelsChange: (hotels: Omit<HubHotel, 'id' | 'hub_id' | 'display_order'>[]) => void
}

const BLANK_HOTEL: Omit<HubHotel, 'id' | 'hub_id' | 'display_order'> = {
  name: '',
  address: '',
  distance_from_venue: '',
  price_range: '',
  booking_link: '',
  notes: '',
}

export function Step6Travel({ travel, hotels, venueAddress, onTravelChange, onHotelsChange }: Props) {
  const [addingHotel, setAddingHotel] = useState(false)
  const [hotelDraft, setHotelDraft] = useState<typeof BLANK_HOTEL>(BLANK_HOTEL)

  const travelField = (key: keyof HubTravel) => ({
    value: (travel[key] as string) || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onTravelChange({ ...travel, [key]: e.target.value }),
  })

  const saveHotel = () => {
    if (!hotelDraft.name.trim()) return
    onHotelsChange([...hotels, { ...hotelDraft }])
    setHotelDraft(BLANK_HOTEL)
    setAddingHotel(false)
  }

  const removeHotel = (i: number) => onHotelsChange(hotels.filter((_, idx) => idx !== i))

  const encodedAddress = venueAddress ? encodeURIComponent(venueAddress) : ''

  return (
    <div className="space-y-6">
      <p className="font-body text-sm text-ink-400">
        Help your out-of-town guests plan their trip. This section is optional — fill in what you know.
      </p>

      {/* Airport */}
      <div className="space-y-3">
        <p className="font-body text-xs font-semibold text-ink-400 uppercase tracking-wider">Airport</p>
        <div>
          <label className="block font-body text-xs text-ink-400 mb-1">Nearest airport name</label>
          <input
            {...travelField('nearest_airport_name')}
            placeholder="Austin-Bergstrom International Airport (AUS)"
            className="input w-full text-sm"
          />
        </div>
        <div>
          <label className="block font-body text-xs text-ink-400 mb-1">Distance from venue</label>
          <input
            {...travelField('airport_distance_text')}
            placeholder="About 25–35 minute drive"
            className="input w-full text-sm"
          />
        </div>
        <div>
          <label className="block font-body text-xs text-ink-400 mb-1">Airport notes (optional)</label>
          <input
            {...travelField('airport_notes')}
            placeholder="Most major airlines fly direct"
            className="input w-full text-sm"
          />
        </div>
      </div>

      {/* Getting Around */}
      <div className="space-y-3">
        <p className="font-body text-xs font-semibold text-ink-400 uppercase tracking-wider">Getting Around</p>
        <div>
          <label className="block font-body text-xs text-ink-400 mb-1">Transport options</label>
          <textarea
            {...travelField('transport_notes')}
            rows={2}
            placeholder="Uber and Lyft are widely available. Rental cars are available at the airport."
            className="input w-full text-sm resize-none"
          />
        </div>
        <div>
          <label className="block font-body text-xs text-ink-400 mb-1">Parking</label>
          <input
            {...travelField('parking_notes')}
            placeholder="Free parking available at both venues"
            className="input w-full text-sm"
          />
        </div>
      </div>

      {/* Where to Stay */}
      <div className="space-y-3">
        <p className="font-body text-xs font-semibold text-ink-400 uppercase tracking-wider">Where to Stay</p>
        <div>
          <label className="block font-body text-xs text-ink-400 mb-1">Recommended area</label>
          <input
            {...travelField('recommended_area')}
            placeholder="North Austin and The Domain area are most convenient"
            className="input w-full text-sm"
          />
        </div>

        {/* Hotels list */}
        {hotels.length > 0 && (
          <div className="space-y-2">
            {hotels.map((hotel, i) => (
              <div key={i} className="flex items-start gap-3 bg-ink-50 rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-ink">{hotel.name}</p>
                  {hotel.address && <p className="font-body text-xs text-ink-400">{hotel.address}</p>}
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {hotel.distance_from_venue && (
                      <span className="font-body text-xs text-ink-400">{hotel.distance_from_venue}</span>
                    )}
                    {hotel.price_range && (
                      <span className="font-body text-xs font-medium text-ink">{hotel.price_range}</span>
                    )}
                    {hotel.booking_link && (
                      <span className="font-body text-xs text-brand flex items-center gap-0.5">
                        <ExternalLink size={10} /> Link added
                      </span>
                    )}
                  </div>
                  {hotel.notes && <p className="font-body text-xs text-ink-300 italic mt-0.5">"{hotel.notes}"</p>}
                </div>
                <button onClick={() => removeHotel(i)} className="text-ink-300 hover:text-red-500 shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add hotel form */}
        {addingHotel ? (
          <div className="border border-border rounded-xl p-4 space-y-3">
            <p className="font-body text-sm font-semibold text-ink">Add hotel recommendation</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-body text-xs text-ink-400 mb-1">Hotel name *</label>
                <input
                  value={hotelDraft.name}
                  onChange={(e) => setHotelDraft({ ...hotelDraft, name: e.target.value })}
                  placeholder="TownePlace Suites"
                  className="input w-full text-sm"
                />
              </div>
              <div>
                <label className="block font-body text-xs text-ink-400 mb-1">Distance to venue</label>
                <input
                  value={hotelDraft.distance_from_venue || ''}
                  onChange={(e) => setHotelDraft({ ...hotelDraft, distance_from_venue: e.target.value })}
                  placeholder="10 minutes from venue"
                  className="input w-full text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block font-body text-xs text-ink-400 mb-1">Address</label>
              <input
                value={hotelDraft.address || ''}
                onChange={(e) => setHotelDraft({ ...hotelDraft, address: e.target.value })}
                placeholder="541 Parker Drive, Austin TX"
                className="input w-full text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-body text-xs text-ink-400 mb-1">Price range</label>
                <input
                  value={hotelDraft.price_range || ''}
                  onChange={(e) => setHotelDraft({ ...hotelDraft, price_range: e.target.value })}
                  placeholder="$120–180/night"
                  className="input w-full text-sm"
                />
              </div>
              <div>
                <label className="block font-body text-xs text-ink-400 mb-1">Notes</label>
                <input
                  value={hotelDraft.notes || ''}
                  onChange={(e) => setHotelDraft({ ...hotelDraft, notes: e.target.value })}
                  placeholder="Ask for the wedding rate"
                  className="input w-full text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block font-body text-xs text-ink-400 mb-1">Booking link (any URL)</label>
              <input
                value={hotelDraft.booking_link || ''}
                onChange={(e) => setHotelDraft({ ...hotelDraft, booking_link: e.target.value })}
                placeholder="https://booking.com/..."
                className="input w-full text-sm"
              />
              <p className="font-body text-xs text-ink-300 mt-1">
                Paste any link — hotel website, Booking.com, Airbnb. We never earn commission.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={saveHotel} className="btn-primary text-sm px-4 py-1.5">Add Hotel</button>
              <button onClick={() => { setAddingHotel(false); setHotelDraft(BLANK_HOTEL) }} className="btn-ghost text-sm px-4 py-1.5">Cancel</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingHotel(true)}
            className="flex items-center gap-2 text-sm font-body font-medium text-brand hover:text-brand/80 transition-colors"
          >
            <Plus size={16} /> Add hotel recommendation
          </button>
        )}
      </div>

      {/* Venue map preview */}
      {encodedAddress && (
        <div className="space-y-2">
          <p className="font-body text-xs font-semibold text-ink-400 uppercase tracking-wider">Venue Location</p>
          <div className="rounded-xl overflow-hidden border border-border" style={{ height: 260 }}>
            <iframe
              title="Venue map"
              width="100%"
              height="260"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://maps.google.com/maps?q=${encodedAddress}&output=embed`}
            />
          </div>
          <p className="font-body text-xs text-ink-300">This map will be shown to your guests in the Travel section.</p>
        </div>
      )}
    </div>
  )
}
