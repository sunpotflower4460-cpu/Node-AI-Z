import { useState, useId, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

type CollapsibleSectionProps = {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  titleClass?: string
}

export const CollapsibleSection = ({
  title,
  children,
  defaultOpen = true,
  titleClass = 'text-[11px] font-bold uppercase tracking-widest text-slate-500',
}: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(defaultOpen)
  const uid = useId()
  const id = `collapsible-${uid}`

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={id}
        className={`flex w-full items-center justify-between gap-2 py-1 ${titleClass}`}
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform text-slate-600 ${open ? '' : '-rotate-90'}`}
        />
      </button>
      {open ? (
        <div id={id} className="mt-2">
          {children}
        </div>
      ) : null}
    </section>
  )
}
