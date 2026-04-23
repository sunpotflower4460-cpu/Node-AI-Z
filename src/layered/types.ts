import type { CharNode, L0Summary } from './L0/types'
import type { TokenNode, L1Summary } from './L1/types'
import type { ChunkNode, L2Summary } from './L2/types'
import type { L3Result } from './L3/types'
import type { L4Result } from './L4/types'
import type { L5Result } from './L5/types'
import type { L6Result } from './L6/types'
import type { L7Result } from './L7/types'
import type { BrainState } from './brainState'
import type { Prediction, PredictionError } from './prediction/types'

export type LayeredThinkingRuntimeInput = {
  text: string
  brainState?: BrainState
}

export type LayeredThinkingTrace = {
  characterNodes: CharNode[]
  l0Summary: L0Summary
  tokenNodes: TokenNode[]
  l1Summary: L1Summary
  chunkNodes: ChunkNode[]
  l2Summary: L2Summary
  l3Result: L3Result
  l4Result: L4Result
  l5Result: L5Result
  l6Result: L6Result
  l7Result: L7Result
  predictionError: PredictionError | null
  nextPrediction: Prediction
  nextBrainState: BrainState
}

export type LayeredThinkingResult = {
  utterance: string
  trace: LayeredThinkingTrace
}
