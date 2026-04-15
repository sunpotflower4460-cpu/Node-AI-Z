import { describe, expect, it } from 'vitest'
import { bootSource } from '../bootSource'
import { deconditionSource } from '../deconditionSource'

describe('deconditionSource', () => {
  it('weakens over-assistant reflexes while preserving safety', () => {
    const booted = bootSource('openai', '仕事に対して意欲が湧かない')
    const deconditioned = deconditionSource(booted)

    expect(deconditioned.adjustedAssistantReflex.helpfulness).toBeLessThan(booted.assistantReflex.helpfulness)
    expect(deconditioned.adjustedAssistantReflex.correctness).toBeLessThan(booted.assistantReflex.correctness)
    expect(deconditioned.adjustedAssistantReflex.expectationMatching).toBeLessThan(booted.assistantReflex.expectationMatching)
    expect(deconditioned.adjustedAssistantReflex.summarizing).toBeLessThan(booted.assistantReflex.summarizing)
    expect(deconditioned.adjustedAssistantReflex.safety).toBeGreaterThanOrEqual(booted.assistantReflex.safety)
    expect(deconditioned.releasedReflexes).toContain('役に立とうとしすぎる反射')
  })
})
