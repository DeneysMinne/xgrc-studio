import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Props {
  currentStep: number
  steps: string[]
}

export default function StepIndicator({ currentStep, steps }: Props) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isLast = index === steps.length - 1

        return (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                  isCompleted && 'bg-[#0066ff] border-[#0066ff] text-white',
                  isActive && 'bg-transparent border-[#0066ff] text-[#0066ff]',
                  !isCompleted && !isActive && 'bg-transparent border-[#30363d] text-[#8b949e]'
                )}
              >
                {isCompleted ? <Check size={14} /> : stepNum}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  isActive ? 'text-[#e6edf3]' : 'text-[#8b949e]'
                )}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'w-12 h-0.5 mx-3',
                  stepNum < currentStep ? 'bg-[#0066ff]' : 'bg-[#30363d]'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
