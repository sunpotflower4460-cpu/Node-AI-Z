import type { UiAuditCheck } from '../uiAuditTypes'

export const homeChecks: UiAuditCheck[] = [
  { id: 'home-status-bar', label: 'CurrentStatusBarが見える', description: '現在のエンジン・ステージ・リスクが上部に表示されている', status: 'pass', severity: 'high' },
  { id: 'home-action-card', label: 'AnalyzeFlowCard/FirstActionCardが上部にある', description: '次のアクションカードが画面上部に配置されている', status: 'pass', severity: 'high' },
  { id: 'home-summary-card', label: 'CurrentSummaryCardがある', description: '現在状態を1枚で把握できるカードがある', status: 'pass', severity: 'high' },
  { id: 'home-no-zero-flood', label: '0件カードが大量に並んでいない', description: '空状態のメトリクスカードが多すぎない', status: 'warning', severity: 'medium', recommendation: '0値メトリクスカードを折りたたみ表示にすることを検討してください' },
  { id: 'home-next-action-clear', label: '次のアクションが分かる', description: '次に何をすればいいかが画面から分かる', status: 'pass', severity: 'high' },
]
