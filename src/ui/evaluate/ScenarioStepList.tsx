import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ScenarioStepViewModel } from './buildScenarioViewModel'

type ScenarioStepListProps = {
  steps: ScenarioStepViewModel[]
}

const ScenarioStepItem = ({ step, index }: { step: ScenarioStepViewModel; index: number }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
            {index + 1}
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-800">{step.stepName}</p>
            <p className="text-[10px] text-slate-400">{step.inputType}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden gap-3 text-[10px] font-semibold text-slate-500 sm:flex">
            <span>assemblies: {step.activeAssemblyCount}</span>
            <span>bridges: {step.bridgeCount}</span>
            <span>recall: {step.recallSuccessCount}</span>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </button>
      {isOpen ? (
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase text-slate-400">Active Assemblies</p>
              <p className="mt-1 text-base font-bold text-slate-800">{step.activeAssemblyCount}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase text-slate-400">Bridge Count</p>
              <p className="mt-1 text-base font-bold text-slate-800">{step.bridgeCount}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase text-slate-400">Recall Success</p>
              <p className="mt-1 text-base font-bold text-slate-800">{step.recallSuccessCount}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase text-slate-400">Teacher Dep.</p>
              <p className="mt-1 text-base font-bold text-slate-800">{step.teacherDependencyAverage.toFixed(2)}</p>
            </div>
          </div>
          {step.notes.length > 0 ? (
            <ul className="mt-3 space-y-1">
              {step.notes.map((note) => (
                <li key={note} className="text-[11px] leading-relaxed text-slate-500">· {note}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export const ScenarioStepList = ({ steps }: ScenarioStepListProps) => {
  if (steps.length === 0) {
    return <p className="text-xs font-medium text-slate-400">ステップ結果はまだありません。</p>
  }

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <ScenarioStepItem key={step.stepId} step={step} index={index} />
      ))}
    </div>
  )
}
