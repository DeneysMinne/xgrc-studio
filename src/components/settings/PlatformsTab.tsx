'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, ExternalLink, Loader2 } from 'lucide-react'

interface Platform {
  id: string
  displayName: string
  description: string
  connected: boolean
  available: boolean
  settingsTab?: string
  setupInstructions?: string
}

export default function PlatformsTab() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/platforms')
      .then(r => r.json())
      .then(data => { setPlatforms(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 size={20} className="animate-spin text-[#8b949e]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[#e6edf3] font-semibold">Publishing Platforms</h2>
        <p className="text-[#8b949e] text-sm mt-0.5">
          Connect platforms to publish posts directly from XGRC Studio.
        </p>
      </div>

      {platforms.map(platform => (
        <div key={platform.id} className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#e6edf3] font-medium">{platform.displayName}</span>
                {platform.connected ? (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle size={12} /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-[#8b949e]">
                    <XCircle size={12} /> Not connected
                  </span>
                )}
              </div>
              <p className="text-sm text-[#8b949e]">{platform.description}</p>

              {platform.setupInstructions && (
                <div className="mt-3 p-3 bg-[#0d1117] border border-[#30363d] rounded-md">
                  <p className="text-xs text-[#d29922] leading-relaxed">{platform.setupInstructions}</p>
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              {platform.available ? (
                <a
                  href="/settings?tab=linkedin"
                  className="px-4 py-2 text-sm border border-[#30363d] rounded-md text-[#e6edf3] hover:bg-[#21262d] transition-colors"
                >
                  {platform.connected ? 'Manage' : 'Connect'}
                </a>
              ) : (
                <a
                  href="https://developers.google.com/my-business"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm border border-[#30363d] rounded-md text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
                >
                  Apply for access <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
