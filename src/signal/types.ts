export type SignalLayer = 'other' | 'self' | 'belief' | 'field'

export type Signal = {
  id: string
  layer: SignalLayer
  label: string
  strength: number // 0-1
  pathways: string[] // what activated this signal
}

export type StimulusPacket = {
  raw: string
  intensity: number // 0-1
  valence: number // -1 to 1
  tokens: string[]
}

export type SelfLoopState = {
  dominantSignals: Signal[]
  loopCount: number
  resonanceScore: number
}

export type BoundaryLoopState = {
  internalSignals: Signal[] // self + belief layers
  externalSignals: Signal[] // other + field layers
  boundaryTension: number // 0-1
}

export type CoFiringGroup = {
  signalIds: string[]
  cohesion: number
}

export type SignalField = {
  signals: Signal[]
  coFiringGroups: CoFiringGroup[]
  fieldIntensity: number
}

export type SignalBindingType = 'resonance' | 'tension' | 'amplification' | 'suppression'

export type SignalBinding = {
  sourceId: string
  targetId: string
  weight: number
  type: SignalBindingType
}

export type ProtoMeaningTexture =
  | 'heavy'
  | 'searching'
  | 'still'
  | 'fragile'
  | 'ambiguous'
  | 'hopeful'
  | 'conflicted'
  | 'open'
  | 'closed'

export type ProtoMeaning = {
  id: string
  cluster: string[] // signal labels
  weight: number // 0-1
  valence: number // -1 to 1
  texture: ProtoMeaningTexture
}

export type UtteranceMode = 'receptive' | 'reflective' | 'boundary' | 'resonant'

export type SignalDecision = {
  shouldSpeak: boolean
  utteranceMode: UtteranceMode
  suppressedModes: UtteranceMode[]
  decisionTrace: string[]
}

export type WordCandidate = {
  protoMeaningId: string
  words: string[]
  confidence: number
}

export type PhrasePlan = {
  order: number
  phrase: string
  sourceProtoMeanings: string[]
}

export type SentenceTone = 'still' | 'searching' | 'holding' | 'opening'

export type SentencePlan = {
  lead: string
  body: string[]
  close: string
  tone: SentenceTone
}

export type SignalRuntimeResult = {
  inputText: string
  stimulus: StimulusPacket
  signals: Signal[]
  selfLoopState: SelfLoopState
  boundaryLoopState: BoundaryLoopState
  signalField: SignalField
  bindings: SignalBinding[]
  protoMeanings: ProtoMeaning[]
  decision: SignalDecision
  wordCandidates: WordCandidate[]
  phrasePlan: PhrasePlan[]
  sentencePlan: SentencePlan
  utterance: string
  debugNotes: string[]
  meta: { elapsedMs: number }
}
