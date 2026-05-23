'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WizardState } from '@/app/create/page'
import { Topic, Solution } from '@/types'

const AUDIENCES = ['Executive', 'Risk', 'Compliance', 'CISO', 'ESG', 'Audit', 'SHEQ']

const CATEGORY_COLORS: Record<string, string> = {
  'Governance & Risk':       'bg-blue-500/20 text-blue-400',
  'Compliance & Regulatory': 'bg-purple-500/20 text-purple-400',
  'Cybersecurity':           'bg-red-500/20 text-red-400',
  'ESG & Sustainability':    'bg-green-500/20 text-green-400',
  'Technology & Digital':    'bg-cyan-500/20 text-cyan-400',
  'SHEQ & Operations':       'bg-orange-500/20 text-orange-400',
}

interface Props {
  state: WizardState
  onUpdate: (updates: Partial<WizardState>) => void
  onNext: () => void
}

export default function TopicSelector({ state, onUpdate, onNext }: Props) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loadingTopics, setLoadingTopics] = useState(true)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [customTopic, setCustomTopic] = useState('')
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])
  const [solutionId, setSolutionId] = useState('')
  const [angle, setAngle] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/topics').then(r => r.json()),
      fetch('/api/solutions').then(r => r.json()),
    ]).then(([t, s]) => {
      setTopics(t)
      setSolutions(s.filter((sol: Solution) => sol.active))
      setLoadingTopics(false)
    }).catch(() => setLoadingTopics(false))
  }, [])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(topics.map(t => t.category))).sort()
    return ['All', ...cats]
  }, [topics])

  const filtered = useMemo(() => {
    return topics.filter(t => {
      const matchCat = category === 'All' || t.category === category
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.value.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [topics, search, category])

  const selectedTopic = state.topic

  const handleGenerate = () => {
    const topic = customTopic.trim() || selectedTopic
    if (!topic) return
    const selectedSolution = solutions.find(s => s.id === solutionId)
    const solutionName = selectedSolution ? `${selectedSolution.name}${selectedSolution.trademark}` : ''
    onUpdate({
      topic,
      additionalContext,
      audience: selectedAudiences.join(', '),
      solutionName,
      angle,
    })
    onNext()
  }

  const canGenerate = !!(customTopic.trim() || selectedTopic)

  if (loadingTopics) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#8b949e]" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[60%_40%] gap-6">
      {/* Left panel — topic list */}
      <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-4 flex flex-col gap-4" style={{ maxHeight: '70vh' }}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff]"
            />
          </div>
          <div className="relative">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="appearance-none bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff] pr-8"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b949e] pointer-events-none" />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {filtered.map(topic => (
            <button
              key={topic.id}
              onClick={() => { onUpdate({ topic: topic.value }); setCustomTopic('') }}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-md border transition-colors',
                selectedTopic === topic.value && !customTopic
                  ? 'bg-[#0066ff]/20 border-[#0066ff] text-[#e6edf3]'
                  : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e]'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm">{topic.title}</span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0', CATEGORY_COLORS[topic.category] || 'bg-[#30363d] text-[#8b949e]')}>
                  {topic.category.split(' & ')[0]}
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-[#8b949e] text-sm text-center py-8">No topics match your search</p>
          )}
        </div>
      </div>

      {/* Right panel — options */}
      <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-5 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">Custom Topic</label>
          <input
            type="text"
            placeholder="Or type your own topic..."
            value={customTopic}
            onChange={e => { setCustomTopic(e.target.value); if (e.target.value) onUpdate({ topic: '' }) }}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">Additional Context <span className="text-[#8b949e] font-normal">(optional)</span></label>
          <textarea
            placeholder="Any specific angle, recent news, or context to include..."
            value={additionalContext}
            onChange={e => setAdditionalContext(e.target.value)}
            rows={3}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff] resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">Audience <span className="text-[#8b949e] font-normal">(optional)</span></label>
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map(a => (
              <button
                key={a}
                onClick={() => setSelectedAudiences(prev =>
                  prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
                )}
                className={cn(
                  'px-3 py-1 rounded-full text-xs border transition-colors',
                  selectedAudiences.includes(a)
                    ? 'bg-[#0066ff] border-[#0066ff] text-white'
                    : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">Solution <span className="text-[#8b949e] font-normal">(optional)</span></label>
          <div className="relative">
            <select
              value={solutionId}
              onChange={e => setSolutionId(e.target.value)}
              className="w-full appearance-none bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff] pr-8"
            >
              <option value="">Auto-select logo</option>
              {solutions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.trademark}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b949e] pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#e6edf3] mb-1.5">Angle / Focus <span className="text-[#8b949e] font-normal">(optional)</span></label>
          <input
            type="text"
            placeholder="e.g. Focus on ROI, mention South Africa..."
            value={angle}
            onChange={e => setAngle(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff]"
          />
        </div>

        <div className="mt-auto pt-2">
          {selectedTopic && !customTopic && (
            <p className="text-xs text-[#8b949e] mb-2 truncate">Selected: <span className="text-[#00d4ff]">{selectedTopic}</span></p>
          )}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full py-3 bg-[#0066ff] text-white rounded-lg font-semibold text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generate Post →
          </button>
        </div>
      </div>
    </div>
  )
}
