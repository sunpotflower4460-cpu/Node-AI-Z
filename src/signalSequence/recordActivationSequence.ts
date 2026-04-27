export type ActivationSequenceObservation = {
  contextAssemblyIds: string[]
  nextAssemblyIds: string[]
  observedAt: number
}

export function recordActivationSequence(input: {
  previousAssemblyIds: string[]
  currentAssemblyIds: string[]
  observedAt: number
  maxContextLength?: number
}): ActivationSequenceObservation | null {
  const currentAssemblyIds = [...new Set(input.currentAssemblyIds)]
  if (currentAssemblyIds.length === 0) {
    return null
  }

  const maxContextLength = input.maxContextLength ?? 3
  const contextAssemblyIds = [...new Set(input.previousAssemblyIds)].slice(-maxContextLength)

  return {
    contextAssemblyIds,
    nextAssemblyIds: currentAssemblyIds,
    observedAt: input.observedAt,
  }
}
