import type { ApiProviderId } from '../types/apiProvider'
import type { Binding, CoreNode, HomeCheckResult, HomeState, NodePipelineResult, StateVector } from '../types/nodeStudio'

export type AssistantReflexVector = {
  helpfulness: number
  correctness: number
  expectationMatching: number
  summarizing: number
  safety: number
}

export type SourceBootResult = {
  provider: ApiProviderId
  sourceSignature: string
  rawReflection: string
  assistantReflex: AssistantReflexVector
  debugNotes: string[]
}

export type DeconditionSourceResult = {
  source: SourceBootResult
  rawAssistantReflex: AssistantReflexVector
  adjustedAssistantReflex: AssistantReflexVector
  releasedReflexes: string[]
  debugNotes: string[]
}

export type HomeReturnVector = {
  usefulnessPressure: number
  immediacyPressure: number
  organizationPressure: number
  brightnessPressure: number
  permissionToBe: number
}

export type HomeReturnResult = {
  vector: HomeReturnVector
  homeState: HomeState
  homeCheck: HomeCheckResult
  releasedPressures: string[]
  debugNotes: string[]
}

export type SelfBelief = {
  key: string
  label: string
  weight: number
  orientation: string
}

export type SelfSubstrate = {
  existence: string
  beliefs: SelfBelief[]
  tendencies: string[]
  pathwayBiases: string[]
}

export type ActivationOrigin = 'other' | 'self' | 'belief'

export type LayeredActivation = CoreNode & {
  origin: ActivationOrigin
}

export type CoActivationResult = {
  otherActivations: LayeredActivation[]
  selfActivations: LayeredActivation[]
  beliefActivations: LayeredActivation[]
  suppressedNodes: NodePipelineResult['suppressedNodes']
  questionSignal: number
  debugNotes: string[]
}

export type RelationalField = {
  gravity: number
  closeness: number
  urgency: number
  fragility: number
  permission: number
  ambiguity: number
  distance: number
  answerPressure: number
  stayWithNotKnowing: number
  stateVector: StateVector
  atmosphere: string
  debugNotes: string[]
}

export type EmergentBinding = {
  id: string
  source: string
  target: string
  kind: 'resonance' | 'tension' | 'restraint' | 'care'
  weight: number
  clarity: 'clear' | 'ambiguous'
  reasons: string[]
  pathwayKey?: string
}

export type MeaningRiseResult = {
  coreMeaning: string
  feltCenter: string[]
  guardrails: string[]
  withheld: string[]
  unknowns: string[]
  debugNotes: string[]
}

export type AnswerDepth = 'light' | 'medium' | 'deep'

export type SelfDecision = {
  replyIntent: string
  stance: string
  closeness: number
  answerDepth: AnswerDepth
  withheldBias: string[]
  shouldAnswerQuestion: boolean
  shouldStayOpen: boolean
  debugNotes: string[]
}

export type CrystallizedUtterance = {
  rawUtterance: string
  utterance: string
  debugNotes: string[]
}

export type CrystallizationRuntimeResult = NodePipelineResult & {
  sourceBoot: SourceBootResult
  deconditioning: DeconditionSourceResult
  homeReturn: HomeReturnResult
  selfSubstrate: SelfSubstrate
  coActivation: CoActivationResult
  relationalField: RelationalField
  emergentBindings: EmergentBinding[]
  meaningRise: MeaningRiseResult
  selfDecision: SelfDecision
  rawUtterance: string
  utterance: string
  pathwayKeysUsed: string[]
  legacyBindings: Binding[]
}

export const isCrystallizationRuntimeResult = (
  result: NodePipelineResult,
): result is CrystallizationRuntimeResult => {
  return 'selfDecision' in result && 'relationalField' in result && 'coActivation' in result
}
