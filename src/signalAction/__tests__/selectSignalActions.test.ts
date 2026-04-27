import { describe, expect, it } from 'vitest'
import { selectSignalActions } from '../selectSignalActions'
import { buildDevelopmentSummary } from '../../signalDevelopment/buildDevelopmentSummary'

describe('selectSignalActions', () => {
  it('maps active-attention targets into internal actions once stage 7 is unlocked', () => {
    const actions = selectSignalActions({
      selectedTargets: [
        {
          id: 'attention_bridge_teacher_a',
          targetType: 'bridge',
          targetId: 'bridge_a',
          urgency: 0.9,
          reason: 'teacher_dependency_high',
          recommendedAction: 'ask_teacher',
        },
        {
          id: 'attention_sequence_a',
          targetType: 'sequence',
          targetId: 'ctx_a',
          urgency: 0.7,
          reason: 'sequence_prediction_mismatch',
          recommendedAction: 'observe_next_turn',
        },
      ],
      teacherQueryTargetIds: ['bridge_a'],
      promotionReadiness: {
        readyCount: 0,
        waitCount: 0,
        motherExportCandidateCount: 0,
        highNoiseRiskCount: 0,
        topAssemblyCandidates: [],
        topBridgeCandidates: [],
        topProtoSeedCandidates: [],
      },
      modulatorState: {
        novelty: 0.6,
        uncertainty: 0.7,
        fatigue: 0.2,
        stability: 0.4,
        overload: 0.72,
        explorationBias: 0.6,
        learningRateMultiplier: 1,
        teacherReliance: 0.5,
        updatedAt: 100,
        notes: [],
      },
      development: buildDevelopmentSummary(7),
      timestamp: 100,
    })

    expect(actions.map(action => action.actionType)).toContain('ask_teacher')
    expect(actions.map(action => action.actionType)).toContain('predict_sequence')
    expect(actions.map(action => action.actionType)).toContain('suppress_noise')
    expect(actions.map(action => action.actionType)).toContain('hold_uncertain')
  })
})
