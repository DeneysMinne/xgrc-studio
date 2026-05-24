'use client'

import { useState, useEffect } from 'react'
import { Post } from '@/types'
import { Search, Plus, FileText } from 'lucide-react'
import { cn, formatDate, truncate } from '@/lib/utils'
import PostDetail from '@/components/history/PostDetail'
import { SkeletonPostCard } from '@/components/ui/Skeleton'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const STATUS_FILTERS = ['All', 'DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED'] as const
type Filter = typeof STATUS_FILTERS[number]

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft', SCHEDULED: 'Scheduled', PUBLISHED: 'Published', FAILED: 'Failed',
}
const STATUS_COLORS: Record<string, string> = {
  DRAFT:     'bg-elevated text-dim',
  SCHEDULED: 'bg-accent/20 text-accent',
  PUBLISHED: 'bg-ok/20 text-ok',
  FAILED:    'bg-err/20 text-err',
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
    !search ||
    p.heading.toLowerCase().includes(search.toLowerCase()) ||
    p.topic.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-ink">History</h1>
          <p className="text-dim mt-1">{total} posts total</p>
        </div>
        <button
          onClick={() => router.push('/create')}
          className="btn-primary"
          aria-label="Create new post"
        >
          <Plus size={16} aria-hidden="true" /> New Post
        </button>
      </div>

      <div className="grid grid-cols-[35%_65%] gap-6" style={{ minHeight: '70vh' }}>
        {/* Left — list */}
        <div className="card flex flex-col overflow-hidden" role="region" aria-label="Post list">
          <div className="p-3 border-b border-edge space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dim" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search posts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search posts"
                className="field w-full pl-8 py-1.5"
              />
            </div>
            <div className="flex gap-1 flex-wrap" role="group" aria-label="Filter by status">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    filter === f ? 'bg-accent text-white' : 'text-dim hover:text-ink'
                  )}
                >
                  {f === 'All' ? 'All' : STATUS_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" role="list" aria-live="polite" aria-busy={loading}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonPostCard key={i} />)
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-10 text-center flex flex-col items-center gap-3"
                role="status"
              >
                <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center">
                  <FileText size={22} className="text-dim" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-ink text-sm font-medium">
                    {filter === 'All' ? 'No posts yet' : `No ${STATUS_LABELS[filter]?.toLowerCase()} posts`}
                  </p>
                  <p className="text-dim text-xs mt-1">
                    {filter === 'All' ? 'Create your first post to get started' : 'Try a different filter'}
                  </p>
                </div>
                {filter === 'All' && (
                  <button onClick={() => router.push('/create')} className="btn-primary text-xs px-3 py-1.5">
                    Create post
                  </button>
                )}
              </motion.div>
            ) : (
              filtered.map(post => (
                <motion.button
                  key={post.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  role="listitem"
                  onClick={() => setSelectedId(post.id)}
                  aria-pressed={selectedId === post.id}
                  aria-label={`${post.heading || 'Untitled'} — ${STATUS_LABELS[post.status] || post.status}`}
                  className={cn(
                    'w-full text-left px-3 py-3 border-b border-edge hover:bg-elevated transition-colors',
                    selectedId === post.id && 'bg-elevated border-l-2 border-l-accent'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-ink leading-tight">
                      {truncate(post.heading || 'Untitled', 50)}
                    </span>
                    <span className={cn('text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0', STATUS_COLORS[post.status] || '')}>
                      {STATUS_LABELS[post.status] || post.status}
                    </span>
                  </div>
                  <p className="text-xs text-dim truncate">{post.topic}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-dim">{formatDate(post.createdAt)}</p>
                    {post.imagePath && (
                      <div className="w-8 h-5 rounded overflow-hidden bg-elevated">
                        <img src={post.imagePath} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Right — detail */}
        <div role="region" aria-label="Post detail">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <PostDetail
                  post={selected}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onUpdate={updatedPost => setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card h-full flex flex-col items-center justify-center gap-3 p-12"
                role="status"
                aria-label="No post selected"
              >
                <div className="w-14 h-14 rounded-full bg-elevated flex items-center justify-center">
                  <FileText size={26} className="text-dim" aria-hidden="true" />
                </div>
                <p className="text-ink text-sm font-medium">Select a post</p>
                <p className="text-dim text-xs">Click any post on the left to view its details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
