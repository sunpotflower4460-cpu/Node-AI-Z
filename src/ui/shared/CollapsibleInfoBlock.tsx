import type { ReactNode } from 'react'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type CollapsibleInfoBlockProps = {
  summary: string
  children: ReactNode
  defaultOpen?: boolean
}

export const CollapsibleInfoBlock = ({ summary, children, defaultOpen = false }: CollapsibleInfoBlockProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition-colors hover:text-slate-200"
      >
        {summary}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}
