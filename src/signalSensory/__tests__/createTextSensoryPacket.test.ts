import { describe, expect, it } from 'vitest'
import { createTextSensoryPacket } from '../createTextSensoryPacket'
import { SENSORY_FEATURE_DIM } from '../sensoryPacketTypes'

describe('createTextSensoryPacket', () => {
  it('creates a packet with correct modality', () => {
    const packet = createTextSensoryPacket('hello')
    expect(packet.modality).toBe('text')
  })

  it('has external source by default', () => {
    const packet = createTextSensoryPacket('hello')
    expect(packet.source).toBe('external')
    expect(packet.tags.isExternal).toBe(true)
  })

  it('features are SENSORY_FEATURE_DIM dimensional', () => {
    const packet = createTextSensoryPacket('test input text')
    expect(packet.features.dimension).toBe(SENSORY_FEATURE_DIM)
    expect(packet.features.values).toHaveLength(SENSORY_FEATURE_DIM)
    expect(packet.features.normalized).toBe(true)
  })

  it('all feature values are in [0, 1]', () => {
    const packet = createTextSensoryPacket('???!!!! hello world test test test')
    packet.features.values.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    })
  })

  it('empty text has lower extractionConfidence', () => {
    const empty = createTextSensoryPacket('')
    const full = createTextSensoryPacket('some text')
    expect(full.confidence.extractionConfidence).toBeGreaterThan(
      empty.confidence.extractionConfidence,
    )
  })

  it('respects custom source option', () => {
    const packet = createTextSensoryPacket('replay text', { source: 'internal_replay' })
    expect(packet.source).toBe('internal_replay')
    expect(packet.tags.isReplay).toBe(true)
    expect(packet.tags.isExternal).toBe(false)
  })

  it('has a unique id per call', () => {
    const p1 = createTextSensoryPacket('hello')
    const p2 = createTextSensoryPacket('hello')
    expect(p1.id).not.toBe(p2.id)
  })

  it('rawSummary contains text length as size', () => {
    const text = 'hello world'
    const packet = createTextSensoryPacket(text)
    expect(packet.rawSummary.size).toBe(text.length)
  })
})
