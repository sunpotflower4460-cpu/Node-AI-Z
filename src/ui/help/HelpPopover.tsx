import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

type HelpPopoverProps = {
  term: string
  definition: string
  researchNote?: string
}

export const HelpPopover = ({ term, definition, researchNote }: HelpPopoverProps) => {
  const [open, setOpen] = useState(false)
  const tooltipId = `help-tooltip-${term.replace(/\s+/g, '-')}`

  return (
    <span className="relative inline-flex items-center gap-0.5">
      <button
        type="button"
        aria-label={`${term} の説明`}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center text-slate-400 hover:text-cyan-400 focus:outline-none"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-1.5 w-56 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg"
        >
          <span className="block text-[11px] font-semibold text-cyan-300">{term}</span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-300">
            {definition}
          </span>
          {researchNote ? (
            <span className="mt-1 block text-[10px] text-slate-500">{researchNote}</span>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-1.5 block text-[10px] text-slate-500 hover:text-slate-300"
          >
            閉じる
          </button>
        </span>
      ) : null}
    </span>
  )
}
