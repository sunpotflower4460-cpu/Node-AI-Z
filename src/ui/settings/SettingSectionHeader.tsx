import type { ReactNode } from 'react'

type SettingSectionHeaderProps = {
  title: string
  description?: string
  badge?: ReactNode
}

export const SettingSectionHeader = ({ title, description, badge }: SettingSectionHeaderProps) => (
  <div className="flex flex-col gap-1">
    <div className="flex flex-wrap items-center gap-2">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</h3>
      {badge}
    </div>
    {description ? (
      <p className="text-[11px] leading-relaxed text-slate-500">{description}</p>
    ) : null}
  </div>
)
