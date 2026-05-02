import type { CrossModalRecallResult } from '../../signalRecall/crossModalRecallTypes'

type Props = {
  results: CrossModalRecallResult[]
}

export const CrossModalRecallPanel = ({ results }: Props) => {
  if (results.length === 0) {
    return <p className="text-xs text-slate-400">想起結果なし</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {results.map(result => (
        <div
          key={result.cueId}
          className={`rounded-xl border px-3 py-2 text-xs flex items-center gap-3 ${
            result.success ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <span className={`font-semibold ${result.success ? 'text-emerald-600' : 'text-slate-400'}`}>
            {result.success ? '✓ 想起成功' : '✗ 想起失敗'}
          </span>
          <span className="text-slate-500">確信度: {result.confidence.toFixed(2)}</span>
          <span className="text-slate-500">パケット: {result.recalledPacketIds.length}</span>
          {result.usedTeacher && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] text-violet-600">先生使用</span>
          )}
        </div>
      ))}
    </div>
  )
}
