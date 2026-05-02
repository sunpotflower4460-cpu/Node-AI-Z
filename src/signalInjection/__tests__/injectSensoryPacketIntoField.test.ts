import { describe, expect, it } from 'vitest'
import { injectSensoryPacketIntoField } from '../injectSensoryPacketIntoField'
import { createStableParticleField } from '../../signalField/createStableParticleField'
import { createTextSensoryPacket } from '../../signalSensory/createTextSensoryPacket'
import { createAudioSensoryPacket } from '../../signalSensory/createAudioSensoryPacket'

describe('injectSensoryPacketIntoField', () => {
  it('returns updated state and injection event', () => {
    const field = createStableParticleField()
    const packet = createTextSensoryPacket('hello signal field')
    const result = injectSensoryPacketIntoField(field, packet)

    expect(result.state).toBeDefined()
    expect(result.event).toBeDefined()
    expect(result.event.packetId).toBe(packet.id)
  })

  it('event modality matches packet modality', () => {
    const field = createStableParticleField()
    const packet = createAudioSensoryPacket(null, { description: 'test' })
    const result = injectSensoryPacketIntoField(field, packet)
    expect(result.event.modality).toBe('audio')
  })

  it('activates at least some particles in a fresh field', () => {
    const field = createStableParticleField()
    const packet = createTextSensoryPacket('strong signal here')
    const result = injectSensoryPacketIntoField(field, packet)
    expect(result.event.activatedParticleCount).toBeGreaterThan(0)
  })

  it('injection event has valid stimulusStrength in [0, 1]', () => {
    const field = createStableParticleField()
    const packet = createTextSensoryPacket('test text')
    const result = injectSensoryPacketIntoField(field, packet)
    expect(result.event.stimulusStrength).toBeGreaterThanOrEqual(0)
    expect(result.event.stimulusStrength).toBeLessThanOrEqual(1)
  })

  it('state has same particle count as original field', () => {
    const field = createStableParticleField()
    const packet = createTextSensoryPacket('test')
    const result = injectSensoryPacketIntoField(field, packet)
    expect(result.state.particles).toHaveLength(field.particles.length)
  })

  it('text and audio injections activate different particle regions', () => {
    const field = createStableParticleField()
    const textPacket = createTextSensoryPacket('hello')
    const audioPacket = createAudioSensoryPacket(null, { description: 'sound' })

    const textResult = injectSensoryPacketIntoField(field, textPacket)
    const audioResult = injectSensoryPacketIntoField(field, audioPacket)

    const textIds = new Set(
      textResult.state.recentActivations
        .filter(e => e.source === 'stimulus')
        .map(e => e.particleId),
    )
    const audioIds = new Set(
      audioResult.state.recentActivations
        .filter(e => e.source === 'stimulus')
        .map(e => e.particleId),
    )

    // They should not be identical (different spatial regions)
    const commonIds = [...textIds].filter(id => audioIds.has(id))
    expect(commonIds.length).toBeLessThan(Math.min(textIds.size, audioIds.size))
  })
})
