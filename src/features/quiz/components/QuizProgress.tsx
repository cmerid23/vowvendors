interface QuizProgressProps {
  current: number
  total: number
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const pct = ((current) / total) * 100

  return (
    <div className="w-full px-4 sm:px-0">
      <div className="flex items-center justify-between mb-2">
        <span className="font-body text-xs text-ink-300 uppercase tracking-widest">
          Question {current + 1} of {total}
        </span>
        <span className="font-body text-xs text-brand font-medium">{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-0.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
