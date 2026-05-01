import type { ReactNode } from 'react'
import type { DetailMode } from './types/settingsUiTypes'

export type SettingRowProps = {
  label: string
  description?: string
  value?: string
  badge?: string
  internalName?: string
  detailMode?: DetailMode
  children?: ReactNode
}

export const SettingRow = ({
  label,
  description,
  value,
  badge,
  internalName,
  detailMode,
  children,
}: SettingRowProps) => (
  <div className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5">
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">{label}</span>
          {badge ? (
            <span className="rounded-full border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
              {badge}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="text-[11px] leading-relaxed text-slate-500">{description}</p>
        ) : null}
        {detailMode === 'research' && internalName ? (
          <p className="font-mono text-[10px] text-slate-600">{internalName}</p>
        ) : null}
      </div>
      {value ? (
        <span className="shrink-0 text-xs font-bold text-cyan-300">{value}</span>
      ) : null}
    </div>
    {children ? <div className="mt-1">{children}</div> : null}
  </div>
)
