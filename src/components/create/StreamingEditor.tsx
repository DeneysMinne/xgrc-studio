'use client'

import { useEffect, useRef, useState } from 'react'
import { WizardState } from '@/app/create/page'
import { wordCount } from '@/lib/utils'
import { Loader2, Check, AlertTriangle } from 'lucide-react'

interface Props {
  state: WizardState
  onUpdate: (updates: Partial<WizardState>) => void
  onNext: () => void
}

type Status = 'writing' | 'written' | 'generating-image' | 'image-ready' | 'image-error' | 'done'

export default function StreamingEditor({ state, onUpdate, onNext }: Props) {
  const [streamedText, setStreamedText] = useState('')
  const [status, setStatus] = useState<Status>('writing')
  const [imageWarning, setImageWarning] = useState<string>()
  const textRef = useRef<HTMLDivElement>(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const run = async () => {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: state.topic,
            additionalContext: state.additionalContext,
            audience: state.audience,
            solutionName: state.solutionName,
            angle: state.angle,
          }),
        })

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let generationResult: Record<string, unknown> | null = null

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('event: token')) continue
            if (line.startsWith('data: ') && line.includes('"text"')) {
              try {
                const data = JSON.parse(line.slice(6))
                setStreamedText(prev => {
                  const next = prev + data.text
                  if (textRef.current) {
                    textRef.current.scrollTop = textRef.current.scrollHeight
                  }
                  return next
                })
              } catch { /* skip */ }
            }
            if (line.startsWith('data: ') && !line.includes('"text"') && line.includes('"heading"')) {
              try {
                generationResult = JSON.parse(line.slice(6))
              } catch { /* skip */ }
            }
            if (line.startsWith('data: ') && line.includes('"error"')) {
              try {
                const data = JSON.parse(line.slice(6))
                setStatus('image-error')
                setImageWarning(data.error)
              } catch { /* skip */ }
            }
          }
        }

        if (!generationResult) return

        setStatus('written')

        // Generate image
        if (generationResult.imagePrompt) {
          setStatus('generating-image')
          try {
            const imgRes = await fetch('/api/generate-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: generationResult.imagePrompt,
                topic: state.topic,
                solutionName: state.solutionName,
                logoKey: generationResult.logoKey,
                visualConcept: generationResult.visualConcept,
              }),
            })
            const imgData = await imgRes.json()
            if (imgData.imagePath) {
              onUpdate({
                heading: generationResult.heading as string,
                content: generationResult.post as string,
                hashtags: generationResult.hashtags as string[],
                logoKey: generationResult.logoKey as string,
                logoVariant: generationResult.logoVariant as string,
                logoWarning: generationResult.logoWarning as string | undefined,
                imagePrompt: generationResult.imagePrompt as string,
                imagePath: imgData.imagePath,
                imageText: generationResult.imageText as string | undefined,
                visualConcept: generationResult.visualConcept as string | undefined,
              })
              if (imgData.warning) setImageWarning(imgData.warning)
              setStatus('image-ready')
            } else {
              throw new Error(imgData.error || 'No image path returned')
            }
          } catch (e) {
            setImageWarning(String(e))
            onUpdate({
              heading: generationResult.heading as string,
              content: generationResult.post as string,
              hashtags: generationResult.hashtags as string[],
              logoKey: generationResult.logoKey as string,
              logoVariant: generationResult.logoVariant as string,
              logoWarning: generationResult.logoWarning as string | undefined,
              imagePrompt: generationResult.imagePrompt as string,
              imageText: generationResult.imageText as string | undefined,
              visualConcept: generationResult.visualConcept as string | undefined,
            })
            setStatus('image-error')
          }
        } else {
          onUpdate({
            heading: generationResult.heading as string,
            content: generationResult.post as string,
            hashtags: generationResult.hashtags as string[],
            logoKey: generationResult.logoKey as string,
            logoVariant: generationResult.logoVariant as string,
          })
          setStatus('image-error')
        }

        // Auto-advance after 800ms
        setTimeout(() => {
          setStatus('done')
          onNext()
        }, 800)

      } catch (err) {
        setImageWarning(String(err))
        setStatus('image-error')
      }
    }

    run()
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const wc = wordCount(streamedText)

  return (
    <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-[#30363d] flex items-center justify-between">
        <div className="text-[#8b949e] text-sm">Topic: <span className="text-[#00d4ff]">{state.topic}</span></div>
      </div>

      <div
        ref={textRef}
        className="p-6 font-mono text-sm text-[#e6edf3] bg-[#0d1117] min-h-[320px] max-h-[420px] overflow-y-auto whitespace-pre-wrap leading-relaxed"
      >
        {streamedText}
        {(status === 'writing') && (
          <span className="inline-block w-0.5 h-4 bg-[#0066ff] ml-0.5 animate-pulse" />
        )}
        {!streamedText && status === 'writing' && (
          <span className="text-[#8b949e]">Generating your post...</span>
        )}
      </div>

      <div className="px-5 py-3 border-t border-[#30363d] flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          {status === 'writing' && (
            <span className="flex items-center gap-2 text-[#0066ff]">
              <span className="w-2 h-2 rounded-full bg-[#0066ff] animate-pulse" />
              Writing...
            </span>
          )}
          {status === 'written' && (
            <span className="flex items-center gap-2 text-[#3fb950]">
              <Check size={14} /> Written
            </span>
          )}
          {status === 'generating-image' && (
            <span className="flex items-center gap-2 text-[#8b949e]">
              <Loader2 size={14} className="animate-spin" /> Generating image...
            </span>
          )}
          {status === 'image-ready' && (
            <span className="flex items-center gap-2 text-[#3fb950]">
              <Check size={14} /> Image ready
            </span>
          )}
          {status === 'image-error' && (
            <span className="flex items-center gap-2 text-[#d29922]">
              <AlertTriangle size={14} />
              {imageWarning ? `Image: ${imageWarning.slice(0, 60)}` : 'Image error — continuing'}
            </span>
          )}
          {status === 'done' && (
            <span className="flex items-center gap-2 text-[#3fb950]">
              <Check size={14} /> Ready — advancing...
            </span>
          )}
        </div>
        <div className="text-[#8b949e] text-xs">{wc} words</div>
      </div>
    </div>
  )
}
