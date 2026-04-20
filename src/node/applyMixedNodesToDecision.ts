/**
 * Apply Mixed Nodes to Decision
 * Phase M5: Mixed-Selective Latent Pool
 *
 * Dominant mixed nodes subtly warp decision/utterance intent based on
 * current internal tendency mixture.
 */

import type { UtteranceIntent } from '../utterance/types'
import type { MixedLatentNode, MixedNodeInfluenceNote } from './mixedNodeTypes'

export type ApplyMixedNodesToDecisionInput = {
  utteranceIntent: UtteranceIntent
  dominantMixedNodes: MixedLatentNode[]
}

export type ApplyMixedNodesToDecisionResult = {
  utteranceIntent: UtteranceIntent
  influenceNotes: MixedNodeInfluenceNote[]
}

/**
 * Apply mixed nodes to utterance intent (decision layer).
 * Mixed nodes warp intent based on intersection state, not conclusions.
 *
 * Examples:
 * - gentle_withdrawal → reduce answerForce, increase shouldStayOpen
 * - fatigue_under_expectation → increase structureNeed but reduce directness
 * - wish_to_open_but_guarded → keep emotionalDistance moderate, increase warmth slightly
 */
export const applyMixedNodesToDecision = (input: ApplyMixedNodesToDecisionInput): ApplyMixedNodesToDecisionResult => {
  const { utteranceIntent, dominantMixedNodes } = input

  const influenceNotes: MixedNodeInfluenceNote[] = []

  let answerForceDelta = 0.0
  let shouldStayOpenDelta = 0.0
  let structureNeedDelta = 0.0
  let directnessDelta = 0.0
  let emotionalDistanceDelta = 0.0
  let warmthDelta = 0.0

  for (const mixedNode of dominantMixedNodes) {
    if (mixedNode.key === 'gentle_withdrawal') {
      // Reduce answer force, increase stay open
      answerForceDelta -= mixedNode.salience * 0.12
      shouldStayOpenDelta += mixedNode.salience * 0.1
      influenceNotes.push({
        nodeId: mixedNode.id,
        target: 'decision',
        delta: -mixedNode.salience * 0.12,
        reason: `${mixedNode.key} reduced answerForce and increased shouldStayOpen`,
      })
    } else if (mixedNode.key === 'fatigue_under_expectation') {
      // Increase structure need but reduce directness
      structureNeedDelta += mixedNode.salience * 0.1
      directnessDelta -= mixedNode.salience * 0.08
      influenceNotes.push({
        nodeId: mixedNode.id,
        target: 'decision',
        delta: mixedNode.salience * 0.1,
        reason: `${mixedNode.key} increased structureNeed but reduced directness`,
      })
    } else if (mixedNode.key === 'wish_to_open_but_guarded') {
      // Keep emotional distance moderate, increase warmth slightly
      warmthDelta += mixedNode.salience * 0.08
      // Don't reduce distance too much
      emotionalDistanceDelta += mixedNode.salience * 0.05
      influenceNotes.push({
        nodeId: mixedNode.id,
        target: 'decision',
        delta: mixedNode.salience * 0.08,
        reason: `${mixedNode.key} increased warmth while maintaining moderate distance`,
      })
    } else if (mixedNode.key === 'protective_openness') {
      // Reduce directness, increase warmth
      directnessDelta -= mixedNode.salience * 0.1
      warmthDelta += mixedNode.salience * 0.1
      influenceNotes.push({
        nodeId: mixedNode.id,
        target: 'decision',
        delta: -mixedNode.salience * 0.1,
        reason: `${mixedNode.key} reduced directness and increased warmth`,
      })
    } else if (mixedNode.key === 'curiosity_with_low_safety') {
      // Increase structure need, keep distance
      structureNeedDelta += mixedNode.salience * 0.08
      emotionalDistanceDelta += mixedNode.salience * 0.06
      influenceNotes.push({
        nodeId: mixedNode.id,
        target: 'decision',
        delta: mixedNode.salience * 0.08,
        reason: `${mixedNode.key} increased structureNeed and maintained distance`,
      })
    } else if (mixedNode.key === 'meaning_loss_under_pressure') {
      // Reduce directness, increase structure need
      directnessDelta -= mixedNode.salience * 0.1
      structureNeedDelta += mixedNode.salience * 0.12
      influenceNotes.push({
        nodeId: mixedNode.id,
        target: 'decision',
        delta: -mixedNode.salience * 0.1,
        reason: `${mixedNode.key} reduced directness and increased structureNeed`,
      })
    }
  }

  // Apply deltas with bounds
  const newAnswerForce = Math.min(Math.max(utteranceIntent.answerForce + answerForceDelta, 0.0), 1.0)
  const newShouldStayOpen = utteranceIntent.shouldStayOpen || (shouldStayOpenDelta > 0.05)
  const newStructureNeed = Math.min(Math.max(utteranceIntent.structureNeed + structureNeedDelta, 0.0), 1.0)
  const newDirectness = Math.min(Math.max(utteranceIntent.directness + directnessDelta, 0.0), 1.0)
  const newEmotionalDistance = Math.min(Math.max(utteranceIntent.emotionalDistance + emotionalDistanceDelta, 0.0), 1.0)
  const newWarmth = Math.min(Math.max(utteranceIntent.warmth + warmthDelta, 0.0), 1.0)

  return {
    utteranceIntent: {
      ...utteranceIntent,
      answerForce: newAnswerForce,
      shouldStayOpen: newShouldStayOpen,
      structureNeed: newStructureNeed,
      directness: newDirectness,
      emotionalDistance: newEmotionalDistance,
      warmth: newWarmth,
    },
    influenceNotes,
  }
}
