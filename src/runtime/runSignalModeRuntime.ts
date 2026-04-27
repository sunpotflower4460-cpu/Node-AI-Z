import type { SignalFieldState, ParticleStimulus } from '../signalField/signalFieldTypes'
import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalLoopState } from '../signalLoop/signalLoopTypes'
import type { SignalConsolidationState } from '../signalConsolidation/signalConsolidationTypes'
import type { SignalAttentionBudget } from '../signalAttention/signalAttentionTypes'
import { runSignalFieldRuntime } from './runSignalFieldRuntime'
import { createInitialSignalPersonalBranch } from '../signalBranch/createInitialSignalPersonalBranch'
import { recordAssemblyExperience } from '../signalBranch/recordAssemblyExperience'
import { recordBridgeExperience } from '../signalBranch/recordBridgeExperience'
import { updateSignalPersonalBranch } from '../signalBranch/updateSignalPersonalBranch'
import { createInitialSignalLoopState } from '../signalLoop/createInitialSignalLoopState'
import { updateSelfLoop } from '../signalLoop/updateSelfLoop'
import { updateBoundaryLoop } from '../signalLoop/updateBoundaryLoop'
import { computePredictionResidue } from '../signalLoop/computePredictionResidue'
import { classifySignalSource } from '../signalLoop/classifySignalSource'
import { deriveMixedLatentSeeds } from '../signalField/deriveMixedLatentSeeds'
import { deriveProtoMeaningSeeds } from '../signalField/deriveProtoMeaningSeeds'
import { buildSignalFieldSummary } from '../signalField/buildSignalFieldSummary'
import { createConsolidationState } from '../signalConsolidation/createConsolidationState'
import { shouldRunConsolidation } from '../signalConsolidation/shouldRunConsolidation'
import { runRestingReplay } from '../signalConsolidation/runRestingReplay'
import { consolidateSignalBranch } from '../signalConsolidation/consolidateSignalBranch'
import { createInitialAttentionBudget } from '../signalAttention/createInitialAttentionBudget'
import { updateAttentionBudget } from '../signalAttention/updateAttentionBudget'
import { allocateSignalAttention } from '../signalAttention/allocateSignalAttention'
import { computeSignalCompetition } from '../signalInhibition/computeSignalCompetition'
import { applyAssemblySuppression } from '../signalInhibition/applyAssemblySuppression'
import { computeAssemblyPromotionReadiness } from '../signalPromotion/computeAssemblyPromotionReadiness'
import { computeBridgePromotionReadiness } from '../signalPromotion/computeBridgePromotionReadiness'
import { computeProtoSeedPromotionReadiness } from '../signalPromotion/computeProtoSeedPromotionReadiness'
import { buildSignalPromotionReadinessSummary } from '../signalPromotion/buildSignalPromotionReadinessSummary'
import { buildSignalMotherExport } from '../signalExport/buildSignalMotherExport'
import { validateSignalMotherExport } from '../signalExport/validateSignalMotherExport'
import { buildSignalBrainLikeGrowthSummary } from '../observe/buildSignalBrainLikeGrowthSummary'

/**
 * Signal Mode Runtime Input
 *
 * Integrates:
 * - Signal Field (particles, assemblies, bridges)
 * - Personal Branch (learning, experience accumulation)
 * - Self/Boundary Loops (temporal continuity, source awareness)
 */
export type SignalModeRuntimeInput = {
  stimulus: ParticleStimulus
  existingBranch?: SignalPersonalBranch
  existingLoopState?: SignalLoopState
  existingFieldState?: SignalFieldState
  existingConsolidationState?: SignalConsolidationState
  existingAttentionBudget?: SignalAttentionBudget
  enableBindingTeacher?: boolean
  textSummary?: string
  imageSummary?: string
  audioSummary?: string
  isUserActive?: boolean
  recentActivityLevel?: number
}

/**
 * Signal Mode Runtime Result
 *
 * Returns updated states for:
 * - Signal Field
 * - Personal Branch
 * - Loop State
 * - Observation summary
 */
