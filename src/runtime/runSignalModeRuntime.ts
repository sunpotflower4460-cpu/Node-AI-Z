import type { SignalFieldState, ParticleStimulus } from '../signalField/signalFieldTypes'
import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalLoopState } from '../signalLoop/signalLoopTypes'
import type { SignalConsolidationState } from '../signalConsolidation/signalConsolidationTypes'
import type { SignalAttentionBudget } from '../signalAttention/signalAttentionTypes'
import type { SensoryPacket } from '../signalSensory/sensoryPacketTypes'
import { sensoryPacketToInjectionVector } from '../signalSensory/sensoryPacketToInjectionVector'
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
import { compareAssemblies } from '../signalContrast/compareAssemblies'
import { classifyContrastRelation } from '../signalContrast/classifyContrastRelation'
import { recordContrastExperience } from '../signalContrast/recordContrastExperience'
import { buildContrastSummary } from '../signalContrast/buildContrastSummary'
import type { ContrastRecord } from '../signalContrast/signalContrastTypes'
import { recordActivationSequence } from '../signalSequence/recordActivationSequence'
import { updateSequenceMemory } from '../signalSequence/updateSequenceMemory'
import { predictNextAssemblies } from '../signalSequence/predictNextAssemblies'
import { buildSequenceSummary } from '../signalSequence/buildSequenceSummary'
import { decayTimescaleWeights } from '../signalPlasticity/decayTimescaleWeights'
import { updateMultiTimescaleWeights } from '../signalPlasticity/updateMultiTimescaleWeights'
import { buildPlasticitySummary } from '../signalPlasticity/buildPlasticitySummary'
import { selectDreamCandidates } from '../signalDream/selectDreamCandidates'
import { runOfflineDreamExploration } from '../signalDream/runOfflineDreamExploration'
import { buildDreamSummary } from '../signalDream/buildDreamSummary'
import { selectAttentionTargets } from '../signalAttentionActive/selectAttentionTargets'
import { chooseTeacherQueryTargets } from '../signalAttentionActive/chooseTeacherQueryTargets'
import { buildActiveAttentionSummary } from '../signalAttentionActive/buildActiveAttentionSummary'
import { computeActiveAttentionBudgetLimit } from '../signalAttentionActive/computeActiveAttentionBudgetLimit'
import { generateInternalQuestions } from '../signalInquiry/generateInternalQuestions'
import { prioritizeInternalQuestions } from '../signalInquiry/prioritizeInternalQuestions'
import { buildInternalQuestionSummary } from '../signalInquiry/buildInternalQuestionSummary'
import { buildSignalActiveLearningSummary } from '../observe/buildSignalActiveLearningSummary'
import type { SignalActionResult } from '../signalAction/signalActionTypes'
import { selectSignalActions } from '../signalAction/selectSignalActions'
import { executeSignalAction } from '../signalAction/executeSignalAction'
import { evaluateSignalActionOutcome } from '../signalAction/evaluateSignalActionOutcome'
import { buildSignalActionSummary } from '../signalAction/buildSignalActionSummary'
import { computeSignalReward } from '../signalReward/computeSignalReward'
import { recordActionOutcome } from '../signalReward/recordActionOutcome'
import { updateOutcomeMemory } from '../signalReward/updateOutcomeMemory'
import { buildSignalRewardSummary } from '../signalReward/buildSignalRewardSummary'
import { updateSignalModulators } from '../signalModulator/updateSignalModulators'
import { applyModulatorsToLearning } from '../signalModulator/applyModulatorsToLearning'
import { buildModulatorSummary } from '../signalModulator/buildModulatorSummary'
import { generateHierarchicalPredictions } from '../signalPrediction/generateHierarchicalPredictions'
import { comparePredictionWithActual } from '../signalPrediction/comparePredictionWithActual'
import { updatePredictionMemory } from '../signalPrediction/updatePredictionMemory'
import { buildHierarchicalPredictionSummary } from '../signalPrediction/buildHierarchicalPredictionSummary'
import { openMemoryForReconsolidation } from '../signalReconsolidation/openMemoryForReconsolidation'
import { reviseSignalMemory } from '../signalReconsolidation/reviseSignalMemory'
import { restabilizeSignalMemory } from '../signalReconsolidation/restabilizeSignalMemory'
import { buildReconsolidationSummary } from '../signalReconsolidation/buildReconsolidationSummary'
import { determineSignalDevelopmentStage } from '../signalDevelopment/determineSignalDevelopmentStage'
import { buildDevelopmentSummary } from '../signalDevelopment/buildDevelopmentSummary'
import { buildSignalActionOutcomeObserveSummary } from '../observe/buildSignalActionOutcomeObserveSummary'
import { createSignalSnapshot } from '../signalPersistence/createSignalSnapshot'
import { saveSignalModeState } from '../signalPersistence/saveSignalModeState'
import { buildPersistenceSummary } from '../signalPersistence/buildPersistenceSummary'
import { buildSignalRiskSummary } from '../signalRisk/buildSignalRiskSummary'
import { buildDevelopmentDashboard } from '../signalDevelopmentDashboard/buildDevelopmentDashboard'
import { buildDevelopmentDashboardSummary } from '../signalDevelopmentDashboard/buildDevelopmentDashboardSummary'
import { buildSignalEvaluationObserveSummary } from '../observe/buildSignalEvaluationObserveSummary'
import type { SignalModeSnapshot } from '../signalPersistence/signalPersistenceTypes'
import type { PersistentOrganismState } from '../signalOrganism/signalOrganismTypes'
import type { BackgroundLoopState } from '../signalBackground/signalBackgroundTypes'
import { createInitialOrganismState } from '../signalOrganism/createInitialOrganismState'
import { createInitialBackgroundLoopState } from '../signalBackground/createInitialBackgroundLoopState'
import { updateOrganismStateFromInput } from '../signalOrganism/updateOrganismStateFromInput'
import { buildOrganismSummary } from '../signalOrganism/buildOrganismSummary'
import { runBackgroundTick } from '../signalBackground/runBackgroundTick'
import { buildBackgroundLoopSummary } from '../signalBackground/buildBackgroundLoopSummary'
import { extendSignalSnapshotWithOrganism } from '../signalPersistence/extendSignalSnapshotWithOrganism'

