type BridgeMaturityRingProps = {
  teacherDependency: number
  recallSuccess: number
  size?: number
}

export const BridgeMaturityRing = ({
  teacherDependency,
  recallSuccess,
  size = 64,
}: BridgeMaturityRingProps) => {
  const r = (size - 8) / 2
  const circumference = 2 * Math.PI * r
  const teacherOffset = circumference * (1 - teacherDependency)
  const recallOffset = circumference * (1 - recallSuccess)
  const cx = size / 2
  const cy = size / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} aria-label="bridge maturity ring">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="4" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#a855f7"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={teacherOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          opacity="0.7"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r - 6}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          strokeDasharray={circumference * 0.7}
          strokeDashoffset={(circumference * 0.7) * (1 - recallSuccess)}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div className="text-center text-[10px] text-slate-400">
        <div>
          <span className="text-purple-400">Dep: </span>
          {`${Math.round(teacherDependency * 100)}%`}
        </div>
        <div>
          <span className="text-emerald-400">Recall: </span>
          {`${Math.round(recallSuccess * 100)}%`}
        </div>
      </div>
    </div>
  )
}
