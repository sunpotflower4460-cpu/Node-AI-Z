import type { UiAuditCheck } from '../uiAuditTypes'

export const observeChecks: UiAuditCheck[] = [
  { id: 'observe-role-explained', label: '観察モードの役割が説明されている', description: '「裏側を見る場所」として観察モードが説明されている', status: 'pass', severity: 'high' },
  { id: 'observe-tab-navigation', label: 'タブ間を自然に移動できる', description: '発火/成長/リスクなどへタブで自然に移動できる', status: 'pass', severity: 'medium' },
  { id: 'observe-research-detail', label: 'Research Viewで詳細を見られる', description: 'Research Viewで詳細データにアクセスできる', status: 'pass', severity: 'medium' },
  { id: 'observe-no-raw-id', label: 'Simple ViewでID露出が少ない', description: 'Simple Viewでraw IDが表に出すぎていない', status: 'warning', severity: 'low', recommendation: 'Simple ViewではIDより日本語ラベルを優先してください' },
]
