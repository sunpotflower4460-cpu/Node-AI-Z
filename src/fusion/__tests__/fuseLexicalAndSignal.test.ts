import { describe, expect, it } from 'vitest'
import { buildLexicalState } from '../../lexical/buildLexicalState'
import { chunkText } from '../../signal/ingest/chunkText'
import { buildMicroSignalState } from '../../signal/buildMicroSignalState'
import { createSignalPackets } from '../../signal/createSignalPackets'
import { deriveMicroCues } from '../../signal/deriveMicroCues'
import { fuseLexicalAndSignal } from '../fuseLexicalAndSignal'

describe('fuseLexicalAndSignal', () => {
  it('creates fused tensions, textures, and confidence', () => {
    const text = '意欲が湧かなくて困っています。転職すべきか続けるべきか、どうしたらいいですか？'
    const lexicalState = buildLexicalState({
      rawText: text,
      chunks: chunkText(text),
      detectedOptions: [
        { id: 'option:change', label: '転職', sourceChunkIds: ['chunk:1'] },
        { id: 'option:stay', label: '続ける', sourceChunkIds: ['chunk:1'] },
      ],
    })
    const packets = createSignalPackets(chunkText(text))
    const cues = deriveMicroCues(packets)
    const microSignalState = buildMicroSignalState({ packets, cues })
    const fusedState = fuseLexicalAndSignal(lexicalState, microSignalState)

    expect(fusedState.integratedTensions.length).toBeGreaterThan(0)
    expect(fusedState.dominantTextures.length).toBeGreaterThan(0)
    expect(fusedState.fusedConfidence).toBeGreaterThan(0)
    expect(fusedState.fusedConfidence).toBeLessThanOrEqual(1)
  })
})
