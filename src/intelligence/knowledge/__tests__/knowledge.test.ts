import { describe, it, expect } from 'vitest'
import { createInfoLayer, updateInfoLayer, upsertInfoEntry } from '../updateInfoLayer'
import { selectInfoCandidates } from '../selectInfoCandidates'
import type { Signal } from '../../signal/types'

const makeSignal = (id: string, label: string): Signal => ({
  id,
  layer: 'self',
  label,
  strength: 0.6,
  pathways: [],
})

// ── createInfoLayer ─────────────────────────────────────────────────────────

describe('createInfoLayer', () => {
  it('creates an empty layer', () => {
    const layer = createInfoLayer()
    expect(layer.entries).toHaveLength(0)
    expect(layer.lastUpdated).toBeTruthy()
  })
})

// ── upsertInfoEntry ─────────────────────────────────────────────────────────

describe('upsertInfoEntry', () => {
  it('adds a new entry', () => {
    const layer = createInfoLayer()
    const next = upsertInfoEntry(layer, { key: 'self_exhaustion', content: '疲れのパターン', relevance: 0.8 })
    expect(next.entries).toHaveLength(1)
    expect(next.entries[0].key).toBe('self_exhaustion')
    expect(next.entries[0].useCount).toBe(0)
  })

  it('updates an existing entry', () => {
    let layer = createInfoLayer()
    layer = upsertInfoEntry(layer, { key: 'key_a', content: 'original', relevance: 0.5 })
    layer = upsertInfoEntry(layer, { key: 'key_a', content: 'updated', relevance: 0.7 })
    expect(layer.entries).toHaveLength(1)
    expect(layer.entries[0].content).toBe('updated')
    expect(layer.entries[0].relevance).toBe(0.7)
  })

  it('does not mutate original layer', () => {
    const original = createInfoLayer()
    upsertInfoEntry(original, { key: 'key_a', content: 'x', relevance: 0.5 })
    expect(original.entries).toHaveLength(0)
  })
})

// ── updateInfoLayer ─────────────────────────────────────────────────────────

describe('updateInfoLayer', () => {
  it('increments useCount for accessed entries', () => {
    let layer = createInfoLayer()
    layer = upsertInfoEntry(layer, { key: 'self_exhaustion', content: '...', relevance: 0.8 })
    const next = updateInfoLayer(layer, ['self_exhaustion'])
    expect(next.entries[0].useCount).toBe(1)
  })

  it('returns original layer unchanged when usedKeys is empty', () => {
    const layer = createInfoLayer()
    expect(updateInfoLayer(layer, [])).toBe(layer)
  })

  it('does not change entries not in usedKeys', () => {
    let layer = createInfoLayer()
    layer = upsertInfoEntry(layer, { key: 'key_a', content: '...', relevance: 0.5 })
    layer = upsertInfoEntry(layer, { key: 'key_b', content: '...', relevance: 0.5 })
    const next = updateInfoLayer(layer, ['key_a'])
    const keyB = next.entries.find((e) => e.key === 'key_b')!
    expect(keyB.useCount).toBe(0)
  })
})

// ── selectInfoCandidates ────────────────────────────────────────────────────

describe('selectInfoCandidates', () => {
  it('returns empty array when info layer is empty', () => {
    const layer = createInfoLayer()
    const result = selectInfoCandidates(layer, [makeSignal('s1', 'label')])
    expect(result).toEqual([])
  })

  it('prioritises entries whose key matches a signal id', () => {
    let layer = createInfoLayer()
    layer = upsertInfoEntry(layer, { key: 'self_exhaustion', content: '...', relevance: 0.5 })
    layer = upsertInfoEntry(layer, { key: 'unrelated_key', content: '...', relevance: 0.9 })
    const signals: Signal[] = [makeSignal('self_exhaustion', '自己疲弊')]
    const result = selectInfoCandidates(layer, signals)
    expect(result[0].key).toBe('self_exhaustion')
  })

  it('returns at most topN entries', () => {
    let layer = createInfoLayer()
    for (let i = 0; i < 10; i++) {
      layer = upsertInfoEntry(layer, { key: `key_${i}`, content: '...', relevance: 0.5 })
    }
    const result = selectInfoCandidates(layer, [], 3)
    expect(result).toHaveLength(3)
  })
})
