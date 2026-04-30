type SectionSummaryCardProps = {
  title: string
  description: string
}

export const SectionSummaryCard = ({ title, description }: SectionSummaryCardProps) => (
  <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
    <p className="text-xs font-bold text-indigo-800">{title}</p>
    <p className="mt-1 text-xs leading-relaxed text-indigo-700/80">{description}</p>
  </div>
)
