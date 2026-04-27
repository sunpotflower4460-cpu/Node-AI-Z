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
import { generateInternalQuestions } from '../signalInquiry/generateInternalQuestions'
import { prioritizeInternalQuestions } from '../signalInquiry/prioritizeInternalQuestions'
import { buildInternalQuestionSummary } from '../signalInquiry/buildInternalQuestionSummary'
import { buildSignalActiveLearningSummary } from '../observe/buildSignalActiveLearningSummary'

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
    activeLearning: ReturnType<typeof buildSignalActiveLearningSummary>
  }
}

const MAX_CONTRAST_COMPARISONS = 8
const MIN_ATTENTION_TARGETS = 1
const MAX_ATTENTION_TARGETS = 6
const BUDGET_PER_TARGET = 12

function createEmptyDreamSummary() {
  return buildDreamSummary({
    candidates: [],
    evaluations: [],
    strengthenedBridgeIds: [],
    createdBridgeIds: [],
    notes: [],
  })
}

/**
 * Run Signal Mode Runtime.
 */
export async function runSignalModeRuntime(
  input: SignalModeRuntimeInput,
): Promise<SignalModeRuntimeResult> {
  const timestamp = input.stimulus.timestamp

  const branch = input.existingBranch ?? createInitialSignalPersonalBranch()
  const loopState = input.existingLoopState ?? createInitialSignalLoopState()
  const previousFieldState = input.existingFieldState
  let consolidationState = input.existingConsolidationState ?? createConsolidationState()
  let attentionBudget = input.existingAttentionBudget ?? createInitialAttentionBudget()

  const isUserActive = input.isUserActive ?? true
  const recentActivityLevel = input.recentActivityLevel ?? 0.5

  const fieldResult = await runSignalFieldRuntime({
    stimulus: input.stimulus,
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
    fieldResult.observe.newlyDetectedAssemblies.filter(id => assemblyById.has(id)).map(id => assemblyById.get(id)!),
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
  const activeAttentionBudgetLimit = Math.max(
    MIN_ATTENTION_TARGETS,
    Math.min(
      MAX_ATTENTION_TARGETS,
      Math.floor(
        (attentionAllocation.replayBudget +
          attentionAllocation.teacherBudget +
          attentionAllocation.consolidationBudget) /
          BUDGET_PER_TARGET,
      ),
    ),
  )
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

  updatedBranch = updateSignalPersonalBranch(updatedBranch)

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
      activeLearning,
    },
  }
}
