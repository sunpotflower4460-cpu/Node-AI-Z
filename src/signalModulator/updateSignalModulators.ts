import type { SignalAttentionBudget } from '../signalAttention/signalAttentionTypes'
import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalOutcomeMemory } from '../signalReward/signalRewardTypes'
import type { HierarchicalPredictionMemory } from '../signalPrediction/hierarchicalPredictionTypes'
import type { SignalModulatorState } from './signalModulatorTypes'

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

export function updateSignalModulators(input: {
  previous: SignalModulatorState
  branch: SignalPersonalBranch
  outcomeMemory: SignalOutcomeMemory
  predictionMemory: HierarchicalPredictionMemory
  attentionBudget: SignalAttentionBudget
  activeParticleCount: number
  timestamp: number
}): SignalModulatorState {
  const novelty = clamp(
    (input.previous.novelty +
      (input.branch.assemblyRecords.length > 1 ? 0.6 : 0.35) +
      input.predictionMemory.averageSurprise * 0.4) /
      2,
  )
  const uncertainty = clamp(
    (input.previous.uncertainty +
      input.outcomeMemory.recentErrorRate * 0.6 +
      input.predictionMemory.averageSurprise * 0.4) /
      2,
  )
  const fatigue = clamp((input.previous.fatigue + input.attentionBudget.fatigue) / 2)
  const stability = clamp(
    (input.previous.stability +
      Math.max(0, input.outcomeMemory.averageReward) * 0.5 +
      input.branch.summary.averageRecallSuccess * 0.5) /
      2,
  )
  const overload = clamp(
    (input.previous.overload +
      Math.min(1, input.activeParticleCount / 25) * 0.6 +
      input.attentionBudget.fatigue * 0.4) /
      2,
  )
  const explorationBias = clamp(novelty * 0.55 + uncertainty * 0.35 - stability * 0.15)
  const learningRateMultiplier = Math.max(
    0.4,
    Math.min(1.4, 1 + stability * 0.2 - fatigue * 0.3 - overload * 0.2 + explorationBias * 0.1),
  )
  const teacherReliance = clamp(
    (input.previous.teacherReliance + input.branch.summary.averageTeacherDependency) / 2,
  )

  const notes: string[] = []
  if (uncertainty >= 0.65) {
    notes.push('High uncertainty: favor teacher queries, replay, and contrast checks')
  }
  if (overload >= 0.65) {
    notes.push('High overload: strengthen inhibition and reduce available learning budget')
  }
  if (stability >= 0.55) {
    notes.push('Stability rising: retain longer-term edits and reconsolidation gains')
  }

  return {
    novelty,
    uncertainty,
    fatigue,
    stability,
    overload,
    explorationBias,
    learningRateMultiplier,
    teacherReliance,
    updatedAt: input.timestamp,
    notes,
  }
}
