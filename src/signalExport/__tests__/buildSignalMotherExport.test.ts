import { describe, it, expect } from 'vitest'
import { buildSignalMotherExport } from '../buildSignalMotherExport'
import { validateSignalMotherExport } from '../validateSignalMotherExport'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'
import type { SignalPromotionReadiness } from '../../signalPromotion/signalPromotionReadinessTypes'

describe('buildSignalMotherExport', () => {
  it('should create export package from ready candidates', () => {
    const branch = createInitialSignalPersonalBranch()

    const candidates: SignalPromotionReadiness[] = [
      {
        targetId: 'asm1',
        targetType: 'assembly',
        readinessScore: 0.9,
        recurrenceScore: 0.8,
        replayScore: 0.7,
        recallScore: 0.6,
        stabilityScore: 0.9,
        teacherIndependenceScore: 1.0,
        noiseRisk: 0.1,
        recommendedAction: 'candidate_for_mother_export',
        notes: [],
      },
      {
        targetId: 'bridge1',
        targetType: 'bridge',
        readinessScore: 0.5,
        recurrenceScore: 0.4,
        replayScore: 0.3,
        recallScore: 0.4,
        stabilityScore: 0.5,
        teacherIndependenceScore: 0.3,
        noiseRisk: 0.4,
        recommendedAction: 'wait',
        notes: [],
      },
    ]

    const exportPackage = buildSignalMotherExport(branch, candidates)

    expect(exportPackage.items.length).toBe(1)
    expect(exportPackage.items[0].itemType).toBe('assembly')
    expect(exportPackage.summary.assemblyCount).toBe(1)
    expect(exportPackage.summary.averageReadiness).toBeGreaterThan(0.7)
  })

  it('should filter out high teacher dependency bridges', () => {
    const branch = createInitialSignalPersonalBranch()

    const candidates: SignalPromotionReadiness[] = [
      {
        targetId: 'bridge1',
        targetType: 'bridge',
        readinessScore: 0.8,
        recurrenceScore: 0.7,
        replayScore: 0.6,
        recallScore: 0.7,
        stabilityScore: 0.8,
        teacherIndependenceScore: 0.3, // Low independence
        noiseRisk: 0.2,
        recommendedAction: 'candidate_for_mother_export',
        notes: [],
      },
    ]

    const exportPackage = buildSignalMotherExport(branch, candidates)

    expect(exportPackage.items.length).toBe(0)
  })
})

describe('validateSignalMotherExport', () => {
  it('should validate a good export package', () => {
    const exportPackage = {
      id: 'export1',
      createdAt: Date.now(),
      sourceBranchId: 'branch1',
      items: [
        {
          id: 'item1',
          sourceMode: 'signal_mode' as const,
          itemType: 'assembly' as const,
          sourceId: 'asm1',
          readinessScore: 0.9,
          stabilityScore: 0.9,
          notes: [],
        },
      ],
      summary: {
        itemCount: 1,
        assemblyCount: 1,
        bridgeCount: 0,
        protoSeedCount: 0,
        averageReadiness: 0.9,
      },
    }

    const validation = validateSignalMotherExport(exportPackage)

    expect(validation.isValid).toBe(true)
    expect(validation.errors).toEqual([])
  })

  it('should detect empty packages', () => {
    const exportPackage = {
      id: 'export1',
      createdAt: Date.now(),
      sourceBranchId: 'branch1',
      items: [],
      summary: {
        itemCount: 0,
        assemblyCount: 0,
        bridgeCount: 0,
        protoSeedCount: 0,
        averageReadiness: 0,
      },
    }

    const validation = validateSignalMotherExport(exportPackage)

    expect(validation.isValid).toBe(false)
    expect(validation.errors.length).toBeGreaterThan(0)
  })

  it('should warn about high teacher dependency', () => {
    const exportPackage = {
      id: 'export1',
      createdAt: Date.now(),
      sourceBranchId: 'branch1',
      items: [
        {
          id: 'item1',
          sourceMode: 'signal_mode' as const,
          itemType: 'bridge' as const,
          sourceId: 'bridge1',
          readinessScore: 0.8,
          stabilityScore: 0.7,
          teacherDependencyScore: 0.9,
          notes: [],
        },
      ],
      summary: {
        itemCount: 1,
        assemblyCount: 0,
        bridgeCount: 1,
        protoSeedCount: 0,
        averageReadiness: 0.8,
      },
    }

    const validation = validateSignalMotherExport(exportPackage)

    expect(validation.warnings.length).toBeGreaterThan(0)
    expect(validation.warnings.some(w => w.includes('teacher dependency'))).toBe(true)
  })
})
