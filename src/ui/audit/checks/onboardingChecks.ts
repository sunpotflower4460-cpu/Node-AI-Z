import type { UiAuditCheck } from '../uiAuditTypes'

export const onboardingChecks: UiAuditCheck[] = [
  { id: 'onboard-what-is', label: 'Node-AI-Zが何か分かる', description: 'Node-AI-Zの目的が説明されている', status: 'pass', severity: 'high' },
  { id: 'onboard-mode-diff-clear', label: '観察/体験の違いが分かる', description: '観察モードと体験モードの違いが説明されている', status: 'pass', severity: 'high' },
  { id: 'onboard-signal-mode-explained', label: '新しい信号モードの意味が分かる', description: '新しい信号モードとは何かが説明されている', status: 'pass', severity: 'medium' },
  { id: 'onboard-first-analyze', label: '最初にAnalyzeする導線がある', description: '最初にAnalyzeすることへの案内がある', status: 'pass', severity: 'high' },
  { id: 'onboard-next-tab-clear', label: '次に見るタブが分かる', description: '分析後に次に見るタブが案内されている', status: 'pass', severity: 'medium' },
]