export type SignalModeRuntimeOptions = {
  /** Enable background loop ticks */
  enableBackgroundLoop?: boolean
  /** Run a background tick before processing the input */
  runBackgroundBeforeInput?: boolean
  /** Run a background tick after processing the input */
  runBackgroundAfterInput?: boolean
  /** Automatically save organism state with the snapshot */
  autosaveOrganismState?: boolean
}

export type SignalModeRuntimeInput = {
  /**
   * Raw particle stimulus. If `sensoryPacket` is also provided,
   * the packet takes precedence and `stimulus` is used as a fallback.
   */
  stimulus: ParticleStimulus
  /**
   * Optional SensoryPacket from the multimodal input layer.
   * When provided, its converted injection vector overrides `stimulus`.
   */
  sensoryPacket?: SensoryPacket
  existingBranch?: SignalPersonalBranch
  existingLoopState?: SignalLoopState
  existingFieldState?: SignalFieldState
  existingConsolidationState?: SignalConsolidationState
  existingAttentionBudget?: SignalAttentionBudget
  /** Persistent organism state from a previous run or restored snapshot */
  existingOrganismState?: PersistentOrganismState
  /** Background loop state from a previous run or restored snapshot */
  existingBackgroundLoopState?: BackgroundLoopState
  enableBindingTeacher?: boolean
  textSummary?: string
  imageSummary?: string
  audioSummary?: string
  isUserActive?: boolean
  recentActivityLevel?: number
  /** Timestamp of the last external input (used by background loop) */
  lastInputAt?: number
  /** When true, autosave Signal Mode state after each run */
  autosave?: boolean
  /** When provided, the result will include the snapshot for external use */
  returnSnapshot?: boolean
  /** Background loop options */
  backgroundOptions?: SignalModeRuntimeOptions
}

export type SignalModeRuntimeResult = {
  fieldState: SignalFieldState
  personalBranch: SignalPersonalBranch
  loopState: SignalLoopState
  consolidationState: SignalConsolidationState
  attentionBudget: SignalAttentionBudget
  /** Current persistent organism state */
  organismState: PersistentOrganismState
  /** Current background loop state */
  backgroundLoopState: BackgroundLoopState
  snapshot?: SignalModeSnapshot
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
    activeLearning: ReturnType<typeof buildSignalActiveLearningSummary>
    actionOutcomeLearning: ReturnType<typeof buildSignalActionOutcomeObserveSummary>
    evaluation: ReturnType<typeof buildSignalEvaluationObserveSummary>
    /** Organism state summary for UI display */
    organismSummary: ReturnType<typeof buildOrganismSummary>
    /** Background loop summary for UI display */
    backgroundLoopSummary: ReturnType<typeof buildBackgroundLoopSummary>
  }
}

