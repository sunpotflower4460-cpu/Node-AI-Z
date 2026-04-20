/**
 * Contextual Node Templates
 * Phase M5: Mixed-Selective Latent Pool
 *
 * Templates for generating mixed nodes based on intersection conditions.
 * NOT a fixed dictionary, but rules for "when these things combine, this mixed state emerges".
 */

import type { FusedState } from '../fusion/types'
import type { ProtoMeaning } from '../meaning/types'
import type { OptionAwareness } from '../option/types'
import type { InteroceptiveState } from '../interoception/interoceptiveState'
import type { WorkspaceState } from '../workspace/workspacePhaseMachine'
import type { MixedNodeAxis } from './mixedNodeTypes'

export type ContextualNodeTemplate = {
  key: string
  label: string
  axes: MixedNodeAxis[]
  tags: string[]
  condition: (context: MixedNodeContext) => boolean
  extractWeight: (context: MixedNodeContext) => number
}

export type MixedNodeContext = {
  fusedState: FusedState
  sensoryProtoMeanings: ProtoMeaning[]
  narrativeProtoMeanings: ProtoMeaning[]
  optionAwareness?: OptionAwareness
  interoception: InteroceptiveState
  workspace: WorkspaceState
}

/**
 * Contextual Node Templates
 * Start with 5-10 templates. DO NOT make this a giant dictionary.
 */
