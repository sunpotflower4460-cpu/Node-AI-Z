import { Compass, MessagesSquare } from 'lucide-react'
import type { AppMode } from '../../types/experience'

type ModeSwitchProps = {
  mode: AppMode
  onChange: (mode: AppMode) => void
}

const OPTIONS: Array<{ key: AppMode; label: string; icon: typeof Compass }> = [
  { key: 'observe', label: '観察研究モード', icon: Compass },
  { key: 'experience', label: '体験モード', icon: MessagesSquare },
]

export const ModeSwitch = ({ mode, onChange }: ModeSwitchProps) => (
  <div className="grid w-full grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-slate-100/80 p-1 shadow-sm sm:inline-flex sm:w-auto sm:items-center">
    {OPTIONS.map(({ key, label, icon: Icon }) => {
      const isActive = mode === key

      return (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
            isActive
              ? 'bg-white text-slate-900 shadow-md ring-1 ring-black/5'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
          }`}
        >
          <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? (key === 'observe' ? 'text-indigo-600' : 'text-rose-500') : ''}`} />
          <span className="truncate">{label}</span>
          {isActive ? (
            <span className={`h-1.5 w-1.5 rounded-full ${key === 'observe' ? 'bg-indigo-500' : 'bg-rose-500'}`} />
          ) : null}
        </button>
      )
    })}
  </div>
)
