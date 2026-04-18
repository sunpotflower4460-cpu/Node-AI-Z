import type { OptionNode } from '../option/types'
import type { MeaningChunk } from '../signal/ingest/chunkTypes'
import type { StateVector } from '../types/nodeStudio'
import type { MicroCue } from '../signal/packetTypes'
import type { TemporalCueState } from '../signal/temporalTypes'
import type { CuePredictionState } from '../signal/buildPredictionState'
import type { CuePredictionModulationResult } from '../signal/applyPredictionModulation'
import type { ProtoMeaningHierarchy } from '../meaning/types'
import { buildLexicalState } from '../lexical'
import { fuseLexicalAndSignal } from '../fusion'
import { buildMicroSignalState } from '../signal/buildMicroSignalState'
import { createSignalPackets } from '../signal/createSignalPackets'
import { deriveMicroCues } from '../signal/deriveMicroCues'
import { applyTemporalDecay } from '../signal/applyTemporalDecay'
import { applyRefractoryGating } from '../signal/applyRefractoryGating'
import { applyCueInhibition } from '../signal/applyCueInhibition'
import { computeDynamicThreshold } from '../signal/computeDynamicThreshold'
import { runRecurrentSelfLoop } from '../signal/runRecurrentSelfLoop'
import { buildPredictionState } from '../signal/buildPredictionState'
import { applyPredictionModulation } from '../signal/applyPredictionModulation'
import { deriveSensoryProtoMeanings } from '../meaning/deriveSensoryProtoMeanings'
import { deriveNarrativeProtoMeanings } from '../meaning/deriveNarrativeProtoMeanings'
import { mergeProtoMeaningHierarchy } from '../meaning/mergeProtoMeaningHierarchy'

export type DualStreamRuntimeInput = {
  text: string
  chunks: MeaningChunk[]
  detectedOptions?: OptionNode[]
  field?: StateVector
  currentTurn?: number
  previousCueStates?: Map<string, TemporalCueState>
  previousPredictionState?: CuePredictionState
  recentActivityScore?: number
}

export type DualStreamRuntimeResult = {
  lexicalState: ReturnType<typeof buildLexicalState>
  signalPackets: ReturnType<typeof createSignalPackets>
  microCues: MicroCue[]
  decayedCues: MicroCue[]
  refractoryCues: MicroCue[]
  inhibitedCues: MicroCue[]
  modulatedCues: MicroCue[]
  thresholdedCues: MicroCue[]
  activeCues: MicroCue[]
  dynamicThreshold: ReturnType<typeof computeDynamicThreshold>
  recurrentResult: ReturnType<typeof runRecurrentSelfLoop>
  prediction: {
    prior: CuePredictionState
    modulation: CuePredictionModulationResult
    next: CuePredictionState
  }
  sensoryProtoMeanings: ReturnType<typeof deriveSensoryProtoMeanings>
  narrativeProtoMeanings: ReturnType<typeof deriveNarrativeProtoMeanings>
  protoMeaningHierarchy: ProtoMeaningHierarchy
  microSignalState: ReturnType<typeof buildMicroSignalState>
  fusedState: ReturnType<typeof fuseLexicalAndSignal>
  observe: {
    temporalDecay: string[]
    refractory: string[]
    inhibition: string[]
    prediction: string[]
    threshold: string
    sensory: string[]
    narrative: string[]
    hierarchy: string[]
  }
  nextTemporalCueStates: TemporalCueState[]
}

const SELF_BELIEF_CUE_IDS = new Set([
  'motivation_drop',
  'distress_cue',
  'uncertainty_cue',
  'purpose_confusion_cue',
  'faint_possibility_cue',
  'pressure_cue',
  'guidance_request_cue',
  'change_option_cue',
  'contrast_cue',
])

const toTemporalState = (cue: MicroCue, turn: number): TemporalCueState => ({
  id: cue.id,
  strength: cue.strength,
  lastFiredTurn: cue.lastFiredTurn ?? turn,
  decayRate: cue.decayRate ?? 0.1,
  refractoryUntilTurn: cue.refractoryUntilTurn ?? turn,
})

