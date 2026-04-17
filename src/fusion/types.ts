import type { LexicalState } from '../lexical/types'
import type { MicroSignalState } from '../signal/packetTypes'

export type FusedState = {
  lexicalState: LexicalState
  microSignalState: MicroSignalState
  integratedTensions: string[]
  dominantTextures: string[]
  fusedConfidence: number
}
