import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { ENGINE_LABEL_MAP } from './engineLabelMap'
import type { OverviewMode } from './modeUiTypes'

type EngineSelectorCompactProps = {
  selectedEngine: OverviewMode
  onChange: (engine: OverviewMode) => void
}

const ENGINE_ORDER: OverviewMode[] = ['signal_mode', 'crystallized_thinking_legacy', 'llm_mode']

export const EngineSelectorCompact = ({ selectedEngine, onChange }: EngineSelectorCompactProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const current = ENGINE_LABEL_MAP[selectedEngine]

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <span className="text-xs font-bold text-slate-500">脳エンジン:</span>
        <span className="text-sm font-bold text-slate-800">{current.full}</span>
        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          aria-expanded={isOpen}
          aria-label="エンジンを変更"
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-700"
        >
          変更
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {isOpen ? (
        <div className="absolute left-0 top-full z-30 mt-1 w-full min-w-[200px] rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {ENGINE_ORDER.map((mode) => {
            const label = ENGINE_LABEL_MAP[mode]
            const isActive = selectedEngine === mode

            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  onChange(mode)
                  setIsOpen(false)
                }}
                aria-pressed={isActive}
                className={`flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <span className="text-sm font-bold">{label.full}</span>
                <span className="text-[11px] text-slate-500">{label.description}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
