import type { AssemblyViewModel } from './buildSignalFieldViewModel'
import { EmptyState } from '../shared/EmptyState'

type AssemblyOverlayPanelProps = {
  assemblies: AssemblyViewModel[]
  researchMode?: boolean
}

export const AssemblyOverlayPanel = ({ assemblies, researchMode = false }: AssemblyOverlayPanelProps) => {
  if (assemblies.length === 0) {
    return (
      <EmptyState
        title="まだ assembly は育っていません。"
        description="同じ入力を何度か与えると、反復する発火群が assembly として記録されます。"
      />
    )
  }

  return (
    <div className="space-y-2">
      {assemblies.map((assembly) => (
        <div
          key={assembly.id}
          className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {researchMode && (
                <p className="mb-1 text-[10px] font-mono text-slate-500">{assembly.id}</p>
              )}
              <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-600">
                <span>recurrence: <span className="font-bold text-slate-800">{assembly.recurrenceCount}</span></span>
                <span>replay: <span className="font-bold text-slate-800">{assembly.replayCount}</span></span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400">stability</p>
              <p className="text-sm font-black text-indigo-700">{Math.round(assembly.stabilityScore * 100)}%</p>
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
            <div
              className="h-1.5 rounded-full bg-indigo-400"
              style={{ width: `${Math.round(assembly.stabilityScore * 100)}%` }}
            />
          </div>
          {assembly.stabilityScore > 0.7 && (
            <p className="mt-1.5 text-[10px] font-semibold text-indigo-600">promotion ready</p>
          )}
        </div>
      ))}
    </div>
  )
}
