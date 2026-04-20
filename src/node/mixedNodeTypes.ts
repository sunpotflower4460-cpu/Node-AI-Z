/**
 * Mixed Node Types
 * Phase M5: Mixed-Selective Latent Pool
 *
 * Mixed nodes represent intersections of multiple axes (affect, goal, relation, body, context, temporal)
 * rather than single-label states. They are dynamically generated from current turn state and
 * can become schema candidates if they recur.
 */

export type MixedNodeAxis =
  | 'affect'
  | 'goal'
  | 'relation'
  | 'body'
  | 'context'
  | 'temporal'

export type MixedNodeSourceRef = {
  sourceType: 'signal' | 'proto' | 'option' | 'workspace' | 'interoception' | 'schema'
  id: string
  weight: number
}

export type MixedLatentNode = {
  id: string
  key: string
  label: string
  axes: MixedNodeAxis[]
  salience: number           // 0.0 - 1.0
  coherence: number          // 0.0 - 1.0
  novelty: number            // 0.0 - 1.0
  sessionLocal: boolean
  sourceRefs: MixedNodeSourceRef[]
  tags: string[]
  generatedAtTurn: number
}

export type MixedNodeSelectionResult = {
  allNodes: MixedLatentNode[]
  dominantNodes: MixedLatentNode[]
  suppressedNodes: MixedLatentNode[]
  notes: string[]
}

export type MixedNodeInfluenceNote = {
  nodeId: string
  target: 'proto' | 'option' | 'decision'
  delta: number
  reason: string
}
