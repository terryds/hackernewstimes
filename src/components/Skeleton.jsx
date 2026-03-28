export function HeroSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-10 w-full rounded" />
      <div className="skeleton h-10 w-4/5 rounded" />
      <div className="skeleton h-4 w-48 rounded mt-2" />
      <div className="skeleton h-4 w-full rounded mt-4" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
    </div>
  )
}

export function SecondarySkeleton() {
  return (
    <div className="space-y-2">
      <div className="skeleton h-6 w-full rounded" />
      <div className="skeleton h-6 w-3/4 rounded" />
      <div className="skeleton h-3 w-32 rounded mt-1" />
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="flex gap-3">
      <div className="skeleton h-8 w-8 rounded shrink-0" />
      <div className="space-y-1 flex-1">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
    </div>
  )
}

export function HeadlineSkeleton() {
  return (
    <div className="flex gap-3 py-3">
      <div className="skeleton h-3 w-10 rounded shrink-0 mt-1" />
      <div className="space-y-1 flex-1">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>
    </div>
  )
}
