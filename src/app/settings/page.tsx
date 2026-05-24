'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import ApiKeysTab from '@/components/settings/ApiKeysTab'
import LinkedInTab from '@/components/settings/LinkedInTab'
import BrandTab from '@/components/settings/BrandTab'
import WriterTab from '@/components/settings/WriterTab'
import PlatformsTab from '@/components/settings/PlatformsTab'
import SolutionsTab from '@/components/settings/SolutionsTab'
import TopicsTab from '@/components/settings/TopicsTab'
import { SkeletonSettings } from '@/components/ui/Skeleton'
import { AppSettings } from '@/types'
import { DEFAULT_BRAND_CONFIG } from '@/lib/brand-config'
import { DEFAULT_WRITER_CONFIG } from '@/lib/ai-writer'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SettingsContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  const [settings, setSettings] = useState<AppSettings>({
    anthropicApiKey: '',
    openaiApiKey: '',
    linkedinClientId: '',
    linkedinClientSecret: '',
    linkedinAccessToken: '',
    linkedinPersonUrn: '',
    linkedinOrgId: '',
    companyName: 'XGRC Software',
    companyLinkedInUrl: '',
    defaultPublishAs: 'PERSONAL',
    brandData: DEFAULT_BRAND_CONFIG,
    writerConfig: DEFAULT_WRITER_CONFIG,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => { setSettings(prev => ({ ...prev, ...data })); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const defaultTab = tabParam === 'linkedin' ? 'linkedin' : 'api-keys'

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="text-dim mt-1">Configure API keys, platforms, brand assets, solutions, topics, and writer profile</p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="bg-surface border border-edge mb-6 flex-wrap h-auto gap-1 p-1" aria-label="Settings sections">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="brand">Brand &amp; Logos</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="writer">Writer Profile</TabsTrigger>
        </TabsList>

        {loading ? (
          <SkeletonSettings />
        ) : (
          <>
            <TabsContent value="api-keys">
              <ApiKeysTab settings={settings} onUpdate={setSettings} />
            </TabsContent>
            <TabsContent value="platforms">
              <PlatformsTab />
            </TabsContent>
            <TabsContent value="linkedin">
              <LinkedInTab settings={settings} onUpdate={setSettings} />
            </TabsContent>
            <TabsContent value="brand">
              <BrandTab settings={settings} onUpdate={setSettings} />
            </TabsContent>
            <TabsContent value="solutions">
              <SolutionsTab />
            </TabsContent>
            <TabsContent value="topics">
              <TopicsTab />
            </TabsContent>
            <TabsContent value="writer">
              <WriterTab settings={settings} onUpdate={setSettings} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="h-7 w-24 bg-elevated rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-elevated rounded animate-pulse" />
        </div>
        <SkeletonSettings />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}
