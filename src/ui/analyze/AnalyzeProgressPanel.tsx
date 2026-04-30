import { PipelineStepIndicator } from './PipelineStepIndicator'

type AnalyzeProgressPanelProps = {
  currentStepIndex?: number
  elapsedMs?: number
  runtimeMode?: string
  researchMode?: boolean
}

export const AnalyzeProgressPanel = ({
  currentStepIndex,
  elapsedMs,
  runtimeMode,
  researchMode = false,
}: AnalyzeProgressPanelProps) => (
  <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
    <p className="mb-3 text-sm font-semibold text-indigo-800">観察中です</p>
    <p className="mb-3 text-xs leading-relaxed text-indigo-700">
      入力が内部パイプラインに入り、発火・結合・状態更新が行われています。
    </p>
    <PipelineStepIndicator
      currentStepIndex={currentStepIndex}
      researchMode={researchMode}
    />
    {researchMode ? (
      <div className="mt-3 flex flex-wrap gap-3 border-t border-indigo-100 pt-3">
        {elapsedMs !== undefined ? (
          <span className="text-[11px] font-mono text-indigo-600">{elapsedMs}ms</span>
        ) : null}
        {runtimeMode ? (
          <span className="text-[11px] font-mono text-indigo-600">mode: {runtimeMode}</span>
        ) : null}
      </div>
    ) : null}
  </div>
)