export type SignalModeRuntimeResult = {
  fieldState: SignalFieldState
  personalBranch: SignalPersonalBranch
  loopState: SignalLoopState
  consolidationState: SignalConsolidationState
  attentionBudget: SignalAttentionBudget
  observe: {
    fieldSummary: ReturnType<typeof buildSignalFieldSummary>
    branchSummary: SignalPersonalBranch['summary']
    loopSummary: {
      selfEchoStrength: number
      replayTendency: number
      boundaryTension: number
      predictionResidue: number
    }
    brainLikeGrowth: ReturnType<typeof buildSignalBrainLikeGrowthSummary>
  }
}

/**
 * Run Signal Mode Runtime.
 *
 * This is the main runtime for Signal Mode that integrates:
 * 1. Signal Field dynamics (particles, assemblies, bridges)
 * 2. Personal Branch learning (experience accumulation, teacher dependency reduction)
 * 3. Self/Boundary Loops (temporal continuity, source awareness)
 * 4. Consolidation (resting replay, pruning)
 * 5. Attention Budget (energy, fatigue, learning rate modulation)
 * 6. Inhibition (competition, lateral inhibition)
 * 7. Promotion Readiness (evaluation for Mother export)
 * 8. Mother Export (package creation, validation)
 *
 * Each turn:
 * - Runs Signal Field runtime (ignition, propagation, assembly detection, etc.)
 * - Records assemblies and bridges in Personal Branch
 * - Updates Self-Loop (echo, baseline, replay tendency)
 * - Updates Boundary-Loop (source balance, tension, prediction residue)
 * - Updates Attention Budget (fatigue, recovery, learning rate)
 * - Applies Competition and Inhibition
 * - Derives proto-meaning seeds and mixed latent seeds
 * - Updates branch maturity stages
 * - Runs Consolidation if resting
 * - Computes Promotion Readiness
 * - Generates Mother Export Package
 */
