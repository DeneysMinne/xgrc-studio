'use client'

import { useState } from 'react'
import { AppSettings, WriterConfig } from '@/types'
import { DEFAULT_WRITER_CONFIG } from '@/lib/ai-writer'
import { Loader2, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  settings: AppSettings
  onUpdate: (s: AppSettings) => void
}

const SECTIONS: { key: keyof WriterConfig; label: string; description: string; rows: number }[] = [
  {
    key: 'companyDescription',
    label: 'Company Description',
    description: 'How Claude understands your company. Included at the top of every prompt.',
    rows: 4,
  },
  {
    key: 'writingStyle',
    label: 'Writing Style',
    description: 'Tone, voice, and audience guidelines.',
    rows: 6,
  },
  {
    key: 'postStructure',
    label: 'Post Structure',
    description: 'The required sections and order for every post.',
    rows: 8,
  },
  {
    key: 'formatting',
    label: 'Formatting Rules',
    description: 'Length, paragraph style, markdown rules.',
    rows: 6,
  },
  {
    key: 'approvedLanguage',
    label: 'Approved Language',
    description: 'Phrases and terms to use naturally in posts.',
    rows: 3,
  },
  {
    key: 'doNotList',
    label: 'Do Not List',
    description: 'Forbidden phrases, claims, and formatting patterns.',
    rows: 6,
  },
]

export default function WriterTab({ settings, onUpdate }: Props) {
  const [saving, setSaving] = useState(false)
  const [showOverride, setShowOverride] = useState(false)
  const config: WriterConfig = settings.writerConfig || DEFAULT_WRITER_CONFIG

  const updateConfig = (key: keyof WriterConfig, value: string) => {
    onUpdate({
      ...settings,
      writerConfig: { ...config, [key]: value },
    })
  }

  const resetToDefaults = () => {
    onUpdate({ ...settings, writerConfig: { ...DEFAULT_WRITER_CONFIG } })
    toast.success('Reset to defaults — click Save to apply')
  }

  const save = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ writerConfig: config }),
      })
      toast.success('Writer profile saved')
    } catch {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#e6edf3] font-semibold">AI Writer Profile</h2>
          <p className="text-[#8b949e] text-sm mt-0.5">
            Controls how Claude writes every post. Changes apply to all future generations.
          </p>
        </div>
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] rounded-md hover:bg-[#21262d]"
        >
          <RotateCcw size={12} /> Reset to defaults
        </button>
      </div>

      {SECTIONS.map(({ key, label, description, rows }) => (
        <div key={key} className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-4 space-y-2">
          <div>
            <label className="text-sm font-medium text-[#e6edf3]">{label}</label>
            <p className="text-xs text-[#8b949e] mt-0.5">{description}</p>
          </div>
          <textarea
            value={config[key] || ''}
            onChange={e => updateConfig(key, e.target.value)}
            rows={rows}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff] resize-y font-mono leading-relaxed"
          />
        </div>
      ))}

      {/* Full override */}
      <div className="bg-[#1a1a2e] border border-[#d29922]/40 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowOverride(!showOverride)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#21262d]"
        >
          <div className="flex items-center gap-2">
            {showOverride ? <ChevronDown size={14} className="text-[#d29922]" /> : <ChevronRight size={14} className="text-[#8b949e]" />}
            <span className="text-sm font-medium text-[#e6edf3]">Full System Prompt Override</span>
            {config.customOverride?.trim() && (
              <span className="text-xs px-2 py-0.5 bg-[#d29922]/20 text-[#d29922] rounded-full">Active</span>
            )}
          </div>
          <span className="text-xs text-[#8b949e]">Advanced</span>
        </button>

        {showOverride && (
          <div className="px-4 pb-4 space-y-2 border-t border-[#30363d]">
            <p className="text-xs text-[#d29922] pt-3">
              When non-empty, this replaces the entire system prompt above. Leave blank to use the structured sections.
            </p>
            <textarea
              value={config.customOverride || ''}
              onChange={e => updateConfig('customOverride', e.target.value)}
              rows={12}
              placeholder="Paste a complete custom system prompt here to override all sections above..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#d29922] resize-y font-mono"
            />
            {config.customOverride?.trim() && (
              <button
                onClick={() => updateConfig('customOverride', '')}
                className="text-xs text-[#f85149] hover:underline"
              >
                Clear override — revert to structured sections
              </button>
            )}
          </div>
        )}
      </div>

      <div className={cn(
        'sticky bottom-0 bg-[#0d1117] border-t border-[#30363d] py-4 flex items-center justify-between'
      )}>
        <p className="text-xs text-[#8b949e]">
          {config.customOverride?.trim()
            ? '⚠ Custom override is active — structured sections above are ignored'
            : 'Using structured sections'}
        </p>
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2 bg-[#0066ff] text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          Save Writer Profile
        </button>
      </div>
    </div>
  )
}
