type ObserveExperienceSwitchHintProps = {
  currentMode: 'observe' | 'experience'
  onSwitchClick?: () => void
  collapsible?: boolean
}

const HINT_TEXT = {
  observe: {
    description: 'ここは裏側を見る場所です。',
    linkText: '自然に話したい場合は体験モードへ。',
  },
  experience: {
    description: 'ここは話す場所です。',
    linkText: '内部で何が起きたかは観察モードで確認できます。',
  },
} as const

export const ObserveExperienceSwitchHint = ({
  currentMode,
  onSwitchClick,
  collapsible = false,
}: ObserveExperienceSwitchHintProps) => {
  const hint = HINT_TEXT[currentMode]

  const content = (
    <p className="text-xs font-medium text-slate-500">
      {hint.description}{' '}
      {onSwitchClick ? (
        <button
          type="button"
          onClick={onSwitchClick}
          className="font-semibold text-slate-600 underline underline-offset-2 transition-colors hover:text-slate-800"
        >
          {hint.linkText}
        </button>
      ) : (
        <span>{hint.linkText}</span>
      )}
    </p>
  )

  if (collapsible) {
    return (
      <details className="group rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <summary className="cursor-pointer list-none text-[11px] font-semibold text-slate-400 group-open:text-slate-600">
          モードについて
        </summary>
        <div className="mt-2">{content}</div>
      </details>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      {content}
    </div>
  )
}
