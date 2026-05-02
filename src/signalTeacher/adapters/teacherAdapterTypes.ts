import type { SameObjectBindingCandidate, TeacherJudgment } from '../signalTeacherTypes'

export type TeacherAdapterInput = {
  candidate: SameObjectBindingCandidate
  packetSummaries: Array<{
    packetId: string
    modality: string
    rawSummary: string
    featureSummary: string
  }>
}

export type TeacherAdapterResult = TeacherJudgment

export interface TeacherAdapter {
  judge(input: TeacherAdapterInput): Promise<TeacherAdapterResult>
}
