import { useMemo } from 'react'
import { runUiAudit } from './runUiAudit'
import { UiAuditSummaryCard } from './UiAuditSummaryCard'
import { ScreenAuditCard } from './ScreenAuditCard'

export const UiAuditPanel = () => {
  const report = useMemo(() => runUiAudit(), [])

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-3">UI Clarity Audit</h2>
      <UiAuditSummaryCard report={report} />
      <div>
        {report.screenResults.map((r) => (
          <ScreenAuditCard key={r.screenId} result={r} />
        ))}
      </div>
    </div>
  )
}
