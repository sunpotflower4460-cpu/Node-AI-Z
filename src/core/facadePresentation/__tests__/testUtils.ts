import type { FacadeView } from '../../facadeRuntime/facadeRuntimeTypes'
import type { AppFacadeMode } from '../../coreTypes'

export const createSampleFacadeView = (mode: AppFacadeMode = 'crystallized_thinking'): FacadeView => {
  return {
    visibleSchemas: [
      {
        id: 'schema-branch-1',
        key: 'branch-pattern',
        dominantProtoMeaningIds: [],
        dominantTextureTags: ['continuity'],
        optionTendencyKeys: [],
        somaticSignatureKeys: [],
        recurrenceCount: 1,
        strength: 0.4,
        confidence: 0.6,
        supportingTraceIds: [],
        firstSeenTurn: 1,
        lastReinforcedTurn: 1,
        origin: 'personal_branch',
      },
      {
        id: 'schema-trunk-1',
        key: 'trunk-pattern',
        dominantProtoMeaningIds: [],
        dominantTextureTags: [],
        optionTendencyKeys: [],
        somaticSignatureKeys: [],
        recurrenceCount: 2,
        strength: 0.7,
        confidence: 0.8,
        supportingTraceIds: [],
        firstSeenTurn: 1,
        lastReinforcedTurn: 1,
        origin: 'shared_trunk',
      },
    ],
    visibleMixedNodes: [
      {
        id: 'mixed-branch',
        key: 'branch-dominant',
        label: 'Branch Dominant',
        axes: ['affect', 'context'],
        salience: 0.9,
        coherence: 0.8,
        novelty: 0.2,
        sessionLocal: true,
        sourceRefs: [],
        tags: ['thinking'],
        generatedAtTurn: 1,
        origin: 'personal_branch',
      },
      {
        id: 'mixed-trunk',
        key: 'trunk-dominant',
        label: 'Trunk Dominant',
        axes: ['relation'],
        salience: 0.4,
        coherence: 0.5,
        novelty: 0.1,
        sessionLocal: false,
        sourceRefs: [],
        tags: ['observe'],
        generatedAtTurn: 1,
        origin: 'shared_trunk',
      },
    ],
    visibleBiases: {
      continuity: 0.8,
      consistency: 0.6,
      precision: 0.5,
    },
    visibleProtoWeights: {
      continuity: 0.2,
    },
    sessionSnapshot: {
      hasActiveSession: true,
      sessionMetadata: { step: 'active' },
    },
    promotionCandidates: [
      {
        id: 'promo-1',
        type: 'schema',
        score: 0.7,
        reasons: ['branch recurrence'],
      },
    ],
    influenceNotes: [
      {
        origin: 'shared_trunk',
        target: 'schema',
        delta: 0.1,
        reason: 'guardian review note',
      },
    ],
    viewMetadata: {
      mode,
      readableScopes: ['personal_branch', 'shared_trunk'],
      timestamp: Date.now(),
      notes: ['base view for testing'],
    },
  }
}
