import type { SameObjectBindingCandidate } from '../../signalTeacher/signalTeacherTypes'

type HumanChoice = 'same' | 'similar_but_different' | 'different' | 'hold'

type Props = {
  candidate: SameObjectBindingCandidate
  onJudge?: (choice: HumanChoice) => void
}

const STATUS_COLORS: Record<string, string> = {
  candidate: 'bg-slate-100 text-slate-600',
  teacher_confirmed: 'bg-emerald-100 text-emerald-700',
  teacher_rejected: 'bg-red-100 text-red-700',
  uncertain: 'bg-amber-100 text-amber-700',
  recalled_once: 'bg-sky-100 text-sky-700',
  teacher_light: 'bg-violet-100 text-violet-700',
  teacher_free: 'bg-green-100 text-green-800',
  archived: 'bg-slate-100 text-slate-400',
}

const JUDGE_BUTTONS: Array<{ choice: HumanChoice; label: string; cls: string }> = [
  { choice: 'same', label: '同じ', cls: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
  { choice: 'similar_but_different', label: '似ているが違う', cls: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' },
  { choice: 'different', label: '違う', cls: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' },
  { choice: 'hold', label: '保留', cls: 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200' },
]

export const BindingCandidateCard = ({ candidate, onJudge }: Props) => {
  const { score, teacher, recall, risk, status, modalities } = candidate
  const recallRatio = recall.recallAttemptCount > 0
    ? `${recall.recallSuccessCount}/${recall.recallAttemptCount}`
    : '—'
  const statusCls = STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-600'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {modalities.map(m => (
            <span key={m} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-500">{m}</span>
          ))}
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusCls}`}>{status}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
        <span>総合スコア: <strong>{score.overallBindingScore.toFixed(2)}</strong></span>
        <span>先生確信度: <strong>{score.teacherConfidence !== undefined ? score.teacherConfidence.toFixed(2) : '—'}</strong></span>
        <span>先生依存度: <strong>{teacher.teacherDependencyScore.toFixed(2)}</strong></span>
        <span>誤結合リスク: <strong>{risk.falseBindingRisk.toFixed(2)}</strong></span>
        <span>想起成功率: <strong>{recallRatio}</strong></span>
      </div>
      {onJudge && (
        <div className="flex flex-wrap gap-2 pt-1">
          {JUDGE_BUTTONS.map(({ choice, label, cls }) => (
            <button
              key={choice}
              type="button"
              onClick={() => onJudge(choice)}
              className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${cls}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
