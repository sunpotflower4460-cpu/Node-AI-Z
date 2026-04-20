/**
 * Apply Mixed Nodes to Option Awareness
 * Phase M5: Mixed-Selective Latent Pool
 *
 * Dominant mixed nodes subtly tilt option awareness without deciding for it.
 */

import type { OptionAwareness } from '../option/types'
import type { MixedLatentNode, MixedNodeInfluenceNote } from './mixedNodeTypes'

export type ApplyMixedNodesToOptionInput = {
  optionAwareness?: OptionAwareness
  dominantMixedNodes: MixedLatentNode[]
}

export type ApplyMixedNodesToOptionResult = {
  optionAwareness?: OptionAwareness
  influenceNotes: MixedNodeInfluenceNote[]
}

/**
 * Apply mixed nodes to option awareness.
 * Mixed nodes tilt how options are seen, not which option to choose.
 *
 * Examples:
 * - change_pull_with_ambivalence → increase ambivalence, slightly boost bridgeSuggested
 * - protective_openness → reduce immediate drastic change appeal
 * - curiosity_with_low_safety → boost resonance but also increase perceived risk
 */
export const applyMixedNodesToOption = (input: ApplyMixedNodesToOptionInput): ApplyMixedNodesToOptionResult => {
  const { optionAwareness, dominantMixedNodes } = input

  const influenceNotes: MixedNodeInfluenceNote[] = []

  if (!optionAwareness) {
    return { optionAwareness, influenceNotes }
  }

  let hesitationDelta = 0.0
  let confidenceDelta = 0.0
  let bridgeDelta = 0.0

  for (const mixedNode of dominantMixedNodes) {
    if (mixedNode.key === 'change_pull_with_ambivalence') {
      // Increase ambivalence/hesitation
      hesitationDelta += mixedNode.salience * 0.12
      // Slightly increase bridge possibility
      bridgeDelta += mixedNode.salience * 0.08
      influenceNotes.push({
        nodeId: mixedNode.id,
        target: 'option',
        delta: mixedNode.salience * 0.12,
        reason: `${mixedNode.key} increased hesitation and bridge suggestion`,
      })
    } else if (mixedNode.key === 'protective_openness') {
      // Reduce confidence in drastic options
      confidenceDelta -= mixedNode.salience * 0.08
      influenceNotes.push({
        nodeId: mixedNode.id,
        target: 'option',
        delta: -mixedNode.salience * 0.08,
        reason: `${mixedNode.key} reduced confidence in drastic options`,
      })
    } else if (mixedNode.key === 'curiosity_with_low_safety') {
      // Increase hesitation despite resonance
      hesitationDelta += mixedNode.salience * 0.1
      influenceNotes.push({
        nodeId: mixedNode.id,
        target: 'option',
        delta: mixedNode.salience * 0.1,
        reason: `${mixedNode.key} increased hesitation due to safety concerns`,
      })
    } else if (mixedNode.key === 'gentle_withdrawal') {
      // Reduce confidence, increase hesitation
      confidenceDelta -= mixedNode.salience * 0.1
      hesitationDelta += mixedNode.salience * 0.08
      influenceNotes.push({
        nodeId: mixedNode.id,
        target: 'option',
        delta: -mixedNode.salience * 0.1,
        reason: `${mixedNode.key} favored gentle withdrawal`,
      })
    } else if (mixedNode.key === 'fragile_but_not_closed') {
      // Slightly increase bridge possibility
      bridgeDelta += mixedNode.salience * 0.1
      influenceNotes.push({
        nodeId: mixedNode.id,
        target: 'option',
        delta: mixedNode.salience * 0.1,
        reason: `${mixedNode.key} suggested bridge possibility`,
      })
    }
  }

  // Apply deltas with bounds
  const newHesitation = Math.min(Math.max(optionAwareness.hesitationStrength + hesitationDelta, 0.0), 1.0)
  const newConfidence = Math.min(Math.max(optionAwareness.confidence + confidenceDelta, 0.0), 1.0)
  const newBridgePossible = optionAwareness.bridgeOptionPossible || (bridgeDelta > 0.05)

  return {
    optionAwareness: {
      ...optionAwareness,
      hesitationStrength: newHesitation,
      confidence: newConfidence,
      bridgeOptionPossible: newBridgePossible,
    },
    influenceNotes,
  }
}
