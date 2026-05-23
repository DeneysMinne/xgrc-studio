'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Check, X, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import { Solution } from '@/types'
import { cn } from '@/lib/utils'

const TRADEMARK_OPTIONS = ['', '®', '™']

interface EditState {
  name: string
  trademark: string
  logoKey: string
}

export default function SolutionsTab() {
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ name: '', trademark: '', logoKey: '' })
  const [adding, setAdding] = useState(false)
  const [newSolution, setNewSolution] = useState<EditState>({ name: '', trademark: '', logoKey: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const res = await fetch('/api/solutions')
    const data = await res.json()
    setSolutions(data)
    setLoading(false)
  }

  function startEdit(s: Solution) {
    setEditingId(s.id)
    setEditState({ name: s.name, trademark: s.trademark, logoKey: s.logoKey })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id: string) {
    if (!editState.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/solutions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editState),
      })
      const updated = await res.json()
      setSolutions(prev => prev.map(s => s.id === id ? updated : s))
      setEditingId(null)
      toast.success('Solution saved')
    } catch {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  async function toggleActive(s: Solution) {
    const res = await fetch(`/api/solutions/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
    })
    const updated = await res.json()
    setSolutions(prev => prev.map(x => x.id === s.id ? updated : x))
    toast.success(updated.active ? 'Solution activated' : 'Solution deactivated')
  }

  async function addSolution() {
    if (!newSolution.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSolution, sortOrder: solutions.length + 1 }),
      })
      const created = await res.json()
      setSolutions(prev => [...prev, created])
      setNewSolution({ name: '', trademark: '', logoKey: '' })
      setAdding(false)
      toast.success('Solution added')
    } catch {
      toast.error('Failed to add solution')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 size={20} className="animate-spin text-[#8b949e]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[#e6edf3] font-semibold">Solutions & Products</h2>
          <p className="text-[#8b949e] text-sm mt-0.5">
            Manage your product and solution names. These populate the solution selector when creating posts and are passed to the AI as context for logo selection.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#0066ff] text-white rounded-md hover:bg-blue-600 flex-shrink-0"
        >
          <Plus size={14} /> Add Solution
        </button>
      </div>

      {/* Field legend */}
      <div className="grid grid-cols-[1fr_80px_1fr_80px_40px] gap-2 px-4 text-xs text-[#8b949e]">
        <span>Name</span>
        <span>Trademark</span>
        <span>
          Logo Key
          <span className="ml-1 text-[#8b949e]">— must match a key in Brand &amp; Logos</span>
        </span>
        <span>Status</span>
        <span />
      </div>

      <div className="space-y-2">
        {solutions.map(s => (
          <div
            key={s.id}
            className={cn(
              'bg-[#1a1a2e] border rounded-lg px-4 py-3',
              s.active ? 'border-[#30363d]' : 'border-[#30363d] opacity-50'
            )}
          >
            {editingId === s.id ? (
              <div className="grid grid-cols-[1fr_80px_1fr_80px_40px] gap-2 items-center">
                <input
                  value={editState.name}
                  onChange={e => setEditState(p => ({ ...p, name: e.target.value }))}
                  className="bg-[#0d1117] border border-[#0066ff] rounded px-2 py-1 text-sm text-[#e6edf3] focus:outline-none"
                  placeholder="Solution name"
                  autoFocus
                />
                <select
                  value={editState.trademark}
                  onChange={e => setEditState(p => ({ ...p, trademark: e.target.value }))}
                  className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-sm text-[#e6edf3] focus:outline-none"
                >
                  {TRADEMARK_OPTIONS.map(o => <option key={o} value={o}>{o || 'None'}</option>)}
                </select>
                <input
                  value={editState.logoKey}
                  onChange={e => setEditState(p => ({ ...p, logoKey: e.target.value }))}
                  className="bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-sm text-[#e6edf3] focus:outline-none font-mono"
                  placeholder="e.g. msx"
                />
                <span className="text-xs text-[#8b949e]">{s.active ? 'Active' : 'Inactive'}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => saveEdit(s.id)}
                    disabled={saving}
                    className="p-1 text-green-400 hover:text-green-300"
                  >
                    <Check size={16} />
                  </button>
                  <button onClick={cancelEdit} className="p-1 text-[#8b949e] hover:text-[#e6edf3]">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-[1fr_80px_1fr_80px_40px] gap-2 items-center">
                <span className="text-sm text-[#e6edf3] font-medium">
                  {s.name}{s.trademark && <sup className="text-xs ml-0.5 text-[#8b949e]">{s.trademark}</sup>}
                </span>
                <span className="text-xs text-[#8b949e]">{s.trademark || '—'}</span>
                <span className="text-sm text-[#8b949e] font-mono">{s.logoKey || '—'}</span>
                <button
                  onClick={() => toggleActive(s)}
                  className={cn(
                    'flex items-center gap-1 text-xs',
                    s.active ? 'text-green-400 hover:text-green-300' : 'text-[#8b949e] hover:text-[#e6edf3]'
                  )}
                >
                  {s.active
                    ? <><ToggleRight size={16} /> Active</>
                    : <><ToggleLeft size={16} /> Inactive</>
                  }
                </button>
                <button onClick={() => startEdit(s)} className="p-1 text-[#8b949e] hover:text-[#e6edf3]">
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding && (
        <div className="bg-[#1a1a2e] border border-[#0066ff]/50 rounded-lg px-4 py-3">
          <p className="text-xs text-[#8b949e] mb-3">New solution</p>
          <div className="grid grid-cols-[1fr_80px_1fr] gap-2 mb-3">
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Name *</label>
              <input
                value={newSolution.name}
                onChange={e => setNewSolution(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#0066ff]"
                placeholder="e.g. ENVIRX"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Trademark</label>
              <select
                value={newSolution.trademark}
                onChange={e => setNewSolution(p => ({ ...p, trademark: e.target.value }))}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#e6edf3] focus:outline-none"
              >
                {TRADEMARK_OPTIONS.map(o => <option key={o} value={o}>{o || 'None'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1">
                Logo Key
                <span className="ml-1 font-normal">— must match a key in Brand &amp; Logos</span>
              </label>
              <input
                value={newSolution.logoKey}
                onChange={e => setNewSolution(p => ({ ...p, logoKey: e.target.value }))}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-sm text-[#e6edf3] focus:outline-none focus:border-[#0066ff] font-mono"
                placeholder="e.g. envirx"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addSolution}
              disabled={saving || !newSolution.name.trim()}
              className="px-4 py-1.5 bg-[#0066ff] text-white text-sm rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : null}
              Add Solution
            </button>
            <button
              onClick={() => { setAdding(false); setNewSolution({ name: '', trademark: '', logoKey: '' }) }}
              className="px-4 py-1.5 text-sm text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#8b949e] space-y-1">
        <p><strong className="text-[#e6edf3]">Name</strong> — shown in the solution dropdown when creating posts and passed to the AI for logo selection.</p>
        <p><strong className="text-[#e6edf3]">Trademark</strong> — ® or ™ displayed next to the name in the UI. Does not affect logo selection.</p>
        <p><strong className="text-[#e6edf3]">Logo Key</strong> — must exactly match a key defined in Brand &amp; Logos. If the key has no uploaded logo file, images generate without a logo.</p>
        <p><strong className="text-[#e6edf3]">Inactive</strong> — hidden from new post creation. Historical posts referencing this solution are unaffected.</p>
      </div>
    </div>
  )
}
