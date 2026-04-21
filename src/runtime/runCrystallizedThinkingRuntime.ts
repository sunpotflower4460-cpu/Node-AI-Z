import type { PersonalLearningState } from '../learning/types'
import type { PlasticityState } from '../types/nodeStudio'
import type { CrystallizedThinkingResult } from './runtimeTypes'
import type { SessionBrainState } from '../brain/sessionBrainState'
import type { Phase2AblationFlags } from '../config/phase2Flags'
import type { Phase3AblationFlags } from '../config/phase3Flags'
import { runChunkedNodePipeline } from './runChunkedNodePipeline'
import { runSignalRuntime } from '../signal/runSignalRuntime'
import { deriveUtteranceIntent } from '../utterance/deriveUtteranceIntent'
import { deriveUtteranceShape } from '../utterance/deriveUtteranceShape'
import { deriveLexicalPulls } from '../utterance/deriveLexicalPulls'
import { buildCrystallizedSentencePlan } from '../utterance/buildCrystallizedSentencePlan'
import { renderCrystallizedReply } from '../utterance/renderCrystallizedReply'
import { buildPreconditionFilter } from '../precondition/buildPreconditionFilter'
import { applyPreconditionToFusedState } from '../precondition/applyPreconditionToFusedState'
import { applyPreconditionToUtterance } from '../precondition/applyPreconditionToUtterance'
import { getPersonaWeightVector } from '../persona/getPersonaWeightVector'
import { applyPersonaToProtoMeanings } from '../persona/applyPersonaToProtoMeanings'
import { applyPersonaToOptionAwareness } from '../persona/applyPersonaToOptionAwareness'
import { applyPersonaToUtterance } from '../persona/applyPersonaToUtterance'
import { createInitialBrainState } from '../brain/createInitialBrainState'
import { updateBrainState } from '../brain/updateBrainState'
import { deriveUncertaintyState } from '../brain/deriveUncertaintyState'
import { derivePrecisionControl } from '../brain/precisionController'
import { applyPrecisionToPredictionError } from '../brain/applyPrecisionToPredictionError'
import { applyPrecisionToSignalDynamics } from '../brain/applyPrecisionToSignalDynamics'
import type { PrecisionInfluenceNote } from '../brain/precisionTypes'
import { DEFAULT_PHASE2_FLAGS } from '../config/phase2Flags'
import { DEFAULT_PHASE3_FLAGS } from '../config/phase3Flags'
import { detectEventBoundary, computeBoundaryEffects } from '../boundary/detectEventBoundary'
import { computeDecisionStrength } from '../meta/computeDecisionConfidence'
import { computeInterpretationConfidence, deriveConfidenceBehavior } from '../meta/computeInterpretationConfidence'
import { computeSensoryUncertainty, computeModelUncertainty, buildUncertaintyState } from '../predictive/precisionController'
import { buildReplayQueue } from '../replay/buildReplayQueue'
import { runIdleReplay } from '../replay/runIdleReplay'
import { updateInteroceptiveState } from '../interoception/updateInteroceptiveState'
import { applyInteroceptiveControl } from '../interoception/applyInteroceptiveControl'
import { buildCoalitionFields } from '../coalition/buildCoalitionFields'
import { mergeCoalitionState } from '../coalition/mergeCoalitionState'
import { selectCoalitionAction } from '../coalition/selectCoalitionAction'
import { advanceWorkspacePhase } from '../workspace/advanceWorkspacePhase'
import { applyWorkspacePhaseControl } from '../workspace/applyWorkspacePhaseControl'
import { buildActiveSensingPolicy } from '../action/buildActiveSensingPolicy'
import { selectInternalAction } from '../action/selectInternalAction'
import { applyWorkspaceGate } from '../brain/workspaceGate'
import { updateWorkspaceState as applyGateToWorkspaceState } from '../brain/updateWorkspaceState'
import type { WorkspaceGateResult } from '../brain/workspaceTypes'
import {
  createEpisodicTrace,
  pruneEpisodicBuffer,
  deriveReplayCandidates,
  runReplayConsolidation,
  applySchemaInfluence,
  shouldRunReplay,
  createEmptySchemaMemory,
} from '../memory'
import type { ReplayConsolidationResult } from '../memory/types'
import {
  composeMixedNodes,
  scoreMixedNodeSalience,
  selectDominantMixedNodes,
  applyMixedNodesToProto,
  applyMixedNodesToOption,
  applyMixedNodesToDecision,
} from '../node'
import type { MixedNodeInfluenceNote } from '../node/mixedNodeTypes'
import {
  createEmptySharedTrunk,
  loadSharedTrunkState,
  saveSharedTrunkState,
  createEmptyPersonalBranch,
  createCrystallizedThinkingFacade,
  resolveCoreView,
  applyTrunkInfluence,
  applyBranchInfluence,
  derivePromotionCandidates,
  updateBranchSessionState,
  enqueuePromotionCandidate,
  listPromotionQueue,
  updatePromotionQueueEntry,
  validatePromotionCandidate,
  applyApprovedPromotion,
  logCandidateQueued,
  logValidationFinished,
  logCandidateQuarantined,
  logCandidateRejected,
  logCandidateApproved,
  logCandidateApplied,
  getPromotionQueueState,
  getPromotionLogState,
  restorePromotionQueueState,
  restorePromotionLogState,
  getGuardianPolicy,
  getAiSenseiConfig,
  resolveGuardianMode,
  buildGuardianReviewRequest,
  enqueueGuardianReview,
  resolveGuardianReviewQueueEntry,
  resolveGuardianReview,
  guardianDecisionResolver,
  getGuardianReviewQueueState,
  restoreGuardianReviewQueueState,
  buildHumanReviewSummary,
  queueHumanReviewSummary,
  getHumanReviewState,
  restoreHumanReviewState,
  appendTrunkApplyRecord,
  buildTrunkDiffSummary,
  saveTrunkSnapshot,
  restoreTrunkSafetyState,
  attachTrunkSafetyState,
} from '../core'
import type { CoreInfluenceNote } from '../core/coreTypes'
import type {
  GuardianReviewRequest,
  GuardianReviewResult,
  GuardianReviewQueueEntry,
} from '../core/guardian/guardianTypes'
import type {
  HumanReviewRecord,
  HumanReviewSummary,
} from '../core/guardian/humanReview/humanReviewTypes'

