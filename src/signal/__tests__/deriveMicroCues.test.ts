import { describe, expect, it } from 'vitest'
import { chunkText } from '../ingest/chunkText'
import { createSignalPackets } from '../createSignalPackets'
import { deriveMicroCues } from '../deriveMicroCues'

describe('deriveMicroCues', () => {
  it('derives cue ids from signal packets', () => {
    const packets = createSignalPackets(
      chunkText('意欲が湧かなくて、毎日同じことの繰り返しで困っています。転職すべきか悩んでいます。'),
    )
    const cues = deriveMicroCues(packets)
    const cueIds = cues.map((cue) => cue.id)

    expect(cueIds).toContain('motivation_drop')
    expect(cueIds).toContain('monotony_cue')
    expect(cueIds).toContain('distress_cue')
    expect(cueIds).toContain('guidance_request_cue')
  })
})
