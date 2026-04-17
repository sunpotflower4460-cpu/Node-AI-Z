import { describe, expect, it } from 'vitest'
import { chunkText } from '../ingest/chunkText'
import { buildMicroSignalState } from '../buildMicroSignalState'
import { createSignalPackets } from '../createSignalPackets'
import { deriveMicroCues } from '../deriveMicroCues'

describe('buildMicroSignalState', () => {
  it('builds dimensions and resolves field tone from cues', () => {
    const packets = createSignalPackets(
      chunkText('意欲が湧かなくて、困っています。どうしたらいいですか？'),
    )
    const cues = deriveMicroCues(packets)
    const state = buildMicroSignalState({ packets, cues })

    expect(state.dimensions.heaviness).toBeGreaterThan(0.4)
    expect(state.dimensions.answerPressure).toBeGreaterThan(0.2)
    expect(['low-band', 'mid-band', 'high-band']).toContain(state.fieldTone)
  })
})
