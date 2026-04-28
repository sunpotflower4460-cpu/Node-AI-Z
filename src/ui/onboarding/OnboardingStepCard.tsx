import type { OnboardingStep } from './buildOnboardingViewModel'

type OnboardingStepCardProps = {
  step: OnboardingStep
  stepNumber: number
  totalSteps: number
}

export const OnboardingStepCard = ({
  step,
  stepNumber,
  totalSteps,
}: OnboardingStepCardProps) => (
  <div className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
    <div className="flex items-center gap-2">
      <span className="rounded-full bg-cyan-950 px-2.5 py-1 text-[11px] font-bold text-cyan-400">
        {`${stepNumber} / ${totalSteps}`}
      </span>
    </div>
    <h3 className="text-base font-extrabold tracking-tight text-white">{step.title}</h3>
    <p className="text-sm leading-relaxed text-slate-300">{step.description}</p>
  </div>
)
