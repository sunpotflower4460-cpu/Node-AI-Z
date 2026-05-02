import { describe, expect, it } from 'vitest'
import { sensoryPacketToInjectionVector } from '../sensoryPacketToInjectionVector'
import { createTextSensoryPacket } from '../createTextSensoryPacket'
import { createAudioSensoryPacket } from '../createAudioSensoryPacket'

describe('sensoryPacketToInjectionVector', () => {
  it('converts text packet to stimulus with text modality', () => {
    const packet = createTextSensoryPacket('hello world')
    const stimulus = sensoryPacketToInjectionVector(packet)
    expect(stimulus.modality).toBe('text')
  })

  it('converts audio packet to stimulus with audio modality', () => {
    const packet = createAudioSensoryPacket(null, { description: 'test sound' })
    const stimulus = sensoryPacketToInjectionVector(packet)
    expect(stimulus.modality).toBe('audio')
  })

  it('stimulus vector has at least 3 elements (x, y, z)', () => {
    const packet = createTextSensoryPacket('test')
    const stimulus = sensoryPacketToInjectionVector(packet)
    expect(stimulus.vector.length).toBeGreaterThanOrEqual(3)
  })

  it('x coordinate for text is in left region of field [0, 0.45]', () => {
    const packet = createTextSensoryPacket('this is a text input')
    const stimulus = sensoryPacketToInjectionVector(packet)
    expect(stimulus.vector[0]).toBeLessThanOrEqual(0.45)
  })

  it('x coordinate for audio is in right region of field [0.55, 1]', () => {
    const packet = createAudioSensoryPacket(null, { description: 'sound' })
    const stimulus = sensoryPacketToInjectionVector(packet)
    expect(stimulus.vector[0]).toBeGreaterThanOrEqual(0.55)
  })

  it('strength is in [0, 1]', () => {
    const packet = createTextSensoryPacket('hello')
    const stimulus = sensoryPacketToInjectionVector(packet)
    expect(stimulus.strength).toBeGreaterThanOrEqual(0)
    expect(stimulus.strength).toBeLessThanOrEqual(1)
  })

  it('strength is above minimum threshold', () => {
    const packet = createTextSensoryPacket('hello world this is a test')
    const stimulus = sensoryPacketToInjectionVector(packet)
    expect(stimulus.strength).toBeGreaterThanOrEqual(0.4)
  })

  it('timestamp matches packet createdAt', () => {
    const ts = 1_700_000_000_000
    const packet = createTextSensoryPacket('hi', { timestamp: ts })
    const stimulus = sensoryPacketToInjectionVector(packet)
    expect(stimulus.timestamp).toBe(ts)
  })

  it('text and audio injections target different x regions', () => {
    const textPacket = createTextSensoryPacket('hello')
    const audioPacket = createAudioSensoryPacket(null)
    const textStim = sensoryPacketToInjectionVector(textPacket)
    const audioStim = sensoryPacketToInjectionVector(audioPacket)
    expect(textStim.vector[0]).toBeLessThan(audioStim.vector[0]!)
  })
})
