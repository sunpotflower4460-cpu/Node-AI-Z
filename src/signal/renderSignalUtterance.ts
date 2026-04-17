import type { SentencePlan } from './types'

export const renderSignalUtterance = (plan: SentencePlan): string => {
  const parts: string[] = [plan.lead]

  for (const line of plan.body) {
    if (line && line !== plan.lead) {
      parts.push(line)
    }
  }

  if (plan.close && plan.close !== plan.lead) {
    parts.push(plan.close)
  }

  return parts.join('\n')
}
