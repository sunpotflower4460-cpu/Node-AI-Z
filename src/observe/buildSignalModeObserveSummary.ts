import type { SignalModeRuntimeResult } from '../runtime/runSignalModeRuntime'
import type { SignalBranchSummary } from '../signalBranch/buildSignalBranchSummary'
import { buildSignalBranchSummary } from '../signalBranch/buildSignalBranchSummary'

/**
 * Signal Mode Observe Summary
 *
 * Comprehensive observation data for Signal Mode, including:
 * - Signal Field state (particles, assemblies, bridges)
 * - Personal Branch learning (experience, teacher dependency)
 * - Loop dynamics (self-echo, boundary tension, prediction residue)
 */
export type SignalModeObserveSummary = {
  // Signal Field
  field: {
    activeParticleCount: number
    assemblyCount: number
    bridgeCount: number
    protoMeaningSeedCount: number
    mixedLatentSeedCount: number
    replayTriggered: boolean
    frameCount: number
  }

  // Personal Branch
  branch: SignalBranchSummary

  // Loop State
  loop: {
    selfEchoStrength: number
    replayTendency: number
    baselineActivation: number
    boundaryTension: number
    predictionResidue: number
    sourceBalance: {
      external: number
      internal: number
      teacher: number
    }
  }

  // Summary Insights
  insights: {
    isTeacherDependent: boolean
    hasStablePatterns: boolean
    isInternallyDriven: boolean
    surpriseLevel: 'low' | 'medium' | 'high'
  }
}

/**
 * Build Signal Mode Observe Summary.
 *
 * Combines Signal Field, Personal Branch, and Loop State data
 * into a comprehensive observation summary for display/logging.
 */
export function buildSignalModeObserveSummary(
  result: SignalModeRuntimeResult,
): SignalModeObserveSummary {
  const branchSummary = buildSignalBranchSummary(result.personalBranch)

  // Compute insights
  const isTeacherDependent = branchSummary.averageTeacherDependency > 0.6
  const hasStablePatterns = branchSummary.mostStableAssemblies.length > 0
  const isInternallyDriven =
    result.loopState.boundaryLoop.sourceBalance.internal +
      result.loopState.boundaryLoop.sourceBalance.teacher >
    result.loopState.boundaryLoop.sourceBalance.external

  const surpriseLevel: 'low' | 'medium' | 'high' =
    result.loopState.boundaryLoop.predictionResidue < 0.3
      ? 'low'
      : result.loopState.boundaryLoop.predictionResidue < 0.6
        ? 'medium'
        : 'high'

  return {
    field: {
      activeParticleCount: result.observe.fieldSummary.activeParticleCount,
      assemblyCount: result.observe.fieldSummary.assemblyCount,
      bridgeCount: result.observe.fieldSummary.bridgeCount,
      protoMeaningSeedCount: result.observe.fieldSummary.protoMeaningSeedCount,
      mixedLatentSeedCount: result.observe.fieldSummary.mixedLatentSeedCount,
      replayTriggered: result.observe.fieldSummary.replayTriggered,
      frameCount: result.fieldState.frameCount,
    },

    branch: branchSummary,

    loop: {
      selfEchoStrength: result.loopState.selfLoop.selfEchoStrength,
      replayTendency: result.loopState.selfLoop.replayTendency,
      baselineActivation: result.loopState.selfLoop.baselineActivation,
      boundaryTension: result.loopState.boundaryLoop.boundaryTension,
      predictionResidue: result.loopState.boundaryLoop.predictionResidue,
      sourceBalance: {
        external: result.loopState.boundaryLoop.sourceBalance.external,
        internal: result.loopState.boundaryLoop.sourceBalance.internal,
        teacher: result.loopState.boundaryLoop.sourceBalance.teacher,
      },
    },

    insights: {
      isTeacherDependent,
      hasStablePatterns,
      isInternallyDriven,
      surpriseLevel,
    },
  }
}
