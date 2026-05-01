import { useState } from 'react'
import type { ScreenAuditResult } from './uiAuditTypes'
import { AuditCheckItem } from './AuditCheckItem'

type Props = {
  result: ScreenAuditResult
}

const STATUS_BADGE: Record<string, string> = {
  pass: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  fail: 'bg-red-100 text-red-700',
}

const STATUS_LABEL: Record<string, string> = {
  pass: 'Pass',
  warning: 'Warning',
  fail: 'Fail',
}

export const ScreenAuditCard = ({ result }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="border rounded-lg p-3 mb-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="font-semibold text-sm">{result.screenLabel}</span>
          <p className="text-xs text-gray-500 mt-0.5">{result.summary}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono">{result.score}/100</span>
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_BADGE[result.status]}`}>
            {STATUS_LABEL[result.status]}
          </span>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-xs text-blue-500 underline"
            aria-expanded={open}
          >
            {open ? '閉じる' : '詳細'}
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-2 border-t pt-2">
          {result.checks.map((c) => (
            <AuditCheckItem key={c.id} check={c} />
          ))}
        </div>
      )}
    </div>
  )
}
