import { describe, expect, it } from 'vitest'
import { chunkText } from '../../signal/ingest/chunkText'
import { runDualStreamRuntime } from '../runDualStreamRuntime'

describe('runDualStreamRuntime', () => {
  it('runs lexical, signal, and fusion stages together', () => {
    const text = '仕事に対する意欲が湧かなくて、転職すべきか続けるべきか悩んでいます。どうしたらいいですか？'
    const result = runDualStreamRuntime({
      text,
      chunks: chunkText(text),
      detectedOptions: [
        { id: 'option:change', label: '転職', sourceChunkIds: ['chunk:1'] },
        { id: 'option:stay', label: '続ける', sourceChunkIds: ['chunk:1'] },
      ],
    })

    expect(result.lexicalState.requestType).toBe('choice')
    expect(result.signalPackets.length).toBeGreaterThan(0)
    expect(result.microCues.length).toBeGreaterThan(0)
    expect(result.microSignalState.fieldTone).toBeDefined()
    expect(result.fusedState.integratedTensions.length).toBeGreaterThan(0)
    expect(result.dynamicThreshold.current).toBeGreaterThan(0)
    expect(result.sensoryProtoMeanings.length).toBeGreaterThan(0)
    expect(result.narrativeProtoMeanings.length).toBeGreaterThan(0)
  })
})
