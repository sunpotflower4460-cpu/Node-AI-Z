import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type LearnMoreDisclosureProps = {
  summary: string
  children: React.ReactNode
}

export const LearnMoreDisclosure = ({ summary, children }: LearnMoreDisclosureProps) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-xs font-semibold text-cyan-500 hover:text-cyan-400"
        aria-expanded={open}
        aria-label={open ? '詳細を閉じる' : '詳細を開く'}
      >
        <span>{open ? '閉じる' : summary}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <div className="mt-2 text-xs leading-relaxed text-slate-400">{children}</div>
      ) : null}
    </div>
  )
}
