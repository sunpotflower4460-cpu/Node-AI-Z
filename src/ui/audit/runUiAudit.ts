import type { UiAuditReport } from './uiAuditTypes'
import { buildScreenAuditResult } from './buildScreenAuditResult'
import { buildUiAuditReport } from './buildUiAuditReport'
import { homeChecks } from './checks/homeChecks'
import { analyzeChecks } from './checks/analyzeChecks'
import { observeChecks } from './checks/observeChecks'
import { experienceChecks } from './checks/experienceChecks'
import { tabChecks } from './checks/tabChecks'
import { settingsChecks } from './checks/settingsChecks'
import { onboardingChecks } from './checks/onboardingChecks'

export const runUiAudit = (): UiAuditReport => {
  const screenResults = [
    buildScreenAuditResult('home', 'Home / 概要', homeChecks, '現在地・入力・要約が上部にあり、初見でも流れが分かります。'),
    buildScreenAuditResult('analyze', 'Analyze Flow', analyzeChecks, '実行状態が分かれており、完了後に結果要約と次タブへの導線があります。'),
    buildScreenAuditResult('observe', '観察モード', observeChecks, '裏側を見る場所として説明されており、タブ間を自然に移動できます。'),
    buildScreenAuditResult('experience', '体験モード', experienceChecks, '入力欄と返答が主役になっており、裏側を見る導線があります。'),
    buildScreenAuditResult('fire', '発火タブ', tabChecks.fire, '発火の有無が分かり、データなし時に案内があります。'),
    buildScreenAuditResult('growth', '成長タブ', tabChecks.growth, '成長タイプの説明と折りたたみ表示が整備されています。'),
    buildScreenAuditResult('teacher', '先生タブ', tabChecks.teacher, '依存度と進行状況が可視化されています。'),
    buildScreenAuditResult('validation', '検証タブ', tabChecks.validation, '検証データへのアクセスが整理されています。'),
    buildScreenAuditResult('risk', 'リスクタブ', tabChecks.risk, '全体リスクが先に表示され、推奨アクションがあります。'),
    buildScreenAuditResult('history', '履歴タブ', tabChecks.history, '履歴データがコンパクトに表示されます。'),
    buildScreenAuditResult('mother', 'Motherタブ', tabChecks.mother, '保存候補として誠実に表現されており、未接続時は操作が無効化されています。'),
    buildScreenAuditResult('settings', '設定', settingsChecks, 'セクションが分かれており、危険操作が分離されています。'),
    buildScreenAuditResult('onboarding', 'オンボーディング', onboardingChecks, 'Node-AI-Zの目的・モードの違い・最初の操作が案内されています。'),
  ]

  return buildUiAuditReport(screenResults)
}
