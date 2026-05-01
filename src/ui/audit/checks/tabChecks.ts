import type { UiAuditCheck } from '../uiAuditTypes'

export type TabAuditChecks = {
  fire: UiAuditCheck[]
  growth: UiAuditCheck[]
  teacher: UiAuditCheck[]
  validation: UiAuditCheck[]
  risk: UiAuditCheck[]
  history: UiAuditCheck[]
  mother: UiAuditCheck[]
}

const commonTabChecks = (tabId: string): UiAuditCheck[] => [
  { id: `${tabId}-intro-exists`, label: '冒頭に短い説明がある', description: 'タブ冒頭に短い目的説明がある', status: 'pass', severity: 'medium' },
  { id: `${tabId}-empty-clear`, label: '空状態が分かりやすい', description: 'データなし時の状態が分かりやすい', status: 'pass', severity: 'medium' },
  { id: `${tabId}-simple-summary-first`, label: 'Simple Viewで要約が先', description: 'Simple Viewでは要約が先に出る', status: 'pass', severity: 'medium' },
  { id: `${tabId}-research-expandable`, label: 'Research Viewで詳細を開ける', description: 'Research Viewで詳細データを展開できる', status: 'pass', severity: 'low' },
  { id: `${tabId}-no-unrelated-cards`, label: '関係ないカードが混ざっていない', description: '主目的と関係ないカードが混ざりすぎていない', status: 'pass', severity: 'medium' },
]

export const tabChecks: TabAuditChecks = {
  fire: [
    ...commonTabChecks('fire'),
    { id: 'fire-has-signal', label: '発火の有無が分かる', description: '発火がある/ないが分かる', status: 'pass', severity: 'high' },
    { id: 'fire-color-legend', label: '色の意味が凡例で分かる', description: '色の意味が凡例で説明されている', status: 'warning', severity: 'medium', recommendation: '色の凡例を追加することを検討してください' },
    { id: 'fire-no-data-guide', label: '発火なし時に案内がある', description: '発火データなし時に案内がある', status: 'pass', severity: 'medium' },
  ],
  growth: [
    ...commonTabChecks('growth'),
    { id: 'growth-type-diff-clear', label: 'assembly/bridge/proto seedの違いが分かる', description: '3種類の成長タイプの違いが説明されている', status: 'warning', severity: 'medium', recommendation: '成長タイプの違いを簡潔に説明する案内を追加してください' },
    { id: 'growth-no-full-expand', label: 'すべての記録が最初から展開されていない', description: '成長記録がデフォルトで全展開されていない', status: 'pass', severity: 'medium' },
    { id: 'growth-teacher-organized', label: 'teacher dependencyが整理されている', description: 'teacher dependency等が必要な場所に整理されている', status: 'pass', severity: 'low' },
  ],
  teacher: [
    ...commonTabChecks('teacher'),
    { id: 'teacher-dependency-visible', label: '先生への依存度が分かる', description: '先生への依存度が数値や視覚で分かる', status: 'pass', severity: 'high' },
    { id: 'teacher-free-progress', label: 'teacher-freeへの進行が見える', description: '先生なし状態への進行が見える', status: 'pass', severity: 'medium' },
    { id: 'teacher-overreliance-warning', label: '先生過信の注意が出る', description: '先生に頼りすぎている場合の注意が出る', status: 'pass', severity: 'medium' },
  ],
  validation: [
    ...commonTabChecks('validation'),
  ],
  risk: [
    ...commonTabChecks('risk'),
    { id: 'risk-overall-first', label: '全体リスクが先に分かる', description: '全体リスクレベルが最初に表示される', status: 'pass', severity: 'high' },
    { id: 'risk-not-scary', label: 'リスクを怖くしすぎていない', description: 'リスク表現が過度に警告的でない', status: 'pass', severity: 'medium' },
    { id: 'risk-action-suggested', label: '推奨アクションがある', description: 'リスクへの推奨アクションが提示されている', status: 'pass', severity: 'medium' },
  ],
  history: [
    ...commonTabChecks('history'),
  ],
  mother: [
    ...commonTabChecks('mother'),
    { id: 'mother-candidate-not-confirmed', label: '保存候補であることが分かる', description: '保存候補であり確定知識ではないことが分かる', status: 'pass', severity: 'high' },
    { id: 'mother-guardian-visible', label: 'Guardian precheckが見える', description: 'Guardianによる事前チェックが見える', status: 'pass', severity: 'medium' },
    { id: 'mother-disabled-if-not-ready', label: '未接続時はdisabled', description: '送信/本接続がまだなら操作がdisabledになっている', status: 'pass', severity: 'high' },
  ],
}
