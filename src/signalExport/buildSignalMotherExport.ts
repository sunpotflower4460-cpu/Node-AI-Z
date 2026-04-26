import type {
  SignalMotherExportItem,
  SignalMotherExportPackage,
} from './signalMotherExportTypes'
import type { SignalPromotionReadiness } from '../signalPromotion/signalPromotionReadinessTypes'
import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'

/**
 * Build a Mother export package from promotion readiness candidates.
 *
 * Selects items that are:
 * - Recommended for mother export
 * - High readiness score (> 0.7)
 * - Low noise risk (< 0.3)
 * - Low teacher dependency (if applicable)
 *
 * Does NOT actually send to Mother - just creates the package.
 */
export function buildSignalMotherExport(
  branch: SignalPersonalBranch,
  readinessCandidates: SignalPromotionReadiness[],
): SignalMotherExportPackage {
  const exportItems: SignalMotherExportItem[] = []

  // Filter candidates that are ready for mother export
  const readyCandidates = readinessCandidates.filter(
    r =>
      r.recommendedAction === 'candidate_for_mother_export' &&
      r.readinessScore > 0.7 &&
      r.noiseRisk < 0.3,
  )

  for (const candidate of readyCandidates) {
    // Additional filter: reject high teacher dependency bridges
    if (
      candidate.targetType === 'bridge' &&
      candidate.teacherIndependenceScore < 0.5
    ) {
      continue
    }

    // Build export item
    const item: SignalMotherExportItem = {
      id: `export-${candidate.targetId}-${Date.now()}`,
      sourceMode: 'signal_mode',
      itemType: candidate.targetType,
      sourceId: candidate.targetId,
      readinessScore: candidate.readinessScore,
      stabilityScore: candidate.stabilityScore,
      notes: [...candidate.notes],
    }

    // Add optional fields based on type
    if (candidate.targetType === 'bridge') {
      item.teacherDependencyScore = 1.0 - candidate.teacherIndependenceScore
      item.recallSuccessScore = candidate.recallScore
    }

    if (candidate.targetType === 'assembly' || candidate.targetType === 'proto_seed') {
      item.recurrenceCount = Math.round(candidate.recurrenceScore * 10)
    }

    // Add label candidate if available
    if (candidate.targetType === 'proto_seed') {
      const protoSeed = branch.protoSeedRecords.find(
        p => p.protoSeedId === candidate.targetId,
      )
      if (protoSeed?.labelCandidate) {
        item.labelCandidate = protoSeed.labelCandidate
      }
    }

    exportItems.push(item)
  }

  // Compute summary
  const assemblyCount = exportItems.filter(i => i.itemType === 'assembly').length
  const bridgeCount = exportItems.filter(i => i.itemType === 'bridge').length
  const protoSeedCount = exportItems.filter(i => i.itemType === 'proto_seed').length

  const averageReadiness =
    exportItems.length > 0
      ? exportItems.reduce((sum, i) => sum + i.readinessScore, 0) /
        exportItems.length
      : 0

  return {
    id: `mother-export-${branch.id}-${Date.now()}`,
    createdAt: Date.now(),
    sourceBranchId: branch.id,
    items: exportItems,
    summary: {
      itemCount: exportItems.length,
      assemblyCount,
      bridgeCount,
      protoSeedCount,
      averageReadiness,
    },
  }
}
