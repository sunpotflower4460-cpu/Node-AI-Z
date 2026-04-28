export const LoadingFieldSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse" aria-busy="true" aria-label="Loading Signal Field">
    <div className="h-4 w-40 rounded-full bg-slate-800" />
    <div className="h-64 w-full rounded-2xl border border-slate-800 bg-slate-950/80" />
    <div className="flex gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 flex-1 rounded-2xl bg-slate-800/60" />
      ))}
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="h-24 rounded-2xl bg-slate-800/60" />
      <div className="h-24 rounded-2xl bg-slate-800/60" />
    </div>
  </div>
)
