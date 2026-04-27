import { describe, expect, it } from 'vitest'
import { compareAssemblies } from '../compareAssemblies'
import { classifyContrastRelation } from '../classifyContrastRelation'
import { buildContrastSummary } from '../buildContrastSummary'
import { recordContrastExperience } from '../recordContrastExperience'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'

describe('signalContrast', () => {
  it('classifies similar but different assemblies without collapsing them into the same object', () => {
    const comparison = compareAssemblies(
      {
        id: 'assembly_a',
        particleIds: ['p1', 'p2', 'p3'],
        recurrenceCount: 4,
        averageCoactivation: 0.7,
        lastActivatedAt: 1000,
      },
      {
        id: 'assembly_b',
        particleIds: ['p2', 'p3', 'p4'],
        recurrenceCount: 4,
        averageCoactivation: 0.66,
        lastActivatedAt: 1200,
      },
    )

    const classification = classifyContrastRelation(comparison)
    expect(classification.relation).not.toBe('same_object')
    expect(['similar_but_different', 'same_category']).toContain(classification.relation)
    expect(classification.confidence).toBeGreaterThan(0.45)
  })

  it('stores and summarizes contrast experiences', () => {
    const branch = recordContrastExperience(
      createInitialSignalPersonalBranch(),
      [
        {
          id: 'contrast_a_b',
          sourceAssemblyId: 'assembly_a',
          targetAssemblyId: 'assembly_b',
          relation: 'unknown',
          confidence: 0.42,
          teacherAssisted: false,
          selfDiscovered: true,
          recurrenceCount: 1,
          lastUpdatedAt: 1000,
        },
      ],
      1000,
    )

    const summary = buildContrastSummary(branch.contrastRecords)
    expect(summary.totalRecords).toBe(1)
    expect(summary.unclearPairs).toHaveLength(1)
    expect(summary.relationCounts.unknown).toBe(1)
  })
})
