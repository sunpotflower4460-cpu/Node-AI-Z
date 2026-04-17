import { describe, expect, it } from 'vitest'
import { chunkText } from '../ingest/chunkText'
import { createSignalPackets } from '../createSignalPackets'

describe('createSignalPackets', () => {
  it('creates one packet per chunk with salience and charge', () => {
    const chunks = chunkText('意欲が湧かなくて、困っています。どうしたらいいですか？')
    const packets = createSignalPackets(chunks)

    expect(packets).toHaveLength(chunks.length)
    packets.forEach((packet, index) => {
      expect(packet.id).toBe(`packet:${index}`)
      expect(packet.salience).toBeGreaterThan(0)
      expect(packet.salience).toBeLessThanOrEqual(1)
      expect(packet.emotionalCharge).toBeGreaterThan(0)
      expect(packet.emotionalCharge).toBeLessThanOrEqual(1)
    })
  })
})
