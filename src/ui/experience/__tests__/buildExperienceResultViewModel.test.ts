import { describe, expect, it } from 'vitest'
import { buildExperienceResultViewModel } from '../buildExperienceResultViewModel'
import type { ExperienceMessage } from '../../../types/experience'

const baseMessage: ExperienceMessage = {
  id: 'msg-1',
  observationId: 'obs-1',
  role: 'assistant',
  text: 'テスト返答',
  timestamp: new Date().toISOString(),
}

describe('buildExperienceResultViewModel', () => {
  it('returns responseText from message', () => {
    const vm = buildExperienceResultViewModel({ message: baseMessage, engineLabel: 'New Signal' })
    expect(vm.responseText).toBe('テスト返答')
  })

  it('returns engineLabel', () => {
    const vm = buildExperienceResultViewModel({ message: baseMessage, engineLabel: 'New Signal' })
    expect(vm.engineLabel).toBe('New Signal')
  })

  it('includes internalSummary', () => {
    const vm = buildExperienceResultViewModel({ message: baseMessage, engineLabel: 'New Signal' })
    expect(vm.internalSummary.length).toBeGreaterThan(0)
  })

  it('returns at least one recommendedObserveLink', () => {
    const vm = buildExperienceResultViewModel({ message: baseMessage, engineLabel: 'New Signal' })
    expect(vm.recommendedObserveLinks.length).toBeGreaterThan(0)
  })

  it('all links target observe mode', () => {
    const vm = buildExperienceResultViewModel({ message: baseMessage, engineLabel: 'New Signal' })
    for (const link of vm.recommendedObserveLinks) {
      expect(link.targetMode).toBe('observe')
    }
  })

  it('adds field link when signal runtime mode', () => {
    const message: ExperienceMessage = { ...baseMessage, runtimeMode: 'signal' }
    const vm = buildExperienceResultViewModel({ message, engineLabel: 'New Signal' })
    const fieldLink = vm.recommendedObserveLinks.find((l) => l.targetTab === 'field')
    expect(fieldLink).toBeDefined()
  })

  it('adds growth link when protoMeanings exist', () => {
    const message: ExperienceMessage = {
      ...baseMessage,
      signalResult: { protoMeanings: [{ id: 'pm1' }] } as ExperienceMessage['signalResult'],
    }
    const vm = buildExperienceResultViewModel({ message, engineLabel: 'New Signal' })
    const growthLink = vm.recommendedObserveLinks.find((l) => l.targetTab === 'growth')
    expect(growthLink).toBeDefined()
  })

  it('falls back to overview link when no specific signals', () => {
    const vm = buildExperienceResultViewModel({ message: baseMessage, engineLabel: 'LLM' })
    const overviewLink = vm.recommendedObserveLinks.find((l) => l.targetTab === 'overview')
    expect(overviewLink).toBeDefined()
  })
})
