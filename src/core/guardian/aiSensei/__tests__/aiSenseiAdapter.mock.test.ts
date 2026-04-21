import { describe, expect, it } from 'vitest'
import { reviewWithAiSensei } from '../aiSenseiAdapter'

describe('reviewWithAiSensei', () => {
  it('returns a deterministic approval in mock mode for low risk payloads', async () => {
    const result = await reviewWithAiSensei(
      {
        requestId: 'req-1',
        guardianMode: 'guardian_assisted',
        candidateKind: 'schema',
        confidenceScore: 0.88,
        riskLevel: 'low',
        summary: ['Low risk candidate'],
        cautionNotes: [],
      },
      {
        mode: 'mock',
        timeoutMs: 100,
      }
    )

    expect(result).toMatchObject({
      decision: 'approve',
      confidence: 0.88,
    })
  })

  it('returns guarded decisions in mock mode for elevated risk payloads', async () => {
    const mediumResult = await reviewWithAiSensei(
      {
        requestId: 'req-2',
        guardianMode: 'guardian_assisted',
        candidateKind: 'schema',
        confidenceScore: 0.7,
        riskLevel: 'medium',
        summary: ['Medium risk candidate'],
        cautionNotes: ['Watch stability'],
      },
      {
        mode: 'mock',
        timeoutMs: 100,
      }
    )

    const highResult = await reviewWithAiSensei(
      {
        requestId: 'req-3',
        guardianMode: 'human_required',
        candidateKind: 'schema',
        confidenceScore: 0.9,
        riskLevel: 'high',
        summary: ['High risk candidate'],
        cautionNotes: ['Escalate'],
      },
      {
        mode: 'mock',
        timeoutMs: 100,
      }
    )

    expect(mediumResult).toMatchObject({
      decision: 'hold_for_review',
    })
    expect(highResult).toMatchObject({
      decision: 'hold_for_review',
    })
  })

  it('returns null when AI sensei is disabled', async () => {
    const result = await reviewWithAiSensei(
      {
        requestId: 'req-4',
        guardianMode: 'guardian_assisted',
        candidateKind: 'schema',
        confidenceScore: 0.6,
        riskLevel: 'medium',
        summary: ['Disabled adapter'],
        cautionNotes: [],
      },
      {
        mode: 'disabled',
        timeoutMs: 100,
      }
    )

    expect(result).toBeNull()
  })
})
