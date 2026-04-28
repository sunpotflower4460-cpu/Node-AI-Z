import { ProgressBar } from '../components/CommonUI'

type DevelopmentProgressBarProps = {
  progress: number
}

export const DevelopmentProgressBar = ({ progress }: DevelopmentProgressBarProps) => (
  <div>
    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-300">
      <span>Stage progress</span>
      <span>{Math.round(progress * 100)}%</span>
    </div>
    <ProgressBar value={progress} colorClass="bg-cyan-400" />
  </div>
)
