export interface Gallery {
  id: string
  vendor_id: string
  slug: string
  title: string
  couple_names: string | null
  wedding_date: string | null
  cover_photo_url: string | null
  password_hash: string | null
  is_active: boolean
  allow_downloads: boolean
  allow_favourites: boolean
  allow_guest_uploads: boolean
  watermark_enabled: boolean
  watermark_text: string | null
  total_photos: number
  total_videos: number
  total_size_bytes: number
  view_count: number
  download_count: number
  created_at: string
  expires_at: string | null
  notified_at: string | null
}

export interface GalleryAlbum {
  id: string
  gallery_id: string
  name: string
  display_order: number
  cover_photo_url: string | null
  photo_count: number
  is_guest_album: boolean
  created_at: string
}

export interface GalleryMedia {
  id: string
  gallery_id: string
  album_id: string | null
  vendor_id: string
  file_name: string
  file_type: 'photo' | 'video'
  mime_type: string | null
  storage_path: string
  thumb_path: string | null
  medium_path: string | null
  original_size_bytes: number | null
  compressed_size_bytes: number | null
  width: number | null
  height: number | null
  display_order: number
  is_hero_shot: boolean
  is_guest_upload: boolean
  guest_uploader_name: string | null
  guest_approved: boolean
  uploaded_by: string | null
  created_at: string
}

export interface GalleryFavourite {
  id: string
  gallery_id: string
  media_id: string
  user_id: string
  created_at: string
}

export type UploadStatus = 'pending' | 'compressing' | 'uploading' | 'done' | 'error'

export interface UploadItem {
  id: string
  file: File
  status: UploadStatus
  progress: number
  previewUrl: string
  error?: string
}