export const runDualStreamRuntime = ({
  text,
  chunks,
  detectedOptions,
  field,
  currentTurn = 0,
  previousCueStates,
  previousPredictionState,
  recentActivityScore = 0.5,
}: DualStreamRuntimeInput): DualStreamRuntimeResult => {
  const lexicalState = buildLexicalState({
    rawText: text,
    chunks,
    detectedOptions,
  })

  const signalPackets = createSignalPackets(chunks)

  const baseCues: MicroCue[] = deriveMicroCues(signalPackets).map((cue) => ({
    ...cue,
    rawStrength: cue.strength,
  }))

  const { features: decayedCues, debugNotes: decayNotes } = applyTemporalDecay(
    baseCues,
    currentTurn,
    previousCueStates,
  )
  const { features: refractoryCues, debugNotes: refractoryNotes } = applyRefractoryGating(
    decayedCues,
    currentTurn,
  )
  const { cues: inhibitedCues, debugNotes: inhibitionNotes } = applyCueInhibition(refractoryCues)

  const priorPrediction: CuePredictionState =
    previousPredictionState ?? { expectedCueIds: [], expectedStrengths: {}, confidence: 0, turn: currentTurn - 1 }
  const modulation = applyPredictionModulation(inhibitedCues, priorPrediction)

  const activityForThreshold = Math.min(
    1,
    (recentActivityScore + modulation.overallSurprise * 0.5 + Math.min(1, baseCues.length / 6) * 0.2) / 1.7,
  )
  const dynamicThreshold = computeDynamicThreshold(activityForThreshold)
  const thresholdedCues = modulation.cues.filter((cue) => cue.strength >= dynamicThreshold.current)

  const recurrentResult = runRecurrentSelfLoop(
    thresholdedCues,
    undefined,
    8,
    0.01,
    SELF_BELIEF_CUE_IDS,
  )
  const activeCues =
    recurrentResult.states.length > 0
      ? (recurrentResult.states[recurrentResult.states.length - 1] as MicroCue[])
      : thresholdedCues

  const microSignalState = buildMicroSignalState({
    packets: signalPackets,
    cues: activeCues,
    field,
  })

  const sensoryProtoMeanings = deriveSensoryProtoMeanings({
    cues: activeCues,
    microState: microSignalState,
    field,
  })
  const narrativeProtoMeanings = deriveNarrativeProtoMeanings({
    sensoryProtoMeanings,
    nodes: [],
    field: field ?? {
      fragility: 0,
      urgency: 0,
      depth: 0,
      care: 0,
      agency: 0,
      ambiguity: 0,
      change: 0,
      stability: 0,
      self: 0,
      relation: 0,
      light: 0,
      heaviness: 0,
    },
    predictionErrorSummary: {
      overallSurprise: modulation.overallSurprise,
      cueIds: modulation.surpriseCues,
    },
  })
  const protoMeaningHierarchy = mergeProtoMeaningHierarchy(sensoryProtoMeanings, narrativeProtoMeanings)

  const fusedState = fuseLexicalAndSignal(lexicalState, microSignalState)

  const nextTemporalCueStates = activeCues.map((cue) => toTemporalState(cue, currentTurn))
  const nextPredictionState = buildPredictionState(activeCues, currentTurn)

  const observe = {
    temporalDecay: decayNotes,
    refractory: refractoryNotes,
    inhibition: inhibitionNotes,
    prediction: modulation.debugNotes,
    threshold: `Dynamic threshold: ${dynamicThreshold.current.toFixed(3)} (activity=${dynamicThreshold.recentActivityScore.toFixed(2)})`,
    sensory: sensoryProtoMeanings.map((m) => `${m.glossJa}(${m.strength.toFixed(2)})`),
    narrative: narrativeProtoMeanings.map((m) => `${m.glossJa}(${m.strength.toFixed(2)})`),
    hierarchy: protoMeaningHierarchy.all.map((m) => `${m.level}:${m.glossJa} ${m.strength.toFixed(2)}`),
  }

  return {
    lexicalState,
    signalPackets,
    microCues: baseCues,
    decayedCues,
    refractoryCues,
    inhibitedCues,
    modulatedCues: modulation.cues,
    thresholdedCues,
    activeCues,
    dynamicThreshold,
    recurrentResult,
    prediction: {
      prior: priorPrediction,
      modulation,
      next: nextPredictionState,
    },
    sensoryProtoMeanings,
    narrativeProtoMeanings,
    protoMeaningHierarchy,
    microSignalState,
    fusedState,
    observe,
    nextTemporalCueStates,
  }
}
