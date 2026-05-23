'use client'

import { useState } from 'react'
import { AppSettings, BrandConfig } from '@/types'
import LogoManager from './LogoManager'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  settings: AppSettings
  onUpdate: (s: AppSettings) => void
}

export default function BrandTab({ settings, onUpdate }: Props) {
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: settings.companyName,
          brandData: settings.brandData,
        }),
      })
      toast.success('Brand settings saved')
    } catch {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  const updateBrand = (updates: Partial<BrandConfig>) => {
    onUpdate({ ...settings, brandData: { ...settings.brandData, ...updates } })
  }

  const updateColour = (key: keyof BrandConfig['colours'], value: string) => {
    updateBrand({ colours: { ...settings.brandData.colours, [key]: value } })
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-6 space-y-4">
        <h3 className="text-[#e6edf3] font-semibold">Company Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#8b949e] mb-1">Company Name</label>
            <input
              type="text"
              value={settings.brandData.companyName}
              onChange={e => updateBrand({ companyName: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#8b949e] mb-1">Primary Tagline</label>
            <input
              type="text"
              value={settings.brandData.taglinePrimary}
              onChange={e => updateBrand({ taglinePrimary: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff]"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-[#8b949e] mb-1">Secondary Tagline</label>
            <input
              type="text"
              value={settings.brandData.taglineSecondary}
              onChange={e => updateBrand({ taglineSecondary: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#8b949e] mb-2">Brand Colours</label>
          <div className="grid grid-cols-5 gap-3">
            {(Object.entries(settings.brandData.colours) as [keyof BrandConfig['colours'], string][]).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={value}
                    onChange={e => updateColour(key, e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs text-[#8b949e] capitalize">{key}</span>
                </div>
                <input
                  type="text"
                  value={value}
                  onChange={e => updateColour(key, e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1 text-[#e6edf3] text-xs focus:outline-none focus:border-[#0066ff]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <LogoManager
        logos={settings.brandData.logos}
        onUpdate={logos => updateBrand({ logos })}
      />

      <div className="sticky bottom-0 bg-[#0d1117] border-t border-[#30363d] py-4 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2 bg-[#0066ff] text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          Save Logo Paths
        </button>
      </div>
    </div>
  )
}
