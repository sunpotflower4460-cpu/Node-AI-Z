/**
 * SectionPriorityHeader — shows a short title and one-line description at the top of each tab.
 * Replaces long explanatory SectionSummaryCards for mobile-first clarity.
 *
 * Example:
 *   <SectionPriorityHeader title="発火" description="入力に反応した点群を見ます。" />
 */
type SectionPriorityHeaderProps = {
  title: string
  description: string
}

export const SectionPriorityHeader = ({ title, description }: SectionPriorityHeaderProps) => (
  <div className="flex flex-col gap-0.5 py-1">
    <h2 className="text-base font-bold text-slate-800">{title}</h2>
    <p className="text-sm text-slate-500 leading-snug">{description}</p>
  </div>
)
