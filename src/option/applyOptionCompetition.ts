import type { OptionCompetitionResult, OptionField } from './types'

type ApplyOptionCompetitionInput = {
  optionFields: OptionField[]
}

const clampNetPull = (value: number) => Math.max(-1, Math.min(1, value))

export const applyOptionCompetition = ({
  optionFields,
}: ApplyOptionCompetitionInput): OptionCompetitionResult => {
  if (optionFields.length === 0) {
    return { optionFields: [], inhibitionNotes: [] }
  }

  const averageSupport = optionFields.reduce((total, field) => total + field.totalSupport, 0) / optionFields.length
  const inhibitionNotes: string[] = []

  const competedFields = optionFields.map((field) => {
    const rivals = optionFields.filter((candidate) => candidate.optionId !== field.optionId)
    if (rivals.length === 0) {
      return field
    }

    const inhibition = rivals.reduce((total, rival) => {
      const supportGap = Math.max(0, rival.totalSupport - field.totalSupport * 0.45)
      const resistancePressure = rival.totalResistance * 0.16
      return total + supportGap * 0.18 + resistancePressure
    }, 0) / rivals.length

    const foregroundBoost = field.totalSupport > averageSupport
      ? (field.totalSupport - averageSupport) * 0.12
      : 0

    if (inhibition > 0.06) {
      const strongestRival = rivals
        .slice()
        .sort((left, right) => right.totalSupport - left.totalSupport)[0]
      inhibitionNotes.push(`${field.optionId} は ${strongestRival.optionId} の前景化で少し抑制された`)
    }

    return {
      ...field,
      netPull: clampNetPull(field.netPull + foregroundBoost - inhibition),
    }
  })

  const sorted = competedFields
    .slice()
    .sort((left, right) => right.netPull - left.netPull)

  const dominantOptionId = sorted.length > 1
    && sorted[0].netPull > 0
    && sorted[0].netPull - sorted[1].netPull >= 0.04
    ? sorted[0].optionId
    : undefined

  return {
    optionFields: competedFields,
    dominantOptionId,
    inhibitionNotes,
  }
}
