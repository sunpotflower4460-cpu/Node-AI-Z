import { Play, RefreshCw } from 'lucide-react'
import type { ScenarioRunnerViewModel } from './buildScenarioViewModel'

type RunState = 'idle' | 'running'

type ScenarioRunnerPanelProps = {
  viewModel: ScenarioRunnerViewModel
  runState: RunState
  onRun: (scenarioId: string) => void
}

const formatTimestamp = (ts: number): string => {
  return new Date(ts).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const ScenarioRunnerPanel = ({ viewModel, runState, onRun }: ScenarioRunnerPanelProps) => {
  const isRunning = runState === 'running'

  const buttonLabel = isRunning
    ? 'Running...'
    : viewModel.lastRunAt !== null
      ? 'Re-run'
      : 'Run Scenario'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-900">{viewModel.scenarioName}</h4>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{viewModel.scenarioDescription}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-semibold text-slate-400">
            <span>{viewModel.stepCount} steps</span>
            {viewModel.lastRunAt !== null ? (
              <span>Last run: {formatTimestamp(viewModel.lastRunAt)}</span>
            ) : (
              <span>未実行</span>
            )}
          </div>
        </div>
        <button
          type="button"
          disabled={isRunning}
          onClick={() => onRun(viewModel.scenarioId)}
          className="flex items-center gap-2 self-start rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
        >
          {isRunning
            ? <RefreshCw className="h-4 w-4 animate-spin" />
            : <Play className="h-4 w-4" />}
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}
