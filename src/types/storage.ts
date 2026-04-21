export type UploadContext = 'gallery' | 'portfolio' | 'guest_upload' | 'wedpose' | 'profile' | 'contract'
export type OwnerType = 'vendor' | 'couple' | 'guest'
export type UploadStatus = 'pending' | 'uploaded' | 'processing' | 'ready' | 'error'
export type FileType = 'photo' | 'video'
export type StoragePlanName = 'free' | 'standard'

export interface StoragePlan {
  id: string
  name: StoragePlanName
  price_monthly: number
  storage_limit_bytes: number | null
  download_limit_monthly: number | null
  features: string[]
  is_active: boolean
}

export interface StorageUsage {
  id: string
  user_id: string
  used_bytes: number
  file_count: number
  last_updated: string
}

export interface StorageSubscription {
  id: string
  user_id: string
  plan_id: string
  status: string
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface MediaFile {
  id: string
  owner_id: string
  owner_type: OwnerType
  context: UploadContext
  context_id: string | null
  original_filename: string
  file_type: FileType
  mime_type: string | null
  width: number | null
  height: number | null
  duration_seconds: number | null
  exif_data: Record<string, unknown> | null
  r2_original_key: string | null
  r2_compressed_key: string | null
  r2_medium_key: string | null
  r2_thumbnail_key: string | null
  original_size_bytes: number | null
  compressed_size_bytes: number | null
  medium_size_bytes: number | null
  thumbnail_size_bytes: number | null
  total_size_bytes: number | null
  upload_status: UploadStatus
  error_message: string | null
  is_hero_shot: boolean
  is_guest_approved: boolean
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface StorageQuotaStatus {
  usedBytes: number
  limitBytes: number | null
  usedPercent: number
  downloadsThisMonth: number
  downloadLimitMonthly: number | null
  planName: StoragePlanName
  canDownload: boolean
  canUpload: boolean
  warningLevel: 'none' | 'warning' | 'critical' | 'exceeded'
}

// Client-side upload tracking (not persisted to DB until ready)
export type FileUploadStatus =
  | 'queued'
  | 'compressing'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'error'

export interface UploadFile {
  id: string
  file: File
  status: FileUploadStatus
  progress: number
  error?: string
  mediaFileId?: string
  thumbnailUrl?: string
  previewUrl?: string
  originalBytes: number
  compressedBytes?: number
}
