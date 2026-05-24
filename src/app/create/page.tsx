'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import StepIndicator from '@/components/ui/StepIndicator'
import TopicSelector from '@/components/create/TopicSelector'
import StreamingEditor from '@/components/create/StreamingEditor'
import ReviewEdit from '@/components/create/ReviewEdit'
import PublishPanel from '@/components/create/PublishPanel'
import { AnimatePresence, motion } from 'framer-motion'

export type WizardState = {
  step: 1 | 2 | 3 | 4
  topic: string
  additionalContext: string
  audience: string
  solutionName: string
  angle: string
  postId?: string
  heading: string
  content: string
  imagePath?: string
  imagePrompt?: string
  hashtags: string[]
  logoKey?: string
  logoVariant?: string
  logoWarning?: string
  visualConcept?: string
  imageText?: string
}

const initialState: WizardState = {
  step: 1, topic: '', additionalContext: '', audience: '',
  solutionName: '', angle: '', heading: '', content: '', hashtags: [],
}

const STEPS = ['Topic', 'Generate', 'Review', 'Publish']

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
}

export default function CreatePage() {
  const [state, setState] = useState<WizardState>(initialState)
  const dirRef = useRef(1)

  const update = useCallback((updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const goToStep = useCallback((step: WizardState['step']) => {
    dirRef.current = step > state.step ? 1 : -1
    setState(prev => ({ ...prev, step }))
  }, [state.step])

  const reset = useCallback(() => {
    dirRef.current = -1
    setState(initialState)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (state.step === 1 && state.topic) goToStep(2)
        else if (state.step === 3) goToStep(4)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.step, state.topic, goToStep])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Create Post</h1>
        <p className="text-dim mt-1">Generate LinkedIn content with AI</p>
      </div>

      <StepIndicator currentStep={state.step} steps={STEPS} />

      <div className="mt-8">
        <AnimatePresence mode="wait" custom={dirRef.current}>
          {state.step === 1 && (
            <motion.div key="step-1" custom={dirRef.current} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2, ease: 'easeInOut' }}>
              <TopicSelector state={state} onUpdate={update} onNext={() => goToStep(2)} />
            </motion.div>
          )}
          {state.step === 2 && (
            <motion.div key="step-2" custom={dirRef.current} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2, ease: 'easeInOut' }}>
              <StreamingEditor state={state} onUpdate={update} onNext={() => goToStep(3)} />
            </motion.div>
          )}
          {state.step === 3 && (
            <motion.div key="step-3" custom={dirRef.current} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2, ease: 'easeInOut' }}>
              <ReviewEdit state={state} onUpdate={update} onBack={() => goToStep(2)} onNext={() => goToStep(4)} />
            </motion.div>
          )}
          {state.step === 4 && (
            <motion.div key="step-4" custom={dirRef.current} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2, ease: 'easeInOut' }}>
              <PublishPanel state={state} onUpdate={update} onBack={() => goToStep(3)} onReset={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
