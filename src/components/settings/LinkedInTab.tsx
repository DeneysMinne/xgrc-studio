'use client'

import { useState } from 'react'
import { AppSettings } from '@/types'
import { Eye, EyeOff, ExternalLink, Check, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  settings: AppSettings
  onUpdate: (s: AppSettings) => void
}

export default function LinkedInTab({ settings, onUpdate }: Props) {
  const [showSecret, setShowSecret] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'ok' | 'error'>('idle')

  const save = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedinClientId: settings.linkedinClientId,
          linkedinClientSecret: settings.linkedinClientSecret,
          linkedinOrgId: settings.linkedinOrgId,
          companyLinkedInUrl: settings.companyLinkedInUrl,
          defaultPublishAs: settings.defaultPublishAs,
        }),
      })
      toast.success('LinkedIn settings saved')
    } catch {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  const connectOAuth = async () => {
    setConnecting(true)
    try {
      const res = await fetch('/api/linkedin/auth')
      const { url, error } = await res.json()
      if (error) {
        toast.error(error)
        setConnecting(false)
        return
      }
      window.open(url, 'linkedin-auth', 'width=600,height=700')
      const handler = (e: MessageEvent) => {
        if (e.data === 'linkedin-connected') {
          toast.success('LinkedIn connected successfully')
          window.removeEventListener('message', handler)
          setConnecting(false)
          // Reload settings
          fetch('/api/settings')
            .then(r => r.json())
            .then(data => onUpdate({ ...settings, ...data, brandData: settings.brandData }))
        }
      }
      window.addEventListener('message', handler)
    } catch {
      toast.error('Failed to initiate OAuth')
      setConnecting(false)
    }
  }

  const testConnection = async () => {
    setTesting(true)
    setTestStatus('idle')
    try {
      const res = await fetch('/api/linkedin/test', { method: 'POST' })
      setTestStatus(res.ok ? 'ok' : 'error')
    } catch {
      setTestStatus('error')
    }
    setTesting(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-6 space-y-4">
        <h3 className="text-[#e6edf3] font-semibold">Developer App Credentials</h3>
        <div>
          <label className="block text-sm text-[#8b949e] mb-1">Client ID</label>
          <input
            type="text"
            value={settings.linkedinClientId}
            onChange={e => onUpdate({ ...settings, linkedinClientId: e.target.value })}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff]"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8b949e] mb-1">Client Secret</label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={settings.linkedinClientSecret}
              onChange={e => onUpdate({ ...settings, linkedinClientSecret: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff] pr-10"
            />
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b949e]"
            >
              {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-6 space-y-4">
        <h3 className="text-[#e6edf3] font-semibold">Company Page</h3>
        <div>
          <label className="block text-sm text-[#8b949e] mb-1">Organization ID</label>
          <input
            type="text"
            value={settings.linkedinOrgId}
            onChange={e => onUpdate({ ...settings, linkedinOrgId: e.target.value })}
            placeholder="e.g. 12345678"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff]"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8b949e] mb-1">LinkedIn Page URL</label>
          <input
            type="text"
            value={settings.companyLinkedInUrl}
            onChange={e => onUpdate({ ...settings, companyLinkedInUrl: e.target.value })}
            placeholder="https://www.linkedin.com/company/xgrc-software"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff]"
          />
        </div>
      </div>

      <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-6 space-y-4">
        <h3 className="text-[#e6edf3] font-semibold">Access Token</h3>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              type={showToken ? 'text' : 'password'}
              value={settings.linkedinAccessToken}
              readOnly
              placeholder="Connect via OAuth to get token"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#8b949e] text-sm pr-10"
            />
            <button
              onClick={() => setShowToken(!showToken)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b949e]"
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            onClick={connectOAuth}
            disabled={connecting || !settings.linkedinClientId}
            className="px-4 py-2 bg-[#0066ff] text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
          >
            {connecting ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
            Connect via OAuth
          </button>
        </div>
        {settings.linkedinPersonUrn && (
          <p className="text-xs text-[#8b949e]">Connected: {settings.linkedinPersonUrn}</p>
        )}
      </div>

      <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-6 space-y-4">
        <h3 className="text-[#e6edf3] font-semibold">Default Publish Target</h3>
        <div className="flex gap-3">
          {(['PERSONAL', 'COMPANY'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => onUpdate({ ...settings, defaultPublishAs: opt })}
              className={`px-4 py-2 rounded-md text-sm border ${
                settings.defaultPublishAs === opt
                  ? 'bg-[#0066ff] border-[#0066ff] text-white'
                  : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              {opt === 'PERSONAL' ? 'My Profile' : 'Company Page'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={testConnection}
            disabled={testing || !settings.linkedinAccessToken}
            className="px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-md text-sm text-[#e6edf3] hover:bg-[#30363d] disabled:opacity-50 flex items-center gap-2"
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : null}
            Test Connection
          </button>
          {testStatus === 'ok' && (
            <span className="flex items-center text-green-400 text-sm">
              <Check size={16} className="mr-1" />Connected
            </span>
          )}
          {testStatus === 'error' && (
            <span className="flex items-center text-red-400 text-sm">
              <AlertTriangle size={16} className="mr-1" />Failed
            </span>
          )}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2 bg-[#0066ff] text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          Save LinkedIn Settings
        </button>
      </div>
    </div>
  )
}
