/**
 * Apply Mixed Nodes to Proto Meanings
 * Phase M5: Mixed-Selective Latent Pool
 *
 * Dominant mixed nodes subtly deepen proto meanings without replacing them.
 */

import type { ProtoMeaning } from '../meaning/types'
import type { MixedLatentNode, MixedNodeInfluenceNote } from './mixedNodeTypes'

export type ApplyMixedNodesToProtoInput = {
  sensoryProtoMeanings: ProtoMeaning[]
  narrativeProtoMeanings: ProtoMeaning[]
  dominantMixedNodes: MixedLatentNode[]
}

export type ApplyMixedNodesToProtoResult = {
  sensoryProtoMeanings: ProtoMeaning[]
  narrativeProtoMeanings: ProtoMeaning[]
  influenceNotes: MixedNodeInfluenceNote[]
}

/**
 * Apply mixed nodes to proto meanings.
 * Mixed nodes deepen narrative proto meanings by foregrounding intersection states.
 *
 * Examples:
 * - wish_to_open_but_guarded → foreground "まだ閉じている" but also "完全には閉じていない"
 * - change_pull_with_ambivalence → strengthen option-comparison narratives
 * - fatigue_under_expectation → foreground "期待圧の下での消耗" rather than just heaviness
 */
export const applyMixedNodesToProto = (input: ApplyMixedNodesToProtoInput): ApplyMixedNodesToProtoResult => {
  const { sensoryProtoMeanings, narrativeProtoMeanings, dominantMixedNodes } = input

  const influenceNotes: MixedNodeInfluenceNote[] = []

  // Sensory proto meanings are left unchanged
  // Mixed nodes primarily affect narrative meanings

  const modifiedNarrative = narrativeProtoMeanings.map((proto) => {
    let strengthDelta = 0.0

    for (const mixedNode of dominantMixedNodes) {
      // Check if this proto meaning relates to the mixed node's tags
      const relatedTags = mixedNode.tags.filter((tag) =>
        proto.glossJa.includes(tag) ||
        proto.toneTags?.some((t) => t.includes(tag))
      )

      if (relatedTags.length > 0) {
        // Boost strength slightly based on mixed node salience
        const boost = mixedNode.salience * 0.1 * relatedTags.length
        strengthDelta += boost

        influenceNotes.push({
          nodeId: mixedNode.id,
          target: 'proto',
          delta: boost,
          reason: `${mixedNode.key} boosted narrative "${proto.glossJa}" (tags: ${relatedTags.join(', ')})`,
        })
      }

      // Specific mixed node effects
      if (mixedNode.key === 'wish_to_open_but_guarded') {
        if (proto.glossJa.includes('閉') || proto.glossJa.includes('守')) {
          strengthDelta += mixedNode.salience * 0.08
          influenceNotes.push({
            nodeId: mixedNode.id,
            target: 'proto',
            delta: mixedNode.salience * 0.08,
            reason: `${mixedNode.key} foregrounded closure/protection narrative`,
          })
        }
      } else if (mixedNode.key === 'change_pull_with_ambivalence') {
        if (proto.glossJa.includes('変') || proto.glossJa.includes('違') || proto.glossJa.includes('選')) {
          strengthDelta += mixedNode.salience * 0.12
          influenceNotes.push({
            nodeId: mixedNode.id,
            target: 'proto',
            delta: mixedNode.salience * 0.12,
            reason: `${mixedNode.key} strengthened change/choice narrative`,
          })
        }
      } else if (mixedNode.key === 'fatigue_under_expectation') {
        if (proto.glossJa.includes('重') || proto.glossJa.includes('疲') || proto.glossJa.includes('圧')) {
          strengthDelta += mixedNode.salience * 0.1
          influenceNotes.push({
            nodeId: mixedNode.id,
            target: 'proto',
            delta: mixedNode.salience * 0.1,
            reason: `${mixedNode.key} deepened heaviness/fatigue narrative`,
          })
        }
      }
    }

    // Apply delta with cap
    const newStrength = Math.min(proto.strength + strengthDelta, 1.0)
    return {
      ...proto,
      strength: newStrength,
    }
  })

  return {
    sensoryProtoMeanings,
    narrativeProtoMeanings: modifiedNarrative,
    influenceNotes,
  }
}
