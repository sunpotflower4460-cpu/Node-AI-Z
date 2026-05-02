import type { CrossModalRecallResult } from './crossModalRecallTypes'

export function buildCrossModalRecallSummary(results: CrossModalRecallResult[]): {
  totalAttempts: number
  successCount: number
  failureCount: number
  avgConfidence: number
  notes: string[]
} {
  const successCount = results.filter(r => r.success).length
  const failureCount = results.length - successCount
  const avgConfidence =
    results.length > 0 ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length : 0

  const notes: string[] = []
  if (results.length > 0) notes.push(`total:${results.length}`)

  return { totalAttempts: results.length, successCount, failureCount, avgConfidence, notes }
}
