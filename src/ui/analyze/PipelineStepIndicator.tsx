import { StepPill } from '../shared/StepPill'

const SIMPLE_STEPS = [
  { id: 'input', label: '入力を受け取る' },
  { id: 'ignition', label: '発火を起こす' },
  { id: 'update', label: '内部状態を更新する' },
  { id: 'meaning', label: '意味の芽を探す' },
  { id: 'summary', label: '結果をまとめる' },
]

const RESEARCH_STEPS = [
  { id: 'input', label: 'input' },
  { id: 'ignition', label: 'ignition' },
  { id: 'signal_field', label: 'signal field' },
  { id: 'workspace', label: 'workspace' },
  { id: 'proto_meaning', label: 'proto meaning' },
  { id: 'decision', label: 'decision' },
  { id: 'summary', label: 'observe summary' },
]

type PipelineStepIndicatorProps = {
  currentStepIndex?: number
  errorStepIndex?: number
  researchMode?: boolean
}

export const PipelineStepIndicator = ({
  currentStepIndex,
  errorStepIndex,
  researchMode = false,
}: PipelineStepIndicatorProps) => {
  const steps = researchMode ? RESEARCH_STEPS : SIMPLE_STEPS
  const activeIndex = currentStepIndex ?? 0

  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="パイプラインステップ">
      {steps.map((step, index) => {
        let status: 'pending' | 'active' | 'done' | 'error' = 'pending'
        if (errorStepIndex !== undefined && index === errorStepIndex) {
          status = 'error'
        } else if (index < activeIndex) {
          status = 'done'
        } else if (index === activeIndex) {
          status = 'active'
        }
        return (
          <div key={step.id} role="listitem">
            <StepPill label={step.label} status={status} />
          </div>
        )
      })}
    </div>
  )
}
