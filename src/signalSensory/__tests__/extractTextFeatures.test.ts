import { describe, expect, it } from 'vitest'
import { extractTextFeatures, TEXT_FEATURE_NAMES } from '../extractors/extractTextFeatures'
import { SENSORY_FEATURE_DIM } from '../sensoryPacketTypes'

describe('extractTextFeatures', () => {
  it('returns zero vector for empty string', () => {
    const result = extractTextFeatures('')
    expect(result.values).toHaveLength(SENSORY_FEATURE_DIM)
    expect(result.values.every(v => v === 0)).toBe(true)
    expect(result.normalized).toBe(true)
  })

  it('returns dimension of SENSORY_FEATURE_DIM for any input', () => {
    const result = extractTextFeatures('こんにちは。今日はどうでしたか？')
    expect(result.dimension).toBe(SENSORY_FEATURE_DIM)
    expect(result.values).toHaveLength(SENSORY_FEATURE_DIM)
  })

  it('all values are in [0, 1]', () => {
    const texts = [
      'hello world',
      '????!!!!!',
      'あ'.repeat(400),
      'the the the the the',
    ]
    for (const text of texts) {
      const result = extractTextFeatures(text)
      result.values.forEach((v, i) => {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(1)
        if (v < 0 || v > 1) throw new Error(`Feature ${i} out of range: ${v}`)
      })
    }
  })

  it('detects question mark in hasQuestion feature (index 2)', () => {
    const withQ = extractTextFeatures('What is this?')
    const withoutQ = extractTextFeatures('This is a statement.')
    expect(withQ.values[2]).toBe(1)
    expect(withoutQ.values[2]).toBe(0)
  })

  it('detects exclamation mark in hasExclamation feature (index 3)', () => {
    const withEx = extractTextFeatures('Wow!')
    const withoutEx = extractTextFeatures('OK.')
    expect(withEx.values[3]).toBe(1)
    expect(withoutEx.values[3]).toBe(0)
  })

  it('repetitionScore is higher for repetitive text', () => {
    const repetitive = extractTextFeatures('the the the the the')
    const unique = extractTextFeatures('apple banana cherry date elderberry')
    expect(repetitive.values[5]).toBeGreaterThan(unique.values[5]!)
  })

  it('returns named features matching SENSORY_FEATURE_DIM', () => {
    const result = extractTextFeatures('test')
    expect(result.featureNames).toHaveLength(SENSORY_FEATURE_DIM)
    expect(result.featureNames).toEqual(TEXT_FEATURE_NAMES)
  })

  it('longer text produces higher charCountNorm (index 0)', () => {
    const short = extractTextFeatures('hi')
    const long = extractTextFeatures('a'.repeat(200))
    expect(long.values[0]).toBeGreaterThan(short.values[0]!)
  })
})
