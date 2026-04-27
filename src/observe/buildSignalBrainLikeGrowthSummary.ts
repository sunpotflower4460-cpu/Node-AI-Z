import type { SignalConsolidationState } from '../signalConsolidation/signalConsolidationTypes'
import type { SignalAttentionBudget, AttentionAllocation } from '../signalAttention/signalAttentionTypes'
import type { SignalCompetitionResult } from '../signalInhibition/signalInhibitionTypes'
import type { SignalPromotionReadinessSummary } from '../signalPromotion/signalPromotionReadinessTypes'
import type { SignalMotherExportPackage } from '../signalExport/signalMotherExportTypes'

/**
 * Signal Brain-Like Growth Summary
 *
 * Comprehensive summary of brain-like features:
 * - Consolidation (resting replay)
 * - Attention budget (energy/fatigue)
 * - Inhibition (competition)
 * - Promotion readiness
 * - Mother export
 */
export type SignalBrainLikeGrowthSummary = {
  consolidation: {
    lastConsolidatedAt: number
    consolidationCount: number
    recentReplayCount: number
    strengthenedCount: number
    weakenedCount: number
    replaySuccessRate: number
    prunedLinkCount: number
  }

  attention: {
    totalBudget: number
    availableBudget: number
    fatigue: number
    recovery: number
    learningRateMultiplier: number
    allocation: AttentionAllocation
  }

  inhibition: {
    dominantCount: number
    coactiveCount: number
    suppressedCount: number
    inhibitionStrength: number
    dominantAssemblyIds: string[]
  }

  promotionReadiness: SignalPromotionReadinessSummary

  motherExport: {
    packageId: string
    itemCount: number
    assemblyCount: number
    bridgeCount: number
    protoSeedCount: number
    averageReadiness: number
    isValid: boolean
    warnings: string[]
  }
}

/**
 * Build Signal Brain-Like Growth Summary.
 *
 * Combines all brain-like growth features into a comprehensive summary
 * for observation and display.
 */
export function buildSignalBrainLikeGrowthSummary(
  consolidation: SignalConsolidationState,
  attentionBudget: SignalAttentionBudget,
  attentionAllocation: AttentionAllocation,
  competition: SignalCompetitionResult,
  promotionReadiness: SignalPromotionReadinessSummary,
  motherExport: SignalMotherExportPackage,
  motherExportValidation: {
    isValid: boolean
    warnings: string[]
    errors: string[]
  },
): SignalBrainLikeGrowthSummary {
  return {
    consolidation: {
      lastConsolidatedAt: consolidation.lastConsolidatedAt,
      consolidationCount: consolidation.consolidationCount,
      recentReplayCount: consolidation.recentReplayAssemblyIds.length,
      strengthenedCount: consolidation.strengthenedAssemblyIds.length,
      weakenedCount: consolidation.weakenedBridgeIds.length,
      replaySuccessRate: consolidation.recentReplayAssemblyIds.length > 0
        ? consolidation.strengthenedAssemblyIds.length / consolidation.recentReplayAssemblyIds.length
        : 0,
      prunedLinkCount: consolidation.prunedLinkCount,
    },

    attention: {
      totalBudget: attentionBudget.totalBudget,
      availableBudget: attentionBudget.availableBudget,
      fatigue: attentionBudget.fatigue,
      recovery: attentionBudget.recovery,
      learningRateMultiplier: attentionBudget.learningRateMultiplier,
      allocation: attentionAllocation,
    },

    inhibition: {
      dominantCount: competition.dominantAssemblyIds.length,
      coactiveCount: competition.coactiveAssemblyIds.length,
      suppressedCount: competition.suppressedAssemblyIds.length,
      inhibitionStrength: competition.inhibitionStrength,
      dominantAssemblyIds: competition.dominantAssemblyIds,
    },

    promotionReadiness,

    motherExport: {
      packageId: motherExport.id,
      itemCount: motherExport.summary.itemCount,
      assemblyCount: motherExport.summary.assemblyCount,
      bridgeCount: motherExport.summary.bridgeCount,
      protoSeedCount: motherExport.summary.protoSeedCount,
      averageReadiness: motherExport.summary.averageReadiness,
      isValid: motherExportValidation.isValid,
      warnings: motherExportValidation.warnings,
    },
  }
}
