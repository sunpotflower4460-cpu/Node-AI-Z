/**
 * Mixed Node Composer
 * Phase M5: Mixed-Selective Latent Pool
 *
 * Generates mixed latent nodes from current turn state.
 * Mixed nodes represent intersections of affect/goal/relation/body/context/temporal,
 * not single-label states.
 */

import type { FusedState } from '../fusion/types'
import type { ProtoMeaning } from '../meaning/types'
import type { OptionAwareness } from '../option/types'
import type { InteroceptiveState } from '../interoception/interoceptiveState'
import type { WorkspaceState } from '../workspace/workspacePhaseMachine'
import type { SchemaMemoryState } from '../memory/types'
import type { MixedLatentNode, MixedNodeSourceRef } from './mixedNodeTypes'
import { CONTEXTUAL_NODE_TEMPLATES } from './contextualNodeTemplates'

export type ComposeMixedNodesInput = {
  fusedState: FusedState
  sensoryProtoMeanings: ProtoMeaning[]
  narrativeProtoMeanings: ProtoMeaning[]
  optionAwareness?: OptionAwareness
  workspace: WorkspaceState
  interoception: InteroceptiveState
  schemaMemory?: SchemaMemoryState
  currentTurn: number
}

const createObservationId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }
  const highResolutionTime = typeof performance !== 'undefined' ? performance.now().toFixed(5) : '0'
  return `${prefix}_${Date.now()}_${highResolutionTime}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Compose mixed latent nodes from current turn state.
 * Returns 3-8 candidates based on contextual templates.
 */
export const composeMixedNodes = (input: ComposeMixedNodesInput): MixedLatentNode[] => {
  const {
    fusedState,
    sensoryProtoMeanings,
    narrativeProtoMeanings,
    optionAwareness,
    workspace,
    interoception,
    schemaMemory,
    currentTurn,
  } = input

  const context = {
    fusedState,
    sensoryProtoMeanings,
    narrativeProtoMeanings,
    optionAwareness,
    interoception,
    workspace,
  }

  const mixedNodes: MixedLatentNode[] = []

  // Run each template and generate candidate nodes
  for (const template of CONTEXTUAL_NODE_TEMPLATES) {
    if (template.condition(context)) {
      const weight = template.extractWeight(context)

      // Only generate if weight is significant
      if (weight > 0.3) {
        // Build source refs
        const sourceRefs: MixedNodeSourceRef[] = []

        // Add fused state as source
        sourceRefs.push({
          sourceType: 'signal',
          id: 'fused_state',
          weight: fusedState.fusedConfidence * 0.3,
        })

        // Add strong proto meanings as sources
        const strongSensory = sensoryProtoMeanings.filter((p) => p.strength > 0.5)
        for (const proto of strongSensory.slice(0, 2)) {
          sourceRefs.push({
            sourceType: 'proto',
            id: proto.id,
            weight: proto.strength * 0.2,
          })
        }

        const strongNarrative = narrativeProtoMeanings.filter((p) => p.strength > 0.5)
        for (const proto of strongNarrative.slice(0, 2)) {
          sourceRefs.push({
            sourceType: 'proto',
            id: proto.id,
            weight: proto.strength * 0.25,
          })
        }

        // Add option awareness if available
        if (optionAwareness && optionAwareness.confidence > 0.4) {
          sourceRefs.push({
            sourceType: 'option',
            id: optionAwareness.dominantOptionId || 'option_field',
            weight: optionAwareness.confidence * 0.2,
          })
        }

        // Add workspace if holding items
        if (workspace.heldItems.length > 0) {
          const strongestHeld = workspace.heldItems.reduce((max, item) =>
            item.strength > max.strength ? item : max
          , workspace.heldItems[0])
          sourceRefs.push({
            sourceType: 'workspace',
            id: strongestHeld.id,
            weight: strongestHeld.strength * 0.15,
          })
        }

        // Add interoception
        sourceRefs.push({
          sourceType: 'interoception',
          id: 'interoceptive_state',
          weight: 0.2,
        })

        // Add schema if template key exists in schema
        if (schemaMemory) {
          const matchingSchema = schemaMemory.patterns.find((p) => p.key.includes(template.key))
          if (matchingSchema) {
            sourceRefs.push({
              sourceType: 'schema',
              id: matchingSchema.id,
              weight: matchingSchema.strength * 0.15,
            })
          }
        }

        // Create mixed node
        const mixedNode: MixedLatentNode = {
          id: createObservationId('mixed'),
          key: template.key,
          label: template.label,
          axes: template.axes,
          salience: weight, // Initial salience from template weight
          coherence: 0.0,   // Will be calculated by scoreMixedNodeSalience
          novelty: 0.0,     // Will be calculated by scoreMixedNodeSalience
          sessionLocal: true,
          sourceRefs,
          tags: template.tags,
          generatedAtTurn: currentTurn,
        }

        mixedNodes.push(mixedNode)
      }
    }
  }

  return mixedNodes
}
