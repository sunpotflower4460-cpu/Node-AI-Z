import { buildBindingTeacherRequest } from '../bindingTeacher/buildBindingTeacherRequest'
import { resolveBindingTeacher } from '../bindingTeacher/resolveBindingTeacher'
import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalFieldState } from '../signalField/signalFieldTypes'
import type { SignalAction, SignalActionResult } from './signalActionTypes'

type ExecuteSignalActionInput = {
  action: SignalAction
  branch: SignalPersonalBranch
  fieldState: SignalFieldState
  enableBindingTeacher?: boolean
  textSummary?: string
  imageSummary?: string
  audioSummary?: string
  timestamp: number
}

export type ExecutedSignalAction = {
  branch: SignalPersonalBranch
  fieldState: SignalFieldState
  result: Omit<SignalActionResult, 'rewardValue'>
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

function updateBranchTimestamp(branch: SignalPersonalBranch, timestamp: number): SignalPersonalBranch {
  return {
    ...branch,
    updatedAt: timestamp,
  }
}

export async function executeSignalAction(
  input: ExecuteSignalActionInput,
): Promise<ExecutedSignalAction> {
  const { action, fieldState, timestamp } = input
  let branch = input.branch

  switch (action.actionType) {
    case 'replay_assembly': {
      let success = false
      branch = updateBranchTimestamp({
        ...branch,
        assemblyRecords: branch.assemblyRecords.map(record => {
          if (record.assemblyId !== action.targetId) {
            return record
          }
          success = true
          return {
            ...record,
            replayCount: record.replayCount + 1,
            stabilityScore: clamp(record.stabilityScore + 0.08),
            lastActivatedAt: timestamp,
          }
        }),
      }, timestamp)
      return {
        branch,
        fieldState,
        result: {
          actionId: action.id,
          success,
          outcomeType: success ? 'recall_success' : 'recall_failed',
          notes: success
            ? ['Replay strengthened a repeating assembly']
            : ['Replay target assembly was not found'],
        },
      }
    }
    case 'test_bridge': {
      let success = false
      branch = updateBranchTimestamp({
        ...branch,
        bridgeRecords: branch.bridgeRecords.map(record => {
          if (record.id !== action.targetId) {
            return record
          }
          const score = record.confidence + record.recallSuccessScore - record.teacherDependencyScore * 0.25
          success = score >= 0.45
          return {
            ...record,
            selfRecallSuccessCount: success
              ? record.selfRecallSuccessCount + 1
              : record.selfRecallSuccessCount,
            failedRecallCount: success ? record.failedRecallCount : record.failedRecallCount + 1,
            confidence: clamp(record.confidence + (success ? 0.08 : -0.05)),
            recallSuccessScore: clamp(record.recallSuccessScore + (success ? 0.1 : -0.08)),
            lastUsedAt: timestamp,
          }
        }),
      }, timestamp)
      return {
        branch,
        fieldState,
        result: {
          actionId: action.id,
          success,
          outcomeType: success ? 'bridge_strengthened' : 'recall_failed',
          notes: success
            ? ['Bridge survived a self-test without extra teacher support']
            : ['Bridge self-test failed and should stay tentative'],
        },
      }
    }
    case 'ask_teacher': {
      const assemblies = fieldState.assemblies.slice(0, 2)
      const teacherResult = await resolveBindingTeacher(buildBindingTeacherRequest(assemblies, {
        textSummary: input.textSummary,
        imageSummary: input.imageSummary,
        audioSummary: input.audioSummary,
      }))
      const success = teacherResult.confidence >= 0.35
      branch = updateBranchTimestamp({
        ...branch,
        bridgeRecords: branch.bridgeRecords.map(record => {
          if (record.id !== action.targetId) {
            return record
          }
          return {
            ...record,
            teacherConfirmCount: record.teacherConfirmCount + 1,
            confidence: clamp(Math.max(record.confidence, teacherResult.confidence)),
            lastUsedAt: timestamp,
          }
        }),
        contrastRecords: branch.contrastRecords.map(record => {
          if (record.id !== action.targetId) {
            return record
          }
          return {
            ...record,
            teacherAssisted: true,
            confidence: clamp(record.confidence + teacherResult.confidence * 0.2),
            lastUpdatedAt: timestamp,
          }
        }),
      }, timestamp)
      return {
        branch,
        fieldState,
        result: {
          actionId: action.id,
          success,
          outcomeType: success ? 'bridge_strengthened' : 'no_effect',
          notes: [...teacherResult.reasons],
        },
      }
    }
    case 'compare_contrast': {
      let success = false
      branch = updateBranchTimestamp({
        ...branch,
        contrastRecords: branch.contrastRecords.map(record => {
          if (record.id !== action.targetId) {
            return record
          }
          success = true
          return {
            ...record,
            relation: record.relation === 'unknown' ? 'similar_but_different' : record.relation,
            confidence: clamp(record.confidence + 0.18),
            recurrenceCount: record.recurrenceCount + 1,
            lastUpdatedAt: timestamp,
          }
        }),
      }, timestamp)
      return {
        branch,
        fieldState,
        result: {
          actionId: action.id,
          success,
          outcomeType: success ? 'contrast_clarified' : 'no_effect',
          notes: success
            ? ['Contrast comparison sharpened the boundary between two patterns']
            : ['No contrast target was available to compare'],
        },
      }
    }
    case 'predict_sequence': {
      let success = false
      branch = updateBranchTimestamp({
        ...branch,
        sequenceRecords: branch.sequenceRecords.map(record => {
          const contextKey = record.assemblyIds.join('>') || 'root'
          if (record.id !== action.targetId && contextKey !== action.targetId) {
            return record
          }
          success = record.predictionConfidence >= 0.45
          return {
            ...record,
            predictionConfidence: clamp(record.predictionConfidence + (success ? 0.08 : -0.08)),
            mismatchCount: success ? record.mismatchCount : record.mismatchCount + 1,
            lastObservedAt: timestamp,
          }
        }),
      }, timestamp)
      return {
        branch,
        fieldState,
        result: {
          actionId: action.id,
          success,
          outcomeType: success ? 'prediction_confirmed' : 'prediction_failed',
          notes: success
            ? ['Sequence continuation stayed inside a learned context']
            : ['Sequence continuation stayed uncertain and needs more examples'],
        },
      }
    }
    case 'suppress_noise': {
      const noisyRecords = branch.assemblyRecords.filter(record => record.recurrenceCount <= 1 && record.stabilityScore < 0.4)
      const success = noisyRecords.length > 0
      branch = updateBranchTimestamp({
        ...branch,
        assemblyRecords: branch.assemblyRecords.map(record => (
          noisyRecords.some(noisy => noisy.id === record.id)
            ? {
                ...record,
                stabilityScore: clamp(record.stabilityScore - 0.03),
              }
            : record
        )),
      }, timestamp)
      return {
        branch,
        fieldState,
        result: {
          actionId: action.id,
          success,
          outcomeType: success ? 'noise_reduced' : 'no_effect',
          notes: success
            ? ['Weak one-off activations were suppressed to protect attention budget']
            : ['No noisy assemblies needed suppression'],
        },
      }
    }
    case 'strengthen_candidate': {
      let success = false
      branch = updateBranchTimestamp({
        ...branch,
        assemblyRecords: branch.assemblyRecords.map(record => {
          if (action.targetType === 'assembly' && record.assemblyId === action.targetId) {
            success = true
            return {
              ...record,
              recurrenceCount: record.recurrenceCount + 1,
              stabilityScore: clamp(record.stabilityScore + 0.07),
              lastActivatedAt: timestamp,
            }
          }
          return record
        }),
        bridgeRecords: branch.bridgeRecords.map(record => {
          if (action.targetType === 'bridge' && record.id === action.targetId) {
            success = true
            return {
              ...record,
              confidence: clamp(record.confidence + 0.06),
              selfRecallSuccessCount: record.selfRecallSuccessCount + 1,
              lastUsedAt: timestamp,
            }
          }
          return record
        }),
        protoSeedRecords: branch.protoSeedRecords.map(record => {
          if (action.targetType === 'proto_seed' && record.protoSeedId === action.targetId) {
            success = true
            return {
              ...record,
              recurrenceCount: record.recurrenceCount + 1,
              stabilityScore: clamp(record.stabilityScore + 0.06),
              updatedAt: timestamp,
            }
          }
          return record
        }),
      }, timestamp)
      return {
        branch,
        fieldState,
        result: {
          actionId: action.id,
          success,
          outcomeType: success ? 'bridge_strengthened' : 'no_effect',
          notes: success
            ? ['Candidate received an extra stabilization pass']
            : ['No strengthenable candidate matched the selected target'],
        },
      }
    }
    case 'hold_uncertain':
    default:
      return {
        branch: updateBranchTimestamp(branch, timestamp),
        fieldState,
        result: {
          actionId: action.id,
          success: true,
          outcomeType: 'no_effect',
          notes: ['Uncertain hypothesis was held without forcing a premature merge'],
        },
      }
  }
}
