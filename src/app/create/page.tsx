'use client'

import { useState, useCallback, useEffect } from 'react'
import StepIndicator from '@/components/ui/StepIndicator'
import TopicSelector from '@/components/create/TopicSelector'
import StreamingEditor from '@/components/create/StreamingEditor'
import ReviewEdit from '@/components/create/ReviewEdit'
import PublishPanel from '@/components/create/PublishPanel'

export type WizardState = {
  step: 1 | 2 | 3 | 4
  topic: string
  additionalContext: string
  audience: string
  solutionName: string
  angle: string
  // From generation
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
  step: 1,
  topic: '',
  additionalContext: '',
  audience: '',
  solutionName: '',
  angle: '',
  heading: '',
  content: '',
  hashtags: [],
}

const STEPS = ['Topic', 'Generate', 'Review', 'Publish']

export default function CreatePage() {
  const [state, setState] = useState<WizardState>(initialState)

  const update = useCallback((updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const goToStep = useCallback((step: WizardState['step']) => {
    setState(prev => ({ ...prev, step }))
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (state.step === 1) {
          const topic = state.topic
          if (topic) setState(prev => ({ ...prev, step: 2 }))
        } else if (state.step === 3) {
          setState(prev => ({ ...prev, step: 4 }))
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.step, state.topic])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#e6edf3]">Create Post</h1>
        <p className="text-[#8b949e] mt-1">Generate LinkedIn content with AI</p>
      </div>

      <StepIndicator currentStep={state.step} steps={STEPS} />

      <div className="mt-8">
        {state.step === 1 && (
          <TopicSelector
            state={state}
            onUpdate={update}
            onNext={() => goToStep(2)}
          />
        )}
        {state.step === 2 && (
          <StreamingEditor
            state={state}
            onUpdate={update}
            onNext={() => goToStep(3)}
          />
        )}
        {state.step === 3 && (
          <ReviewEdit
            state={state}
            onUpdate={update}
            onBack={() => goToStep(2)}
            onNext={() => goToStep(4)}
          />
        )}
        {state.step === 4 && (
          <PublishPanel
            state={state}
            onUpdate={update}
            onBack={() => goToStep(3)}
            onReset={reset}
          />
        )}
      </div>
    </div>
  )
}
