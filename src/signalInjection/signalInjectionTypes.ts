import type { SensoryPacket } from '../signalSensory/sensoryPacketTypes'
import type { ParticleStimulus } from '../signalField/signalFieldTypes'

/** Intermediate representation before the stimulus reaches the field */
export type InjectionVector = {
  stimulus: ParticleStimulus
  packetId: string
  modality: string
  source: string
  strength: number
  timestamp: number
}

/** Records what happened when a packet was injected */
export type InjectionEvent = {
  id: string
  packetId: string
  injectedAt: number
  modality: SensoryPacket['modality']
  source: SensoryPacket['source']
  stimulusStrength: number
  activatedParticleCount: number
  notes: string[]
}

export type InjectionSummary = {
  totalInjected: number
  modalityCounts: Record<string, number>
  meanStrength: number
  lastInjectedAt: number | null
  recentEvents: InjectionEvent[]
}
