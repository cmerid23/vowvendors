import { CheckCircle, AlertCircle, Loader2, X, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { formatBytes } from '../../lib/clientCompression'
import type { UploadFile } from '../../types/storage'

interface Props {
  files: UploadFile[]
  onCancel: (id: string) => void
  onRemove: (id: string) => void
  onRetry: (id: string) => void
  onUploadAll: () => void
  onClear: () => void
  isUploading: boolean
  stats: { total: number; queued: number; active: number; ready: number; errors: number }
}

export function UploadQueue({ files, onCancel, onRemove, onRetry, onUploadAll, onClear, isUploading, stats }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  if (files.length === 0) return null

  const overallPercent = stats.total > 0 ? Math.round((stats.ready / stats.total) * 100) : 0
  const allDone = stats.queued === 0 && stats.active === 0

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-ink-50/50 cursor-pointer select-none"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-3">
          {stats.active > 0 ? (
            <Loader2 size={15} className="text-brand animate-spin" />
          ) : allDone ? (
            <CheckCircle size={15} className="text-green-500" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-ink-300" />
          )}
          <span className="font-body text-sm font-medium text-ink">
            {allDone
              ? `${stats.ready} of ${stats.total} complete`
              : `${stats.ready} of ${stats.total} — uploading…`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {allDone && (
            <button
              onClick={(e) => { e.stopPropagation(); onClear() }}
              className="text-xs font-body text-ink-300 hover:text-ink transition-colors"
            >
              Clear
            </button>
          )}
          {collapsed ? <ChevronDown size={14} className="text-ink-300" /> : <ChevronUp size={14} className="text-ink-300" />}
        </div>
      </div>

      {/* Overall progress bar */}
      {!allDone && (
        <div className="h-1 bg-ink-100">
          <div className="h-full bg-brand transition-all duration-300" style={{ width: `${overallPercent}%` }} />
        </div>
      )}

      {/* File list */}
      {!collapsed && (
        <div className="max-h-64 overflow-y-auto divide-y divide-border">
          {files.map((f) => (
            <FileRow key={f.id} file={f} onCancel={onCancel} onRemove={onRemove} onRetry={onRetry} />
          ))}
        </div>
      )}

      {/* Footer actions */}
      {!collapsed && stats.queued > 0 && !isUploading && (
        <div className="px-4 py-3 border-t border-border flex justify-end">
          <button
            onClick={onUploadAll}
            className="text-sm font-body font-medium text-white bg-brand hover:bg-brand/90 px-4 py-1.5 rounded-full transition-colors"
          >
            Upload {stats.queued} {stats.queued === 1 ? 'file' : 'files'}
          </button>
        </div>
      )}
    </div>
  )
}

function FileRow({ file, onCancel, onRemove, onRetry }: {
  file: UploadFile
  onCancel: (id: string) => void
  onRemove: (id: string) => void
  onRetry: (id: string) => void
}) {
  const statusIcon = {
    queued:      <div className="w-4 h-4 rounded-full border-2 border-ink-200 shrink-0" />,
    compressing: <Loader2 size={14} className="text-amber-500 animate-spin shrink-0" />,
    uploading:   <Loader2 size={14} className="text-brand animate-spin shrink-0" />,
    processing:  <Loader2 size={14} className="text-brand animate-spin shrink-0" />,
    ready:       <CheckCircle size={14} className="text-green-500 shrink-0" />,
    error:       <AlertCircle size={14} className="text-red-500 shrink-0" />,
  }[file.status]

  const statusLabel = {
    queued: 'Queued',
    compressing: 'Compressing…',
    uploading: `${file.progress}%`,
    processing: 'Processing…',
    ready: 'Ready',
    error: 'Error',
  }[file.status]

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      {/* Thumbnail or icon */}
      <div className="w-8 h-8 rounded bg-ink-50 overflow-hidden shrink-0">
        {file.previewUrl ? (
          <img src={file.previewUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-200 text-xs">📹</div>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="font-body text-xs text-ink truncate">{file.file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="font-body text-xs text-ink-300">{formatBytes(file.originalBytes)}</p>
          {file.compressedBytes && file.compressedBytes < file.originalBytes && (
            <span className="text-xs text-green-600 font-body">
              → {formatBytes(file.compressedBytes)} ({Math.round((1 - file.compressedBytes / file.originalBytes) * 100)}% saved)
            </span>
          )}
        </div>
        {file.status === 'uploading' && (
          <div className="h-1 bg-ink-100 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${file.progress}%` }} />
          </div>
        )}
        {file.error && <p className="text-red-500 text-xs font-body truncate">{file.error}</p>}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-body ${file.status === 'ready' ? 'text-green-600' : file.status === 'error' ? 'text-red-500' : 'text-ink-400'}`}>
          {statusLabel}
        </span>
        {statusIcon}
        {file.status === 'error' && (
          <button onClick={() => onRetry(file.id)} className="text-brand hover:text-brand/80" title="Retry">
            <RefreshCw size={12} />
          </button>
        )}
        {['queued', 'error'].includes(file.status) && (
          <button onClick={() => file.status === 'queued' ? onRemove(file.id) : onRemove(file.id)} className="text-ink-300 hover:text-ink" title="Remove">
            <X size={12} />
          </button>
        )}
        {['uploading', 'compressing'].includes(file.status) && (
          <button onClick={() => onCancel(file.id)} className="text-ink-300 hover:text-red-500" title="Cancel">
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
