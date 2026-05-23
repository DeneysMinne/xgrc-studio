'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Check, X, Loader2, RotateCcw, ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Topic } from '@/types'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'Governance & Risk',
  'Compliance & Regulatory',
  'Cybersecurity',
  'ESG & Sustainability',
  'Technology & Digital',
  'SHEQ & Operations',
]

const CATEGORY_COLORS: Record<string, string> = {
  'Governance & Risk':       'bg-blue-500/20 text-blue-400',
  'Compliance & Regulatory': 'bg-purple-500/20 text-purple-400',
  'Cybersecurity':           'bg-red-500/20 text-red-400',
  'ESG & Sustainability':    'bg-green-500/20 text-green-400',
  'Technology & Digital':    'bg-cyan-500/20 text-cyan-400',
  'SHEQ & Operations':       'bg-orange-500/20 text-orange-400',
}

interface EditState {
  title: string
  value: string
  category: string
  logoKey: string
  hashtags: string
}

function emptyEdit(): EditState {
  return { title: '', value: '', category: CATEGORIES[0], logoKey: '', hashtags: '' }
}

export default function TopicsTab() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>(emptyEdit())
  const [adding, setAdding] = useState(false)
  const [newTopic, setNewTopic] = useState<EditState>(emptyEdit())
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [filterCat, setFilterCat] = useState('All')

  useEffect(() => { load() }, [])

  async function load() {
    const res = await fetch('/api/topics')
    const data = await res.json()
    setTopics(data)
    setLoading(false)
  }

  function hashtagsToString(tags: string[]): string {
    return tags.join(', ')
  }

  function stringToHashtags(raw: string): string[] {
    return raw.split(',').map(t => t.trim()).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`)
  }

  function startEdit(t: Topic) {
    setEditingId(t.id)
    setEditState({
      title: t.title,
      value: t.value,
      category: t.category,
      logoKey: t.logoKey,
      hashtags: hashtagsToString(t.hashtags),
    })
  }

  function cancelEdit() { setEditingId(null) }

  async function saveEdit(id: string) {
    if (!editState.title.trim() || !editState.value.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/topics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editState, hashtags: stringToHashtags(editState.hashtags) }),
      })
      const updated = await res.json()
      setTopics(prev => prev.map(t => t.id === id ? updated : t))
      setEditingId(null)
      toast.success('Topic saved')
    } catch {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  async function toggleActive(t: Topic) {
    const res = await fetch(`/api/topics/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !t.active }),
    })
    const updated = await res.json()
    setTopics(prev => prev.map(x => x.id === t.id ? updated : x))
    toast.success(updated.active ? 'Topic activated' : 'Topic deactivated')
  }

  async function addTopic() {
    if (!newTopic.title.trim() || !newTopic.value.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTopic, hashtags: stringToHashtags(newTopic.hashtags) }),
      })
      const created = await res.json()
      setTopics(prev => [...prev, created])
      setNewTopic(emptyEdit())
      setAdding(false)
      toast.success('Topic added')
    } catch {
      toast.error('Failed to add topic')
    }
    setSaving(false)
  }

  async function resetDefaults() {
    setResetting(true)
    try {
      const res = await fetch('/api/topics/reset', { method: 'POST' })
      const data = await res.json()
      setTopics(data)
      toast.success('Default topics restored — your custom topics are unchanged')
    } catch {
      toast.error('Reset failed')
    }
    setResetting(false)
  }

  const displayed = filterCat === 'All' ? topics : topics.filter(t => t.category === filterCat)
  const grouped = CATEGORIES.reduce<Record<string, Topic[]>>((acc, cat) => {
    acc[cat] = displayed.filter(t => t.category === cat)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 size={20} className="animate-spin text-[#8b949e]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[#e6edf3] font-semibold">Topic Library</h2>
          <p className="text-[#8b949e] text-sm mt-0.5">
            Topics shown in the Create Post selector. Edit, deactivate, or add new topics without touching any code.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={resetDefaults}
            disabled={resetting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] rounded-md hover:bg-[#21262d]"
          >
            {resetting ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
            Reset defaults
          </button>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#0066ff] text-white rounded-md hover:bg-blue-600"
          >
            <Plus size={14} /> Add Topic
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="relative inline-block">
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="appearance-none bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-[#e6edf3] focus:outline-none pr-7"
        >
          <option value="All">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b949e] pointer-events-none" />
      </div>

      {adding && (
        <div className="bg-[#1a1a2e] border border-[#0066ff]/50 rounded-lg p-4 space-y-3">
          <p className="text-xs text-[#8b949e]">New topic</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Display title *</label>
              <input
                value={newTopic.title}
                onChange={e => setNewTopic(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#0066ff]"
                placeholder="e.g. POPIA Compliance: What SA organisations need to know"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">AI topic value *</label>
              <input
                value={newTopic.value}
                onChange={e => setNewTopic(p => ({ ...p, value: e.target.value }))}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#0066ff]"
                placeholder="e.g. POPIA Compliance"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Category *</label>
              <div className="relative">
                <select
                  value={newTopic.category}
                  onChange={e => setNewTopic(p => ({ ...p, category: e.target.value }))}
                  className="w-full appearance-none bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#e6edf3] focus:outline-none pr-7"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b949e] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Logo key <span className="font-normal">(leave blank for auto)</span></label>
              <input
                value={newTopic.logoKey}
                onChange={e => setNewTopic(p => ({ ...p, logoKey: e.target.value }))}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#0066ff] font-mono"
                placeholder="e.g. msxCyber"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#8b949e] mb-1">Hashtags <span className="font-normal">(comma-separated, # added automatically)</span></label>
            <input
              value={newTopic.hashtags}
              onChange={e => setNewTopic(p => ({ ...p, hashtags: e.target.value }))}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#0066ff]"
              placeholder="#POPIA, #DataPrivacy, #Compliance, #SouthAfrica, #GRC"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addTopic}
              disabled={saving || !newTopic.title.trim() || !newTopic.value.trim()}
              className="px-4 py-1.5 bg-[#0066ff] text-white text-sm rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : null}
              Add Topic
            </button>
            <button
              onClick={() => { setAdding(false); setNewTopic(emptyEdit()) }}
              className="px-4 py-1.5 text-sm text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {CATEGORIES.filter(cat => grouped[cat]?.length > 0).map(cat => (
        <div key={cat}>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('text-xs px-2 py-0.5 rounded-full', CATEGORY_COLORS[cat])}>{cat}</span>
            <span className="text-xs text-[#8b949e]">{grouped[cat].length} topics</span>
          </div>
          <div className="space-y-1.5">
            {grouped[cat].map(t => (
              <div
                key={t.id}
                className={cn(
                  'bg-[#1a1a2e] border rounded-lg px-4 py-3',
                  t.active ? 'border-[#30363d]' : 'border-[#30363d] opacity-50'
                )}
              >
                {editingId === t.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-[#8b949e] mb-1">Display title</label>
                        <input
                          value={editState.title}
                          onChange={e => setEditState(p => ({ ...p, title: e.target.value }))}
                          className="w-full bg-[#0d1117] border border-[#0066ff] rounded px-2 py-1.5 text-sm text-[#e6edf3] focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#8b949e] mb-1">AI topic value</label>
                        <input
                          value={editState.value}
                          onChange={e => setEditState(p => ({ ...p, value: e.target.value }))}
                          className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#e6edf3] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#8b949e] mb-1">Category</label>
                        <div className="relative">
                          <select
                            value={editState.category}
                            onChange={e => setEditState(p => ({ ...p, category: e.target.value }))}
                            className="w-full appearance-none bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#e6edf3] focus:outline-none pr-7"
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b949e] pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-[#8b949e] mb-1">Logo key</label>
                        <input
                          value={editState.logoKey}
                          onChange={e => setEditState(p => ({ ...p, logoKey: e.target.value }))}
                          className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#e6edf3] focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[#8b949e] mb-1">Hashtags (comma-separated)</label>
                      <input
                        value={editState.hashtags}
                        onChange={e => setEditState(p => ({ ...p, hashtags: e.target.value }))}
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#e6edf3] focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(t.id)}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs text-green-400 hover:text-green-300 border border-green-400/30 rounded"
                      >
                        <Check size={12} /> Save
                      </button>
                      <button onClick={cancelEdit} className="flex items-center gap-1.5 px-3 py-1 text-xs text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] rounded">
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#e6edf3] leading-snug">{t.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-[#8b949e] font-mono">{t.value}</span>
                        {t.logoKey && <span className="text-xs text-[#8b949e]">logo: <span className="font-mono">{t.logoKey}</span></span>}
                        <span className="text-xs text-[#8b949e]">{t.hashtags.length} hashtags</span>
                        {!t.isDefault && <span className="text-xs px-1.5 py-0.5 bg-[#d29922]/20 text-[#d29922] rounded">Custom</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleActive(t)}
                        className={cn(
                          'flex items-center gap-1 text-xs',
                          t.active ? 'text-green-400 hover:text-green-300' : 'text-[#8b949e] hover:text-[#e6edf3]'
                        )}
                      >
                        {t.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button onClick={() => startEdit(t)} className="p-1 text-[#8b949e] hover:text-[#e6edf3]">
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#8b949e] space-y-1">
        <p><strong className="text-[#e6edf3]">Display title</strong> — what users see in the Create Post topic list.</p>
        <p><strong className="text-[#e6edf3]">AI topic value</strong> — the short label passed to Claude as the post topic. Keep it concise.</p>
        <p><strong className="text-[#e6edf3]">Logo key</strong> — leave blank to auto-select based on topic keywords. Set a specific key to always use that logo for this topic.</p>
        <p><strong className="text-[#e6edf3]">Reset defaults</strong> — restores all built-in topics. Your custom topics are never deleted.</p>
      </div>
    </div>
  )
}
