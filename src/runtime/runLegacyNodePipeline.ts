import { runNodePipeline } from '../core/runNodePipeline'
import { buildRevisionEntry } from '../revision/buildRevisionEntry'
import { buildStudioViewModel } from '../studio/buildStudioViewModel'
import type { NodePipelineResult, PlasticityState, RevisionEntry, StudioViewModel } from '../types/nodeStudio'

export type LegacyNodePipelineSnapshot = {
  pipelineResult: NodePipelineResult
  studioView: StudioViewModel
  revisionEntry: RevisionEntry
}

export const runLegacyNodePipeline = (
  text: string,
  plasticity?: PlasticityState,
): LegacyNodePipelineSnapshot => {
  const pipelineResult = runNodePipeline(text, plasticity)
  const studioView = buildStudioViewModel(pipelineResult, plasticity)
  const revisionEntry = buildRevisionEntry(pipelineResult, studioView)

  return {
    pipelineResult,
    studioView,
    revisionEntry,
  }
}
