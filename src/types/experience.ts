import type { NodePipelineResult, RevisionEntry, StudioViewModel } from './nodeStudio'
import type { SignalRuntimeResult } from '../signal/types'

export type AppMode = 'observe' | 'experience'
export type ObservationSource = AppMode
export type RuntimeMode = 'node' | 'signal'

export type ObservationRecord = {
  id: string
  type: ObservationSource
  runtimeMode: RuntimeMode
  text: string
  timestamp: string
  time: string
  pipelineResult: NodePipelineResult
  studioView: StudioViewModel
  revisionEntry: RevisionEntry
  assistantReply: string
  signalResult?: SignalRuntimeResult
}

export type ExperienceMessage = {
  id: string
  observationId: string
  role: 'user' | 'assistant'
  text: string
  timestamp: string
  runtimeMode?: RuntimeMode
  pipelineResult?: NodePipelineResult
  studioView?: StudioViewModel
  revisionEntry?: RevisionEntry
  signalResult?: SignalRuntimeResult
}
