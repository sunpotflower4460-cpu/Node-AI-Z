import type { ReactNode } from 'react'

/**
 * CompactActionBar — shows up to 3 primary actions in a compact horizontal bar.
 * Actions are rendered as TouchTarget-sized buttons.
 *
 * State-based action sets:
 *   pre-analyze: Analyze (primary)
 *   post-analyze: 発火を見る / 成長を見る / リスクを見る
 *   research: Traceを見る / Rawを見る
 */
export type CompactAction = {
  id: string
  label: string
  /** Whether this is the dominant primary action */
  primary?: boolean
  onClick: () => void
  disabled?: boolean
}

type CompactActionBarProps = {
  actions: CompactAction[]
  /** Optional leading content (e.g. status indicator) */
  leading?: ReactNode
}

export const CompactActionBar = ({ actions, leading }: CompactActionBarProps) => {
  // Limit to 3 actions as per spec
  const visible = actions.slice(0, 3)

  return (
    <div
      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
      role="toolbar"
      aria-label="主要アクション"
    >
      {leading ? <div className="mr-1 shrink-0">{leading}</div> : null}
      {visible.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={action.disabled}
          onClick={action.onClick}
          className={[
            'min-h-[40px] flex-1 rounded-xl px-3 text-sm font-semibold transition-colors',
            action.primary
              ? 'bg-cyan-500 text-white hover:bg-cyan-400 active:bg-cyan-600 disabled:opacity-40'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-40',
          ].join(' ')}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
