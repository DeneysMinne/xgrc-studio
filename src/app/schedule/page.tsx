'use client'

import { useState, useEffect } from 'react'
import { Post } from '@/types'
import { Calendar, List, Clock, X, Loader2, CalendarX } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek,
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
          <h1 className="text-2xl font-bold text-ink">Schedule</h1>
          <p className="text-dim mt-1">{posts.length} scheduled {posts.length === 1 ? 'post' : 'posts'}</p>
        </div>
        <div className="flex gap-1 p-1 card rounded-lg" role="group" aria-label="View mode">
          <button
            onClick={() => setViewMode('calendar')}
            aria-pressed={viewMode === 'calendar'}
            aria-label="Calendar view"
            className={cn('p-2 rounded-md transition-colors', viewMode === 'calendar' ? 'bg-accent text-white' : 'text-dim hover:text-ink')}
          >
            <Calendar size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            aria-label="List view"
            className={cn('p-2 rounded-md transition-colors', viewMode === 'list' ? 'bg-accent text-white' : 'text-dim hover:text-ink')}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 flex items-center justify-center" aria-busy="true" aria-label="Loading scheduled posts">
          <Loader2 size={24} className="animate-spin text-dim" />
        </div>
      ) : posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-16 text-center flex flex-col items-center gap-4"
          role="status"
        >
          <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center">
            <CalendarX size={28} className="text-dim" aria-hidden="true" />
          </div>
          <div>
            <p className="text-ink font-medium">Nothing scheduled</p>
            <p className="text-dim text-sm mt-1">Create a post and schedule it for a future date.</p>
          </div>
          <a href="/create" className="btn-primary text-sm">Create a post</a>
        </motion.div>
      ) : viewMode === 'calendar' ? (
        <div className="card overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-edge">
            <button
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              aria-label="Previous month"
              className="text-dim hover:text-ink px-2 py-1 rounded transition-colors"
            >
              &#8249;
            </button>
            <span className="text-ink font-semibold" aria-live="polite">{format(currentMonth, 'MMMM yyyy')}</span>
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              aria-label="Next month"
              className="text-dim hover:text-ink px-2 py-1 rounded transition-colors"
            >
              &#8250;
            </button>
          </div>
          <div className="grid grid-cols-7" role="grid" aria-label="Calendar">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} className="text-center text-xs text-dim py-2 border-b border-edge" role="columnheader">{d}</div>
            ))}
            {calendarDays.map(day => {
              const dayPosts = postsOnDay(day)
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
              return (
                <div
                  key={day.toISOString()}
                  role="gridcell"
                  aria-label={format(day, 'MMMM d, yyyy')}
                  className={cn(
                    'min-h-[80px] p-1 border-b border-r border-edge last:border-r-0',
                    !isCurrentMonth && 'opacity-40',
                    isToday(day) && 'bg-accent/10'
                  )}
                >
                  <div className={cn(
                    'text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full',
                    isToday(day) ? 'bg-accent text-white' : 'text-dim'
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayPosts.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPost(p)}
                        className="w-full text-left text-xs bg-accent/20 text-glow rounded px-1 py-0.5 truncate hover:bg-accent/40 transition-colors"
                        aria-label={`${p.heading} at ${p.scheduledAt ? format(new Date(p.scheduledAt), 'HH:mm') : ''}`}
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
        <div className="space-y-2" role="list">
          {posts
            .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
            .map(post => (
              <motion.button
                key={post.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                role="listitem"
                onClick={() => setSelectedPost(post)}
                className="w-full text-left card px-4 py-3 hover:border-accent transition-colors"
                aria-label={`${post.heading || 'Untitled'}, scheduled for ${post.scheduledAt ? formatDate(post.scheduledAt) : 'unknown time'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-ink font-medium text-sm">{post.heading || 'Untitled'}</p>
                    <p className="text-dim text-xs mt-0.5">{post.topic}</p>
                  </div>
                  <div className="flex items-center gap-2 text-dim text-xs">
                    <Clock size={12} aria-hidden="true" />
                    {post.scheduledAt ? formatDate(post.scheduledAt) : '—'}
                  </div>
                </div>
              </motion.button>
            ))}
        </div>
      )}

      {/* Side panel */}
      <AnimatePresence>
        {selectedPost && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setSelectedPost(null)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed right-0 top-0 z-50 bg-surface border-l border-edge w-[400px] h-full overflow-y-auto p-5 space-y-4"
              role="dialog"
              aria-modal="true"
              aria-label="Scheduled post details"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-ink font-semibold">Scheduled Post</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  aria-label="Close panel"
                  className="text-dim hover:text-ink transition-colors p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="bg-white rounded-lg p-4 text-sm">
                <p className="font-bold text-gray-900 mb-2">{selectedPost.heading}</p>
                <p className="text-gray-700 whitespace-pre-wrap text-xs leading-relaxed mb-2">
                  {selectedPost.content.slice(0, 300)}{selectedPost.content.length > 300 ? '...' : ''}
                </p>
                {selectedPost.imagePath && (
                  <img src={selectedPost.imagePath} alt="Post image" className="w-full rounded" />
                )}
              </div>

              <div className="text-xs text-dim space-y-1">
                <p>Scheduled: <span className="text-ink">{selectedPost.scheduledAt ? formatDate(selectedPost.scheduledAt) : '—'}</span></p>
                <p>Publish as: <span className="text-ink">{selectedPost.publishAs}</span></p>
              </div>

              <div>
                <label className="label text-xs" htmlFor="reschedule-date">Reschedule to</label>
                <div className="flex gap-2">
                  <input
                    id="reschedule-date"
                    type="datetime-local"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="field flex-1 text-xs py-1.5"
                  />
                  <button
                    onClick={handleReschedule}
                    disabled={!newDate || rescheduling}
                    className="btn-primary text-xs px-3 py-1.5"
                    aria-label="Save new schedule date"
                  >
                    {rescheduling ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : 'Save'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleCancel(selectedPost.id)}
                className="btn-danger w-full"
                aria-label="Cancel schedule and revert to draft"
              >
                <X size={14} aria-hidden="true" /> Cancel Schedule
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
