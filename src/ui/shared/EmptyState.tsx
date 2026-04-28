type EmptyStateProps = {
  title: string
  description: string
}

export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-10 text-center">
    <p className="text-sm font-semibold text-slate-600">{title}</p>
    <p className="mt-2 text-xs leading-relaxed text-slate-400">{description}</p>
  </div>
)