/**
 * Crystallized Thinking Runtime
 * API-independent approach focused on Dual Stream / Signal / ProtoMeaning / Option / Somatic.
 * This mode does NOT use provider selection for core decision-making.
 */

export type CrystallizedThinkingRuntimeInput = {
  text: string
  plasticity?: PlasticityState
  personalLearning: PersonalLearningState
  personaId?: string // Pass 3: Optional persona selection
  brainState?: SessionBrainState // Phase 1: Session continuity
  phase2Flags?: Phase2AblationFlags // Phase 2: Ablation flags
  phase3Flags?: Phase3AblationFlags // Phase 3: Ablation flags
}

/**
 * Run the Crystallized Thinking runtime.
 * Uses dual stream architecture, signal dynamics, proto meanings, and option awareness.
 * Provider selection does NOT affect the core runtime logic.
 *
 * Pass 2: Adds utterance layer generation from internal state.
 * Pass 3: Adds precondition filter (Home/Existence/Belief) and persona weighting.
 * Phase 1: Adds session brain state continuity across turns.
 * Phase 2: Adds event boundary, confidence meta-layer, uncertainty precision, and idle replay.
 * Phase 3: Adds interoceptive core, coalition formation, workspace phases, and active sensing.
 * Phase M11: Adds guardian layer for promotion review (async).
 */
