import { describe, expect, it } from 'vitest'
import { createObservationRecord, createExperienceTurnMessages } from '../../runtime/createObservationRecord'
import { createPersonalLearningState } from '../../learning/personalLearning'
import { mapExperienceMessagesToObservationHistory } from '../mapExperienceMessagesToObservationHistory'

describe('mapExperienceMessagesToObservationHistory', () => {
  it('preserves layered implementation metadata for experience history', async () => {
    const record = await createObservationRecord({
      type: 'experience',
      text: '元気ですか',
      provider: 'openai',
      runtimeMode: 'node',
      implementationMode: 'layered_thinking',
      personalLearning: createPersonalLearningState(),
    })

    const history = mapExperienceMessagesToObservationHistory(createExperienceTurnMessages(record))

    expect(history).toHaveLength(1)
    expect(history[0]?.implementationMode).toBe('layered_thinking')
    expect(history[0]?.layeredThinkingTrace?.l7?.templateKey).toBeTruthy()
  })
})
