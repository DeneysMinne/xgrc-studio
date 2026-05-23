'use client'

import { useState, useEffect } from 'react'
import { Post } from '@/types'
import { Calendar, List, Clock, X, Loader2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns'

export default function SchedulePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [rescheduling, setRescheduling] = useState(false)
  const [newDate, setNewDate] = useState('')

  useEffect(() => {
    fetch('/api/posts?status=SCHEDULED&limit=100')
      .then(r => r.json())
      .then(data => { setPosts(data.posts || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleCancel = async (postId: string) => {
    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT', scheduledAt: null }),
      })
      setPosts(prev => prev.filter(p => p.id !== postId))
      setSelectedPost(null)
      toast.success('Post unscheduled')
    } catch { toast.error('Failed to cancel') }
  }

  const handleReschedule = async () => {
    if (!selectedPost || !newDate) return
    setRescheduling(true)
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: newDate }),
      })
      const updated = await res.json()
      setPosts(prev => prev.map(p => p.id === updated.id ? updated : p))
      setSelectedPost(updated)
      setNewDate('')
      toast.success('Rescheduled')
    } catch { toast.error('Reschedule failed') }
    setRescheduling(false)
  }

  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  })

  const postsOnDay = (day: Date) =>
    posts.filter(p => p.scheduledAt && isSameDay(new Date(p.scheduledAt), day))

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">Schedule</h1>
          <p className="text-[#8b949e] mt-1">{posts.length} scheduled posts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={cn('p-2 rounded-md', viewMode === 'calendar' ? 'bg-[#0066ff] text-white' : 'bg-[#1a1a2e] text-[#8b949e] hover:text-[#e6edf3]')}
          >
            <Calendar size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn('p-2 rounded-md', viewMode === 'list' ? 'bg-[#0066ff] text-white' : 'bg-[#1a1a2e] text-[#8b949e] hover:text-[#e6edf3]')}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-[#8b949e]">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg p-12 text-center">
          <Clock size={32} className="mx-auto text-[#30363d] mb-4" />
          <p className="text-[#8b949e]">No scheduled posts. Create a post and schedule it for a future date.</p>
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="bg-[#1a1a2e] border border-[#30363d] rounded-lg overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#30363d]">
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="text-[#8b949e] hover:text-[#e6edf3] px-2">&#8249;</button>
            <span className="text-[#e6edf3] font-semibold">{format(currentMonth, 'MMMM yyyy')}</span>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="text-[#8b949e] hover:text-[#e6edf3] px-2">&#8250;</button>
          </div>
          <div className="grid grid-cols-7">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} className="text-center text-xs text-[#8b949e] py-2 border-b border-[#30363d]">{d}</div>
            ))}
            {calendarDays.map(day => {
              const dayPosts = postsOnDay(day)
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[80px] p-1 border-b border-r border-[#30363d] last:border-r-0',
                    !isCurrentMonth && 'opacity-40',
                    isToday(day) && 'bg-[#0066ff]/10'
                  )}
                >
                  <div className={cn('text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full', isToday(day) ? 'bg-[#0066ff] text-white' : 'text-[#8b949e]')}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayPosts.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPost(p)}
                        className="w-full text-left text-xs bg-[#0066ff]/20 text-[#00d4ff] rounded px-1 py-0.5 truncate hover:bg-[#0066ff]/40 transition-colors"
                      >
                        {p.scheduledAt ? format(new Date(p.scheduledAt), 'HH:mm') : ''} {p.heading}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {posts
            .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
            .map(post => (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="w-full text-left bg-[#1a1a2e] border border-[#30363d] rounded-lg px-4 py-3 hover:border-[#0066ff] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#e6edf3] font-medium text-sm">{post.heading || 'Untitled'}</p>
                    <p className="text-[#8b949e] text-xs mt-0.5">{post.topic}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[#8b949e] text-xs">
                    <Clock size={12} />
                    {post.scheduledAt ? formatDate(post.scheduledAt) : '—'}
                  </div>
                </div>
              </button>
            ))}
        </div>
      )}

      {/* Side panel for selected post */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50" onClick={() => setSelectedPost(null)}>
          <div className="bg-[#1a1a2e] border-l border-[#30363d] w-[400px] h-full overflow-y-auto p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-[#e6edf3] font-semibold">Scheduled Post</h3>
              <button onClick={() => setSelectedPost(null)} className="text-[#8b949e] hover:text-[#e6edf3]"><X size={16} /></button>
            </div>

            <div className="bg-white rounded-lg p-4 text-sm">
              <p className="font-bold text-gray-900 mb-2">{selectedPost.heading}</p>
              <p className="text-gray-800 whitespace-pre-wrap text-xs leading-relaxed mb-2">{selectedPost.content.slice(0, 300)}{selectedPost.content.length > 300 ? '...' : ''}</p>
              {selectedPost.imagePath && <img src={selectedPost.imagePath} alt="" className="w-full rounded" />}
            </div>

            <div className="text-xs text-[#8b949e] space-y-1">
              <p>Scheduled: <span className="text-[#e6edf3]">{selectedPost.scheduledAt ? formatDate(selectedPost.scheduledAt) : '—'}</span></p>
              <p>Publish as: <span className="text-[#e6edf3]">{selectedPost.publishAs}</span></p>
            </div>

            <div>
              <label className="block text-xs text-[#8b949e] mb-1">Reschedule to</label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-[#e6edf3] text-xs focus:outline-none focus:border-[#0066ff]"
                />
                <button
                  onClick={handleReschedule}
                  disabled={!newDate || rescheduling}
                  className="px-3 py-1.5 bg-[#0066ff] text-white rounded text-xs disabled:opacity-50"
                >
                  {rescheduling ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>

            <button
              onClick={() => handleCancel(selectedPost.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/30 rounded-md text-sm hover:bg-[#f85149]/30"
            >
              <X size={14} /> Cancel Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
