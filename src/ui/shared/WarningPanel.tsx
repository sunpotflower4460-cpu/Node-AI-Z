import { AlertTriangle } from 'lucide-react'

type WarningPanelProps = {
  warnings: string[]
  emptyMessage?: string
}

export const WarningPanel = ({ warnings, emptyMessage = '警告はありません。' }: WarningPanelProps) => {
  if (warnings.length === 0) {
    return (
      <p className="text-xs font-medium text-slate-400">{emptyMessage}</p>
    )
  }

  return (
    <ul className="space-y-2">
      {warnings.map((warning) => (
        <li
          key={warning}
          className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <span className="leading-relaxed">{warning}</span>
        </li>
      ))}
    </ul>
  )
}