export const CONTEXTUAL_NODE_TEMPLATES: ContextualNodeTemplate[] = [
  // 1. fatigue_under_expectation
  {
    key: 'fatigue_under_expectation',
    label: '期待圧の下での消耗',
    axes: ['affect', 'body', 'relation'],
    tags: ['fatigue', 'pressure', 'expectation', 'heaviness'],
    condition: (ctx) => {
      const hasHeaviness = ctx.fusedState.dominantTextures.includes('heaviness')
      const hasPressure = ctx.fusedState.integratedTensions.includes('pressure') ||
                          ctx.fusedState.integratedTensions.includes('expectation')
      const lowEnergy = ctx.interoception.energy < 0.4
      const hasExpectationNarrative = ctx.narrativeProtoMeanings.some((p) =>
        p.glossJa.includes('べき') || p.glossJa.includes('期待')
      )
      return hasHeaviness && hasPressure && lowEnergy && hasExpectationNarrative
    },
    extractWeight: (ctx) => {
      const heavinessWeight = ctx.fusedState.dominantTextures.includes('heaviness') ? 0.3 : 0.0
      const pressureWeight = ctx.fusedState.integratedTensions.some((t) =>
        t.includes('pressure') || t.includes('expectation')
      ) ? 0.3 : 0.0
      const energyWeight = (1.0 - ctx.interoception.energy) * 0.4
      return heavinessWeight + pressureWeight + energyWeight
    },
  },

  // 2. wish_to_open_but_guarded
  {
    key: 'wish_to_open_but_guarded',
    label: '開きたいが守られている',
    axes: ['affect', 'relation', 'body'],
    tags: ['openness', 'guard', 'fragility', 'ambivalence'],
    condition: (ctx) => {
      const midOpenness = ctx.interoception.socialSafety > 0.3 && ctx.interoception.socialSafety < 0.7
      const lowSafety = ctx.interoception.socialSafety < 0.5
      const hasFragility = ctx.fusedState.dominantTextures.includes('fragility')
      const highAmbiguity = ctx.optionAwareness && ctx.optionAwareness.hesitationStrength > 0.5
      return midOpenness && lowSafety && hasFragility && !!highAmbiguity
    },
    extractWeight: (ctx) => {
      const opennessWeight = Math.abs(ctx.interoception.socialSafety - 0.5) * 0.3
      const safetyWeight = (1.0 - ctx.interoception.socialSafety) * 0.3
      const fragilityWeight = ctx.fusedState.dominantTextures.includes('fragility') ? 0.2 : 0.0
      const ambiguityWeight = ctx.optionAwareness ? ctx.optionAwareness.hesitationStrength * 0.2 : 0.0
      return opennessWeight + safetyWeight + fragilityWeight + ambiguityWeight
    },
  },

  // 3. curiosity_with_low_safety
  {
    key: 'curiosity_with_low_safety',
    label: '安全感の低い好奇心',
    axes: ['affect', 'goal', 'relation'],
    tags: ['curiosity', 'novelty', 'safety', 'uncertainty'],
    condition: (ctx) => {
      const highNoveltyHunger = ctx.interoception.noveltyHunger > 0.6
      const lowSafety = ctx.interoception.socialSafety < 0.4
      const hasCuriosityNarrative = ctx.narrativeProtoMeanings.some((p) =>
        p.glossJa.includes('可能性') || p.glossJa.includes('新しい')
      )
      const highUncertainty = ctx.interoception.uncertaintyTolerance < 0.5
      return highNoveltyHunger && lowSafety && hasCuriosityNarrative && highUncertainty
    },
    extractWeight: (ctx) => {
      const noveltyWeight = ctx.interoception.noveltyHunger * 0.35
      const safetyWeight = (1.0 - ctx.interoception.socialSafety) * 0.35
      const uncertaintyWeight = (1.0 - ctx.interoception.uncertaintyTolerance) * 0.3
      return noveltyWeight + safetyWeight + uncertaintyWeight
    },
  },

  // 4. gentle_withdrawal
  {
    key: 'gentle_withdrawal',
    label: '穏やかな引き下がり',
    axes: ['affect', 'relation', 'body'],
    tags: ['withdrawal', 'protect', 'gentle', 'low-energy'],
    condition: (ctx) => {
      const notTooLowOpenness = ctx.interoception.socialSafety > 0.2
      const lowEnergy = ctx.interoception.energy < 0.4
      const hasProtectTendency = ctx.fusedState.dominantTextures.includes('shield') ||
                                  ctx.fusedState.dominantTextures.includes('protect')
      const lowConfidence = ctx.optionAwareness && ctx.optionAwareness.confidence < 0.5
      return notTooLowOpenness && lowEnergy && hasProtectTendency && !!lowConfidence
    },
    extractWeight: (ctx) => {
      const opennessWeight = Math.min(ctx.interoception.socialSafety, 0.6) * 0.25
      const energyWeight = (1.0 - ctx.interoception.energy) * 0.35
      const protectWeight = (ctx.fusedState.dominantTextures.includes('shield') ||
                             ctx.fusedState.dominantTextures.includes('protect')) ? 0.2 : 0.0
      const confidenceWeight = ctx.optionAwareness ? (1.0 - ctx.optionAwareness.confidence) * 0.2 : 0.0
      return opennessWeight + energyWeight + protectWeight + confidenceWeight
    },
  },

  // 5. change_pull_with_ambivalence
  {
    key: 'change_pull_with_ambivalence',
    label: '両価を持つ変化の引き',
    axes: ['goal', 'affect', 'temporal'],
    tags: ['change', 'ambivalence', 'resonance', 'hesitation'],
    condition: (ctx) => {
      const hasChangeOption = ctx.narrativeProtoMeanings.some((p) =>
        p.glossJa.includes('変') || p.glossJa.includes('違う')
      )
      const lowOptionGap = ctx.optionAwareness && ctx.optionAwareness.differenceMagnitude < 0.3
      const highAmbivalence = ctx.optionAwareness && ctx.optionAwareness.hesitationStrength > 0.5
      const hasResonance = ctx.fusedState.dominantTextures.includes('resonance')
      return hasChangeOption && !!lowOptionGap && !!highAmbivalence && hasResonance
    },
    extractWeight: (ctx) => {
      const changeWeight = ctx.narrativeProtoMeanings.some((p) =>
        p.glossJa.includes('変') || p.glossJa.includes('違う')
      ) ? 0.3 : 0.0
      const gapWeight = ctx.optionAwareness ? (1.0 - ctx.optionAwareness.differenceMagnitude) * 0.25 : 0.0
      const ambivalenceWeight = ctx.optionAwareness ? ctx.optionAwareness.hesitationStrength * 0.25 : 0.0
      const resonanceWeight = ctx.fusedState.dominantTextures.includes('resonance') ? 0.2 : 0.0
      return changeWeight + gapWeight + ambivalenceWeight + resonanceWeight
    },
  },

  // 6. protective_openness
  {
    key: 'protective_openness',
    label: '防御的な開き',
    axes: ['affect', 'relation', 'context'],
    tags: ['openness', 'protect', 'cautious', 'ambivalence'],
    condition: (ctx) => {
      const midSafety = ctx.interoception.socialSafety > 0.3 && ctx.interoception.socialSafety < 0.6
      const hasFragility = ctx.fusedState.dominantTextures.includes('fragility')
      const hasOpenNarrative = ctx.narrativeProtoMeanings.some((p) =>
        p.glossJa.includes('開') || p.glossJa.includes('伝え')
      )
      const notTooLowEnergy = ctx.interoception.energy > 0.3
      return midSafety && hasFragility && hasOpenNarrative && notTooLowEnergy
    },
    extractWeight: (ctx) => {
      const safetyWeight = (0.6 - Math.abs(ctx.interoception.socialSafety - 0.45)) * 0.35
      const fragilityWeight = ctx.fusedState.dominantTextures.includes('fragility') ? 0.3 : 0.0
      const opennessWeight = ctx.narrativeProtoMeanings.some((p) =>
        p.glossJa.includes('開') || p.glossJa.includes('伝え')
      ) ? 0.35 : 0.0
      return safetyWeight + fragilityWeight + opennessWeight
    },
  },

  // 7. meaning_loss_under_pressure
  {
    key: 'meaning_loss_under_pressure',
    label: '圧の下での意味喪失',
    axes: ['affect', 'context', 'body'],
    tags: ['pressure', 'meaning-loss', 'overload', 'confusion'],
    condition: (ctx) => {
      const highPressure = ctx.fusedState.integratedTensions.includes('pressure')
      const highOverload = ctx.interoception.overload > 0.6
      const lowConfidence = ctx.fusedState.fusedConfidence < 0.4
      const hasConfusionNarrative = ctx.narrativeProtoMeanings.some((p) =>
        p.glossJa.includes('わからない') || p.glossJa.includes('迷')
      )
      return highPressure && highOverload && lowConfidence && hasConfusionNarrative
    },
    extractWeight: (ctx) => {
      const pressureWeight = ctx.fusedState.integratedTensions.includes('pressure') ? 0.3 : 0.0
      const overloadWeight = ctx.interoception.overload * 0.3
      const confidenceWeight = (1.0 - ctx.fusedState.fusedConfidence) * 0.2
      const confusionWeight = ctx.narrativeProtoMeanings.some((p) =>
        p.glossJa.includes('わからない') || p.glossJa.includes('迷')
      ) ? 0.2 : 0.0
      return pressureWeight + overloadWeight + confidenceWeight + confusionWeight
    },
  },

  // 8. fragile_but_not_closed
  {
    key: 'fragile_but_not_closed',
    label: '壊れやすいが閉じてはいない',
    axes: ['affect', 'body', 'relation'],
    tags: ['fragility', 'openness', 'vulnerability', 'resilience'],
    condition: (ctx) => {
      const hasFragility = ctx.fusedState.dominantTextures.includes('fragility')
      const notTooLowSafety = ctx.interoception.socialSafety > 0.25
      const lowButNotZeroEnergy = ctx.interoception.energy > 0.2 && ctx.interoception.energy < 0.5
      const hasOpenWorkspace = ctx.workspace.phase === 'encode' || ctx.workspace.phase === 'hold'
      return hasFragility && notTooLowSafety && lowButNotZeroEnergy && hasOpenWorkspace
    },
    extractWeight: (ctx) => {
      const fragilityWeight = ctx.fusedState.dominantTextures.includes('fragility') ? 0.35 : 0.0
      const safetyWeight = Math.min(ctx.interoception.socialSafety, 0.5) * 0.25
      const energyWeight = (ctx.interoception.energy > 0.2 && ctx.interoception.energy < 0.5) ? 0.2 : 0.0
      const workspaceWeight = (ctx.workspace.phase === 'encode' || ctx.workspace.phase === 'hold') ? 0.2 : 0.0
      return fragilityWeight + safetyWeight + energyWeight + workspaceWeight
    },
  },
]
