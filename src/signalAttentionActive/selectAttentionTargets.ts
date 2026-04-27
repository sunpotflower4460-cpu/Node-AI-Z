import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalPromotionReadinessSummary } from '../signalPromotion/signalPromotionReadinessTypes'
import type { ContrastSummary } from '../signalContrast/signalContrastTypes'
import type { SequenceSummary } from '../signalSequence/signalSequenceTypes'
import type { AttentionAllocation } from '../signalAttention/signalAttentionTypes'
import type { ActiveAttentionTarget } from './activeAttentionTypes'
import { scoreAttentionUrgency } from './scoreAttentionUrgency'

export type SelectAttentionTargetsInput = {
  branch: SignalPersonalBranch
  promotionReadiness: SignalPromotionReadinessSummary
  contrastSummary: ContrastSummary
  sequenceSummary: SequenceSummary
  attentionAllocation: AttentionAllocation
}

export function selectAttentionTargets(
  input: SelectAttentionTargetsInput,
): ActiveAttentionTarget[] {
  const candidates: ActiveAttentionTarget[] = []

  for (const assembly of input.branch.assemblyRecords) {
    if (assembly.recurrenceCount >= 2 && assembly.stabilityScore < 0.55) {
      candidates.push({
        id: `attention_assembly_${assembly.assemblyId}`,
        targetType: 'assembly',
        targetId: assembly.assemblyId,
        urgency: scoreAttentionUrgency({
          reason: 'unstable_but_repeating',
          recurrenceCount: assembly.recurrenceCount,
          instability: 1 - assembly.stabilityScore,
        }),
        reason: 'unstable_but_repeating',
        recommendedAction: 'replay',
      })
    }
  }

  for (const bridge of input.branch.bridgeRecords) {
    if (bridge.teacherDependencyScore >= 0.6) {
      candidates.push({
        id: `attention_bridge_teacher_${bridge.id}`,
        targetType: 'bridge',
        targetId: bridge.id,
        urgency: scoreAttentionUrgency({
          reason: 'teacher_dependency_high',
          teacherDependencyScore: bridge.teacherDependencyScore,
        }),
        reason: 'teacher_dependency_high',
        recommendedAction: 'ask_teacher',
      })
    }

    if (bridge.failedRecallCount > bridge.selfRecallSuccessCount) {
      candidates.push({
        id: `attention_bridge_recall_${bridge.id}`,
        targetType: 'bridge',
        targetId: bridge.id,
        urgency: scoreAttentionUrgency({
          reason: 'recall_failed',
          failedRecallCount: bridge.failedRecallCount,
        }),
        reason: 'recall_failed',
        recommendedAction: 'replay',
      })
    }
  }

  const promotionCandidates = [
    ...input.promotionReadiness.topAssemblyCandidates,
    ...input.promotionReadiness.topBridgeCandidates,
    ...input.promotionReadiness.topProtoSeedCandidates,
  ]

  for (const candidate of promotionCandidates) {
    if (candidate.readinessScore >= 0.75) {
      candidates.push({
        id: `attention_promotion_${candidate.targetId}`,
        targetType: candidate.targetType,
        targetId: candidate.targetId,
        urgency: scoreAttentionUrgency({
          reason: 'high_promotion_readiness',
          readinessScore: candidate.readinessScore,
        }),
        reason: 'high_promotion_readiness',
        recommendedAction: 'strengthen',
      })
    }
  }

  for (const mismatch of input.sequenceSummary.mismatchedContexts) {
    candidates.push({
      id: `attention_sequence_${mismatch.contextKey}`,
      targetType: 'sequence',
      targetId: mismatch.contextKey,
      urgency: scoreAttentionUrgency({
        reason: 'sequence_prediction_mismatch',
        mismatchScore: mismatch.mismatchScore,
      }),
      reason: 'sequence_prediction_mismatch',
      recommendedAction: 'observe_next_turn',
    })
  }

  for (const unclear of input.contrastSummary.unclearPairs) {
    candidates.push({
      id: `attention_contrast_${unclear.id}`,
      targetType: 'contrast',
      targetId: unclear.id,
      urgency: scoreAttentionUrgency({
        reason: 'contrast_unclear',
        uncertainty: 1 - unclear.confidence,
      }),
      reason: 'contrast_unclear',
      recommendedAction: 'compare',
    })
  }

  const budgetLimit = Math.max(
    1,
    Math.min(
      6,
      Math.floor(
        (input.attentionAllocation.replayBudget +
          input.attentionAllocation.teacherBudget +
          input.attentionAllocation.consolidationBudget) /
          12,
      ),
    ),
  )

  return candidates
    .sort((a, b) => b.urgency - a.urgency)
    .slice(0, budgetLimit)
}
