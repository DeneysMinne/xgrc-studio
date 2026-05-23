'use client'

import { useState } from 'react'
import { WizardState } from '@/app/create/page'
import { ArrowLeft, Copy, Send, Loader2, Check, ExternalLink, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
  state: WizardState
  onUpdate: (updates: Partial<WizardState>) => void
  onBack: () => void
  onReset: () => void
}

export default function PublishPanel({ state, onUpdate, onBack, onReset }: Props) {
  const [publishAs, setPublishAs] = useState<'PERSONAL' | 'COMPANY'>('PERSONAL')
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now')
  const [scheduledAt, setScheduledAt] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [published, setPublished] = useState(false)
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const router = useRouter()

  // suppress unused warning — onUpdate available for future use
  void onUpdate

  const fullText = `${state.heading}\n\n${state.content}\n\n${state.hashtags.join(' ')}`

  const handleCopyAndOpen = async () => {
    await navigator.clipboard.writeText(fullText)
    toast.success('Post copied to clipboard')
    window.open('https://www.linkedin.com/feed/', '_blank')
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      const method = state.postId ? 'PATCH' : 'POST'
      const url = state.postId ? `/api/posts/${state.postId}` : '/api/posts'
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: state.topic,
          heading: state.heading,
          content: state.content,
          imagePath: state.imagePath,
          imagePrompt: state.imagePrompt,
          hashtags: state.hashtags,
          logoKey: state.logoKey,
          logoVariant: state.logoVariant,
          status: 'DRAFT',
          publishAs,
        }),
      })
      toast.success('Saved as draft')
      router.push('/history')
    } catch { toast.error('Save failed') }
    setSaving(false)
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      // Save/update post first
      const method = state.postId ? 'PATCH' : 'POST'
      const url = state.postId ? `/api/posts/${state.postId}` : '/api/posts'
      const saveRes = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: state.topic,
          heading: state.heading,
          content: state.content,
          imagePath: state.imagePath,
          imagePrompt: state.imagePrompt,
          hashtags: state.hashtags,
          logoKey: state.logoKey,
          logoVariant: state.logoVariant,
          status: 'DRAFT',
          publishAs,
        }),
      })
      const savedPost = await saveRes.json()
      const postId = state.postId || savedPost.id

      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          publishAs,
          scheduleAt: scheduleMode === 'later' ? scheduledAt : undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        if (scheduleMode === 'later') {
          toast.success('Post scheduled')
          router.push('/schedule')
        } else {
          setPublished(true)
          if (data.linkedinPostUrl) setLinkedinUrl(data.linkedinPostUrl)
          toast.success('Published to LinkedIn')
          setTimeout(() => router.push('/history'), 5000)
        }
      } else {
        throw new Error(data.error || 'Publish failed')
      }
    } catch (e) {
      toast.error('Publish failed: ' + String(e))
    }
    setPublishing(false)
  }

  if (published) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#3fb950]/20 flex items-center justify-center mx-auto">
          <Check size={32} className="text-[#3fb950]" />
        </div>
        <h2 className="text-2xl font-bold text-[#e6edf3]">Published to LinkedIn</h2>
        {linkedinUrl && (
          <a href={linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-[#0066ff] hover:underline text-sm">
            <ExternalLink size={14} /> View on LinkedIn
          </a>
        )}
        <p className="text-[#8b949e] text-sm">Redirecting to History in 5 seconds...</p>
        <button onClick={onReset} className="flex items-center gap-2 mx-auto px-6 py-3 bg-[#0066ff] text-white rounded-lg font-semibold hover:bg-blue-600">
          <Plus size={16} /> Create Another Post
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[55%_45%] gap-6">
      {/* LinkedIn preview */}
      <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#30363d]">
          <h3 className="text-sm font-medium text-[#e6edf3]">LinkedIn Preview</h3>
        </div>
        <div className="p-4 bg-white rounded-b-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#0a1628] flex items-center justify-center text-white text-xs font-bold">XG</div>
            <div>
              <p className="font-semibold text-sm text-gray-900">XGRC Software</p>
              <p className="text-xs text-gray-500">XGRC Software · Following</p>
            </div>
          </div>
          <p className="font-bold text-gray-900 text-sm mb-2">{state.heading}</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mb-3">{state.content}</p>
          {state.imagePath && (
            <img src={state.imagePath} alt="Post image" className="w-full rounded-md mb-2" />
          )}
          <p className="text-sm text-blue-600">{state.hashtags.join(' ')}</p>
        </div>
      </div>

      {/* Publish options */}
      <div className="space-y-4">
        <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-[#e6edf3]">Publish As</h3>
          <div className="flex gap-2">
            {(['PERSONAL', 'COMPANY'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setPublishAs(opt)}
                className={cn(
                  'flex-1 py-2 rounded-md text-sm border transition-colors',
                  publishAs === opt ? 'bg-[#0066ff] border-[#0066ff] text-white' : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'
                )}
              >
                {opt === 'PERSONAL' ? 'My Profile' : 'Company Page'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-[#e6edf3]">When</h3>
          <div className="space-y-2">
            {(['now', 'later'] as const).map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={scheduleMode === opt}
                  onChange={() => setScheduleMode(opt)}
                  className="accent-[#0066ff]"
                />
                <span className="text-sm text-[#e6edf3]">{opt === 'now' ? 'Publish now' : 'Schedule for later'}</span>
              </label>
            ))}
          </div>
          {scheduleMode === 'later' && (
            <div>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff]"
              />
              <p className="text-xs text-[#8b949e] mt-1">Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-[#8b949e] hover:text-[#e6edf3] text-sm"
          >
            <ArrowLeft size={16} /> Back to Edit
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#21262d] border border-[#30363d] rounded-md text-sm text-[#e6edf3] hover:bg-[#30363d] disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            Save as Draft
          </button>
          <button
            onClick={handleCopyAndOpen}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#21262d] border border-[#30363d] rounded-md text-sm text-[#e6edf3] hover:bg-[#30363d]"
          >
            <Copy size={14} /> Copy text + open LinkedIn
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing || (scheduleMode === 'later' && !scheduledAt)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0066ff] text-white rounded-md text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
          >
            {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {scheduleMode === 'later' ? 'Schedule Post' : 'Publish to LinkedIn'}
          </button>
        </div>
      </div>
    </div>
  )
}
