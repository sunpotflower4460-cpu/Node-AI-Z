import type { UiAuditCheck } from './uiAuditTypes'

export const commonChecks: Omit<UiAuditCheck, 'status'>[] = [
  { id: 'purpose-clear', label: '画面の目的が分かる', description: '画面の目的が1〜2行で説明されている', severity: 'high' },
  { id: 'top-info-first', label: '重要情報が上部にある', description: '最初に見るべき情報が上部にある', severity: 'high' },
  { id: 'primary-button-clear', label: '主ボタンが分かる', description: '最初に押すボタンが視覚的に分かる', severity: 'high' },
  { id: 'empty-state-clear', label: '0件状態が分かりやすい', description: 'データがない状態が壊れて見えない', severity: 'medium' },
  { id: 'card-density-ok', label: 'カード密度が適切', description: '大きなカードが多すぎない', severity: 'medium' },
  { id: 'research-not-overexposed', label: 'Research情報が前に出すぎていない', description: 'Simple Viewで詳細情報が出すぎていない', severity: 'medium' },
  { id: 'japanese-labels-first', label: '日本語ラベルが優先されている', description: 'Simple Viewで英語IDより日本語が先に出る', severity: 'low' },
  { id: 'mobile-first-screen-ok', label: 'スマホの初期画面が重くない', description: 'スマホで1画面目が情報過多でない', severity: 'medium' },
  { id: 'tap-target-ok', label: 'タップ領域が適切', description: 'タップ領域が小さすぎない', severity: 'medium' },
  { id: 'danger-ops-separated', label: '危険操作が分離されている', description: '危険操作が通常操作と混ざっていない', severity: 'high' },
]
