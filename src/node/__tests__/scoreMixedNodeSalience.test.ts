/**
 * Score Mixed Node Salience Tests
 * Phase M5: Mixed-Selective Latent Pool
 */

import { describe, it, expect } from 'vitest'
import { scoreMixedNodeSalience } from '../scoreMixedNodeSalience'
import { createDefaultInteroceptiveState } from '../../interoception/interoceptiveState'
import { createDefaultWorkspaceState } from '../../workspace/workspacePhaseMachine'
import type { MixedLatentNode } from '../mixedNodeTypes'

describe('scoreMixedNodeSalience', () => {
  it('scores salience based on source refs and context', () => {
    const node: MixedLatentNode = {
      id: 'test_1',
      key: 'test_node',
      label: 'Test Node',
      axes: ['affect', 'body'],
      salience: 0.5,
      coherence: 0.5,
      novelty: 0.5,
      sessionLocal: true,
      sourceRefs: [
        { sourceType: 'proto', id: 'proto1', weight: 0.7 },
        { sourceType: 'interoception', id: 'intero1', weight: 0.5 },
      ],
      tags: ['fatigue'],
      generatedAtTurn: 1,
    }

    const workspace = createDefaultWorkspaceState()
    const interoception = createDefaultInteroceptiveState()
    interoception.energy = 0.3 // Low energy matches fatigue tag

    const scored = scoreMixedNodeSalience({
      node,
      workspace,
      interoception,
      surprise: 0.6,
    })

    expect(scored.salience).toBeGreaterThan(node.salience)
    expect(scored.coherence).toBeGreaterThan(0)
    expect(scored.coherence).toBeLessThanOrEqual(1.0)
    expect(scored.novelty).toBeGreaterThan(0)
    expect(scored.novelty).toBeLessThanOrEqual(1.0)
  })

  it('increases coherence with multiple source types', () => {
    const node: MixedLatentNode = {
      id: 'test_2',
      key: 'multi_source',
      label: 'Multi Source Node',
      axes: ['affect', 'goal', 'body'],
      salience: 0.5,
      coherence: 0.5,
      novelty: 0.5,
      sessionLocal: true,
      sourceRefs: [
        { sourceType: 'proto', id: 'proto1', weight: 0.6 },
        { sourceType: 'option', id: 'opt1', weight: 0.5 },
        { sourceType: 'workspace', id: 'ws1', weight: 0.4 },
        { sourceType: 'interoception', id: 'intero1', weight: 0.5 },
      ],
      tags: ['change', 'ambivalence'],
      generatedAtTurn: 1,
    }

    const scored = scoreMixedNodeSalience({
      node,
      workspace: createDefaultWorkspaceState(),
      interoception: createDefaultInteroceptiveState(),
    })

    expect(scored.coherence).toBeGreaterThan(0.5)
  })
})
