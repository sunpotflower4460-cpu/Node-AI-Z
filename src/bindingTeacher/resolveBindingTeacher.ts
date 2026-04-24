import type { BindingTeacherRequest, BindingTeacherResult } from './bindingTeacherTypes'

/**
 * Mock implementation of Binding Teacher.
 * In production this would call an external LLM adapter.
 * The LLM acts as a "Binding Teacher" only — telling the system
 * "these refer to the same object", not acting as the intelligence core.
 */
export async function resolveBindingTeacher(request: BindingTeacherRequest): Promise<BindingTeacherResult> {
  const hasMultipleModalities =
    [request.textSummary, request.imageSummary, request.audioSummary].filter(Boolean).length > 1
  if (hasMultipleModalities) {
    return {
      relation: 'closely_related',
      confidence: 0.6,
      reasons: ['multiple modalities present — mock binding teacher suggests close relation'],
    }
  }
  if ((request.assemblyHints?.length ?? 0) > 1) {
    return {
      relation: 'weakly_related',
      confidence: 0.4,
      reasons: ['multiple assemblies hinted — mock binding teacher suggests weak relation'],
    }
  }
  return {
    relation: 'unsure',
    confidence: 0.2,
    reasons: ['insufficient multi-modal context for binding'],
  }
}