export const runCrystallizedThinkingRuntime = async ({
  text,
  plasticity,
  personalLearning,
  personaId,
  brainState: inputBrainState,
  phase2Flags = DEFAULT_PHASE2_FLAGS,
  phase3Flags = DEFAULT_PHASE3_FLAGS,
}: CrystallizedThinkingRuntimeInput): Promise<CrystallizedThinkingResult> => {
  // ===== Phase 1: Initialize or use existing brain state =====
  const brainState = inputBrainState ?? createInitialBrainState()

  // ===== Pass 3: Precondition & Persona Layers =====

  // 1. Build precondition filter (Home/Existence/Belief)
  const preconditionFilter = buildPreconditionFilter()

  // 2. Get persona weight vector
  const personaWeightVector = getPersonaWeightVector(personaId)

  // Run chunked pipeline with dual stream and signal processing
  // Phase 1: Pass session state instead of fixed values
  const chunkedResult = runChunkedNodePipeline(
    text,
    plasticity,
    brainState.recentActivityAverage, // Use session state instead of 0.5
    brainState.turnCount,              // Use session turn count instead of 0
    brainState.temporalStates,         // Use session temporal states instead of undefined
    personalLearning.pathwayStrengths, // Use pathway strengths from personal learning
    brainState.afterglow,              // Use session afterglow instead of 0
    brainState.predictionState,        // Use session prediction state instead of undefined
    personalLearning.somaticMarkers,
  )

  // ===== Phase M2: Precision / Uncertainty Control =====
  // Derive uncertainty state from current turn signals
  const m2UncertaintyState = deriveUncertaintyState({
    predictionModulation: chunkedResult.predictionModulationResult,
    sensoryMeanings: chunkedResult.sensoryProtoMeanings,
    narrativeMeanings: chunkedResult.narrativeProtoMeanings,
    optionAwareness: chunkedResult.optionAwareness,
    previousMicroSignal: brainState.microSignalDimensions,
    recentFieldIntensity: brainState.recentFieldIntensity,
    hasExplicitQuestion: text.includes('?'),
  })

  // Derive precision control from interoception and uncertainty
  const precisionControlResult = derivePrecisionControl({
    interoception: brainState.interoception,
    uncertaintyState: m2UncertaintyState,
    afterglow: brainState.afterglow,
    recentActivityAverage: brainState.recentActivityAverage,
    recentFieldIntensity: brainState.recentFieldIntensity,
    previousPrecisionControl: brainState.precisionControl,
  })

  // Apply precision to prediction error
  const weightedError = applyPrecisionToPredictionError(
    chunkedResult.predictionModulationResult,
    precisionControlResult.precisionControl,
    m2UncertaintyState,
  )

  // Apply precision to signal dynamics
  const signalDynamicsAdjustment = applyPrecisionToSignalDynamics(
    precisionControlResult.precisionControl,
    weightedError,
  )

  // Collect all precision notes
  const allPrecisionNotes: PrecisionInfluenceNote[] = [
    ...precisionControlResult.notes,
    ...weightedError.notes,
    ...signalDynamicsAdjustment.notes,
  ]

  // ===== Pass 3: Apply Persona to proto meanings =====

  // Apply persona to proto meanings
  const personaModulatedSensory = applyPersonaToProtoMeanings(
    chunkedResult.sensoryProtoMeanings,
    personaWeightVector,
  )
  const personaModulatedNarrative = applyPersonaToProtoMeanings(
    chunkedResult.narrativeProtoMeanings,
    personaWeightVector,
  )

  // Apply persona to option awareness
  const personaModulatedOptions = applyPersonaToOptionAwareness(
    chunkedResult.optionAwareness,
    personaWeightVector,
  )

  // ===== Pass 3: Apply Precondition to fused state =====

  const preconditionModulatedFusedState = applyPreconditionToFusedState(
    chunkedResult.dualStream.fusedState,
    preconditionFilter,
  )

  // ===== Phase M4: Memory System — Create Episodic Trace =====
  // Phase M5: Create episodic trace AFTER mixed nodes are generated
  // Note: We create the trace before schema influence but after mixed node generation
  // so that we can store which mixed nodes were dominant in this turn
  const currentEpisodicTrace = createEpisodicTrace({
    inputText: text,
    sensoryProtoMeanings: personaModulatedSensory,
    narrativeProtoMeanings: personaModulatedNarrative,
    optionAwareness: personaModulatedOptions,
    somaticInfluence: chunkedResult.somaticInfluence,
    surprise: chunkedResult.predictionModulationResult?.overallSurprise,
    currentTurn: brainState.turnCount,
    microSignalDimensions: {
      fieldTone: chunkedResult.dualStream.microSignalState.fieldTone,
      fusedConfidence: chunkedResult.dualStream.fusedState.fusedConfidence,
    },
    dominantMixedNodes: [], // Will be updated after mixed nodes are generated
  })

  // Add trace to buffer temporarily (will be pruned and persisted later)
  const currentEpisodicTraces = [...(brainState.episodicTraces ?? []), currentEpisodicTrace]

  // ===== Phase M4: Replay Consolidation =====
  let replayConsolidationResult: ReplayConsolidationResult | undefined
  let updatedSchemaMemory = brainState.schemaMemory ?? createEmptySchemaMemory()
  let consolidatedEpisodicTraces = currentEpisodicTraces

  // Check if replay should run this turn
  if (
    shouldRunReplay(
      consolidatedEpisodicTraces,
      brainState.turnCount,
      brainState.afterglow,
      updatedSchemaMemory.lastReplayTurn,
    )
  ) {
    // Derive replay candidates
    const replayCandidates = deriveReplayCandidates({
      episodicBuffer: consolidatedEpisodicTraces,
      workspace: brainState.workspace,
      afterglow: brainState.afterglow,
      recentFieldIntensity: brainState.recentFieldIntensity,
      currentTurn: brainState.turnCount,
    })

    // Run consolidation if we have candidates
    if (replayCandidates.length > 0) {
      const consolidationOutput = runReplayConsolidation({
        episodicBuffer: consolidatedEpisodicTraces,
        schemaMemory: updatedSchemaMemory,
        replayCandidates,
        currentTurn: brainState.turnCount,
      })

      replayConsolidationResult = consolidationOutput.result
      updatedSchemaMemory = {
        ...consolidationOutput.updatedSchemaMemory,
        lastReplayTurn: brainState.turnCount,
      }
      consolidatedEpisodicTraces = consolidationOutput.updatedEpisodicBuffer
    }
  }

  // Prune episodic buffer to keep it manageable
  consolidatedEpisodicTraces = pruneEpisodicBuffer({
    buffer: consolidatedEpisodicTraces,
    maxSize: 15,
    currentTurn: brainState.turnCount,
  })

  // ===== Phase M4: Apply Schema Influence =====
  // Schema patterns subtly influence current processing
  const schemaInfluenceResult = applySchemaInfluence({
    fusedState: preconditionModulatedFusedState,
    sensoryProtoMeanings: personaModulatedSensory,
    narrativeProtoMeanings: personaModulatedNarrative,
    optionAwareness: personaModulatedOptions,
    optionDecision: chunkedResult.optionDecision,
    schemaMemory: updatedSchemaMemory,
    currentTurn: brainState.turnCount,
  })

  // Use schema-influenced states for the rest of processing
  const schemaInfluencedFusedState = schemaInfluenceResult.fusedState
  const schemaInfluencedSensory = schemaInfluenceResult.sensoryProtoMeanings
  const schemaInfluencedNarrative = schemaInfluenceResult.narrativeProtoMeanings
  const schemaInfluencedOptions = schemaInfluenceResult.optionAwareness ?? personaModulatedOptions
  const schemaInfluencedDecision = schemaInfluenceResult.optionDecision ?? chunkedResult.optionDecision

  // ===== Phase M5: Mixed-Selective Latent Pool =====
  // Generate mixed latent nodes from current turn state
  const mixedNodeCandidates = composeMixedNodes({
    fusedState: schemaInfluencedFusedState,
    sensoryProtoMeanings: schemaInfluencedSensory,
    narrativeProtoMeanings: schemaInfluencedNarrative,
    optionAwareness: schemaInfluencedOptions,
    workspace: brainState.workspace,
    interoception: brainState.interoception,
    schemaMemory: updatedSchemaMemory,
    currentTurn: brainState.turnCount,
  })

  // Score salience, coherence, and novelty for each mixed node
  const scoredMixedNodes = mixedNodeCandidates.map((node) =>
    scoreMixedNodeSalience({
      node,
      workspace: brainState.workspace,
      interoception: brainState.interoception,
      schemaMemory: updatedSchemaMemory,
      surprise: chunkedResult.predictionModulationResult?.overallSurprise,
    })
  )

  // Select dominant vs suppressed mixed nodes
  const mixedNodeSelection = selectDominantMixedNodes({
    allNodes: scoredMixedNodes,
    precisionControl: precisionControlResult.precisionControl,
    workspace: brainState.workspace,
    interoception: brainState.interoception,
  })

  // Apply dominant mixed nodes to proto meanings
  const mixedNodeProtoResult = applyMixedNodesToProto({
    sensoryProtoMeanings: schemaInfluencedSensory,
    narrativeProtoMeanings: schemaInfluencedNarrative,
    dominantMixedNodes: mixedNodeSelection.dominantNodes,
  })

  // Apply dominant mixed nodes to option awareness
  const mixedNodeOptionResult = applyMixedNodesToOption({
    optionAwareness: schemaInfluencedOptions,
    dominantMixedNodes: mixedNodeSelection.dominantNodes,
  })

  // Use mixed-node-influenced states for signal runtime and utterance
  const mixedNodeInfluencedSensory = mixedNodeProtoResult.sensoryProtoMeanings
  const mixedNodeInfluencedNarrative = mixedNodeProtoResult.narrativeProtoMeanings
  const mixedNodeInfluencedOptions = mixedNodeOptionResult.optionAwareness ?? schemaInfluencedOptions

  // Collect all mixed node influence notes
  const allMixedNodeNotes: MixedNodeInfluenceNote[] = [
    ...mixedNodeProtoResult.influenceNotes,
    ...mixedNodeOptionResult.influenceNotes,
  ]

  // Update episodic trace with dominant mixed nodes
  currentEpisodicTrace.dominantMixedNodeIds = mixedNodeSelection.dominantNodes.map((n) => n.id)
  currentEpisodicTrace.mixedNodeTags = mixedNodeSelection.dominantNodes.flatMap((n) => n.tags)

  // Run signal-centered runtime with mixed-node-influenced state
  const signalResult = runSignalRuntime(text, {
    optionAwareness: mixedNodeInfluencedOptions,
    optionDecision: schemaInfluencedDecision,
    optionUtteranceHints: chunkedResult.optionUtteranceHints,
    somaticInfluence: chunkedResult.somaticInfluence,
    fusedState: schemaInfluencedFusedState,
    lexicalState: chunkedResult.dualStream.lexicalState,
    microSignalState: chunkedResult.dualStream.microSignalState,
  })

  // ===== Utterance Layer Generation (Pass 2) =====

  // 1. Derive utterance intent from internal state (with mixed-node-influenced meanings)
  const baseUtteranceIntent = deriveUtteranceIntent({
    fusedState: schemaInfluencedFusedState,
    sensoryProtoMeanings: mixedNodeInfluencedSensory,
    narrativeProtoMeanings: mixedNodeInfluencedNarrative,
    optionAwareness: mixedNodeInfluencedOptions,
    somaticInfluence: chunkedResult.somaticInfluence,
    currentDecision: schemaInfluencedDecision,
  })

  // ===== Pass 3: Apply Precondition and Persona to utterance intent =====

  const preconditionModulatedIntent = applyPreconditionToUtterance(
    baseUtteranceIntent,
    preconditionFilter,
  )
  const personaModulatedIntent = applyPersonaToUtterance(
    preconditionModulatedIntent,
    personaWeightVector,
  )

  // ===== Phase M5: Apply mixed nodes to decision/utterance intent =====
  const mixedNodeDecisionResult = applyMixedNodesToDecision({
    utteranceIntent: personaModulatedIntent,
    dominantMixedNodes: mixedNodeSelection.dominantNodes,
  })
  const utteranceIntent = mixedNodeDecisionResult.utteranceIntent

  // Add decision influence notes to all mixed node notes
  allMixedNodeNotes.push(...mixedNodeDecisionResult.influenceNotes)

  // 2. Derive utterance shape (with mixed-node-influenced meanings)
  const utteranceShape = deriveUtteranceShape({
    utteranceIntent,
    optionAwareness: mixedNodeInfluencedOptions,
    narrativeProtoMeanings: mixedNodeInfluencedNarrative,
    sensoryProtoMeanings: mixedNodeInfluencedSensory,
  })

  // 3. Derive lexical pulls (with mixed-node-influenced state)
  const lexicalPulls = deriveLexicalPulls({
    fusedState: schemaInfluencedFusedState,
    sensoryProtoMeanings: mixedNodeInfluencedSensory,
    narrativeProtoMeanings: mixedNodeInfluencedNarrative,
    optionAwareness: mixedNodeInfluencedOptions,
  })

  // 4. Build sentence plan (with mixed-node-influenced meanings)
  const crystallizedSentencePlan = buildCrystallizedSentencePlan({
    utteranceIntent,
    utteranceShape,
    lexicalPulls,
    sensoryProtoMeanings: mixedNodeInfluencedSensory,
    narrativeProtoMeanings: mixedNodeInfluencedNarrative,
    optionAwareness: mixedNodeInfluencedOptions,
    currentDecision: schemaInfluencedDecision,
  })

  // 5. Render final crystallized reply
  const finalCrystallizedReply = renderCrystallizedReply({
    sentencePlan: crystallizedSentencePlan,
    utteranceIntent,
    lexicalPulls,
  })

  // ===== Phase 2: Event Boundary Detection =====
  let eventBoundary
  let boundaryEffects
  if (phase2Flags.boundaryEnabled) {
    // Detect goal shift from option decision changes
    const goalShift = chunkedResult.optionDecision?.preferredOptionId ? 0.3 : 0.0

    // Detect stance shift from option decision stance
    const stanceShift = chunkedResult.optionDecision?.stance === 'observe' ? 0.4 : 0.0

    // Detect relation shift (simplified - could be enhanced)
    const relationShift = 0.0

    // Detect somatic shift from somatic influence
    const somaticShift = chunkedResult.somaticInfluence?.influenceStrength ?? 0.0

    // Detect field intensity jump
    const currentFieldIntensity = chunkedResult.predictionModulationResult?.fieldIntensityBoost ?? 0.0
    const fieldIntensityJump = Math.abs(currentFieldIntensity - brainState.recentFieldIntensity)

    eventBoundary = detectEventBoundary({
      predictionErrorMagnitude: chunkedResult.predictionModulationResult?.overallSurprise ?? 0.0,
      goalShift,
      stanceShift,
      relationShift,
      somaticShift,
      fieldIntensityJump,
    })

    boundaryEffects = computeBoundaryEffects(eventBoundary)
  }

  // ===== Phase 2: Confidence Meta-Layer =====
  let confidenceState
  if (phase2Flags.confidenceEnabled) {
    // Compute decision strength
    const fieldCoherence = chunkedResult.stateVector.stability ?? 0.5
    const decisionResult = computeDecisionStrength(
      personaModulatedOptions,
      preconditionModulatedFusedState,
      fieldCoherence,
    )

    // Compute interpretation confidence
    const interpretationResult = computeInterpretationConfidence(
      chunkedResult.predictionModulationResult,
      personaModulatedSensory,
      personaModulatedNarrative,
      personaModulatedOptions,
    )

    // Derive behavioral flags
    confidenceState = deriveConfidenceBehavior(
      decisionResult.strength,
      interpretationResult.confidence,
    )
  }

  // ===== Phase 2: Uncertainty Precision System =====
  let uncertaintyState
  if (phase2Flags.uncertaintyEnabled) {
    // Compute sensory uncertainty
    const sensoryResult = computeSensoryUncertainty(
      personaModulatedSensory,
      personaModulatedNarrative,
      chunkedResult.stateVector,
      text.length,
    )

    // Compute model uncertainty
    const isNovelInput = (chunkedResult.predictionModulationResult?.overallSurprise ?? 0.0) > 0.5
    const modelResult = computeModelUncertainty(
      brainState.predictionState,
      isNovelInput,
    )

    // Build complete uncertainty state
    uncertaintyState = buildUncertaintyState(
      sensoryResult.uncertainty,
      modelResult.uncertainty,
    )
  }

  // ===== Phase 3: Interoceptive Core =====
  let interoceptiveState
  let interoceptiveControl
  if (phase3Flags.interoceptionEnabled) {
    // Update interoceptive state from current turn
    interoceptiveState = updateInteroceptiveState({
      previousState: brainState.interoception,
      somaticInfluence: chunkedResult.somaticInfluence,
      uncertaintyState,
      confidenceState,
      surpriseMagnitude: chunkedResult.predictionModulationResult?.overallSurprise ?? 0.0,
      currentTurn: brainState.turnCount,
      recentActivityScore: brainState.recentActivityAverage,
    })

    // Derive interoceptive control parameters
    interoceptiveControl = applyInteroceptiveControl(interoceptiveState)
  }

  // ===== Phase 3: Workspace Phase Control =====
  let workspaceState
  let workspacePhaseControlResult
  let workspaceGateResult: WorkspaceGateResult | undefined
  if (phase3Flags.workspacePhaseEnabled) {
    // Determine next workspace phase
    const nextPhase = advanceWorkspacePhase({
      currentState: brainState.workspace,
      eventBoundary,
      coalitionState: { activeCoalitions: [], unresolvedTension: 0 }, // Temporary - will be updated after coalition formation
      interoceptiveControl: interoceptiveControl ?? {
        thresholdMultiplier: 1.0,
        inhibitionMultiplier: 1.0,
        precisionWeight: 1.0,
        coalitionStabilityBias: 0.0,
        replayEligibilityMultiplier: 1.0,
        workspaceTransitionSpeed: 1.0,
      },
      surpriseMagnitude: chunkedResult.predictionModulationResult?.overallSurprise ?? 0.0,
    })

    // Apply workspace phase control
    workspacePhaseControlResult = applyWorkspacePhaseControl({
      currentState: brainState.workspace,
      newPhase: nextPhase,
      narrativeProtoMeanings: personaModulatedNarrative,
      sensoryProtoMeanings: personaModulatedSensory,
    })

    // ===== Phase M3: Workspace Gate =====
    // Apply workspace gate to control what gets admitted, held, shielded, or flushed
    workspaceGateResult = applyWorkspaceGate({
      currentWorkspace: workspacePhaseControlResult.updatedState,
      candidateInput: {
        lexicalState: chunkedResult.dualStream.lexicalState,
        microSignalState: chunkedResult.dualStream.microSignalState,
        sensoryProtoMeanings: personaModulatedSensory,
        narrativeProtoMeanings: personaModulatedNarrative,
        optionAwareness: chunkedResult.detectedOptions ? {
          detectedOptions: chunkedResult.detectedOptions.map((opt) => ({
            id: opt.id,
            label: opt.label,
            salience: 0.6, // Default salience for detected options
          })),
        } : undefined,
        turnCount: brainState.turnCount,
      },
      salienceFactors: {
        afterglow: brainState.afterglow,
        recentFieldIntensity: brainState.recentFieldIntensity,
        overloadPressure: workspacePhaseControlResult.updatedState.distractorPressure,
        safetySense: interoceptiveState?.socialSafety ?? 0.5,
        unresolvedThreadCount: workspacePhaseControlResult.updatedState.heldItems.filter(
          (item) => item.strength > 0.5,
        ).length,
      },
    })

    // Update workspace state with gate results
    workspaceState = applyGateToWorkspaceState(
      workspacePhaseControlResult.updatedState,
      workspaceGateResult,
      brainState.turnCount,
    )
  }

  // ===== Phase 3: Coalition Formation =====
  let coalitionState
  let coalitionAction
  if (phase3Flags.coalitionEnabled) {
    // Build coalition fields from multiple sources
    const coalitionFields = buildCoalitionFields({
      nodes: chunkedResult.activatedNodes,
      sensoryProtoMeanings: personaModulatedSensory,
      narrativeProtoMeanings: personaModulatedNarrative,
      optionFields: chunkedResult.optionCompetition?.optionFields ?? [],
      interoceptiveState: interoceptiveState ?? brainState.interoception,
    })

    // Merge into coalition state
    coalitionState = mergeCoalitionState({
      coalitionFields,
      interoceptiveControl: interoceptiveControl ?? {
        thresholdMultiplier: 1.0,
        inhibitionMultiplier: 1.0,
        precisionWeight: 1.0,
        coalitionStabilityBias: 0.0,
        replayEligibilityMultiplier: 1.0,
        workspaceTransitionSpeed: 1.0,
      },
    })

    // Select coalition action
    coalitionAction = selectCoalitionAction(coalitionState)
  }

  // ===== Phase 3: Active Sensing Policy =====
  let internalActionPolicy
  if (phase3Flags.activeSensingEnabled) {
    // Build active sensing policy
    internalActionPolicy = buildActiveSensingPolicy({
      coalitionAction: coalitionAction ?? {
        preferredAction: 'answer',
        confidence: 0.5,
        reasons: ['Coalition disabled, using default'],
      },
      confidenceState,
      uncertaintyState,
      workspaceState: workspaceState ?? brainState.workspace,
      interoceptiveState: interoceptiveState ?? brainState.interoception,
    })

    // Select final internal action (currently just returns preferred action)
    selectInternalAction(internalActionPolicy)
  }

  // ===== Phase 2: Idle Replay System =====
  let replaySummary
  if (phase2Flags.replayEnabled) {
    // Build replay queue
    const replayQueue = buildReplayQueue(
      brainState,
      eventBoundary,
      chunkedResult.predictionModulationResult?.overallSurprise ?? 0.0,
    )

    // Run idle replay (consolidation)
    const { summary: nextReplaySummary } = runIdleReplay(replayQueue, personalLearning)
    replaySummary = nextReplaySummary
  }

  // ===== Phase 1: Update brain state for next turn =====
  // Phase M2: Pass precision state to updateBrainState
  // Phase M4: Pass memory state to updateBrainState
  // Phase M5: Pass mixed node state to updateBrainState
  let nextBrainState = updateBrainState(
    brainState,
    chunkedResult,
    {
      precisionControl: precisionControlResult.precisionControl,
      uncertaintyState: m2UncertaintyState,
      precisionNotes: allPrecisionNotes,
    },
    {
      episodicTraces: consolidatedEpisodicTraces,
      schemaMemory: updatedSchemaMemory,
      schemaInfluenceNotes: schemaInfluenceResult.influenceNotes,
    },
    {
      mixedLatentPool: scoredMixedNodes,
      mixedNodeNotes: allMixedNodeNotes,
    }
  )

  // Phase 2: Update episodic buffer if boundary was triggered
  if (phase2Flags.boundaryEnabled && eventBoundary?.triggered && boundaryEffects?.shouldCreateSegment) {
    nextBrainState = {
      ...nextBrainState,
      episodicBuffer: [
        ...nextBrainState.episodicBuffer,
        {
          turn: brainState.turnCount,
          timestamp: Date.now(),
          boundaryScore: eventBoundary.score,
          surpriseMagnitude: chunkedResult.predictionModulationResult?.overallSurprise,
        },
      ],
    }
  }

  // Phase 3: Update workspace and interoception states
  if (phase3Flags.workspacePhaseEnabled && workspaceState) {
    nextBrainState = {
      ...nextBrainState,
      workspace: workspaceState,
    }
  }
  if (phase3Flags.interoceptionEnabled && interoceptiveState) {
    nextBrainState = {
      ...nextBrainState,
      interoception: interoceptiveState,
    }
  }

  // ===== Phase M9: Trunk / Branch / Facade Integration =====
  // Initialize trunk, branch, and facade (in production, these would be loaded from storage)
  const sharedTrunk = loadSharedTrunkState() ?? createEmptySharedTrunk()
  restorePromotionQueueState(sharedTrunk.promotionQueue ?? [])
  restorePromotionLogState(sharedTrunk.promotionLogs ?? [])
  restoreGuardianReviewQueueState(sharedTrunk.guardianReviewQueue ?? [])
  restoreHumanReviewState({
    summaries: sharedTrunk.humanReviewSummaries,
    records: sharedTrunk.humanReviewRecords,
  })
  restoreTrunkSafetyState({
    applyRecords: sharedTrunk.trunkApplyRecords,
    revertRecords: sharedTrunk.trunkRevertRecords,
    snapshotRecords: sharedTrunk.trunkSnapshotRecords,
    currentRevertSafetySnapshotId: sharedTrunk.currentRevertSafetySnapshotId,
    lastTrunkConsistencyCheck: sharedTrunk.lastTrunkConsistencyCheck,
    safeUndoNotes: sharedTrunk.safeUndoNotes,
  })
  const personalBranch = createEmptyPersonalBranch('default-user')

  // Update branch with current session state
  const updatedBranch = updateBranchSessionState(personalBranch, nextBrainState)

  // Create app facade for crystallized thinking
  const appFacade = createCrystallizedThinkingFacade()

  // Derive promotion candidates from branch patterns
  const promotionCandidates = derivePromotionCandidates(
    updatedBranch,
    sharedTrunk,
    nextBrainState.turnCount
  )

  // ===== Phase M10 + M11: Promotion Pipeline with Guardian Layer =====
  // Process new candidates through the promotion pipeline
  const promotionPipelineResults: {
    queuedCount: number
    validatedCount: number
    guardianReviewedCount: number
    approvedCount: number
    appliedCount: number
    quarantinedCount: number
    rejectedCount: number
  } = {
    queuedCount: 0,
    validatedCount: 0,
    guardianReviewedCount: 0,
    approvedCount: 0,
    appliedCount: 0,
    quarantinedCount: 0,
    rejectedCount: 0,
  }

  let updatedTrunk = sharedTrunk

  // Get guardian policy
  const guardianPolicy = getGuardianPolicy()
  const aiSenseiConfig = getAiSenseiConfig()

  // Storage for guardian review requests and results
  const guardianReviewRequests: GuardianReviewRequest[] = []
  const guardianReviewResults: GuardianReviewResult[] = []
  const guardianReviewQueueEntries: GuardianReviewQueueEntry[] = []
  const humanReviewState = getHumanReviewState()
  const humanReviewSummaries: HumanReviewSummary[] = [...humanReviewState.summaries]
  const humanReviewRecords: HumanReviewRecord[] = [...humanReviewState.records]

  // Step 1: Enqueue new promotion candidates
  for (const candidate of promotionCandidates) {
    const queueEntry = enqueuePromotionCandidate(candidate)
    logCandidateQueued(queueEntry)
    promotionPipelineResults.queuedCount++
  }

  // Step 2: Process queued candidates through validation and guardian review
  const queuedEntries = listPromotionQueue('queued')
  for (const entry of queuedEntries) {
    // Validate the candidate
    const validation = validatePromotionCandidate(
      entry.candidate,
      updatedBranch,
      updatedTrunk
    )

    // Update queue entry with validation result
    updatePromotionQueueEntry(entry.id, {
      status: validation.status,
      validation,
    })

    logValidationFinished(
      entry.candidate.id,
      validation.status,
      validation.riskLevel,
      validation.confidenceScore
    )
    promotionPipelineResults.validatedCount++

    // Phase M11: Guardian Review Step
    // Determine guardian mode based on risk level
    const guardianMode = resolveGuardianMode(validation.riskLevel, guardianPolicy)

    // Build guardian review request
    const guardianRequest = buildGuardianReviewRequest(
      entry.candidate,
      validation,
      guardianMode
    )
    guardianReviewRequests.push(guardianRequest)

    // Enqueue guardian review
    const guardianQueueEntry = enqueueGuardianReview(guardianRequest)
    guardianReviewQueueEntries.push(guardianQueueEntry)

    // Optional: check if a human reviewer already made a decision
    const existingHumanRecord = humanReviewRecords.find(
      (record) => record.candidateId === entry.candidate.id
    )

    // Resolve guardian review (AI sensei or system). For human-required, we only use this as context.
    let aiSenseiResult: GuardianReviewResult | null = null
    let guardianResult: GuardianReviewResult | null = null

    if (existingHumanRecord) {
      guardianResult = {
        requestId: guardianRequest.id,
        actor: 'human_reviewer',
        decision: existingHumanRecord.decision,
        confidence: validation.confidenceScore,
        reasons: [existingHumanRecord.reason],
        cautionNotes: validation.cautionNotes,
        createdAt: existingHumanRecord.createdAt,
      }
    } else if (guardianMode === 'system_only' || guardianMode === 'guardian_assisted') {
      guardianResult = await resolveGuardianReview(
        guardianRequest,
        guardianPolicy,
        undefined,
        aiSenseiConfig
      )
      aiSenseiResult = guardianResult
    } else if (guardianMode === 'human_required') {
      aiSenseiResult = await resolveGuardianReview(
        guardianRequest,
        guardianPolicy,
        undefined,
        aiSenseiConfig
      )
    }

    // Build human-facing summary (only for guardian-assisted / human-required)
    if (guardianMode !== 'system_only') {
      const humanSummary = buildHumanReviewSummary({
        candidate: entry.candidate,
        validation,
        guardianRequest,
        aiSenseiReview: aiSenseiResult ?? undefined,
        sourceBranchId: updatedBranch.branchId,
      })
      queueHumanReviewSummary(humanSummary)
      const existingSummaryIndex = humanReviewSummaries.findIndex(
        (item) => item.candidateId === humanSummary.candidateId
      )
      if (existingSummaryIndex >= 0) {
        humanReviewSummaries[existingSummaryIndex] = humanSummary
      } else {
        humanReviewSummaries.push(humanSummary)
      }
    }

    // Resolve final promotion decision with guardian result (human beats AI/system)
    const guardianDecision = guardianDecisionResolver(
      validation,
      guardianResult,
      guardianMode
    )

    const finalStatus = guardianDecision.finalStatus

    if (guardianResult) {
      const guardianResultWithFinalDecision: GuardianReviewResult = {
        ...guardianResult,
        finalDecision: guardianDecision,
      }

      guardianReviewResults.push(guardianResultWithFinalDecision)
      resolveGuardianReviewQueueEntry(
        guardianQueueEntry.id,
        guardianResultWithFinalDecision
      )
      promotionPipelineResults.guardianReviewedCount++
    }

    // Update queue entry with final status
    updatePromotionQueueEntry(entry.id, {
      status: finalStatus,
    })

    // Create approval record with guardian information
    const approvalRecord = {
      id: `approval-${entry.candidate.id}-${Date.now()}`,
      candidateId: entry.candidate.id,
      decision:
        finalStatus === 'approved'
          ? ('approve' as const)
          : finalStatus === 'rejected'
            ? ('reject' as const)
            : ('quarantine' as const),
      reason: guardianDecision.reasons.join('; '),
      createdAt: Date.now(),
      actor: 'system' as const,
      // Phase M11: Guardian layer information
      guardianMode,
      guardianActor: guardianDecision.guardianActor,
      validationRisk: validation.riskLevel,
    }

    // Log decision
    if (finalStatus === 'approved') {
      logCandidateApproved(approvalRecord)
      promotionPipelineResults.approvedCount++
    } else if (finalStatus === 'rejected') {
      logCandidateRejected(approvalRecord)
      promotionPipelineResults.rejectedCount++
    } else if (finalStatus === 'quarantined') {
      logCandidateQuarantined(approvalRecord)
      promotionPipelineResults.quarantinedCount++
    }

    // Step 3: Apply approved candidates to trunk
    if (finalStatus === 'approved') {
      const trunkBeforeApply = updatedTrunk
      const trunkBeforeSnapshot = saveTrunkSnapshot(trunkBeforeApply, {
        kind: 'before_apply',
        candidateId: entry.candidate.id,
        label: `Before applying ${entry.candidate.id}`,
      })

      const applyResult = applyApprovedPromotion(
        updatedTrunk,
        entry.candidate,
        validation
      )

      if (applyResult.success && applyResult.trunkUpdated) {
        updatedTrunk = applyResult.nextTrunk
        const trunkAfterSnapshot = saveTrunkSnapshot(updatedTrunk, {
          kind: 'after_apply',
          candidateId: entry.candidate.id,
          label: `After applying ${entry.candidate.id}`,
        })
        const trunkDiffSummary = buildTrunkDiffSummary({
          before: trunkBeforeApply,
          after: updatedTrunk,
          candidate: entry.candidate,
        })
        appendTrunkApplyRecord({
          id: `trunk-apply-${entry.candidate.id}-${Date.now()}`,
          candidateId: entry.candidate.id,
          promotionKind: entry.candidate.type,
          appliedAt: Date.now(),
          trunkBeforeSnapshotId: trunkBeforeSnapshot.id,
          trunkAfterSnapshotId: trunkAfterSnapshot.id,
          trunkDiffSummary,
          appliedBy: guardianDecision.guardianActor ?? 'system',
          rollbackMetadata: applyResult.rollbackMetadata,
        })
        logCandidateApplied(applyResult)
        promotionPipelineResults.appliedCount++

        // Mark queue entry as applied
        updatePromotionQueueEntry(entry.id, {
          status: 'applied',
        })
      }
    }
  }

  // Store promotion queue, logs, and guardian queue in trunk for persistence
  updatedTrunk = attachTrunkSafetyState({
    ...updatedTrunk,
    promotionQueue: getPromotionQueueState(),
    promotionLogs: getPromotionLogState(),
    // Phase M11: Store guardian review queue
    guardianReviewQueue: getGuardianReviewQueueState(),
    humanReviewSummaries,
    humanReviewRecords,
  })
  saveSharedTrunkState(updatedTrunk)

  // Apply trunk influence (read-only, subtle)
  const trunkInfluenceResult = applyTrunkInfluence(
    updatedSchemaMemory.patterns,
    scoredMixedNodes,
    updatedTrunk,
    appFacade.trunkInfluenceWeight
  )

  // Apply branch influence (primary, strong)
  const branchInfluenceResult = applyBranchInfluence(
    updatedSchemaMemory.patterns,
    scoredMixedNodes,
    updatedBranch,
    appFacade.branchInfluenceWeight
  )

  // Collect all core influence notes
  const allCoreInfluenceNotes: CoreInfluenceNote[] = [
    ...trunkInfluenceResult.notes,
    ...branchInfluenceResult.notes,
  ]

  // Resolve unified core view
  const coreView = resolveCoreView(
    updatedTrunk,
    updatedBranch,
    appFacade,
    promotionCandidates
  )

  // Update brain state with core influence notes
  nextBrainState = {
    ...nextBrainState,
    coreInfluenceNotes: allCoreInfluenceNotes,
  }

  return {
    implementationMode: 'crystallized_thinking',
    lexicalState: chunkedResult.dualStream.lexicalState,
    microSignalState: chunkedResult.dualStream.microSignalState,
    fusedState: schemaInfluencedFusedState, // Phase M4: Use schema-influenced fused state
    signalPackets: chunkedResult.dualStream.signalPackets,
    protoMeanings: {
      sensory: schemaInfluencedSensory, // Phase M4: Use schema-influenced meanings
      narrative: schemaInfluencedNarrative, // Phase M4: Use schema-influenced meanings
    },
    optionAwareness: schemaInfluencedOptions, // Phase M4: Use schema-influenced options
    optionDecision: schemaInfluencedDecision, // Phase M4: Use schema-influenced decision
    somaticInfluence: chunkedResult.somaticInfluence,
    utterance: signalResult.utterance,
    dualStreamResult: chunkedResult.dualStream,
    chunkedResult,
    signalResult,
    // Utterance layer (Pass 2)
    utteranceIntent,
    utteranceShape,
    lexicalPulls,
    crystallizedSentencePlan,
    finalCrystallizedReply,
    // Precondition & Persona layers (Pass 3)
    preconditionFilter,
    personaWeightVector,
    // Session continuity (Phase 1)
    nextBrainState,
    // Phase 2: Boundary / Confidence / Uncertainty / Replay
    eventBoundary,
    confidenceState,
    uncertaintyState,
    replaySummary,
    // Phase M2: Precision / Uncertainty Control
    precisionControl: precisionControlResult.precisionControl,
    m2UncertaintyState,
    weightedPredictionError: weightedError,
    signalDynamicsAdjustment,
    precisionNotes: allPrecisionNotes,
    // Phase 3: Interoception / Coalition / Workspace / Action
    interoceptiveState,
    coalitionState,
    workspaceState,
    internalActionPolicy,
    // Phase M3: Workspace Gate
    workspaceGateResult,
    // Phase M4: Episodic / Schema / Replay
    currentEpisodicTrace,
    replayConsolidationResult,
    schemaInfluenceNotes: schemaInfluenceResult.influenceNotes,
    // Phase M5: Mixed-Selective Latent Pool
    mixedNodeSelection,
    mixedNodeInfluencedProto: {
      sensory: mixedNodeInfluencedSensory,
      narrative: mixedNodeInfluencedNarrative,
    },
    mixedNodeInfluencedOptions,
    mixedNodeNotes: allMixedNodeNotes,
    // Phase M9: Trunk / Branch / Facade
    coreView,
    coreInfluenceNotes: allCoreInfluenceNotes,
    promotionCandidates,
    // Phase M10: Promotion Pipeline
    promotionPipelineResults,
    updatedTrunk,
    // Phase M11: Guardian Layer
    guardianReviewRequests,
    guardianReviewResults,
    guardianPolicy,
    aiSenseiConfig,
    humanReviewSummaries,
    humanReviewRecords,
  }
}
