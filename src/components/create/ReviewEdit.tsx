'use client'

import { useState } from 'react'
import { WizardState } from '@/app/create/page'
import { RefreshCw, Upload, FolderOpen, ChevronDown, ChevronRight, Save, ArrowLeft, Loader2, X, Plus } from 'lucide-react'
import { cn, wordCount } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  state: WizardState
  onUpdate: (updates: Partial<WizardState>) => void
  onBack: () => void
  onNext: () => void
}

export default function ReviewEdit({ state, onUpdate, onBack, onNext }: Props) {
  const [refineText, setRefineText] = useState('')
  const [refining, setRefining] = useState(false)
  const [previousContent, setPreviousContent] = useState<{ heading: string; content: string } | null>(null)
  const [regeneratingImage, setRegeneratingImage] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newHashtag, setNewHashtag] = useState('')
  const [editedPrompt, setEditedPrompt] = useState(state.imagePrompt || '')

  const handleRefine = async () => {
    if (!refineText.trim()) return
    setRefining(true)
    setPreviousContent({ heading: state.heading, content: state.content })
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalPost: state.content, heading: state.heading, instructions: refineText }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      onUpdate({ content: data.post, heading: data.heading })
      setRefineText('')
      toast.success('Post refined')
    } catch (e) {
      toast.error('Refinement failed: ' + String(e))
    }
    setRefining(false)
  }

  const handleUndo = () => {
    if (previousContent) {
      onUpdate(previousContent)
      setPreviousContent(null)
    }
  }

  const handleRegenerateImage = async () => {
    setRegeneratingImage(true)
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editedPrompt,
          postId: state.postId,
          topic: state.topic,
          solutionName: state.solutionName,
          logoKey: state.logoKey,
          visualConcept: state.visualConcept,
          imageText: state.imageText,
        }),
      })
      const data = await res.json()
      if (data.imagePath) {
        onUpdate({ imagePath: data.imagePath })
        toast.success('Image regenerated')
      } else throw new Error(data.error)
    } catch (e) {
      toast.error('Image generation failed: ' + String(e))
    }
    setRegeneratingImage(false)
  }

  const handleUploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.imagePath) { onUpdate({ imagePath: data.imagePath }); toast.success('Image uploaded') }
    } catch { toast.error('Upload failed') }
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      const method = state.postId ? 'PATCH' : 'POST'
      const url = state.postId ? `/api/posts/${state.postId}` : '/api/posts'
      const res = await fetch(url, {
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
        }),
      })
      const data = await res.json()
      if (!state.postId) onUpdate({ postId: data.id })
      toast.success('Draft saved')
    } catch { toast.error('Save failed') }
    setSaving(false)
  }

  const addHashtag = () => {
    const tag = newHashtag.trim().startsWith('#') ? newHashtag.trim() : `#${newHashtag.trim()}`
    if (!tag || tag === '#') return
    onUpdate({ hashtags: [...state.hashtags, tag] })
    setNewHashtag('')
  }

  const removeHashtag = (i: number) => {
    onUpdate({ hashtags: state.hashtags.filter((_, idx) => idx !== i) })
  }

  const wc = wordCount(state.content)
  const charCount = state.content.length

  return (
    <div className="grid grid-cols-[55%_45%] gap-6">
      {/* Left — Post content */}
      <div className="space-y-4">
        <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[#e6edf3]">Post Heading</label>
            <span className="text-xs text-[#8b949e]">{state.heading.length}/80</span>
          </div>
          <input
            type="text"
            value={state.heading}
            onChange={e => onUpdate({ heading: e.target.value.slice(0, 80) })}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2.5 text-[#e6edf3] font-semibold text-lg focus:outline-none focus:border-[#0066ff]"
          />
        </div>

        <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-4">
          <label className="block text-sm font-medium text-[#e6edf3] mb-2">Post Body</label>
          <textarea
            value={state.content}
            onChange={e => onUpdate({ content: e.target.value })}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff] resize-none"
            rows={14}
          />
          <div className="flex justify-between mt-1.5 text-xs text-[#8b949e]">
            <span className={cn(wc > 250 ? 'text-[#f85149]' : wc > 200 ? 'text-[#d29922]' : '')}>{wc} words</span>
            <span>{charCount} chars</span>
          </div>
        </div>

        <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-4">
          <label className="block text-sm font-medium text-[#e6edf3] mb-2">Refine with AI</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Make the hook stronger, shorten to 180 words..."
              value={refineText}
              onChange={e => setRefineText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRefine() }}
              className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff]"
            />
            <button
              onClick={handleRefine}
              disabled={refining || !refineText.trim()}
              className="px-4 py-2 bg-[#0066ff] text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {refining ? <Loader2 size={14} className="animate-spin" /> : null}
              Refine
            </button>
            {previousContent && (
              <button
                onClick={handleUndo}
                className="px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-md text-sm text-[#8b949e] hover:text-[#e6edf3]"
              >
                Undo
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-4">
          <label className="block text-sm font-medium text-[#e6edf3] mb-2">Hashtags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {state.hashtags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1 px-2 py-1 bg-[#0066ff]/20 text-[#00d4ff] rounded-full text-xs">
                {tag}
                <button onClick={() => removeHashtag(i)} className="hover:text-red-400"><X size={10} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="#AddHashtag"
              value={newHashtag}
              onChange={e => setNewHashtag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addHashtag() }}
              className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff]"
            />
            <button onClick={addHashtag} className="px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-md text-[#8b949e] hover:text-[#e6edf3]">
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Right — Image */}
      <div className="space-y-4">
        <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-4">
          {state.imagePath ? (
            <img src={state.imagePath} alt="Generated" className="w-full rounded-md" />
          ) : (
            <div className="w-full aspect-video bg-[#0d1117] rounded-md flex items-center justify-center">
              <p className="text-[#8b949e] text-sm">No image generated</p>
            </div>
          )}

          <div className="mt-3 space-y-2">
            {state.logoKey && (
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-[#0066ff]/20 text-[#00d4ff] rounded-full">
                  {state.logoKey} {state.logoVariant ? `· ${state.logoVariant}` : ''}
                </span>
                {state.logoWarning && (
                  <span className="text-xs px-2 py-0.5 bg-[#d29922]/20 text-[#d29922] rounded-full">
                    ⚠ {state.logoWarning}
                  </span>
                )}
              </div>
            )}

            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#e6edf3]"
            >
              {showPrompt ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Image prompt
            </button>

            {showPrompt && (
              <textarea
                value={editedPrompt}
                onChange={e => setEditedPrompt(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-2 py-2 text-[#8b949e] text-xs focus:outline-none focus:border-[#0066ff] resize-none"
                rows={5}
              />
            )}

            {state.imagePath && (
              <p className="text-xs text-[#8b949e] truncate cursor-pointer hover:text-[#e6edf3]" title={state.imagePath}>
                {state.imagePath}
              </p>
            )}

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleRegenerateImage}
                disabled={regeneratingImage}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-md text-xs text-[#e6edf3] hover:bg-[#30363d] disabled:opacity-50"
              >
                {regeneratingImage ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                Regenerate
              </button>
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-md text-xs text-[#e6edf3] hover:bg-[#30363d] cursor-pointer">
                <Upload size={12} />
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadImage(f) }} />
              </label>
              {state.imagePath && (
                <button
                  onClick={() => fetch('/api/open-finder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: state.imagePath }) })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-md text-xs text-[#e6edf3] hover:bg-[#30363d]"
                >
                  <FolderOpen size={12} />
                  Finder
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="col-span-2 flex items-center justify-between pt-2 border-t border-[#30363d]">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-[#8b949e] hover:text-[#e6edf3] text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-md text-sm text-[#e6edf3] hover:bg-[#30363d] disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Draft
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2 bg-[#3fb950] text-white rounded-md text-sm font-semibold hover:bg-green-500"
          >
            Approve & Continue →
          </button>
        </div>
      </div>
    </div>
  )
}
