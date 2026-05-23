'use client'

import { useState } from 'react'
import { Post } from '@/types'
import { Edit, Trash2, Copy, Send, Loader2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-[#30363d] text-[#8b949e]',
  SCHEDULED: 'bg-blue-500/20 text-blue-400',
  PUBLISHED: 'bg-green-500/20 text-[#3fb950]',
  FAILED: 'bg-red-500/20 text-[#f85149]',
}

interface Props {
  post: Post
  onDelete: (id: string) => Promise<void>
  onDuplicate: (post: Post) => Promise<void>
  onUpdate: (post: Post) => void
}

export default function PostDetail({ post, onDelete, onDuplicate, onUpdate }: Props) {
  const [deleting, setDeleting] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    await onDelete(post.id)
    toast.success('Post deleted')
    setDeleting(false)
    setConfirmDelete(false)
  }

  const handleDuplicate = async () => {
    setDuplicating(true)
    await onDuplicate(post)
    toast.success('Post duplicated')
    setDuplicating(false)
  }

  const handlePublishNow = async () => {
    setPublishing(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, publishAs: post.publishAs }),
      })
      const data = await res.json()
      if (data.success) {
        const updated = await fetch(`/api/posts/${post.id}`).then(r => r.json())
        onUpdate(updated)
        toast.success('Published to LinkedIn')
      } else {
        toast.error(data.error || 'Publish failed')
      }
    } catch (e) { toast.error(String(e)) }
    setPublishing(false)
  }

  const handleCopyText = async () => {
    const text = `${post.heading}\n\n${post.content}\n\n${post.hashtags.join(' ')}`
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#30363d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('text-xs px-2 py-0.5 rounded-full', STATUS_COLORS[post.status] || '')}>
            {post.status}
          </span>
          <span className="text-xs text-[#8b949e]">{formatDate(post.createdAt)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyText}
            className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded"
            title="Copy text"
          >
            <Copy size={15} />
          </button>
          <button
            onClick={handleDuplicate}
            disabled={duplicating}
            className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded disabled:opacity-50"
            title="Duplicate"
          >
            {duplicating ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} />}
          </button>
          <button
            onClick={() => router.push(`/create?edit=${post.id}`)}
            className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded"
            title="Edit"
          >
            <Edit size={15} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={cn('p-1.5 hover:bg-[#21262d] rounded disabled:opacity-50', confirmDelete ? 'text-[#f85149]' : 'text-[#8b949e] hover:text-[#f85149]')}
            title={confirmDelete ? 'Click again to confirm' : 'Delete'}
          >
            {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
          {confirmDelete && (
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-[#8b949e] hover:text-[#e6edf3] px-2">Cancel</button>
          )}
        </div>
      </div>

      {/* LinkedIn-style preview */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="bg-white rounded-lg overflow-hidden mb-4">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#0a1628] flex items-center justify-center text-white text-xs font-bold">XG</div>
              <div>
                <p className="font-semibold text-sm text-gray-900">XGRC Software</p>
                <p className="text-xs text-gray-500">XGRC Software</p>
              </div>
            </div>
            {post.heading && <p className="font-bold text-gray-900 text-sm mb-2">{post.heading}</p>}
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mb-3">{post.content}</p>
            {post.imagePath && (
              <img src={post.imagePath} alt="" className="w-full rounded-md mb-2" />
            )}
            <p className="text-sm text-blue-600">{post.hashtags.join(' ')}</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-xs text-[#8b949e]">
          {post.topic && <p>Topic: <span className="text-[#e6edf3]">{post.topic}</span></p>}
          {post.logoKey && <p>Logo: <span className="text-[#e6edf3]">{post.logoKey} {post.logoVariant && `· ${post.logoVariant}`}</span></p>}
          {post.publishedAt && <p>Published: <span className="text-[#e6edf3]">{formatDate(post.publishedAt)}</span></p>}
          {post.scheduledAt && <p>Scheduled: <span className="text-[#e6edf3]">{formatDate(post.scheduledAt)}</span></p>}
          {post.linkedinPostId && (
            <p>LinkedIn ID: <span className="text-[#e6edf3]">{post.linkedinPostId}</span></p>
          )}
          {post.updatedAt && <p>Updated: <span className="text-[#e6edf3]">{formatDate(post.updatedAt)}</span></p>}
        </div>
      </div>

      {/* Actions */}
      {(post.status === 'DRAFT' || post.status === 'SCHEDULED' || post.status === 'FAILED') && (
        <div className="px-5 py-4 border-t border-[#30363d] flex gap-2">
          <button
            onClick={handlePublishNow}
            disabled={publishing}
            className="flex items-center gap-2 px-4 py-2 bg-[#0066ff] text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Publish Now
          </button>
          <button
            onClick={handleCopyText}
            className="flex items-center gap-2 px-4 py-2 bg-[#21262d] border border-[#30363d] rounded-md text-sm text-[#e6edf3] hover:bg-[#30363d]"
          >
            <Copy size={14} /> Copy + LinkedIn
          </button>
        </div>
      )}
    </div>
  )
}
