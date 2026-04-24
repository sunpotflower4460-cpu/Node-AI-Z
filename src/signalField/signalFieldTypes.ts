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

/**
 * A pre-semantic seed derived from Signal Field assemblies / proto-meanings / bridges.
 * Intentionally does NOT carry high-level meaning labels (e.g. "sadness").
 * Features describe structural / statistical properties of the firing pattern.
 */
export type ProtoMeaningSeed = {
  id: string
  sourceAssemblyIds: string[]
  sourceProtoMeaningIds?: string[]
  strength: number
  seedType: 'assembly_cluster' | 'bridge_cluster' | 'replay_cluster'
  features: string[]
}

/**
 * A latent-axis seed derived from ProtoMeaningSeeds.
 * Connects the signal field layer to the crystallized_thinking mixed-node world.
 * Axes are abstract continuous values — no final meaning labels yet.
 */
export type MixedLatentSeed = {
  id: string
  sourceSeedIds: string[]
  weight: number
  axes: {
    pull?: number
    avoidance?: number
    openness?: number
    instability?: number
    repetition?: number
    crossModalBinding?: number
  }
}
