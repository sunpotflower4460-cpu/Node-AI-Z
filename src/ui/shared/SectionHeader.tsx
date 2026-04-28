import type { ReactNode } from 'react'

type SectionHeaderProps = {
  title: string
  description?: string
  badge?: ReactNode
}

export const SectionHeader = ({ title, description, badge }: SectionHeaderProps) => (
  <div className="flex flex-col gap-1">
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {badge}
    </div>
    {description ? (
      <p className="text-xs font-medium leading-relaxed text-slate-500">{description}</p>
    ) : null}
  </div>
)
