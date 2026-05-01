import { useState } from 'react'
import { Info, ChevronDown } from 'lucide-react'

type HelpTextProps = { title: string; body: string }

export const HelpText = ({ title, body }: HelpTextProps) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 text-left"
        aria-expanded={open}
      >
        <Info className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
        <span className="flex-1 text-xs font-semibold text-slate-300">{title}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </button>
      {open ? (
        <p className="mt-2 pl-5 text-[11px] leading-relaxed text-slate-400">{body}</p>
      ) : null}
    </div>
  )
}
