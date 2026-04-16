import { formatObservationTime } from '../runtime/createObservationRecord'
import type { ExperienceMessage, ObservationRecord } from '../types/experience'
import type { NodePipelineResult, RevisionEntry, StudioViewModel } from '../types/nodeStudio'

type ExperienceObservationMessage = ExperienceMessage & {
  pipelineResult: NodePipelineResult
  studioView: StudioViewModel
  revisionEntry: RevisionEntry
}

export const hasObservationData = (
  message: ExperienceMessage,
): message is ExperienceObservationMessage => {
  return message.role === 'assistant' && Boolean(message.pipelineResult && message.studioView && message.revisionEntry)
}

export const mapExperienceMessagesToObservationHistory = (
  messages: ExperienceMessage[],
): ObservationRecord[] => {
  return messages
    .filter(hasObservationData)
    .map((message) => ({
      id: message.observationId,
      type: 'experience' as const,
      runtimeMode: message.runtimeMode ?? ('node' as const),
      text: message.pipelineResult.inputText,
      timestamp: message.timestamp,
      time: formatObservationTime(message.timestamp),
      pipelineResult: message.pipelineResult,
      studioView: message.studioView,
      revisionEntry: message.revisionEntry,
      assistantReply: message.text,
      signalResult: message.signalResult,
    }))
}

export const mergeObservationHistories = (...histories: ObservationRecord[][]): ObservationRecord[] => {
  return histories
    .flat()
    .sort((first, second) => new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime())
}
