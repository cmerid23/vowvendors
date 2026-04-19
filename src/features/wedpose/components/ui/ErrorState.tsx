import { useNavigate } from 'react-router-dom'

interface ErrorStateProps {
  message: string
  showSettingsLink?: boolean
}

export function ErrorState({ message, showSettingsLink = true }: ErrorStateProps) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="text-4xl mb-4">📷</div>
      <p className="text-cream-300 font-body text-sm max-w-xs">{message}</p>
      {showSettingsLink && (
        <button
          onClick={() => navigate('/vendor/wedpose/settings')}
          className="mt-4 wp-btn-gold"
        >
          Open Settings
        </button>
      )}
    </div>
  )
}
