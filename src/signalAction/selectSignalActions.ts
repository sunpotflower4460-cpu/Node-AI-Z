import type { ActiveAttentionTarget } from '../signalAttentionActive/activeAttentionTypes'
import type { SignalPromotionReadinessSummary } from '../signalPromotion/signalPromotionReadinessTypes'
import type { SignalModulatorState } from '../signalModulator/signalModulatorTypes'
import type { SignalDevelopmentState } from '../signalDevelopment/signalDevelopmentTypes'
import type { SignalAction } from './signalActionTypes'

export type SelectSignalActionsInput = {
  selectedTargets: ActiveAttentionTarget[]
  teacherQueryTargetIds: string[]
  promotionReadiness: SignalPromotionReadinessSummary
  modulatorState: SignalModulatorState
  development: SignalDevelopmentState
  timestamp: number
}

function buildActionFromTarget(
  target: ActiveAttentionTarget,
  teacherQueryTargetIds: string[],
  timestamp: number,
  index: number,
): SignalAction {
  if (teacherQueryTargetIds.includes(target.targetId)) {
    return {
      id: `action_ask_teacher_${target.targetId}_${timestamp}_${index}`,
      actionType: 'ask_teacher',
      targetType: target.targetType,
      targetId: target.targetId,
      reason: target.reason,
      expectedOutcome: 'reduce uncertainty with teacher guidance',
      cost: 12,
      selectedAt: timestamp,
    }
  }

  switch (target.reason) {
    case 'unstable_but_repeating':
    case 'recall_failed':
      return {
        id: `action_replay_${target.targetId}_${timestamp}_${index}`,
        actionType: target.targetType === 'bridge' ? 'test_bridge' : 'replay_assembly',
        targetType: target.targetType,
        targetId: target.targetId,
        reason: target.reason,
        expectedOutcome: 'improve recall reliability',
        cost: 8,
        selectedAt: timestamp,
      }
    case 'teacher_dependency_high':
      return {
        id: `action_teacher_${target.targetId}_${timestamp}_${index}`,
        actionType: 'ask_teacher',
        targetType: target.targetType,
        targetId: target.targetId,
        reason: target.reason,
        expectedOutcome: 'clarify bridge before self-recall',
        cost: 12,
        selectedAt: timestamp,
      }
    case 'sequence_prediction_mismatch':
      return {
        id: `action_sequence_${target.targetId}_${timestamp}_${index}`,
        actionType: 'predict_sequence',
        targetType: 'sequence',
        targetId: target.targetId,
        reason: target.reason,
        expectedOutcome: 'reduce prediction mismatch',
        cost: 7,
        selectedAt: timestamp,
      }
    case 'contrast_unclear':
      return {
        id: `action_contrast_${target.targetId}_${timestamp}_${index}`,
        actionType: 'compare_contrast',
        targetType: 'contrast',
        targetId: target.targetId,
        reason: target.reason,
        expectedOutcome: 'clarify similar-but-different structure',
        cost: 6,
        selectedAt: timestamp,
      }
    case 'high_promotion_readiness':
    default:
      return {
        id: `action_strengthen_${target.targetId}_${timestamp}_${index}`,
        actionType: 'strengthen_candidate',
        targetType: target.targetType,
        targetId: target.targetId,
        reason: target.reason,
        expectedOutcome: 'stabilize a promising candidate',
        cost: 5,
        selectedAt: timestamp,
      }
  }
}

export function selectSignalActions(input: SelectSignalActionsInput): SignalAction[] {
  if (!input.development.unlockedCapabilities.includes('internal_actions')) {
    return []
  }

  const selected = input.selectedTargets.map((target, index) =>
    buildActionFromTarget(target, input.teacherQueryTargetIds, input.timestamp, index),
  )

  if (input.modulatorState.overload >= 0.65) {
    selected.unshift({
      id: `action_suppress_noise_${input.timestamp}`,
      actionType: 'suppress_noise',
      targetType: 'assembly',
      targetId: 'global_noise_field',
      reason: 'overload_high',
      expectedOutcome: 'reduce diffuse low-value firing',
      cost: 4,
      selectedAt: input.timestamp,
    })
  }

  if (input.modulatorState.uncertainty >= 0.65) {
    const mostUncertain = input.selectedTargets.find(target => target.reason === 'contrast_unclear')
      ?? input.selectedTargets[0]
    if (mostUncertain) {
      selected.push({
        id: `action_hold_uncertain_${mostUncertain.targetId}_${input.timestamp}`,
        actionType: 'hold_uncertain',
        targetType: mostUncertain.targetType,
        targetId: mostUncertain.targetId,
        reason: 'uncertainty_high',
        expectedOutcome: 'avoid over-committing while evidence is weak',
        cost: 2,
        selectedAt: input.timestamp,
      })
    }
  }

  if (
    selected.length === 0 &&
    input.promotionReadiness.topAssemblyCandidates[0] &&
    input.development.unlockedCapabilities.includes('internal_actions')
  ) {
    const candidate = input.promotionReadiness.topAssemblyCandidates[0]
    selected.push({
      id: `action_default_strengthen_${candidate.targetId}_${input.timestamp}`,
      actionType: 'strengthen_candidate',
      targetType: candidate.targetType,
      targetId: candidate.targetId,
      reason: 'fallback_high_readiness',
      expectedOutcome: 'keep development moving toward stable patterns',
      cost: 5,
      selectedAt: input.timestamp,
    })
  }

  return selected.slice(0, 4)
}
