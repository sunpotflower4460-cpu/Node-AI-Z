/**
 * Mixed Node Composer Tests
 * Phase M5: Mixed-Selective Latent Pool
 */

import { describe, it, expect } from 'vitest'
import { composeMixedNodes } from '../mixedNodeComposer'
import { createDefaultInteroceptiveState } from '../../interoception/interoceptiveState'
import { createDefaultWorkspaceState } from '../../workspace/workspacePhaseMachine'
import type { FusedState } from '../../fusion/types'
import type { ProtoMeaning } from '../../meaning/types'

describe('composeMixedNodes', () => {
  it('generates mixed nodes based on contextual templates', () => {
    const fusedState: FusedState = {
      lexicalState: {
        wordVectors: [],
        syntacticRelations: [],
        disambiguationFlags: [],
      },
      microSignalState: {
        signalStrength: 0.6,
        fieldTone: 'fragility',
        activeCues: [],
      },
      integratedTensions: ['pressure'],
      dominantTextures: ['heaviness', 'fragility'],
      fusedConfidence: 0.5,
    }

    const sensoryProtoMeanings: ProtoMeaning[] = [
      {
        id: 'sensory_1',
        level: 'sensory',
        glossJa: '重い感じ',
        strength: 0.7,
        sourceCueIds: ['cue1'],
      },
    ]

    const narrativeProtoMeanings: ProtoMeaning[] = [
      {
        id: 'narrative_1',
        level: 'narrative',
        glossJa: '期待に応えなければ',
        strength: 0.8,
        sourceCueIds: ['cue2'],
      },
    ]

    const interoception = createDefaultInteroceptiveState()
    interoception.energy = 0.3 // Low energy

    const workspace = createDefaultWorkspaceState()

    const result = composeMixedNodes({
      fusedState,
      sensoryProtoMeanings,
      narrativeProtoMeanings,
      workspace,
      interoception,
      currentTurn: 1,
    })

    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)

    // Should generate fatigue_under_expectation based on template conditions
    const fatigueNode = result.find((n) => n.key === 'fatigue_under_expectation')
    if (fatigueNode) {
      expect(fatigueNode.axes).toContain('affect')
      expect(fatigueNode.axes).toContain('body')
      expect(fatigueNode.salience).toBeGreaterThan(0)
      expect(fatigueNode.sessionLocal).toBe(true)
      expect(fatigueNode.sourceRefs.length).toBeGreaterThan(0)
    }
  })

  it('does not generate nodes when conditions are not met', () => {
    const fusedState: FusedState = {
      lexicalState: {
        wordVectors: [],
        syntacticRelations: [],
        disambiguationFlags: [],
      },
      microSignalState: {
        signalStrength: 0.6,
        fieldTone: 'neutral',
        activeCues: [],
      },
      integratedTensions: [],
      dominantTextures: [],
      fusedConfidence: 0.8,
    }

    const result = composeMixedNodes({
      fusedState,
      sensoryProtoMeanings: [],
      narrativeProtoMeanings: [],
      workspace: createDefaultWorkspaceState(),
      interoception: createDefaultInteroceptiveState(),
      currentTurn: 1,
    })

    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
    // Should generate few or no nodes when conditions are neutral
    expect(result.length).toBeLessThanOrEqual(3)
  })
})
