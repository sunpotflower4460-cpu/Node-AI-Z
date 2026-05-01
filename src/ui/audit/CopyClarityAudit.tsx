import type { UiAuditCheck } from './uiAuditTypes'
import { AuditCheckItem } from './AuditCheckItem'

export const copyClarityChecks: UiAuditCheck[] = [
  { id: 'copy-japanese-first', label: '日本語ラベルが優先されている', description: 'Simple Viewで日本語ラベルが英語より先に出る', status: 'pass', severity: 'medium' },
  { id: 'copy-no-raw-ids', label: '英語IDが前に出すぎていない', description: '内部IDが画面に露出しすぎていない', status: 'pass', severity: 'medium' },
  { id: 'copy-no-overstatement', label: '過剰表現がない', description: '「意識/自我/本当に理解」などの過剰表現がない', status: 'pass', severity: 'medium' },
  { id: 'copy-risk-not-scary', label: 'Risk表現が過度でない', description: 'Riskが怖くなりすぎていない', status: 'pass', severity: 'medium' },
  { id: 'copy-mother-export-safe', label: 'Mother Exportが確定知識に見えない', description: 'Mother Exportが観察候補として誠実に表現されている', status: 'pass', severity: 'high' },
]

type Props = {
  checks?: UiAuditCheck[]
}

export const CopyClarityAudit = ({ checks = copyClarityChecks }: Props) => (
  <div className="border rounded-lg p-3 mb-2">
    <h3 className="font-semibold text-sm mb-2">コピー分かりやすさチェック</h3>
    {checks.map((c) => (
      <AuditCheckItem key={c.id} check={c} />
    ))}
  </div>
)
