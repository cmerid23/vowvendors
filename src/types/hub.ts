export type HubTheme = 'romantic' | 'modern' | 'rustic' | 'garden' | 'minimal'

export interface WeddingHub {
  id: string
  couple_id: string | null
  created_by: string | null
  access_code: string
  is_active: boolean
  is_public: boolean
  partner_one_name: string
  partner_two_name: string
  wedding_date: string
  venue_name: string | null
  venue_address: string | null
  cover_photo_url: string | null
  welcome_message: string | null
  accent_color: string
  theme: HubTheme
  show_timeline: boolean
  show_photo_wall: boolean
  show_seating: boolean
  show_song_requests: boolean
  show_vendors: boolean
  show_travel: boolean
  show_things_to_do: boolean
  show_faq: boolean
  venue_city: string | null
  venue_state: string | null
  total_scans: number
  total_guest_accounts: number
  total_photos_uploaded: number
  created_at: string
  updated_at: string
}

export interface HubTimelineEvent {
  id: string
  hub_id: string
  time: string
  title: string
  description: string | null
  icon: string
  is_current: boolean
  display_order: number
  created_at: string
}

export interface HubPhoto {
  id: string
  hub_id: string
  uploader_id: string | null
  uploader_name: string | null
  uploader_email: string | null
  r2_original_key: string
  r2_thumbnail_key: string | null
  r2_medium_key: string | null
  file_size_bytes: number | null
  is_approved: boolean
  is_featured: boolean
  caption: string | null
  like_count: number
  created_at: string
}

export interface HubVendor {
  id: string
  hub_id: string
  vendor_id: string | null
  vendor_name: string
  vendor_category: string | null
  vendor_instagram: string | null
  vendor_website: string | null
  vendor_vowvendors_slug: string | null
  display_order: number
  created_at: string
}

export interface HubSongRequest {
  id: string
  hub_id: string
  requester_id: string | null
  requester_name: string | null
  song_title: string
  artist: string | null
  message: string | null
  vote_count: number
  is_played: boolean
  created_at: string
}

export interface HubSeatingTable {
  id: string
  hub_id: string
  table_name: string
  seats: Array<{ name: string; seat: number }>
  display_order: number
}

export interface HubScan {
  id: string
  hub_id: string
  user_id: string | null
  session_id: string | null
  created_at: string
}

export interface HubAnalytics {
  totalScans: number
  totalGuestAccounts: number
  totalPhotos: number
  totalLikes: number
  totalSongRequests: number
  topVendorTaps: Array<{ vendorName: string; taps: number }>
}

export interface HubTravel {
  id: string
  hub_id: string
  nearest_airport_name: string | null
  nearest_airport_code: string | null
  airport_distance_text: string | null
  airport_notes: string | null
  transport_notes: string | null
  parking_notes: string | null
  recommended_area: string | null
}

export interface HubHotel {
  id: string
  hub_id: string
  name: string
  address: string | null
  distance_from_venue: string | null
  price_range: string | null
  booking_link: string | null
  notes: string | null
  display_order: number
}

export interface HubThingToDo {
  id: string
  hub_id: string
  name: string
  category: 'food' | 'outdoors' | 'shopping' | 'culture' | 'entertainment' | 'general'
  description: string | null
  address: string | null
  distance_from_venue: string | null
  website_url: string | null
  google_maps_url: string | null
  is_ai_generated: boolean
  display_order: number
}

export interface HubFaqItem {
  id: string
  hub_id: string
  category: string
  question: string
  answer: string
  display_order: number
  is_from_template: boolean
}

export interface FaqTemplate {
  question: string
  placeholder: string
}

export interface ThingsToDoSuggestion {
  name: string
  category: string
  description: string
  distance_hint: string
}

export type HubThingToDoCategory = 'food' | 'outdoors' | 'shopping' | 'culture' | 'entertainment' | 'general'

export const THINGS_TO_DO_CATEGORIES: Array<{ id: HubThingToDoCategory; label: string; emoji: string }> = [
  { id: 'food', label: 'Food & Drinks', emoji: '🍽️' },
  { id: 'outdoors', label: 'Outdoors', emoji: '🌳' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'culture', label: 'Culture', emoji: '🏛️' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎭' },
  { id: 'general', label: 'General', emoji: '📍' },
]

// Form types for creation
export interface CreateHubData {
  created_by: string
  couple_id?: string
  partner_one_name: string
  partner_two_name: string
  wedding_date: string
  venue_name?: string
  venue_address?: string
  venue_city?: string
  venue_state?: string
  cover_photo_url?: string
  welcome_message?: string
  accent_color?: string
  theme?: HubTheme
  show_timeline?: boolean
  show_photo_wall?: boolean
  show_seating?: boolean
  show_song_requests?: boolean
  show_vendors?: boolean
  show_travel?: boolean
  show_things_to_do?: boolean
  show_faq?: boolean
}

export interface CreateTimelineEvent {
  time: string
  title: string
  description?: string
  icon?: string
  display_order?: number
}

export interface CreateHubVendor {
  vendor_name: string
  vendor_category?: string
  vendor_instagram?: string
  vendor_website?: string
  vendor_vowvendors_slug?: string
  vendor_id?: string
}

export interface CreateSongRequest {
  requester_name?: string
  song_title: string
  artist?: string
  message?: string
}

export const TIMELINE_ICONS: Record<string, string> = {
  heart: '💛',
  camera: '📷',
  music: '🎵',
  cake: '🎂',
  rings: '💍',
  champagne: '🥂',
  dance: '💃',
  car: '🚗',
  flower: '🌸',
  food: '🍽️',
}

export const TIMELINE_PRESETS: Array<{ title: string; icon: string; time: string }> = [
  { title: 'Guest Arrival', icon: 'heart', time: '2:30 PM' },
  { title: 'Ceremony Begins', icon: 'rings', time: '3:00 PM' },
  { title: 'Cocktail Hour', icon: 'champagne', time: '4:30 PM' },
  { title: 'Reception Dinner', icon: 'food', time: '6:00 PM' },
  { title: 'First Dance', icon: 'dance', time: '7:30 PM' },
  { title: 'Cake Cutting', icon: 'cake', time: '8:00 PM' },
  { title: 'Bouquet Toss', icon: 'flower', time: '8:30 PM' },
  { title: 'Last Dance', icon: 'dance', time: '9:45 PM' },
  { title: "Send-Off", icon: 'car', time: '10:00 PM' },
]

export const VENDOR_CATEGORIES = [
  'Photographer',
  'Videographer',
  'Florist',
  'DJ',
  'Band',
  'Planner / Coordinator',
  'Caterer',
  'Cake',
  'Hair & Makeup',
  'Officiant',
  'Venue',
  'Transportation',
  'Other',
]

export const HUB_THEMES: Array<{ id: HubTheme; label: string; color: string }> = [
  { id: 'romantic', label: 'Romantic Gold', color: '#B8860B' },
  { id: 'modern', label: 'Modern White', color: '#374151' },
  { id: 'rustic', label: 'Rustic Terracotta', color: '#C2714F' },
  { id: 'garden', label: 'Garden Green', color: '#4A7C59' },
  { id: 'minimal', label: 'Minimal Black', color: '#111827' },
]
