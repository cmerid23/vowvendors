export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-charcoal-50">
      <div className="wp-skeleton aspect-[3/4] w-full" />
      <div className="p-3 space-y-2">
        <div className="wp-skeleton h-4 w-3/4 rounded" />
        <div className="wp-skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  )
}
