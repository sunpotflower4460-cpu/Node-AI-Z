import type { UiAuditCheck } from './uiAuditTypes'

type Props = {
  check: UiAuditCheck
}

const STATUS_COLOR: Record<string, string> = {
  pass: 'text-green-600',
  warning: 'text-yellow-600',
  fail: 'text-red-600',
}

const STATUS_ICON: Record<string, string> = {
  pass: '✓',
  warning: '⚠',
  fail: '✗',
}

export const AuditCheckItem = ({ check }: Props) => (
  <div className="flex items-start gap-2 py-1 text-sm">
    <span className={`font-bold shrink-0 ${STATUS_COLOR[check.status]}`}>
      {STATUS_ICON[check.status]}
    </span>
    <div className="flex-1 min-w-0">
      <span className="font-medium">{check.label}</span>
      {check.recommendation && (
        <p className="text-xs text-gray-500 mt-0.5">{check.recommendation}</p>
      )}
    </div>
  </div>
)
