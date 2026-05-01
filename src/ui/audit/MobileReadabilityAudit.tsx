import type { UiAuditCheck } from './uiAuditTypes'
import { AuditCheckItem } from './AuditCheckItem'

export const mobileReadabilityChecks: UiAuditCheck[] = [
  { id: 'mobile-first-screen-fits', label: '初期画面に主情報が収まる', description: 'スマホ1画面に主情報が収まる', status: 'pass', severity: 'high' },
  { id: 'mobile-button-height-ok', label: 'ボタン高さが適切', description: 'ボタン高さが小さすぎない（最低44px）', status: 'pass', severity: 'medium' },
  { id: 'mobile-tabs-tappable', label: 'タブが押しやすい', description: 'タブのタップ領域が十分', status: 'pass', severity: 'medium' },
  { id: 'mobile-no-sticky-overlap', label: 'sticky要素が重なっていない', description: 'sticky要素が互いに重ならない', status: 'pass', severity: 'medium' },
  { id: 'mobile-font-readable', label: '文字が読める', description: '文字サイズが小さすぎない', status: 'pass', severity: 'high' },
  { id: 'mobile-hscroll-noted', label: '横スクロール箇所が分かる', description: '横スクロールが必要な場所が分かる', status: 'warning', severity: 'low', recommendation: '横スクロールが必要な場所には視覚的な手がかりを追加してください' },
]

type Props = {
  checks?: UiAuditCheck[]
}

export const MobileReadabilityAudit = ({ checks = mobileReadabilityChecks }: Props) => (
  <div className="border rounded-lg p-3 mb-2">
    <h3 className="font-semibold text-sm mb-2">モバイル表示チェック</h3>
    {checks.map((c) => (
      <AuditCheckItem key={c.id} check={c} />
    ))}
  </div>
)
