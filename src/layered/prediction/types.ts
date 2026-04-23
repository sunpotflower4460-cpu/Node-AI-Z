import type { NeedType } from '../L4/types'
import type { SentenceType } from '../L3/types'

export type Prediction = {
  expectedNeed: NeedType | null
  expectedTopic: string | null
  expectedSentenceType: SentenceType | null
}

export type PredictionError = {
  needMismatch: boolean
  topicShift: boolean
  surprise: number
}
