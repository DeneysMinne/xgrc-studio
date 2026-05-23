'use client'

import { useState, useEffect } from 'react'
import { Post } from '@/types'
import { Search, Plus } from 'lucide-react'
import { cn, formatDate, truncate } from '@/lib/utils'
import PostDetail from '@/components/history/PostDetail'
import { useRouter } from 'next/navigation'

const STATUS_FILTERS = ['All', 'DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED'] as const
type Filter = typeof STATUS_FILTERS[number]

const STATUS_LABELS: Record<string, string> = { DRAFT: 'Draft', SCHEDULED: 'Scheduled', PUBLISHED: 'Published', FAILED: 'Failed' }
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-[#30363d] text-[#8b949e]',
  SCHEDULED: 'bg-blue-500/20 text-blue-400',
  PUBLISHED: 'bg-green-500/20 text-[#3fb950]',
  FAILED: 'bg-red-500/20 text-[#f85149]',
}

export default function HistoryPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchPosts = async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (filter !== 'All') params.set('status', filter)
    const res = await fetch(`/api/posts?${params}`)
    const data = await res.json()
    setPosts(data.posts || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [filter])  // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = posts.filter(p =>
    !search || p.heading.toLowerCase().includes(search.toLowerCase()) || p.topic.toLowerCase().includes(search.toLowerCase())
  )

  const selected = filtered.find(p => p.id === selectedId) || null

  const handleDelete = async (id: string) => {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    setPosts(prev => prev.filter(p => p.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const handleDuplicate = async (post: Post) => {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: post.topic,
        heading: post.heading + ' (Copy)',
        content: post.content,
        imagePath: post.imagePath,
        imagePrompt: post.imagePrompt,
        hashtags: post.hashtags,
        logoKey: post.logoKey,
        logoVariant: post.logoVariant,
        status: 'DRAFT',
      }),
    })
    const newPost = await res.json()
    setPosts(prev => [newPost, ...prev])
    setSelectedId(newPost.id)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">History</h1>
          <p className="text-[#8b949e] mt-1">{total} posts total</p>
        </div>
        <button
          onClick={() => router.push('/create')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0066ff] text-white rounded-lg text-sm font-medium hover:bg-blue-600"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      <div className="grid grid-cols-[35%_65%] gap-6" style={{ minHeight: '70vh' }}>
        {/* Left — list */}
        <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#30363d] space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]" />
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-8 pr-3 py-1.5 text-[#e6edf3] text-sm focus:outline-none focus:border-[#0066ff]"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    filter === f ? 'bg-[#0066ff] text-white' : 'text-[#8b949e] hover:text-[#e6edf3]'
                  )}
                >
                  {f === 'All' ? 'All' : STATUS_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-[#8b949e] text-sm">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[#8b949e] text-sm">
                  {filter === 'All' ? 'No posts yet. Create your first post.' : `No ${STATUS_LABELS[filter]?.toLowerCase()} posts.`}
                </p>
                {filter === 'All' && (
                  <button onClick={() => router.push('/create')} className="mt-3 text-[#0066ff] text-sm hover:underline">
                    Create your first post
                  </button>
                )}
              </div>
            ) : (
              filtered.map(post => (
                <button
                  key={post.id}
                  onClick={() => setSelectedId(post.id)}
                  className={cn(
                    'w-full text-left px-3 py-3 border-b border-[#30363d] hover:bg-[#21262d] transition-colors',
                    selectedId === post.id && 'bg-[#21262d] border-l-2 border-l-[#0066ff]'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-[#e6edf3] leading-tight">{truncate(post.heading || 'Untitled', 50)}</span>
                    <span className={cn('text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0', STATUS_COLORS[post.status] || '')}>
                      {STATUS_LABELS[post.status] || post.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#8b949e] truncate">{post.topic}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-[#8b949e]">{formatDate(post.createdAt)}</p>
                    {post.imagePath && (
                      <div className="w-8 h-5 rounded overflow-hidden bg-[#30363d]">
                        <img src={post.imagePath} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right — detail */}
        <div>
          {selected ? (
            <PostDetail
              post={selected}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onUpdate={updatedPost => setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))}
            />
          ) : (
            <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg h-full flex items-center justify-center">
              <p className="text-[#8b949e] text-sm">Select a post to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
