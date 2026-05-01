import type { UiAuditCheck } from '../uiAuditTypes'

export const settingsChecks: UiAuditCheck[] = [
  { id: 'settings-sections-clear', label: '設定セクションが分かれている', description: '基本/脳エンジン/表示/保存/研究/危険操作が分かれている', status: 'pass', severity: 'high' },
  { id: 'settings-mode-engine-separated', label: '画面モードと脳エンジンが混ざっていない', description: '表示モードと脳エンジン設定が別セクションになっている', status: 'pass', severity: 'medium' },
  { id: 'settings-danger-separated', label: '危険操作が分離されている', description: '危険操作が通常設定と視覚的に分離されている', status: 'pass', severity: 'high' },
  { id: 'settings-simple-not-overloaded', label: 'Simple Viewの設定が多すぎない', description: 'Simple Viewで設定項目が多すぎない', status: 'pass', severity: 'medium' },
]
