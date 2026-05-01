import { Eye, MessageCircleHeart } from 'lucide-react'

type ModeRoleCardProps = {
  onObserveClick?: () => void
  onExperienceClick?: () => void
}

export const ModeRoleCard = ({ onObserveClick, onExperienceClick }: ModeRoleCardProps) => (
  <div className="grid grid-cols-2 gap-3">
    <button
      type="button"
      onClick={onObserveClick}
      disabled={!onObserveClick}
      className="flex flex-col items-start gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 p-3 text-left transition-colors hover:bg-indigo-100 disabled:cursor-default disabled:hover:bg-indigo-50"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
        <Eye className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="text-xs font-bold text-indigo-800">観察</p>
        <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-indigo-600">
          発火・成長・リスクを見る
        </p>
      </div>
    </button>

    <button
      type="button"
      onClick={onExperienceClick}
      disabled={!onExperienceClick}
      className="flex flex-col items-start gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-3 text-left transition-colors hover:bg-rose-100 disabled:cursor-default disabled:hover:bg-rose-50"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <MessageCircleHeart className="h-3.5 w-3.5" />
      </div>
      <div>
        <p className="text-xs font-bold text-rose-800">体験</p>
        <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-rose-600">
          自然に話して反応を受け取る
        </p>
      </div>
    </button>
  </div>
)
