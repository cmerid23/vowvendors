import { AlertTriangle, Info, CheckCircle } from 'lucide-react'
import type { BudgetAlert } from '../lib/calculator'

interface BudgetAlertsProps {
  alerts: BudgetAlert[]
}

const ALERT_STYLES = {
  warning: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    Icon: AlertTriangle,
    iconColor: 'text-red-500',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    Icon: Info,
    iconColor: 'text-blue-500',
  },
  success: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    Icon: CheckCircle,
    iconColor: 'text-green-500',
  },
}

export function BudgetAlerts({ alerts }: BudgetAlertsProps) {
  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const { bg, text, Icon, iconColor } = ALERT_STYLES[alert.type]
        return (
          <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${bg}`}>
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
            <p className={`text-sm ${text}`}>{alert.message}</p>
          </div>
        )
      })}
    </div>
  )
}
