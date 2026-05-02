import type { TeacherAdapter, TeacherAdapterInput, TeacherAdapterResult } from './teacherAdapterTypes'
import { createTeacherJudgment } from '../createTeacherJudgment'

const adapter: TeacherAdapter = {
  async judge(input: TeacherAdapterInput): Promise<TeacherAdapterResult> {
    return createTeacherJudgment({
      candidateId: input.candidate.id,
      teacherType: 'llm_stub',
      judgment: 'uncertain',
      confidence: 0.3,
      explanation: 'LLM not connected',
    })
  },
}

export const llmTeacherAdapterStub: TeacherAdapter = adapter
