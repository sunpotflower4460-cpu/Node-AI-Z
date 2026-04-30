import type { UiDetailMode } from '../mode/modeUiTypes'
import type { SignalScenarioResult } from '../../signalScenario/signalScenarioTypes'
import { ScenarioView } from '../evaluate/ScenarioView'
import { SectionSummaryCard } from '../shared/SectionSummaryCard'
import { DetailAccordion } from '../shared/DetailAccordion'

type EvaluateTabProps = {
  detailMode: UiDetailMode
  scenarioResults?: Map<string, SignalScenarioResult>
  onRunScenario?: (scenarioId: string) => Promise<void>
}

export const EvaluateTab = ({
  detailMode,
  scenarioResults,
  onRunScenario,
}: EvaluateTabProps) => {
  const isResearch = detailMode === 'research'

  return (
    <div className="flex flex-col gap-4">
      <SectionSummaryCard
        title={isResearch ? 'Evaluate' : '検証'}
        description={
          isResearch
            ? 'Run scenarios and ablation tests to verify teacher dependency, recall success, and overbinding risk.'
            : 'Scenario を実行して、teacher 依存・想起成功・過結合リスクの変化を確認します。'
        }
      />

      <ScenarioView
        detailMode={detailMode}
        scenarioResults={scenarioResults}
        onRunScenario={onRunScenario}
      />

      {isResearch ? (
        <DetailAccordion summary="Ablation Config (coming soon)">
          <p className="text-xs text-slate-400">
            Ablation test configuration will be available in a future update.
          </p>
        </DetailAccordion>
      ) : null}
    </div>
  )
}
