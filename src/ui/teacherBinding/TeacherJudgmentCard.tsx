import type { TeacherJudgment } from '../../signalTeacher/signalTeacherTypes'

type Props = {
  judgment: TeacherJudgment
}

const JUDGMENT_COLORS: Record<string, string> = {
  same_object: 'bg-emerald-100 text-emerald-800',
  same_category: 'bg-sky-100 text-sky-800',
  similar_but_different: 'bg-amber-100 text-amber-800',
  different: 'bg-red-100 text-red-800',
  uncertain: 'bg-slate-100 text-slate-600',
}

const TEACHER_TYPE_LABELS: Record<string, string> = {
  mock: 'モック先生',
  llm_stub: 'LLMスタブ',
  human: '人間先生',
}

export const TeacherJudgmentCard = ({ judgment }: Props) => {
  const judgmentCls = JUDGMENT_COLORS[judgment.judgment] ?? 'bg-slate-100 text-slate-600'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${judgmentCls}`}>{judgment.judgment}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{TEACHER_TYPE_LABELS[judgment.teacherType] ?? judgment.teacherType}</span>
        <span className="ml-auto text-xs text-slate-400">確信度: {judgment.confidence.toFixed(2)}</span>
      </div>
      <p className="text-xs text-slate-600">{judgment.explanation}</p>
    </div>
  )
}
