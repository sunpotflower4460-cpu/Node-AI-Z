import type { ReactNode } from 'react'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * CollapsedDetailGroup — hides detail content behind a "詳細を見る" disclosure.
 * Use for Development requirements, raw metrics, risk calculation details,
 * scenario step logs, package JSON, trace details, etc.
 */
type CollapsedDetailGroupProps = {
  label?: string
  children: ReactNode
  defaultOpen?: boolean
}

export const CollapsedDetailGroup = ({
  label = '詳細を見る',
  children,
  defaultOpen = false,
}: CollapsedDetailGroupProps) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:text-slate-800"
      >
        <span>{label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <div className="border-t border-slate-200 px-3 pb-3 pt-2 text-sm text-slate-700">
          {children}
        </div>
      ) : null}
    </div>
  )
}
