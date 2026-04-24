import type { Assembly } from '../signalField/signalFieldTypes'
import type { BindingTeacherRequest } from './bindingTeacherTypes'

export function buildBindingTeacherRequest(
  assemblies: Assembly[],
  options?: { textSummary?: string; imageSummary?: string; audioSummary?: string },
): BindingTeacherRequest {
  const assemblyHints = assemblies.map(a => `assembly:${a.id}(size=${a.particleIds.length},recurrence=${a.recurrenceCount})`)
  return {
    textSummary: options?.textSummary,
    imageSummary: options?.imageSummary,
    audioSummary: options?.audioSummary,
    assemblyHints,
  }
}
