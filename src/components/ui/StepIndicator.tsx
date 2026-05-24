'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  currentStep: number
  steps: string[]
}

export default function StepIndicator({ currentStep, steps }: Props) {
  return (
    <div className="flex items-center gap-0" role="list" aria-label="Progress steps">
      {steps.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isLast = index === steps.length - 1

        return (
          <div key={step} className="flex items-center" role="listitem">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  backgroundColor: isCompleted || isActive ? 'var(--accent)' : 'transparent',
                  borderColor: isCompleted || isActive ? 'var(--accent)' : 'var(--border)',
                }}
                transition={{ duration: 0.2 }}
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2',
                  isCompleted ? 'text-white' : isActive ? 'text-accent bg-transparent' : 'text-dim'
                )}
              >
                {isCompleted ? <Check size={14} aria-label="Completed" /> : stepNum}
              </motion.div>
              <span className={cn('text-sm font-medium', isActive ? 'text-ink' : 'text-dim')}>
                {step}
              </span>
            </div>
            {!isLast && (
              <div className="relative w-12 h-0.5 mx-3 bg-edge overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-accent"
                  animate={{ width: stepNum < currentStep ? '100%' : '0%' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
