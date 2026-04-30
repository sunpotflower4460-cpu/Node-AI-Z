import type { ReactNode } from 'react'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type DetailAccordionProps = {
  summary: string
  children: ReactNode
  defaultOpen?: boolean
}

export const DetailAccordion = ({
  summary,
  children,
  defaultOpen = false,
}: DetailAccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:text-indigo-700"
      >
        <span>{summary}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen ? (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3">{children}</div>
      ) : null}
    </div>
  )
}
