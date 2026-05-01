import type { UiAuditReport } from './uiAuditTypes'

type Props = {
  report: UiAuditReport
}

const STATUS_COLOR: Record<string, string> = {
  pass: 'text-green-600',
  warning: 'text-yellow-600',
  fail: 'text-red-600',
}

const STATUS_LABEL: Record<string, string> = {
  pass: 'Pass',
  warning: 'Warning',
  fail: 'Fail',
}

export const UiAuditSummaryCard = ({ report }: Props) => (
  <div className="border-b pb-3 mb-3">
    <div className="flex items-center gap-3">
      <span className="font-bold text-base">UI Audit</span>
      <span className={`font-semibold text-sm ${STATUS_COLOR[report.overallStatus]}`}>
        {STATUS_LABEL[report.overallStatus]}
      </span>
      <span className="text-sm font-mono text-gray-600">Score: {report.overallScore} / 100</span>
    </div>
    {report.topWarnings.length > 0 && (
      <div className="mt-2">
        <p className="text-xs font-semibold text-yellow-700 mb-1">Top warnings:</p>
        <ul className="space-y-0.5">
          {report.topWarnings.map((w, i) => (
            <li key={i} className="text-xs text-gray-700">• {w}</li>
          ))}
        </ul>
      </div>
    )}
    {report.recommendedNextFixes.length > 0 && (
      <div className="mt-2">
        <p className="text-xs font-semibold text-blue-700 mb-1">Recommended fixes:</p>
        <ul className="space-y-0.5">
          {report.recommendedNextFixes.map((f, i) => (
            <li key={i} className="text-xs text-gray-700">• {f}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
)
