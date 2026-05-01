import type { UiAuditCheck } from './uiAuditTypes'
import { AuditCheckItem } from './AuditCheckItem'

export const emptyStateChecks: UiAuditCheck[] = [
  { id: 'empty-title-exists', label: '空状態タイトルがある', description: '空状態に説明タイトルがある', status: 'pass', severity: 'high' },
  { id: 'empty-reason-clear', label: 'なぜ空なのか分かる', description: 'なぜデータがないかが分かる', status: 'pass', severity: 'medium' },
  { id: 'empty-next-action-clear', label: '次のアクションが分かる', description: '空状態から次に何をするかが分かる', status: 'pass', severity: 'high' },
  { id: 'empty-no-zero-flood', label: '0カードが大量に並んでいない', description: '0値カードが画面を埋め尽くしていない', status: 'warning', severity: 'medium', recommendation: '0値カードをグループ化するか折りたたみ表示にしてください' },
]

type Props = {
  checks?: UiAuditCheck[]
}

export const EmptyStateAudit = ({ checks = emptyStateChecks }: Props) => (
  <div className="border rounded-lg p-3 mb-2">
    <h3 className="font-semibold text-sm mb-2">空状態チェック</h3>
    {checks.map((c) => (
      <AuditCheckItem key={c.id} check={c} />
    ))}
  </div>
)
