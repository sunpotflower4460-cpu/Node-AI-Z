import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'

type StageTransitionBannerProps = {
  fromStage: number
  toStage: number
  unlockedFeature?: string
  onDismiss?: () => void
}

export const StageTransitionBanner = ({
  fromStage,
  toStage,
  unlockedFeature,
  onDismiss,
}: StageTransitionBannerProps) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onDismiss?.()
    }, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-fade-in flex items-center gap-3 rounded-xl border border-indigo-800/60 bg-indigo-950/80 px-4 py-3 shadow-lg backdrop-blur-sm"
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Stage Up</p>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
          {`Stage ${fromStage}`}
          <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
          {`Stage ${toStage}`}
        </p>
        {unlockedFeature ? (
          <p className="text-xs text-slate-400">{`${unlockedFeature} unlocked`}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => { setVisible(false); onDismiss?.() }}
        className="ml-auto rounded-full p-1 text-slate-500 hover:text-slate-300"
        aria-label="閉じる"
      >
        ×
      </button>
    </div>
  )
}
