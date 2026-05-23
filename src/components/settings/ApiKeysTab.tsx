'use client'

import { useState } from 'react'
import { AppSettings } from '@/types'
import { Eye, EyeOff, Check, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  settings: AppSettings
  onUpdate: (s: AppSettings) => void
}

export default function ApiKeysTab({ settings, onUpdate }: Props) {
  const [showAnthropicKey, setShowAnthropicKey] = useState(false)
  const [showOpenAIKey, setShowOpenAIKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testingAnthropic, setTestingAnthropic] = useState(false)
  const [testingOpenAI, setTestingOpenAI] = useState(false)
  const [anthropicStatus, setAnthropicStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [openaiStatus, setOpenaiStatus] = useState<'idle' | 'ok' | 'error'>('idle')

  const save = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anthropicApiKey: settings.anthropicApiKey,
          openaiApiKey: settings.openaiApiKey,
        }),
      })
      toast.success('API keys saved')
    } catch {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  const testAnthropic = async () => {
    setTestingAnthropic(true)
    setAnthropicStatus('idle')
    try {
      const res = await fetch('/api/settings/test-anthropic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: settings.anthropicApiKey }),
      })
      setAnthropicStatus(res.ok ? 'ok' : 'error')
    } catch {
      setAnthropicStatus('error')
    }
    setTestingAnthropic(false)
  }

  const testOpenAI = async () => {
    setTestingOpenAI(true)
    setOpenaiStatus('idle')
    try {
      const res = await fetch('/api/settings/test-openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: settings.openaiApiKey }),
      })
      setOpenaiStatus(res.ok ? 'ok' : 'error')
    } catch {
      setOpenaiStatus('error')
    }
    setTestingOpenAI(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-6">
        <h3 className="text-[#e6edf3] font-semibold mb-4">Anthropic (Claude)</h3>
        <div className="space-y-3">
          <label className="block text-sm text-[#8b949e]">API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showAnthropicKey ? 'text' : 'password'}
                value={settings.anthropicApiKey}
                onChange={e => onUpdate({ ...settings, anthropicApiKey: e.target.value })}
                placeholder="sk-ant-..."
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff] pr-10"
              />
              <button
                onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#e6edf3]"
              >
                {showAnthropicKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              onClick={testAnthropic}
              disabled={testingAnthropic || !settings.anthropicApiKey}
              className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-md text-sm text-[#e6edf3] hover:bg-[#30363d] disabled:opacity-50 flex items-center gap-2"
            >
              {testingAnthropic ? <Loader2 size={14} className="animate-spin" /> : null}
              Test
            </button>
            {anthropicStatus === 'ok' && (
              <span className="flex items-center text-green-400 text-sm">
                <Check size={16} className="mr-1" />OK
              </span>
            )}
            {anthropicStatus === 'error' && (
              <span className="flex items-center text-red-400 text-sm">
                <AlertTriangle size={16} className="mr-1" />Failed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-6">
        <h3 className="text-[#e6edf3] font-semibold mb-4">OpenAI (DALL-E / Image Generation)</h3>
        <div className="space-y-3">
          <label className="block text-sm text-[#8b949e]">API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showOpenAIKey ? 'text' : 'password'}
                value={settings.openaiApiKey}
                onChange={e => onUpdate({ ...settings, openaiApiKey: e.target.value })}
                placeholder="sk-proj-..."
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff] pr-10"
              />
              <button
                onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#e6edf3]"
              >
                {showOpenAIKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              onClick={testOpenAI}
              disabled={testingOpenAI || !settings.openaiApiKey}
              className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-md text-sm text-[#e6edf3] hover:bg-[#30363d] disabled:opacity-50 flex items-center gap-2"
            >
              {testingOpenAI ? <Loader2 size={14} className="animate-spin" /> : null}
              Test
            </button>
            {openaiStatus === 'ok' && (
              <span className="flex items-center text-green-400 text-sm">
                <Check size={16} className="mr-1" />OK
              </span>
            )}
            {openaiStatus === 'error' && (
              <span className="flex items-center text-red-400 text-sm">
                <AlertTriangle size={16} className="mr-1" />Failed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2 bg-[#0066ff] text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          Save API Keys
        </button>
      </div>
    </div>
  )
}
