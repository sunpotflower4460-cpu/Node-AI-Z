import { getStageCapabilities } from './getStageCapabilities'
import type { SignalDevelopmentStage, SignalDevelopmentState } from './signalDevelopmentTypes'

const STAGE_LABELS: Record<SignalDevelopmentStage, string> = {
  1: 'point ignition',
  2: 'assembly formation',
  3: 'teacher-guided identity',
  4: 'self recall',
  5: 'contrast learning',
  6: 'sequence memory',
  7: 'internal action selection',
  8: 'mother export candidate',
}

const UNLOCKS_BY_STAGE: Record<SignalDevelopmentStage, string[]> = {
  1: ['point_firing'],
  2: ['point_firing', 'assemblies'],
  3: ['point_firing', 'assemblies', 'teacher_guidance'],
  4: ['point_firing', 'assemblies', 'teacher_guidance', 'self_recall', 'modulators'],
  5: ['point_firing', 'assemblies', 'teacher_guidance', 'self_recall', 'modulators', 'contrast_learning', 'reconsolidation'],
  6: ['point_firing', 'assemblies', 'teacher_guidance', 'self_recall', 'modulators', 'contrast_learning', 'reconsolidation', 'sequence_memory', 'hierarchical_prediction'],
  7: ['point_firing', 'assemblies', 'teacher_guidance', 'self_recall', 'modulators', 'contrast_learning', 'reconsolidation', 'sequence_memory', 'hierarchical_prediction', 'internal_actions'],
  8: ['point_firing', 'assemblies', 'teacher_guidance', 'self_recall', 'modulators', 'contrast_learning', 'reconsolidation', 'sequence_memory', 'hierarchical_prediction', 'internal_actions', 'mother_export_candidate'],
}

export function buildDevelopmentSummary(stage: SignalDevelopmentStage): SignalDevelopmentState {
  return {
    stage,
    label: STAGE_LABELS[stage],
    unlockedCapabilities: UNLOCKS_BY_STAGE[stage],
    progressScore: stage / 8,
    capabilities: getStageCapabilities(stage),
  }
}
