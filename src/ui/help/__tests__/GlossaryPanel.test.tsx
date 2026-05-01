import { describe, expect, it } from 'vitest'
import { buildGlossaryViewModel, findGlossaryEntry, GLOSSARY_ENTRIES } from '../buildGlossaryViewModel'

describe('buildGlossaryViewModel', () => {
  it('returns entries', () => {
    const { entries } = buildGlossaryViewModel()
    expect(entries.length).toBeGreaterThan(0)
  })

  it('contains key terms', () => {
    const { entries } = buildGlossaryViewModel()
    const terms = entries.map((e) => e.term)
    expect(terms).toContain('発火')
    expect(terms).toContain('成長した点群')
    expect(terms).toContain('結びつき')
    expect(terms).toContain('意味の種')
    expect(terms).toContain('先生')
    expect(terms).toContain('先生への依存')
    expect(terms).toContain('昇格候補')
    expect(terms).toContain('過結合傾向')
    expect(terms).toContain('保存候補')
  })

  it('each entry has term and definition', () => {
    const { entries } = buildGlossaryViewModel()
    for (const entry of entries) {
      expect(entry.term.length).toBeGreaterThan(0)
      expect(entry.definition.length).toBeGreaterThan(0)
    }
  })
})

describe('findGlossaryEntry', () => {
  it('finds an existing term', () => {
    const entry = findGlossaryEntry('発火')
    expect(entry).toBeDefined()
    expect(entry?.definition).toBeTruthy()
  })

  it('returns undefined for unknown term', () => {
    expect(findGlossaryEntry('存在しない用語')).toBeUndefined()
  })

  it('entry for 新しい信号モード exists', () => {
    const entry = findGlossaryEntry('新しい信号モード')
    expect(entry).toBeDefined()
    expect(entry?.researchNote).toContain('signal_mode')
  })
})

describe('GLOSSARY_ENTRIES', () => {
  it('all entries have research notes', () => {
    for (const entry of GLOSSARY_ENTRIES) {
      expect(entry.researchNote).toBeTruthy()
    }
  })
})
