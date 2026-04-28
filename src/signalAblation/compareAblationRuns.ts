import type { SignalScenarioResult } from '../signalScenario/signalScenarioTypes'
import type { SignalAblationComparison, SignalAblationConfig } from './signalAblationTypes'
import { getDisabledFeatures } from './createDefaultAblationConfig'
import { runSignalScenario } from '../signalScenario/runSignalScenario'
import type { SignalScenario } from '../signalScenario/signalScenarioTypes'

export async function compareAblationRuns(
  scenario: SignalScenario,
  ablationConfig: SignalAblationConfig,
): Promise<{ baseline: SignalScenarioResult; ablated: SignalScenarioResult; comparison: SignalAblationComparison }> {
  const baseline = await runSignalScenario(scenario)
  const ablated = await runSignalScenario(scenario, undefined, ablationConfig)

  const disabledFeatures = getDisabledFeatures(ablationConfig)
  const notes: string[] = []

  const diff = {
    assemblyGrowthDiff: ablated.metrics.assemblyGrowth - baseline.metrics.assemblyGrowth,
    bridgeGrowthDiff: ablated.metrics.bridgeGrowth - baseline.metrics.bridgeGrowth,
    recallSuccessDiff: ablated.metrics.recallSuccessDelta - baseline.metrics.recallSuccessDelta,
    teacherDependencyDiff:
      ablated.metrics.teacherDependencyDelta - baseline.metrics.teacherDependencyDelta,
    overbindingRiskDiff:
      ablated.metrics.overbindingRiskDelta - baseline.metrics.overbindingRiskDelta,
    promotionReadinessDiff:
      ablated.metrics.promotionReadinessDelta - baseline.metrics.promotionReadinessDelta,
  }

  if (diff.assemblyGrowthDiff < -2) {
    notes.push(`disabling [${disabledFeatures.join(', ')}] reduced assembly growth by ${Math.abs(diff.assemblyGrowthDiff)}`)
  }
  if (diff.recallSuccessDiff < 0) {
    notes.push(`recall success decreased by ${Math.abs(diff.recallSuccessDiff)} with ablation`)
  }

  return {
    baseline,
    ablated,
    comparison: {
      baselineRunId: `baseline_${baseline.startedAt}`,
      ablatedRunId: `ablated_${ablated.startedAt}`,
      disabledFeatures,
      metricDiff: diff,
      notes,
    },
  }
}