export async function runSignalModeRuntime(
  input: SignalModeRuntimeInput,
): Promise<SignalModeRuntimeResult> {
  // Initialize or retrieve existing states
  const branch = input.existingBranch ?? createInitialSignalPersonalBranch()
  const loopState = input.existingLoopState ?? createInitialSignalLoopState()
  const previousFieldState = input.existingFieldState
  let consolidationState = input.existingConsolidationState ?? createConsolidationState()
  let attentionBudget = input.existingAttentionBudget ?? createInitialAttentionBudget()

  const isUserActive = input.isUserActive ?? true
  const recentActivityLevel = input.recentActivityLevel ?? 0.5

  // 1. Run Signal Field runtime
  const fieldResult = await runSignalFieldRuntime({
    stimulus: input.stimulus,
    existingState: previousFieldState,
    enableBindingTeacher: input.enableBindingTeacher,
    textSummary: input.textSummary,
    imageSummary: input.imageSummary,
    audioSummary: input.audioSummary,
  })

  const fieldState = fieldResult.state

  // 2. Record assemblies in Personal Branch
  let updatedBranch = recordAssemblyExperience(
    branch,
    fieldResult.observe.newlyDetectedAssemblies.map(id =>
      fieldState.assemblies.find(a => a.id === id)!,
    ),
    'external_stimulus', // Default source; could be refined based on context
  )

  // 3. Record bridges in Personal Branch
  if (fieldState.crossModalBridges.length > 0) {
    updatedBranch = recordBridgeExperience(updatedBranch, fieldState.crossModalBridges, {
      createdBy: input.enableBindingTeacher ? 'binding_teacher' : 'self_discovered',
      confidence: fieldResult.observe.bindingTeacherResult?.confidence ?? 0.5,
      timestamp: Date.now(),
    })
  }

  // 4. Update bridge maturity stages
  updatedBranch = updateSignalPersonalBranch(updatedBranch)

  // 5. Compute prediction residue
  const predictionResidue = computePredictionResidue(previousFieldState, fieldState)

  // 6. Update Self-Loop
  const updatedSelfLoop = updateSelfLoop(
    loopState.selfLoop,
    fieldState,
    fieldState.recentActivations,
  )

  // 7. Classify signal sources
  const signalSources = fieldState.recentActivations.map(event => ({
    source: classifySignalSource(event),
    strength: event.strength,
  }))

  // 8. Update Boundary-Loop
  const updatedBoundaryLoop = updateBoundaryLoop(
    loopState.boundaryLoop,
    signalSources,
    predictionResidue,
  )

  // 9. Update Attention Budget
  const activeParticleCount = fieldState.particles.filter(p => p.activation > 0.1).length
  attentionBudget = updateAttentionBudget(
    attentionBudget,
    activeParticleCount,
    input.enableBindingTeacher ?? false,
    !isUserActive,
  )

  // 10. Allocate Attention
  const attentionAllocation = allocateSignalAttention(
    attentionBudget,
    !isUserActive,
    predictionResidue,
  )

  // 11. Compute Competition and Inhibition
  const recentlyActiveAssemblyIds = fieldState.assemblies
    .filter(a => a.lastActivatedAt > Date.now() - 10000)
    .map(a => a.id)

  let competition = computeSignalCompetition(
    updatedBranch,
    recentlyActiveAssemblyIds,
  )

  competition = applyAssemblySuppression(competition, updatedBranch)

  // 12. Run Consolidation if conditions are met
  const shouldConsolidate = shouldRunConsolidation(
    {
      now: Date.now(),
      isUserActive,
      recentActivityLevel,
    },
    consolidationState,
    updatedBranch,
  )

  if (shouldConsolidate) {
    const replayResult = runRestingReplay(updatedBranch)
    updatedBranch = consolidateSignalBranch(updatedBranch, replayResult)

    consolidationState = {
      ...consolidationState,
      lastConsolidatedAt: Date.now(),
      consolidationCount: consolidationState.consolidationCount + 1,
      recentReplayAssemblyIds: replayResult.replayedAssemblyIds,
      strengthenedAssemblyIds: replayResult.strengthenedAssemblyIds,
      weakenedBridgeIds: [], // Could be computed from bridges
      prunedLinkCount: 0, // Could be computed from pruning
      notes: replayResult.notes,
    }
  }

  // 13. Compute Promotion Readiness
  const allReadiness = [
    ...updatedBranch.assemblyRecords.map(a =>
      computeAssemblyPromotionReadiness(
        a,
        competition.suppressedAssemblyIds.includes(a.assemblyId),
      ),
    ),
    ...updatedBranch.bridgeRecords.map(b => computeBridgePromotionReadiness(b)),
    ...updatedBranch.protoSeedRecords.map(p =>
      computeProtoSeedPromotionReadiness(p, updatedBranch),
    ),
  ]

  const promotionReadiness = buildSignalPromotionReadinessSummary(allReadiness)

  // 14. Build Mother Export Package
  const motherExport = buildSignalMotherExport(updatedBranch, allReadiness)
  const motherExportValidation = validateSignalMotherExport(motherExport)

  // 15. Derive proto-meaning seeds and mixed latent seeds
  const protoSeeds = deriveProtoMeaningSeeds(fieldState)
  const mixedSeeds = deriveMixedLatentSeeds(protoSeeds)

  // 16. Build observation summary
  const fieldSummary = buildSignalFieldSummary(
    fieldState,
    protoSeeds,
    mixedSeeds,
    fieldResult.observe.recallEvents.length > 0,
  )

  const loopSummary = {
    selfEchoStrength: updatedSelfLoop.selfEchoStrength,
    replayTendency: updatedSelfLoop.replayTendency,
    boundaryTension: updatedBoundaryLoop.boundaryTension,
    predictionResidue: updatedBoundaryLoop.predictionResidue,
  }

  const brainLikeGrowth = buildSignalBrainLikeGrowthSummary(
    consolidationState,
    attentionBudget,
    attentionAllocation,
    competition,
    promotionReadiness,
    motherExport,
    motherExportValidation,
  )

  return {
    fieldState,
    personalBranch: updatedBranch,
    loopState: {
      selfLoop: updatedSelfLoop,
      boundaryLoop: updatedBoundaryLoop,
    },
    consolidationState,
    attentionBudget,
    observe: {
      fieldSummary,
      branchSummary: updatedBranch.summary,
      loopSummary,
      brainLikeGrowth,
    },
  }
}
