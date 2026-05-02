export type CrossModalRecallCue = {
  id: string
  sourcePacketId: string
  sourceModality: string
  targetModalities: string[]
  candidateIds: string[]
  createdAt: number
}

export type CrossModalRecallResult = {
  cueId: string
  success: boolean
  recalledCandidateIds: string[]
  recalledPacketIds: string[]
  confidence: number
  usedTeacher: boolean
  notes: string[]
}
