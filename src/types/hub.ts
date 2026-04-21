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

// Form types for creation
export interface CreateHubData {
  created_by: string
  couple_id?: string
  partner_one_name: string
  partner_two_name: string
  wedding_date: string
  venue_name?: string
  venue_address?: string
  cover_photo_url?: string
  welcome_message?: string
  accent_color?: string
  theme?: HubTheme
  show_timeline?: boolean
  show_photo_wall?: boolean
  show_seating?: boolean
  show_song_requests?: boolean
  show_vendors?: boolean
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
