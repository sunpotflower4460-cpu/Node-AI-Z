import type { PersonalLearningState } from '../intelligence/learning/types'
import type { ApiProviderId } from '../types/apiProvider'
import type { ExperienceMessage, ObservationRecord, RuntimeMode } from '../types/experience'
import type { PlasticityState } from '../types/nodeStudio'
import { runMainRuntime, type RuntimeSource } from './runMainRuntime'

export type CreateObservationRecordInput = {
  type: ObservationRecord['type']
  text: string
  plasticity?: PlasticityState
  provider: ApiProviderId
  runtimeMode: RuntimeMode
  personalLearning: PersonalLearningState
  source?: RuntimeSource
}

export const createObservationId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }

  const highResolutionTime = typeof performance !== 'undefined' ? performance.now().toFixed(5) : '0'
  return `${prefix}_${Date.now()}_${highResolutionTime}_${Math.random().toString(36).slice(2, 8)}`
}

export const formatObservationTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const createObservationRecord = async ({
  type,
  text,
  plasticity,
  provider,
  runtimeMode,
  personalLearning,
  source,
}: CreateObservationRecordInput): Promise<ObservationRecord> => {
  const timestamp = new Date().toISOString()
  const runtimeResult = await runMainRuntime({
    text,
    plasticity,
    provider,
    runtimeMode,
    personalLearning,
    source,
  })

  return {
    id: createObservationId(type),
    type,
    text,
    timestamp,
    time: formatObservationTime(timestamp),
    ...runtimeResult,
  }
}

export const createExperienceTurnMessages = (record: ObservationRecord): ExperienceMessage[] => {
  const turnTimestamp = record.timestamp

  return [
    {
      id: createObservationId('exp_user'),
      observationId: record.id,
      role: 'user',
      text: record.text,
      timestamp: turnTimestamp,
      runtimeMode: record.runtimeMode,
      pipelineResult: record.pipelineResult,
      studioView: record.studioView,
      revisionEntry: record.revisionEntry,
      signalResult: record.signalResult,
    },
    {
      id: createObservationId('exp_assistant'),
      observationId: record.id,
      role: 'assistant',
      text: record.assistantReply,
      timestamp: turnTimestamp,
      runtimeMode: record.runtimeMode,
      pipelineResult: record.pipelineResult,
      studioView: record.studioView,
      revisionEntry: record.revisionEntry,
      signalResult: record.signalResult,
    },
  ]
}
