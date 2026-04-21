import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image, Video } from 'lucide-react'

const ACCEPT_PHOTOS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
}
const ACCEPT_VIDEOS = {
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
}

interface Props {
  onFilesSelected: (files: File[]) => void
  accept?: 'photos' | 'videos' | 'both'
  maxFiles?: number
  disabled?: boolean
  compact?: boolean
}

export function DropZone({ onFilesSelected, accept = 'photos', maxFiles, disabled, compact }: Props) {
  const acceptTypes =
    accept === 'photos' ? ACCEPT_PHOTOS :
    accept === 'videos' ? ACCEPT_VIDEOS :
    { ...ACCEPT_PHOTOS, ...ACCEPT_VIDEOS }

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) onFilesSelected(accepted)
  }, [onFilesSelected])

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: acceptTypes,
    maxFiles,
    disabled,
    multiple: !compact,
  })

  const borderColor = isDragReject
    ? 'border-red-400 bg-red-50'
    : isDragAccept || isDragActive
      ? 'border-brand bg-brand/5 scale-[1.01]'
      : disabled
        ? 'border-border bg-ink-50/30 opacity-50 cursor-not-allowed'
        : 'border-border hover:border-brand/50 hover:bg-ink-50/50 cursor-pointer'

  const IconComponent = accept === 'videos' ? Video : Image

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-card transition-all duration-200 select-none ${borderColor} ${compact ? 'p-6' : 'p-10'} text-center`}
    >
      <input {...getInputProps()} />
      <div className={`flex flex-col items-center gap-3 ${compact ? '' : 'py-2'}`}>
        {isDragActive ? (
          <Upload size={compact ? 24 : 36} className="text-brand animate-bounce" />
        ) : (
          <IconComponent size={compact ? 24 : 36} className="text-ink-200" />
        )}
        {!compact && (
          <>
            <div>
              <p className="font-display text-lg text-ink mb-0.5">
                {isDragActive ? 'Drop to upload' : `Drop ${accept === 'both' ? 'files' : accept} here`}
              </p>
              <p className="font-body text-sm text-ink-400">
                or <span className="text-brand underline">click to browse</span>
                {accept === 'photos' && ' — JPG, PNG, HEIC, WebP'}
                {accept === 'videos' && ' — MP4, MOV, AVI (max 3 GB)'}
                {accept === 'both' && ' — photos and videos'}
              </p>
            </div>
            {isDragReject && (
              <p className="text-red-500 text-sm font-body">Unsupported file type</p>
            )}
          </>
        )}
        {compact && (
          <p className="font-body text-xs text-ink-400">
            {isDragActive ? 'Drop here' : 'Click or drag'}
          </p>
        )}
      </div>
    </div>
  )
}
