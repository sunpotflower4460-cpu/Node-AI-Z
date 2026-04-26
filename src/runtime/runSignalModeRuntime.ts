import type { SignalFieldState, ParticleStimulus } from '../signalField/signalFieldTypes'
import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalLoopState } from '../signalLoop/signalLoopTypes'
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
  enableBindingTeacher?: boolean
  textSummary?: string
  imageSummary?: string
  audioSummary?: string
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
  observe: {
    fieldSummary: ReturnType<typeof buildSignalFieldSummary>
    branchSummary: SignalPersonalBranch['summary']
    loopSummary: {
      selfEchoStrength: number
      replayTendency: number
      boundaryTension: number
      predictionResidue: number
    }
  }
}

/**
 * Run Signal Mode Runtime.
 *
 * This is the main runtime for Signal Mode that integrates:
 * 1. Signal Field dynamics (particles, assemblies, bridges)
 * 2. Personal Branch learning (experience accumulation, teacher dependency reduction)
 * 3. Self/Boundary Loops (temporal continuity, source awareness)
 *
 * Each turn:
 * - Runs Signal Field runtime (ignition, propagation, assembly detection, etc.)
 * - Records assemblies and bridges in Personal Branch
 * - Updates Self-Loop (echo, baseline, replay tendency)
 * - Updates Boundary-Loop (source balance, tension, prediction residue)
 * - Derives proto-meaning seeds and mixed latent seeds
 * - Updates branch maturity stages
 */
export async function runSignalModeRuntime(
  input: SignalModeRuntimeInput,
): Promise<SignalModeRuntimeResult> {
  // Initialize or retrieve existing states
  const branch = input.existingBranch ?? createInitialSignalPersonalBranch()
  const loopState = input.existingLoopState ?? createInitialSignalLoopState()
  const previousFieldState = input.existingFieldState

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

  // 9. Derive proto-meaning seeds and mixed latent seeds
  const protoSeeds = deriveProtoMeaningSeeds(fieldState)
  const mixedSeeds = deriveMixedLatentSeeds(protoSeeds)

  // 10. Build observation summary
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

  return {
    fieldState,
    personalBranch: updatedBranch,
    loopState: {
      selfLoop: updatedSelfLoop,
      boundaryLoop: updatedBoundaryLoop,
    },
    observe: {
      fieldSummary,
      branchSummary: updatedBranch.summary,
      loopSummary,
    },
  }
}
