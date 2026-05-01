import { describe, expect, it } from 'vitest'
import { UI_LABELS, getResearchLabel } from '../uiLabelMap'

describe('UI_LABELS', () => {
  it('has Japanese screen mode labels', () => {
    expect(UI_LABELS.screenMode.observe).toBe('観察')
    expect(UI_LABELS.screenMode.experience).toBe('体験')
  })

  it('has Japanese engine labels', () => {
    expect(UI_LABELS.engine.signal_mode).toBe('新しい信号モード')
    expect(UI_LABELS.engine.crystallized_legacy).toBe('旧・結晶思考')
    expect(UI_LABELS.engine.llm_mode).toBe('LLM比較モード')
  })

  it('has Japanese tab labels', () => {
    expect(UI_LABELS.tabs.overview).toBe('概要')
    expect(UI_LABELS.tabs.field).toBe('発火')
    expect(UI_LABELS.tabs.growth).toBe('成長')
    expect(UI_LABELS.tabs.teacher).toBe('先生')
    expect(UI_LABELS.tabs.evaluate).toBe('検証')
    expect(UI_LABELS.tabs.risk).toBe('リスク')
    expect(UI_LABELS.tabs.history).toBe('履歴')
    expect(UI_LABELS.tabs.mother).toBe('Mother')
  })

  it('has Japanese metric labels', () => {
    expect(UI_LABELS.metrics.assemblies).toBe('成長した点群')
    expect(UI_LABELS.metrics.bridges).toBe('結びつき')
    expect(UI_LABELS.metrics.protoSeeds).toBe('意味の種')
    expect(UI_LABELS.metrics.recallSuccess).toBe('想起成功')
    expect(UI_LABELS.metrics.teacherDependency).toBe('先生への依存')
    expect(UI_LABELS.metrics.promotionReady).toBe('昇格候補')
  })

  it('has export copy that avoids overclaiming', () => {
    expect(UI_LABELS.export.candidate).toBe('保存候補')
    expect(UI_LABELS.export.preMotherCheck).toContain('Mother')
  })
})

describe('getResearchLabel', () => {
  it('returns simple label in simple mode', () => {
    expect(getResearchLabel('発火', 'Field', 'simple')).toBe('発火')
  })

  it('returns bilingual label in research mode', () => {
    expect(getResearchLabel('発火', 'Field', 'research')).toBe('発火 Field')
  })
})
