type Props = {
  avgTeacherDependency: number
  teacherFreeCount: number
  notes: string[]
}

export const TeacherDependencySummaryCard = ({ avgTeacherDependency, teacherFreeCount, notes }: Props) => {
  const depPct = Math.round(avgTeacherDependency * 100)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">先生依存サマリー</p>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-[11px] text-slate-500">
            <span>平均先生依存度</span>
            <span>{depPct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-violet-400 transition-all"
              style={{ width: `${depPct}%` }}
            />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">{teacherFreeCount}</p>
          <p className="text-[10px] text-slate-400">自立済</p>
        </div>
      </div>
      {notes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {notes.map(n => (
            <span key={n} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{n}</span>
          ))}
        </div>
      )}
    </div>
  )
}
