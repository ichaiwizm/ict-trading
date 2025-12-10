export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
              <div className="h-3 w-24 animate-pulse rounded bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="p-4 md:p-6">
        <div className="mx-auto max-w-[2000px] space-y-4">
          {/* Chart and Side Panels */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Chart Skeleton */}
            <div className="lg:col-span-2">
              <div className="relative h-[500px] lg:h-[600px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-zinc-800" />
                    <p className="mt-4 font-mono text-sm text-zinc-500">
                      Loading ICT Analysis...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Panels Skeleton */}
            <div className="space-y-4">
              <div className="h-40 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />
              <div className="h-40 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />
              <div className="h-40 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />
            </div>
          </div>

          {/* Bottom Panels Skeleton */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
