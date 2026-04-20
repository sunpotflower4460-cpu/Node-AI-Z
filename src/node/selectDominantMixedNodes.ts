/**
 * Select Dominant Mixed Nodes
 * Phase M5: Mixed-Selective Latent Pool
 *
 * Separates dominant mixed nodes from suppressed ones based on
 * workspace gate mode, precision control, and interoception.
 */

import type { MixedLatentNode, MixedNodeSelectionResult } from './mixedNodeTypes'
import type { PrecisionControl } from '../brain/precisionTypes'
import type { WorkspaceState } from '../workspace/workspacePhaseMachine'
import type { InteroceptiveState } from '../interoception/interoceptiveState'

export type SelectDominantMixedNodesInput = {
  allNodes: MixedLatentNode[]
  precisionControl?: PrecisionControl
  workspace: WorkspaceState
  interoception: InteroceptiveState
}

/**
 * Select dominant mixed nodes from all candidates.
 *
 * Selection rules by workspace phase:
 * - hold: Prioritize nodes connected to unresolved items, suppress high-novelty
 * - update: Prioritize balanced salience+coherence
 * - shield: Prioritize fragility-protective nodes, suppress strong/complex
 * - flush: Suppress low-coherence, favor cleanup
 *
 * Limit dominant to 1-3 nodes.
 */
export const selectDominantMixedNodes = (input: SelectDominantMixedNodesInput): MixedNodeSelectionResult => {
  const { allNodes, precisionControl, workspace, interoception } = input

  if (allNodes.length === 0) {
    return {
      allNodes: [],
      dominantNodes: [],
      suppressedNodes: [],
      notes: ['No mixed nodes generated'],
    }
  }

  const notes: string[] = []
  const gateMode = workspace.phase

  // Score each node for dominance based on gate mode
  const scoredNodes = allNodes.map((node) => {
    let dominanceScore = 0.0

    // Base score from salience and coherence
    dominanceScore += node.salience * 0.4
    dominanceScore += node.coherence * 0.3

    // Mode-specific adjustments
    if (gateMode === 'hold') {
      // Hold: prefer nodes connected to workspace, suppress novelty
      const hasWorkspaceSource = node.sourceRefs.some((ref) => ref.sourceType === 'workspace')
      if (hasWorkspaceSource) {
        dominanceScore += 0.2
        notes.push(`${node.key}: boosted for workspace connection in hold mode`)
      }
      // Suppress high novelty
      if (node.novelty > 0.7) {
        dominanceScore -= 0.15
        notes.push(`${node.key}: suppressed for high novelty in hold mode`)
      }
    } else if (gateMode === 'encode') {
      // Update/encode: prefer balanced salience+coherence
      const balance = 1.0 - Math.abs(node.salience - node.coherence)
      dominanceScore += balance * 0.15
      notes.push(`${node.key}: balance score +${balance.toFixed(2)} in encode mode`)
    } else if (gateMode === 'block') {
      // Shield/block: prefer protective nodes, suppress complex
      if (node.tags.includes('protect') || node.tags.includes('fragility')) {
        dominanceScore += 0.25
        notes.push(`${node.key}: boosted for protective quality in block mode`)
      }
      if (node.axes.length > 4) {
        dominanceScore -= 0.2
        notes.push(`${node.key}: suppressed for complexity in block mode`)
      }
    } else if (gateMode === 'release') {
      // Flush: suppress low coherence
      if (node.coherence < 0.4) {
        dominanceScore -= 0.3
        notes.push(`${node.key}: suppressed for low coherence in release mode`)
      }
    }

    // Precision control adjustments
    if (precisionControl) {
      // High precision = prefer high coherence
      if (precisionControl.sensoryPrecision > 0.7 && node.coherence > 0.6) {
        dominanceScore += 0.1
        notes.push(`${node.key}: boosted for coherence under high precision`)
      }
      // Low precision = suppress novelty
      if (precisionControl.sensoryPrecision < 0.4 && node.novelty > 0.7) {
        dominanceScore -= 0.15
        notes.push(`${node.key}: suppressed for novelty under low precision`)
      }
    }

    // Interoception adjustments
    // Low energy = prefer low-energy nodes
    if (interoception.energy < 0.4 && node.tags.includes('fatigue')) {
      dominanceScore += 0.15
      notes.push(`${node.key}: boosted for fatigue tag under low energy`)
    }
    // Low safety = prefer protective nodes
    if (interoception.socialSafety < 0.4 && (node.tags.includes('protect') || node.tags.includes('guard'))) {
      dominanceScore += 0.15
      notes.push(`${node.key}: boosted for protective quality under low safety`)
    }

    return { node, dominanceScore }
  })

  // Sort by dominance score
  scoredNodes.sort((a, b) => b.dominanceScore - a.dominanceScore)

  // Select top 1-3 as dominant
  const dominantCount = Math.min(3, Math.max(1, Math.floor(scoredNodes.length / 3)))
  const dominantNodes = scoredNodes.slice(0, dominantCount).map((s) => s.node)
  const suppressedNodes = scoredNodes.slice(dominantCount).map((s) => s.node)

  notes.push(`Selected ${dominantNodes.length} dominant nodes from ${allNodes.length} candidates`)
  notes.push(`Suppressed ${suppressedNodes.length} nodes`)

  return {
    allNodes,
    dominantNodes,
    suppressedNodes,
    notes,
  }
}
