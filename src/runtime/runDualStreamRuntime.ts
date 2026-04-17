import type { OptionNode } from '../option/types'
import type { MeaningChunk } from '../signal/ingest/chunkTypes'
import type { StateVector } from '../types/nodeStudio'
import { buildLexicalState } from '../lexical'
import { fuseLexicalAndSignal } from '../fusion'
import { buildMicroSignalState } from '../signal/buildMicroSignalState'
import { createSignalPackets } from '../signal/createSignalPackets'
import { deriveMicroCues } from '../signal/deriveMicroCues'

export type DualStreamRuntimeInput = {
  text: string
  chunks: MeaningChunk[]
  detectedOptions?: OptionNode[]
  field?: StateVector
}

export type DualStreamRuntimeResult = {
  lexicalState: ReturnType<typeof buildLexicalState>
  signalPackets: ReturnType<typeof createSignalPackets>
  microCues: ReturnType<typeof deriveMicroCues>
  microSignalState: ReturnType<typeof buildMicroSignalState>
  fusedState: ReturnType<typeof fuseLexicalAndSignal>
}

export const runDualStreamRuntime = ({
  text,
  chunks,
  detectedOptions,
  field,
}: DualStreamRuntimeInput): DualStreamRuntimeResult => {
  const lexicalState = buildLexicalState({
    rawText: text,
    chunks,
    detectedOptions,
  })
  const signalPackets = createSignalPackets(chunks)
  const microCues = deriveMicroCues(signalPackets)
  const microSignalState = buildMicroSignalState({
    packets: signalPackets,
    cues: microCues,
    field,
  })
  const fusedState = fuseLexicalAndSignal(lexicalState, microSignalState)

  return {
    lexicalState,
    signalPackets,
    microCues,
    microSignalState,
    fusedState,
  }
}
