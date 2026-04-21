import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Zap } from 'lucide-react'
import { useStorageStore } from '../../store/useStorageStore'
import { Button } from '../ui/Button'

const STANDARD_FEATURES = [
  'Unlimited storage',
  'Unlimited downloads',
  'Google Drive auto-sync',
  'Dropbox auto-sync',
  'Instagram export',
  'Priority support',
]

const FREE_FEATURES = [
  '5 GB storage',
  '50 downloads / month',
  'View unlimited photos',
]

export function StorageUpgradeModal() {
  const { showUpgradeModal, setShowUpgradeModal, quota } = useStorageStore()
  const isDownloadLimit = quota && !quota.canDownload && quota.downloadsThisMonth >= (quota.downloadLimitMonthly || 50)

  return (
    <AnimatePresence>
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between">
              <div>
                <p className="text-2xl mb-1">💛</p>
                <h2 className="font-display text-xl font-semibold text-ink">
                  {isDownloadLimit ? "You've loved your gallery" : 'Storage limit reached'}
                </h2>
                <p className="font-body text-sm text-ink-400 mt-1">
                  {isDownloadLimit
                    ? `You've downloaded ${quota?.downloadsThisMonth || 50} photos this month. Upgrade to keep downloading.`
                    : 'Upgrade to continue uploading and downloading your memories.'}
                </p>
              </div>
              <button onClick={() => setShowUpgradeModal(false)} className="text-ink-300 hover:text-ink ml-3 shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Plan comparison */}
            <div className="px-6 pb-6 grid grid-cols-2 gap-3">
              {/* Free */}
              <div className="border border-border rounded-xl p-4">
                <p className="font-body text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">Free</p>
                <p className="font-display text-2xl font-semibold text-ink mb-3">$0</p>
                <ul className="space-y-1.5">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs font-body text-ink-400">
                      <Check size={11} className="mt-0.5 shrink-0 text-ink-300" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Standard */}
              <div className="border-2 border-brand rounded-xl p-4 relative">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-body font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                  Recommended
                </span>
                <p className="font-body text-xs font-semibold text-brand uppercase tracking-wider mb-3">Unlimited</p>
                <p className="font-display text-2xl font-semibold text-ink mb-3">
                  $5<span className="text-sm text-ink-400 font-body font-normal">/mo</span>
                </p>
                <ul className="space-y-1.5">
                  {STANDARD_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs font-body text-ink">
                      <Check size={11} className="mt-0.5 shrink-0 text-brand" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-6 space-y-2">
              <Button className="w-full justify-center gap-2">
                <Zap size={14} /> Upgrade for $5/month
              </Button>
              <p className="text-center font-body text-xs text-ink-300">No contracts. Cancel any time.</p>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full text-center font-body text-sm text-ink-400 hover:text-ink transition-colors py-1"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
