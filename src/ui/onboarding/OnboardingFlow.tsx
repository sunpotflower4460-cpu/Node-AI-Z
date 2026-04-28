import { useState } from 'react'
import { buildOnboardingViewModel } from './buildOnboardingViewModel'
import { OnboardingStepCard } from './OnboardingStepCard'

type OnboardingFlowProps = {
  onComplete: () => void
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const viewModel = buildOnboardingViewModel()
  const { steps, totalSteps } = viewModel
  const step = steps[currentStep]

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  if (!step) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="オンボーディング"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md">
        <OnboardingStepCard
          step={step}
          stepNumber={currentStep + 1}
          totalSteps={totalSteps}
        />
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-400 disabled:opacity-40 hover:text-white"
          >
            前へ
          </button>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`inline-block h-1.5 w-1.5 rounded-full transition-colors ${
                  i === currentStep ? 'bg-cyan-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
          >
            {currentStep < totalSteps - 1 ? '次へ' : '始める'}
          </button>
        </div>
        <button
          type="button"
          onClick={onComplete}
          className="mt-3 w-full text-center text-[11px] text-slate-600 hover:text-slate-400"
        >
          スキップ
        </button>
      </div>
    </div>
  )
}
