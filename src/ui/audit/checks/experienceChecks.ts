import type { UiAuditCheck } from '../uiAuditTypes'

export const experienceChecks: UiAuditCheck[] = [
  { id: 'exp-role-explained', label: '体験モードの役割が説明されている', description: '「自然に話す場所」として体験モードが説明されている', status: 'pass', severity: 'high' },
  { id: 'exp-input-prominent', label: '入力欄と返答が主役', description: '入力欄と返答が画面の主役になっている', status: 'pass', severity: 'high' },
  { id: 'exp-no-impl-details', label: '実装詳細が前に出すぎていない', description: '実装方式やSurface Providerが前に出すぎていない', status: 'pass', severity: 'medium' },
  { id: 'exp-observe-link', label: '裏側を見る導線がある', description: '返答後に観察モードへのリンクがある', status: 'pass', severity: 'medium' },
  { id: 'exp-not-llm-mode', label: 'LLMモードと誤解されない', description: '体験モードがLLM Modeと混同されない説明がある', status: 'pass', severity: 'medium' },
]