const MAX_CONTRAST_COMPARISONS = 8

function createEmptyDreamSummary() {
  return buildDreamSummary({
    candidates: [],
    evaluations: [],
    strengthenedBridgeIds: [],
    createdBridgeIds: [],
    notes: [],
  })
}

export async function runSignalModeRuntime(
  input: SignalModeRuntimeInput,
): Promise<SignalModeRuntimeResult> {
  // Resolve the active stimulus: SensoryPacket takes precedence when provided
  const activeStimulus: ParticleStimulus = input.sensoryPacket
    ? sensoryPacketToInjectionVector(input.sensoryPacket)
    : input.stimulus

  const timestamp = activeStimulus.timestamp
  const branch = input.existingBranch ?? createInitialSignalPersonalBranch()
  const loopState = input.existingLoopState ?? createInitialSignalLoopState()
  const previousFieldState = input.existingFieldState
  let consolidationState = input.existingConsolidationState ?? createConsolidationState()
  let attentionBudget = input.existingAttentionBudget ?? createInitialAttentionBudget()

  // --- Organism / Background state ---
  let organismState = input.existingOrganismState ?? createInitialOrganismState()
  let backgroundLoopState = input.existingBackgroundLoopState ?? createInitialBackgroundLoopState()

  const bgOptions = input.backgroundOptions ?? {}
  const enableBackgroundLoop = bgOptions.enableBackgroundLoop ?? false

  // Optional: run background tick before processing input
  if (enableBackgroundLoop && bgOptions.runBackgroundBeforeInput) {
    const bgResult = runBackgroundTick({
      organism: organismState,
      background: backgroundLoopState,
      now: timestamp,
      lastInputAt: input.lastInputAt,
    })
    if (bgResult.ran) {
      organismState = bgResult.updatedOrganismState
      backgroundLoopState = bgResult.updatedBackgroundState
    }
  }

  const isUserActive = input.isUserActive ?? true
  const recentActivityLevel = input.recentActivityLevel ?? 0.5

  const fieldResult = await runSignalFieldRuntime({
    stimulus: activeStimulus,
    existingState: previousFieldState,
    enableBindingTeacher: input.enableBindingTeacher,
    textSummary: input.textSummary,
    imageSummary: input.imageSummary,
    audioSummary: input.audioSummary,
  })

  const fieldState = fieldResult.state
  const currentAssemblyIds = fieldState.assemblies.map(assembly => assembly.id)
  const currentAssemblyIdSet = new Set(currentAssemblyIds)
  const assemblyById = new Map(fieldState.assemblies.map(assembly => [assembly.id, assembly]))

  let updatedBranch = recordAssemblyExperience(
    branch,
    fieldResult.observe.newlyDetectedAssemblies
      .filter(id => assemblyById.has(id))
      .map(id => assemblyById.get(id)!),
    'external_stimulus',
  )

  if (fieldState.crossModalBridges.length > 0) {
    updatedBranch = recordBridgeExperience(updatedBranch, fieldState.crossModalBridges, {
      createdBy: input.enableBindingTeacher ? 'binding_teacher' : 'self_discovered',
      confidence: fieldResult.observe.bindingTeacherResult?.confidence ?? 0.5,
      timestamp,
    })
  }

  updatedBranch = updateSignalPersonalBranch(updatedBranch)

  const contrastExperiences: ContrastRecord[] = []
  const contrastAssemblies = fieldState.assemblies
    .filter(assembly => assembly.lastActivatedAt > timestamp - 10_000)
    .slice(0, MAX_CONTRAST_COMPARISONS)
  for (let i = 0; i < contrastAssemblies.length; i += 1) {
    for (let j = i + 1; j < contrastAssemblies.length; j += 1) {
      const comparison = compareAssemblies(contrastAssemblies[i]!, contrastAssemblies[j]!)
      const classification = classifyContrastRelation(comparison)
      contrastExperiences.push({
        id: `contrast_${comparison.sourceAssemblyId}_${comparison.targetAssemblyId}`,
        sourceAssemblyId: comparison.sourceAssemblyId,
        targetAssemblyId: comparison.targetAssemblyId,
        relation: classification.relation,
        confidence: classification.confidence,
        teacherAssisted: false,
        selfDiscovered: true,
        recurrenceCount: 1,
        lastUpdatedAt: timestamp,
      })
    }
  }
  updatedBranch = recordContrastExperience(updatedBranch, contrastExperiences, timestamp)

  const previousSequencePredictions = predictNextAssemblies(
    updatedBranch.sequenceRecords,
    loopState.selfLoop.recentAssemblyIds,
  )
  const sequenceObservation = recordActivationSequence({
    previousAssemblyIds: loopState.selfLoop.recentAssemblyIds,
    currentAssemblyIds,
    observedAt: timestamp,
  })
  updatedBranch = {
    ...updatedBranch,
    sequenceRecords: updateSequenceMemory(
      updatedBranch.sequenceRecords,
      sequenceObservation,
      previousSequencePredictions,
    ),
    updatedAt: timestamp,
  }

  const predictionResidue = computePredictionResidue(previousFieldState, fieldState)
  const updatedSelfLoop = updateSelfLoop(
    loopState.selfLoop,
    fieldState,
    fieldState.recentActivations,
  )

  const signalSources = fieldState.recentActivations.map(event => ({
    source: classifySignalSource(event),
    strength: event.strength,
  }))

  const updatedBoundaryLoop = updateBoundaryLoop(
    loopState.boundaryLoop,
    signalSources,
    predictionResidue,
  )

  const activeParticleCount = fieldState.particles.filter(particle => particle.activation > 0.1).length
  attentionBudget = updateAttentionBudget(
    attentionBudget,
    activeParticleCount,
    input.enableBindingTeacher ?? false,
    !isUserActive,
  )

  const attentionAllocation = allocateSignalAttention(
    attentionBudget,
    !isUserActive,
    predictionResidue,
  )

  let plasticityRecords = decayTimescaleWeights(updatedBranch.plasticityRecords, timestamp)
  const plasticityReinforcements = [
    ...updatedBranch.assemblyRecords
      .filter(record => currentAssemblyIdSet.has(record.assemblyId))
      .map(record => ({
        targetType: 'assembly' as const,
        targetId: record.assemblyId,
        intensity: Math.max(0.2, record.stabilityScore + record.recurrenceCount * 0.05),
      })),
    ...updatedBranch.bridgeRecords
      .filter(record => timestamp - record.lastUsedAt < 15_000)
      .map(record => ({
        targetType: 'bridge' as const,
        targetId: `${record.sourceAssemblyId}->${record.targetAssemblyId}`,
        intensity: Math.max(0.2, record.confidence),
      })),
    ...updatedBranch.sequenceRecords
      .filter(record => timestamp - record.lastObservedAt < 15_000)
      .map(record => ({
        targetType: 'sequence' as const,
        targetId: record.id,
        intensity: Math.max(0.2, record.predictionConfidence),
      })),
  ]
  plasticityRecords = updateMultiTimescaleWeights({
    records: plasticityRecords,
    reinforcements: plasticityReinforcements,
    learningRateMultiplier: attentionBudget.learningRateMultiplier,
    timestamp,
    isResting: !isUserActive,
  })
  updatedBranch = {
    ...updatedBranch,
    plasticityRecords,
    updatedAt: timestamp,
  }

  const recentlyActiveAssemblyIds = fieldState.assemblies
    .filter(assembly => assembly.lastActivatedAt > timestamp - 10_000)
    .map(assembly => assembly.id)

  let competition = computeSignalCompetition(updatedBranch, recentlyActiveAssemblyIds)
  competition = applyAssemblySuppression(competition, updatedBranch)

  const shouldConsolidate = shouldRunConsolidation(
    {
      now: timestamp,
      isUserActive,
      recentActivityLevel,
    },
    consolidationState,
    updatedBranch,
  )

  let dreamSummary = createEmptyDreamSummary()

  if (shouldConsolidate) {
    const replayResult = runRestingReplay(updatedBranch)
    updatedBranch = consolidateSignalBranch(updatedBranch, replayResult)

    const dreamCandidates = selectDreamCandidates({
      branch: updatedBranch,
      contrastRecords: updatedBranch.contrastRecords,
      sequenceRecords: updatedBranch.sequenceRecords,
    })
    const dreamExploration = runOfflineDreamExploration({
      branch: updatedBranch,
      candidates: dreamCandidates,
      contrastRecords: updatedBranch.contrastRecords,
      sequenceRecords: updatedBranch.sequenceRecords,
      plasticityRecords: updatedBranch.plasticityRecords,
      timestamp,
    })
    updatedBranch = updateSignalPersonalBranch({
      ...dreamExploration.branch,
      plasticityRecords: updateMultiTimescaleWeights({
        records: dreamExploration.branch.plasticityRecords,
        reinforcements: [
          ...dreamExploration.result.strengthenedBridgeIds.map(id => ({
            targetType: 'bridge' as const,
            targetId: id,
            intensity: 0.55,
          })),
          ...dreamExploration.result.createdBridgeIds.map(id => ({
            targetType: 'bridge' as const,
            targetId: id,
            intensity: 0.45,
          })),
        ],
        learningRateMultiplier: attentionBudget.learningRateMultiplier,
        timestamp,
        isResting: true,
      }),
      updatedAt: timestamp,
    })
    dreamSummary = buildDreamSummary(dreamExploration.result)

    consolidationState = {
      ...consolidationState,
      lastConsolidatedAt: timestamp,
      consolidationCount: consolidationState.consolidationCount + 1,
      recentReplayAssemblyIds: replayResult.replayedAssemblyIds,
      strengthenedAssemblyIds: replayResult.strengthenedAssemblyIds,
      weakenedBridgeIds: [],
      prunedLinkCount: 0,
      notes: [...replayResult.notes, ...dreamSummary.notes],
    }
  }

  const allReadiness = [
    ...updatedBranch.assemblyRecords.map(record =>
      computeAssemblyPromotionReadiness(
        record,
        competition.suppressedAssemblyIds.includes(record.assemblyId),
      ),
    ),
    ...updatedBranch.bridgeRecords.map(record => computeBridgePromotionReadiness(record)),
    ...updatedBranch.protoSeedRecords.map(record =>
      computeProtoSeedPromotionReadiness(record, updatedBranch),
    ),
  ]

  const promotionReadiness = buildSignalPromotionReadinessSummary(allReadiness)
  const contrastSummary = buildContrastSummary(updatedBranch.contrastRecords)
  const nextSequencePredictions = predictNextAssemblies(updatedBranch.sequenceRecords, currentAssemblyIds)
  const sequenceSummary = buildSequenceSummary(updatedBranch.sequenceRecords, nextSequencePredictions)
  const plasticitySummary = buildPlasticitySummary(updatedBranch.plasticityRecords)

  const selectedAttentionTargets = selectAttentionTargets({
    branch: updatedBranch,
    promotionReadiness,
    contrastSummary,
    sequenceSummary,
    attentionAllocation,
  })
  const activeAttentionBudgetLimit = computeActiveAttentionBudgetLimit(attentionAllocation)
  const teacherQueryTargetIds = chooseTeacherQueryTargets(
    selectedAttentionTargets,
    attentionAllocation.teacherBudget,
  )
  const activeAttentionSummary = buildActiveAttentionSummary({
    selectedTargets: selectedAttentionTargets,
    teacherQueryTargetIds,
    budgetLimit: activeAttentionBudgetLimit,
  })

  const internalQuestions = prioritizeInternalQuestions(
    generateInternalQuestions(selectedAttentionTargets),
    updatedBoundaryLoop.boundaryTension,
    updatedBoundaryLoop.predictionResidue,
  )
  const internalQuestionSummary = buildInternalQuestionSummary(internalQuestions)

  const developmentState = buildDevelopmentSummary(determineSignalDevelopmentStage(updatedBranch))
  const predictions = developmentState.capabilities.canPredictHierarchically
    ? generateHierarchicalPredictions({
        branch: updatedBranch,
        currentAssemblyIds,
        previousAssemblyIds: loopState.selfLoop.recentAssemblyIds,
        timestamp,
      })
    : []
  const predictionComparisons = comparePredictionWithActual({
    predictions,
    actualAssemblyIds: currentAssemblyIds,
    actualBridgeIds: updatedBranch.bridgeRecords.map(record => record.id),
    actualProtoSeedIds: updatedBranch.protoSeedRecords.map(record => record.protoSeedId),
  })
  const predictionMemory = updatePredictionMemory({
    memory: updatedBranch.predictionMemory,
    predictions,
    comparisons: predictionComparisons,
    timestamp,
  })

  let modulatorState = developmentState.capabilities.canModulateLearning
    ? updateSignalModulators({
        previous: updatedBranch.modulatorState,
        branch: updatedBranch,
        outcomeMemory: updatedBranch.outcomeMemory,
        predictionMemory,
        attentionBudget,
        activeParticleCount,
        timestamp,
      })
    : updatedBranch.modulatorState
  attentionBudget = applyModulatorsToLearning(attentionBudget, modulatorState)

  const selectedActions = selectSignalActions({
    selectedTargets: selectedAttentionTargets,
    teacherQueryTargetIds,
    promotionReadiness,
    modulatorState,
    development: developmentState,
    timestamp,
  })

  const evaluatedResults: SignalActionResult[] = []
  let actionBranch = updatedBranch
  for (const action of selectedActions) {
    const executed = await executeSignalAction({
      action,
      branch: actionBranch,
      fieldState,
      enableBindingTeacher: input.enableBindingTeacher,
      textSummary: input.textSummary,
      imageSummary: input.imageSummary,
      audioSummary: input.audioSummary,
      timestamp,
    })
    actionBranch = executed.branch
    evaluatedResults.push(evaluateSignalActionOutcome(action, executed.result))
  }

  let outcomeMemory = updatedBranch.outcomeMemory
  const recentOutcomeRecords = []
  for (let index = 0; index < selectedActions.length; index += 1) {
    const action = selectedActions[index]!
    const result: SignalActionResult = evaluatedResults[index]!
    const surprise = predictionComparisons.find(comparison => comparison.targetId === action.targetId)?.surprise ?? 0
    const reward = computeSignalReward(result, surprise)
    const rewardResult: SignalActionResult = {
      ...result,
      rewardValue: reward.rewardValue,
      notes: [...result.notes, ...reward.notes],
    }
    evaluatedResults[index] = rewardResult
    const record = recordActionOutcome({
      action,
      result: rewardResult,
      errorValue: reward.errorValue,
      timestamp,
    })
    recentOutcomeRecords.push(record)
    outcomeMemory = updateOutcomeMemory({
      memory: outcomeMemory,
      record,
      actionType: action.actionType,
    })
  }

  const reconsolidationOpened = developmentState.capabilities.canReconsolidate
    ? openMemoryForReconsolidation({
        previous: updatedBranch.reconsolidationState,
        recentOutcomes: recentOutcomeRecords,
        predictionComparisons,
        timestamp,
      })
    : updatedBranch.reconsolidationState
  const revised = developmentState.capabilities.canReconsolidate
    ? reviseSignalMemory({
        branch: actionBranch,
        state: reconsolidationOpened,
        timestamp,
      })
    : { branch: actionBranch, state: reconsolidationOpened }
  const reconsolidationState = developmentState.capabilities.canReconsolidate
    ? restabilizeSignalMemory(revised.state, timestamp)
    : revised.state

  updatedBranch = updateSignalPersonalBranch({
    ...revised.branch,
    actionHistory: [...updatedBranch.actionHistory, ...selectedActions].slice(-20),
    actionResults: [...updatedBranch.actionResults, ...evaluatedResults].slice(-20),
    outcomeMemory,
    modulatorState,
    predictionMemory,
    reconsolidationState,
    developmentState,
    updatedAt: timestamp,
  })
  modulatorState = updatedBranch.modulatorState

  const motherExport = buildSignalMotherExport(updatedBranch, allReadiness)
  const motherExportValidation = validateSignalMotherExport(motherExport)

  const protoSeeds = deriveProtoMeaningSeeds(fieldState)
  const mixedSeeds = deriveMixedLatentSeeds(protoSeeds)

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

  const activeLearning = buildSignalActiveLearningSummary({
    activeAttention: activeAttentionSummary,
    contrast: contrastSummary,
    sequence: sequenceSummary,
    plasticity: plasticitySummary,
    dream: dreamSummary,
    inquiry: internalQuestionSummary,
  })

  const actionSummary = buildSignalActionSummary(selectedActions, evaluatedResults)
  const rewardSummary = buildSignalRewardSummary(updatedBranch.outcomeMemory)
  const modulatorSummary = buildModulatorSummary(modulatorState)
  const predictionSummary = buildHierarchicalPredictionSummary(updatedBranch.predictionMemory)
  const reconsolidationSummary = buildReconsolidationSummary(updatedBranch.reconsolidationState)
  const actionOutcomeLearning = buildSignalActionOutcomeObserveSummary({
    actions: actionSummary,
    reward: rewardSummary,
    modulators: modulatorSummary,
    prediction: predictionSummary,
    reconsolidation: reconsolidationSummary,
    development: updatedBranch.developmentState,
  })

  // Risk, dashboard, and persistence evaluation
  const finalLoopState = { selfLoop: updatedSelfLoop, boundaryLoop: updatedBoundaryLoop }
  const riskReport = buildSignalRiskSummary(updatedBranch, fieldState)
  const developmentDashboard = buildDevelopmentDashboard(updatedBranch, riskReport)
  const developmentDashboardSummary = buildDevelopmentDashboardSummary(developmentDashboard)

  // Build snapshot (always create, optionally save)
  const baseSnapshot = createSignalSnapshot({
    fieldState,
    personalBranch: updatedBranch,
    loopState: finalLoopState,
    consolidationState,
    attentionBudget,
  })

  // Update organism state from this input run
  const riskLevelNum =
    riskReport.riskLevel === 'high' ? 0.8 : riskReport.riskLevel === 'medium' ? 0.5 : 0.2
  organismState = updateOrganismStateFromInput(organismState, {
    activeParticleCount: fieldState.particles.filter(p => p.activation > 0.1).length,
    assemblyCount: fieldState.assemblies.length,
    newAssemblyCount: fieldResult.observe.newlyDetectedAssemblies.length,
    bridgeChangeCount: fieldState.crossModalBridges.length,
    predictionError: updatedBoundaryLoop.predictionResidue,
    riskLevel: riskLevelNum,
    teacherInvolved: input.enableBindingTeacher ?? false,
    recallSuccess: fieldResult.observe.recallEvents.length > 0,
    timestamp,
    inputModality: input.sensoryPacket
      ? (activeStimulus.modality as 'text' | 'image' | 'audio')
      : (input.stimulus.modality as 'text' | 'image' | 'audio'),
  })

  // Update recent assembly ids for replay
  const newAssemblyIds = fieldResult.observe.newlyDetectedAssemblies.slice(0, 5)
  if (newAssemblyIds.length > 0) {
    organismState = {
      ...organismState,
      recent: {
        ...organismState.recent,
        recentAssemblyIds: [
          ...organismState.recent.recentAssemblyIds,
          ...newAssemblyIds,
        ].slice(-20),
        replayQueueIds: [
          ...organismState.recent.replayQueueIds,
          ...newAssemblyIds,
        ].slice(-30),
      },
    }
  }

  // Optional: run background tick after processing input
  if (enableBackgroundLoop && bgOptions.runBackgroundAfterInput) {
    const bgResult = runBackgroundTick({
      organism: organismState,
      background: backgroundLoopState,
      now: timestamp,
      lastInputAt: timestamp,
    })
    if (bgResult.ran) {
      organismState = bgResult.updatedOrganismState
      backgroundLoopState = bgResult.updatedBackgroundState
    }
  }

  const snapshot = extendSignalSnapshotWithOrganism(baseSnapshot, organismState, backgroundLoopState)

  if (input.autosave) {
    await saveSignalModeState(snapshot)
  }

  const shouldIncludeSnapshot = (input.returnSnapshot ?? false) || (input.autosave ?? false)
  const persistenceSummary = buildPersistenceSummary(shouldIncludeSnapshot ? snapshot : null)

  const evaluation = buildSignalEvaluationObserveSummary({
    persistence: persistenceSummary,
    risk: riskReport,
    development: developmentDashboardSummary,
  })

  return {
    fieldState,
    personalBranch: updatedBranch,
    loopState: finalLoopState,
    consolidationState,
    attentionBudget,
    organismState,
    backgroundLoopState,
    snapshot: input.returnSnapshot ? snapshot : undefined,
    observe: {
      fieldSummary,
      branchSummary: updatedBranch.summary,
      loopSummary,
      brainLikeGrowth,
      activeLearning,
      actionOutcomeLearning,
      evaluation,
      organismSummary: buildOrganismSummary(organismState),
      backgroundLoopSummary: buildBackgroundLoopSummary(backgroundLoopState),
    },
  }
}
