export type ParticleId = string

export type ParticlePoint = {
  id: ParticleId
  x: number
  y: number
  z?: number
  activation: number
  threshold: number
  refractory: number
  decayRate: number
  modalityAffinity?: {
    text?: number
    image?: number
    audio?: number
  }
}

export type ParticleLink = {
  sourceId: ParticleId
  targetId: ParticleId
  weight: number
  age: number
  isCrossModal?: boolean
}

export type ParticleStimulus = {
  modality: 'text' | 'image' | 'audio'
  vector: number[]
  strength: number
  timestamp: number
}

export type ActivationEvent = {
  particleId: ParticleId
  strength: number
  source: 'stimulus' | 'propagation' | 'replay'
  timestamp: number
}

export type Assembly = {
  id: string
  particleIds: ParticleId[]
  recurrenceCount: number
  averageCoactivation: number
  lastActivatedAt: number
}

export type ProtoMeaning = {
  id: string
  assemblyIds: string[]
  strength: number
  promotedAt: number
  labelCandidate?: string
}

export type CrossModalBridge = {
  id: string
  sourceAssemblyId: string
  targetAssemblyId: string
  confidence: number
  stage: 'tentative' | 'reinforced' | 'promoted'
  createdAt: number
}

export type SignalFieldState = {
  particles: ParticlePoint[]
  links: ParticleLink[]
  recentActivations: ActivationEvent[]
  assemblies: Assembly[]
  protoMeanings: ProtoMeaning[]
  crossModalBridges: CrossModalBridge[]
  frameCount: number
}
