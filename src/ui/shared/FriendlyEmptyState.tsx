type FriendlyEmptyStateProps = {
  title: string
  description: string
  nextAction?: string
  hint?: string
}

export const FriendlyEmptyState = ({
  title,
  description,
  nextAction,
  hint,
}: FriendlyEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center">
    <p className="text-sm font-semibold text-slate-600">{title}</p>
    <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-400">{description}</p>
    {nextAction ? (
      <p className="mt-3 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
        {nextAction}
      </p>
    ) : null}
    {hint ? (
      <p className="mt-2 text-[11px] leading-relaxed text-slate-300">{hint}</p>
    ) : null}
  </div>
)
