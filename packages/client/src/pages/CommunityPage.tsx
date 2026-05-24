import { useEffect, useState, useCallback, useOptimistic, startTransition } from 'react'
import { motion } from 'framer-motion'
import { Users, Send, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type {
  CommunityPostDTO,
  ReactionAggregate,
  ReactionEmoji,
  ReactionStateDTO,
} from '@kvitifai/shared'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { api } from '../services/api'
import { ReactionBar } from '../components/community/ReactionBar'
import { CommentsSection } from '../components/community/CommentsSection'

const POLL_INTERVAL_MS = 20_000

function applyReactionLocally(post: CommunityPostDTO, emoji: ReactionEmoji): CommunityPostDTO {
  const previous = post.myReaction
  const nextMy: ReactionEmoji | null = previous === emoji ? null : emoji

  const counts = new Map<ReactionEmoji, number>()
  for (const r of post.reactions) counts.set(r.emoji, r.count)

  if (previous) {
    counts.set(previous, Math.max(0, (counts.get(previous) ?? 1) - 1))
  }
  if (nextMy) {
    counts.set(nextMy, (counts.get(nextMy) ?? 0) + 1)
  }

  const reactions: ReactionAggregate[] = Array.from(counts.entries())
    .filter(([, count]) => count > 0)
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count)

  return { ...post, reactions, myReaction: nextMy }
}

export function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPostDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [sending, setSending] = useState(false)
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({})

  const [optimisticPosts, applyOptimisticReaction] = useOptimistic(
    posts,
    (state, action: { postId: string; emoji: ReactionEmoji }) =>
      state.map((p) => (p.id === action.postId ? applyReactionLocally(p, action.emoji) : p)),
  )

  const fetchPosts = useCallback(async (silent: boolean) => {
    try {
      const { data } = await api.get<CommunityPostDTO[]>('/community')
      setPosts(data)
    } catch {
      /* silent */
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(false)
  }, [fetchPosts])

  useEffect(() => {
    let intervalId: number | undefined
    const start = () => {
      stop()
      intervalId = window.setInterval(() => fetchPosts(true), POLL_INTERVAL_MS)
    }
    const stop = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId)
        intervalId = undefined
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchPosts(true)
        start()
      } else {
        stop()
      }
    }
    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [fetchPosts])

  const handlePost = async () => {
    const content = newPost.trim()
    if (!content) return
    setSending(true)
    try {
      const { data } = await api.post<CommunityPostDTO>('/community', { content })
      setPosts((prev) => (prev.some((p) => p.id === data.id) ? prev : [data, ...prev]))
      setNewPost('')
      toast.success('Опубликовано!')
    } catch {
      toast.error('Не удалось опубликовать')
    } finally {
      setSending(false)
    }
  }

  const handleReact = (postId: string, emoji: ReactionEmoji) => {
    startTransition(async () => {
      applyOptimisticReaction({ postId, emoji })
      try {
        const { data } = await api.post<ReactionStateDTO>(`/community/${postId}/reaction`, { emoji })
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, reactions: data.reactions, myReaction: data.myReaction } : p,
          ),
        )
      } catch {
        toast.error('Ошибка реакции')
      }
    })
  }

  const toggleComments = (postId: string) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  const renderPosts = optimisticPosts

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Users className="text-emerald-500" /> Сообщество
      </h1>

      <Card className="space-y-3">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Поделись своим успехом или поддержи других…"
          rows={3}
          maxLength={1000}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent focus:border-emerald-500 outline-none resize-none"
        />
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">{newPost.length}/1000</span>
          <Button onClick={handlePost} loading={sending} size="sm" disabled={!newPost.trim()}>
            <Send size={16} className="mr-1" /> Опубликовать
          </Button>
        </div>
      </Card>

      {loading && renderPosts.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : renderPosts.length === 0 ? (
        <Card className="text-center py-12">
          <MessageCircle size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500">Стань первым — поделись историей!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {renderPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm font-bold text-white">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{post.authorName}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(post.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">
                  {post.content}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <ReactionBar
                    reactions={post.reactions}
                    myReaction={post.myReaction}
                    onReact={(emoji) => handleReact(post.id, emoji)}
                  />
                  <button
                    type="button"
                    onClick={() => toggleComments(post.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:border-emerald-400/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-500/10 transition-colors"
                  >
                    <MessageCircle size={14} />
                    {openComments[post.id] ? 'Скрыть' : 'Комментарии'} ({post.commentsCount})
                  </button>
                </div>

                {openComments[post.id] && (
                  <CommentsSection
                    postId={post.id}
                    initialCount={post.commentsCount}
                    onCountChange={(n) =>
                      setPosts((prev) =>
                        prev.map((p) => (p.id === post.id ? { ...p, commentsCount: n } : p)),
                      )
                    }
                  />
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
