import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import type { SignalScenario, SignalScenarioResult } from '../../signalScenario/signalScenarioTypes'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { buildScenarioViewModel, buildScenarioRunnerViewModel } from './buildScenarioViewModel'
import { ScenarioRunnerPanel } from './ScenarioRunnerPanel'
import { ScenarioResultSummary } from './ScenarioResultSummary'
import { ScenarioStepList } from './ScenarioStepList'
import { ScenarioMetricCards } from './ScenarioMetricCards'
import { EmptyState } from '../shared/EmptyState'
import { SectionHeader } from '../shared/SectionHeader'

const DEFAULT_SCENARIOS: SignalScenario[] = [
  { id: 'same_object_learning', name: 'Same Object Learning', description: '同じオブジェクトへの繰り返し刺激で assembly がどう育つか検証する。', steps: [] },
  { id: 'similar_but_different', name: 'Similar But Different', description: '似ているが異なる刺激を流した時の bridge 分化を検証する。', steps: [] },
  { id: 'teacher_to_teacher_free', name: 'Teacher to Teacher-Free', description: 'teacher 補助を段階的に外した時の recall 成功率を検証する。', steps: [] },
  { id: 'overbinding_stress', name: 'Overbinding Stress Test', description: '高負荷な刺激でオーバーバインディングが発生するか検証する。', steps: [] },
  { id: 'rest_consolidation', name: 'Rest Consolidation', description: '休止期間中の consolidation 効果を検証する。', steps: [] },
]

type ScenarioViewProps = {
  detailMode: UiDetailMode
  scenarioResults?: Map<string, SignalScenarioResult>
  onRunScenario?: (scenarioId: string) => Promise<void>
}

export const ScenarioView = ({
  detailMode,
  scenarioResults = new Map(),
  onRunScenario,
}: ScenarioViewProps) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(DEFAULT_SCENARIOS[0]?.id ?? '')
  const [runningId, setRunningId] = useState<string | null>(null)

  const selectedScenario = DEFAULT_SCENARIOS.find((s) => s.id === selectedScenarioId) ?? DEFAULT_SCENARIOS[0]

  const handleRun = async (scenarioId: string) => {
    if (!onRunScenario) return
    setRunningId(scenarioId)
    try {
      await onRunScenario(scenarioId)
    } finally {
      setRunningId(null)
    }
  }

  if (!selectedScenario) return null

  const result = scenarioResults.get(selectedScenario.id) ?? null
  const runnerVm = buildScenarioRunnerViewModel(
    selectedScenario,
    result ? result.endedAt : null,
  )
  const summaryVm = result ? buildScenarioViewModel(selectedScenario, result) : null

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Evaluate — Scenario View"
        description="Signal Mode を育成・検証するためのシナリオ実行画面です。"
        badge={
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
            New Signal Mode
          </span>
        }
      />

      {/* Scenario selector */}
      <div className="flex flex-wrap gap-2">
        {DEFAULT_SCENARIOS.map((scenario) => {
          const hasResult = scenarioResults.has(scenario.id)
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => setSelectedScenarioId(scenario.id)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                selectedScenarioId === scenario.id
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              {hasResult ? <FlaskConical className="h-3.5 w-3.5 text-emerald-500" /> : <FlaskConical className="h-3.5 w-3.5 text-slate-300" />}
              {scenario.name}
            </button>
          )
        })}
      </div>

      {/* Runner panel */}
      <ScenarioRunnerPanel
        viewModel={runnerVm}
        runState={runningId === selectedScenario.id ? 'running' : 'idle'}
        onRun={handleRun}
      />

      {/* Result */}
      {summaryVm ? (
        <>
          <ScenarioResultSummary summary={summaryVm} />

          {detailMode === 'research' ? (
            <>
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Metric Cards</p>
                <ScenarioMetricCards metrics={summaryVm.metrics} />
              </div>
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Step Details</p>
                <ScenarioStepList steps={summaryVm.steps} />
              </div>
            </>
          ) : (
            summaryVm.steps.length > 0 ? (
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Steps</p>
                <ScenarioStepList steps={summaryVm.steps} />
              </div>
            ) : null
          )}
        </>
      ) : (
        <EmptyState
          title="まだ scenario 実行結果はありません。"
          description="Run Scenario を押すと、Signal Mode の育ち方を検証できます。"
        />
      )}
    </div>
  )
}
