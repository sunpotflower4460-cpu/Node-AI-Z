import { DiffBadge } from '../shared/DiffBadge'
import type { ScenarioSummaryViewModel } from './buildScenarioViewModel'

type ScenarioResultSummaryProps = {
  summary: ScenarioSummaryViewModel
}

export const ScenarioResultSummary = ({ summary }: ScenarioResultSummaryProps) => (
  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <h3 className="text-sm font-bold text-indigo-800">{summary.scenarioName}</h3>
      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
        {summary.durationMs}ms
      </span>
    </div>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <div className="flex items-center justify-between gap-2 rounded-xl border border-white bg-white px-3 py-2 shadow-sm">
        <span className="text-xs font-medium text-slate-600">Assemblies</span>
        <DiffBadge value={summary.assemblyGrowth} goodDirection="up" />
      </div>
      <div className="flex items-center justify-between gap-2 rounded-xl border border-white bg-white px-3 py-2 shadow-sm">
        <span className="text-xs font-medium text-slate-600">Bridges</span>
        <DiffBadge value={summary.bridgeGrowth} goodDirection="up" />
      </div>
      <div className="flex items-center justify-between gap-2 rounded-xl border border-white bg-white px-3 py-2 shadow-sm">
        <span className="text-xs font-medium text-slate-600">Teacher Dependency</span>
        <DiffBadge value={summary.teacherDependencyDelta} goodDirection="down" />
      </div>
      <div className="flex items-center justify-between gap-2 rounded-xl border border-white bg-white px-3 py-2 shadow-sm">
        <span className="text-xs font-medium text-slate-600">Recall Success</span>
        <DiffBadge value={summary.recallSuccessDelta} goodDirection="up" />
      </div>
      <div className="flex items-center justify-between gap-2 rounded-xl border border-white bg-white px-3 py-2 shadow-sm">
        <span className="text-xs font-medium text-slate-600">Overbinding Risk</span>
        <DiffBadge value={summary.overbindingRiskDelta} goodDirection="down" />
      </div>
      <div className="flex items-center justify-between gap-2 rounded-xl border border-white bg-white px-3 py-2 shadow-sm">
        <span className="text-xs font-medium text-slate-600">Promotion Readiness</span>
        <DiffBadge value={summary.promotionReadinessDelta} goodDirection="up" />
      </div>
    </div>
    {summary.notes.length > 0 ? (
      <ul className="mt-3 space-y-1">
        {summary.notes.map((note) => (
          <li key={note} className="text-xs font-medium leading-relaxed text-indigo-700">· {note}</li>
        ))}
      </ul>
    ) : null}
  </div>
)
