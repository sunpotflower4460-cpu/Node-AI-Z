/**
 * Select Dominant Mixed Nodes Tests
 * Phase M5: Mixed-Selective Latent Pool
 */

import { describe, it, expect } from 'vitest'
import { selectDominantMixedNodes } from '../selectDominantMixedNodes'
import { createDefaultInteroceptiveState } from '../../interoception/interoceptiveState'
import { createDefaultWorkspaceState } from '../../workspace/workspacePhaseMachine'
import type { MixedLatentNode } from '../mixedNodeTypes'

describe('selectDominantMixedNodes', () => {
  it('selects dominant nodes from candidates', () => {
    const nodes: MixedLatentNode[] = [
      {
        id: 'node_1',
        key: 'high_salience',
        label: 'High Salience Node',
        axes: ['affect'],
        salience: 0.9,
        coherence: 0.8,
        novelty: 0.3,
        sessionLocal: true,
        sourceRefs: [],
        tags: [],
        generatedAtTurn: 1,
      },
      {
        id: 'node_2',
        key: 'low_salience',
        label: 'Low Salience Node',
        axes: ['body'],
        salience: 0.3,
        coherence: 0.4,
        novelty: 0.6,
        sessionLocal: true,
        sourceRefs: [],
        tags: [],
        generatedAtTurn: 1,
      },
      {
        id: 'node_3',
        key: 'medium_salience',
        label: 'Medium Salience Node',
        axes: ['goal'],
        salience: 0.6,
        coherence: 0.7,
        novelty: 0.4,
        sessionLocal: true,
        sourceRefs: [],
        tags: [],
        generatedAtTurn: 1,
      },
    ]

    const result = selectDominantMixedNodes({
      allNodes: nodes,
      workspace: createDefaultWorkspaceState(),
      interoception: createDefaultInteroceptiveState(),
    })

    expect(result.allNodes).toHaveLength(3)
    expect(result.dominantNodes.length).toBeGreaterThan(0)
    expect(result.dominantNodes.length).toBeLessThanOrEqual(3)
    expect(result.notes.length).toBeGreaterThan(0)

    // High salience node should be dominant
    expect(result.dominantNodes).toContain(nodes[0])
  })

  it('limits dominant nodes to 1-3', () => {
    const nodes: MixedLatentNode[] = Array.from({ length: 10 }, (_, i) => ({
      id: `node_${i}`,
      key: `test_${i}`,
      label: `Test Node ${i}`,
      axes: ['affect'],
      salience: 0.5 + (i * 0.05),
      coherence: 0.5,
      novelty: 0.5,
      sessionLocal: true,
      sourceRefs: [],
      tags: [],
      generatedAtTurn: 1,
    }))

    const result = selectDominantMixedNodes({
      allNodes: nodes,
      workspace: createDefaultWorkspaceState(),
      interoception: createDefaultInteroceptiveState(),
    })

    expect(result.dominantNodes.length).toBeGreaterThanOrEqual(1)
    expect(result.dominantNodes.length).toBeLessThanOrEqual(3)
  })
})
