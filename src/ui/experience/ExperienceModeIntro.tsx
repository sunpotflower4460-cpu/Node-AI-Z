import { MessageCircleHeart } from 'lucide-react'

type ExperienceModeIntroProps = {
  onObserveModeClick?: () => void
}

export const ExperienceModeIntro = ({ onObserveModeClick }: ExperienceModeIntroProps) => (
  <div className="rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-4 md:px-5">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500">
        <MessageCircleHeart className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-rose-800">体験モード</p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-rose-700">
          自然に話しながら、裏側では結晶思考の観察が積み上がります。
        </p>
        <p className="mt-0.5 text-xs font-medium text-rose-600">
          詳しい内部状態は{' '}
          {onObserveModeClick ? (
            <button
              type="button"
              onClick={onObserveModeClick}
              className="underline underline-offset-2 hover:text-rose-800 transition-colors"
            >
              観察モード
            </button>
          ) : (
            '観察モード'
          )}{' '}
          で確認できます。
        </p>
      </div>
    </div>
  </div>
)
