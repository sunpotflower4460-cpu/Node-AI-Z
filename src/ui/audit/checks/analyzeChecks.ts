import type { UiAuditCheck } from '../uiAuditTypes'

export const analyzeChecks: UiAuditCheck[] = [
  { id: 'analyze-states-clear', label: '実行状態が分かれている', description: '入力前/実行中/完了/エラー状態が視覚的に区別できる', status: 'pass', severity: 'high' },
  { id: 'analyze-step-compact', label: '実行中ステップが短く表示される', description: '実行中ステップが冗長でなく簡潔に表示される', status: 'pass', severity: 'medium' },
  { id: 'analyze-result-summary', label: 'Analyze後に結果要約が出る', description: '分析完了後に要約が表示される', status: 'pass', severity: 'high' },
  { id: 'analyze-next-tab-guide', label: '次タブへの導線がある', description: '分析後に次に見るタブへの案内がある', status: 'pass', severity: 'medium' },
  { id: 'analyze-zero-result-ok', label: '0結果でも説明がある', description: 'データなし時にbaselineとして説明される', status: 'pass', severity: 'medium' },
]
