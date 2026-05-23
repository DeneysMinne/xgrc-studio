'use client'

import { useState } from 'react'
import { Logo, LogoVariant } from '@/types'
import { Check, ChevronDown, ChevronRight, Loader2, X, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  logos: Logo[]
  onUpdate: (logos: Logo[]) => void
}

export default function LogoManager({ logos, onUpdate }: Props) {
  const [expanded, setExpanded] = useState<string | null>('xgrcMaster')
  const [uploading, setUploading] = useState<Record<string, boolean>>({})

  const updateVariant = (logoKey: string, variantIndex: number, updates: Partial<LogoVariant>) => {
    const newLogos = logos.map(logo => {
      if (logo.key !== logoKey) return logo
      const newVariants = logo.variants.map((v, i) => i === variantIndex ? { ...v, ...updates } : v)
      return { ...logo, variants: newVariants }
    })
    onUpdate(newLogos)
  }

  const uploadFile = async (logoKey: string, variantIndex: number, variantName: string, file: File) => {
    const key = `${logoKey}-${variantIndex}`
    setUploading(prev => ({ ...prev, [key]: true }))
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('logoKey', logoKey)
      formData.append('variantName', variantName)
      const res = await fetch('/api/logos', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.filePath) {
        updateVariant(logoKey, variantIndex, { filePath: data.filePath })
        toast.success('Logo uploaded')
      }
    } catch {
      toast.error('Upload failed')
    }
    setUploading(prev => ({ ...prev, [key]: false }))
  }

  const showInFinder = async (filePath: string) => {
    await fetch('/api/open-finder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath }),
    })
  }

  return (
    <div className="space-y-3">
      <h3 className="text-[#e6edf3] font-semibold">Logo Manager</h3>
      {logos.map(logo => (
        <div key={logo.key} className="bg-[#1a1a2e] border border-[#30363d] rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === logo.key ? null : logo.key)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#21262d] transition-colors"
          >
            <div className="flex items-center gap-3">
              {expanded === logo.key
                ? <ChevronDown size={16} className="text-[#0066ff]" />
                : <ChevronRight size={16} className="text-[#8b949e]" />
              }
              <span className="text-[#00d4ff] font-semibold text-sm">{logo.trademarkName}</span>
              <span className="text-[#8b949e] text-sm">{logo.logoName}</span>
            </div>
            <div className="flex gap-1">
              {logo.variants.map((v, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${v.filePath ? 'bg-green-400' : 'bg-[#30363d]'}`} />
              ))}
            </div>
          </button>

          {expanded === logo.key && (
            <div className="px-4 pb-4 space-y-3 border-t border-[#30363d]">
              <p className="text-xs text-[#8b949e] pt-3">{logo.useCase}</p>
              {logo.variants.map((variant, i) => {
                const uploadKey = `${logo.key}-${i}`
                return (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2 items-center bg-[#0d1117] rounded-md p-3">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={e => updateVariant(logo.key, i, { name: e.target.value })}
                      className="bg-[#1a1a2e] border border-[#30363d] rounded px-2 py-1.5 text-[#e6edf3] text-xs focus:outline-none focus:border-[#0066ff]"
                      placeholder="Variant name"
                    />
                    <select
                      value={variant.worksOn}
                      onChange={e => updateVariant(logo.key, i, { worksOn: e.target.value as 'light' | 'dark' | 'any' })}
                      className="bg-[#1a1a2e] border border-[#30363d] rounded px-2 py-1.5 text-[#e6edf3] text-xs focus:outline-none"
                    >
                      <option value="any">Any background</option>
                      <option value="light">Light backgrounds</option>
                      <option value="dark">Dark backgrounds</option>
                    </select>
                    <div className="flex items-center gap-1 col-span-1">
                      <div className="relative flex-1 min-w-[160px]">
                        <input
                          type="text"
                          value={variant.filePath}
                          onChange={e => updateVariant(logo.key, i, { filePath: e.target.value })}
                          placeholder="File path"
                          className="w-full bg-[#1a1a2e] border border-[#30363d] rounded px-2 py-1.5 text-[#e6edf3] text-xs focus:outline-none focus:border-[#0066ff] pr-16"
                        />
                        <label className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-[#21262d] rounded text-xs text-[#8b949e] hover:text-[#e6edf3] cursor-pointer">
                          {uploading[uploadKey] ? <Loader2 size={10} className="animate-spin" /> : 'Browse'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0]
                              if (file) uploadFile(logo.key, i, variant.name, file)
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {variant.filePath ? (
                        <>
                          <span className="flex items-center gap-1 text-green-400 text-xs whitespace-nowrap">
                            <Check size={12} />Set
                          </span>
                          <button
                            onClick={() => showInFinder(variant.filePath)}
                            className="p-1 hover:text-[#e6edf3] text-[#8b949e]"
                            title="Show in Finder"
                          >
                            <FolderOpen size={14} />
                          </button>
                          <button
                            onClick={() => updateVariant(logo.key, i, { filePath: '' })}
                            className="p-1 hover:text-red-400 text-[#8b949e]"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <span className="text-[#8b949e] text-xs whitespace-nowrap">Missing</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
