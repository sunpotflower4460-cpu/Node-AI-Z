type TeacherRiskHintProps = {
  riskValue: number
  hasOvertrustRisk: boolean
}

export const TeacherRiskHint = ({ riskValue, hasOvertrustRisk }: TeacherRiskHintProps) => {
  if (!hasOvertrustRisk && riskValue < 0.3) {
    return null
  }

  if (hasOvertrustRisk) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
        <p className="text-sm font-bold text-red-700">
          注意: teacher 由来の bridge が self recall 成功前に強くなっています。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-red-600">
          contrast test または teacher-free recall を増やしてください。
          teacher ありの bridge が定着する前に、自己想起の成功体験を積む必要があります。
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      <p className="text-sm font-bold text-amber-700">
        teacher 依存がやや高めです。
      </p>
      <p className="mt-2 text-xs leading-relaxed text-amber-600">
        teacher なしでの想起を試すと teacher_light → teacher_free への移行が進みます。
      </p>
    </div>
  )
}
