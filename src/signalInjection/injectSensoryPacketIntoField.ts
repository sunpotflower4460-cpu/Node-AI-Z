import type { SignalFieldState } from '../signalField/signalFieldTypes'
import type { SensoryPacket } from '../signalSensory/sensoryPacketTypes'
import type { InjectionEvent } from './signalInjectionTypes'
import { sensoryPacketToInjectionVector } from '../signalSensory/sensoryPacketToInjectionVector'
import { igniteParticles } from '../signalField/igniteParticles'

export type InjectionResult = {
  state: SignalFieldState
  event: InjectionEvent
}

/**
 * Injects a SensoryPacket into the Signal Field by:
 *  1. Converting the packet to a ParticleStimulus via sensoryPacketToInjectionVector
 *  2. Running igniteParticles to activate nearby particles
 *  3. Returning the updated field state and an InjectionEvent record
 *
 * This is the single common entry point for all modalities.
 */
export function injectSensoryPacketIntoField(
  fieldState: SignalFieldState,
  packet: SensoryPacket,
): InjectionResult {
  const stimulus = sensoryPacketToInjectionVector(packet)
  const { state: updatedState, events } = igniteParticles(fieldState, stimulus)

  const activatedCount = events.length

  const injectionEvent: InjectionEvent = {
    id: `inject_${packet.id}_${stimulus.timestamp}`,
    packetId: packet.id,
    injectedAt: stimulus.timestamp,
    modality: packet.modality,
    source: packet.source,
    stimulusStrength: stimulus.strength,
    activatedParticleCount: activatedCount,
    notes: activatedCount === 0
      ? ['no particles activated — field may be fully refractory']
      : [`activated ${activatedCount} particle(s)`],
  }

  return { state: updatedState, event: injectionEvent }
}
