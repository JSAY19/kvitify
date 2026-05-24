import { useEffect, useRef, useState, useOptimistic, startTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2 } from 'lucide-react'
import type { PostCommentDTO } from '@kvitifai/shared'
import { api } from '../../services/api'
import toast from 'react-hot-toast'

interface CommentsSectionProps {
  postId: string
  initialCount: number
  onCountChange?: (n: number) => void
}

type OptimisticAction =
  | { type: 'add'; comment: PostCommentDTO }
  | { type: 'remove'; id: string }

const POLL_INTERVAL_MS = 20_000

function reduce(state: PostCommentDTO[], action: OptimisticAction): PostCommentDTO[] {
  if (action.type === 'add') return [...state, action.comment]
  return state.filter((c) => c.id !== action.id)
}

export function CommentsSection({ postId, initialCount, onCountChange }: CommentsSectionProps) {
  const [comments, setComments] = useState<PostCommentDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const [optimisticComments, dispatchOptimistic] = useOptimistic(comments, reduce)

  const onCountChangeRef = useRef(onCountChange)
  useEffect(() => {
    onCountChangeRef.current = onCountChange
  }, [onCountChange])

  const fetchComments = (silent: boolean) => {
    let cancelled = false
    api
      .get<PostCommentDTO[]>(`/community/${postId}/comments`)
      .then((r) => {
        if (cancelled) return
        setComments(r.data)
        onCountChangeRef.current?.(r.data.length)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled && !silent) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }

  useEffect(() => {
    const cancel = fetchComments(false)
    return cancel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  useEffect(() => {
    let intervalId: number | undefined
    const start = () => {
      stop()
      intervalId = window.setInterval(() => fetchComments(true), POLL_INTERVAL_MS)
    }
    const stop = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId)
        intervalId = undefined
      }
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') start()
      else stop()
    }
    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  const handleSend = () => {
    const text = draft.trim()
    if (!text || sending) return
    setDraft('')
    setSending(true)
    startTransition(async () => {
      const tempId = `tmp-${Date.now()}`
      const optimisticComment: PostCommentDTO = {
        id: tempId,
        content: text,
        authorName: 'Вы',
        isOwn: true,
        createdAt: new Date().toISOString(),
      }
      dispatchOptimistic({ type: 'add', comment: optimisticComment })
      try {
        const { data } = await api.post<PostCommentDTO>(`/community/${postId}/comments`, {
          content: text,
        })
        setComments((prev) => {
          if (prev.some((c) => c.id === data.id)) return prev
          const next = [...prev, data]
          onCountChangeRef.current?.(next.length)
          return next
        })
      } catch {
        toast.error('Не удалось отправить комментарий')
        setDraft(text)
      } finally {
        setSending(false)
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Удалить комментарий?')) return
    startTransition(async () => {
      dispatchOptimistic({ type: 'remove', id })
      try {
        await api.delete(`/community/comments/${id}`)
        setComments((prev) => {
          const next = prev.filter((c) => c.id !== id)
          onCountChangeRef.current?.(next.length)
          return next
        })
      } catch {
        toast.error('Не удалось удалить')
      }
    })
  }

  const showInitialLoader = loading && optimisticComments.length === 0
  const hasComments = optimisticComments.length > 0

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 space-y-3">
      {showInitialLoader ? (
        <p className="text-xs text-slate-400">Загружаем комментарии…</p>
      ) : !hasComments ? (
        <p className="text-xs text-slate-400 italic">
          {initialCount === 0 ? 'Пока нет комментариев — будь первым!' : 'Комментариев пока нет.'}
        </p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {optimisticComments.map((c) => {
              const isPending = c.id.startsWith('tmp-')
              return (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: isPending ? 0.65 : 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group flex items-start gap-2 rounded-xl bg-slate-50 dark:bg-white/5 px-3 py-2"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {c.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold truncate">{c.authorName}</p>
                      <p className="text-[10px] text-slate-400 shrink-0">
                        {isPending
                          ? 'отправляем…'
                          : new Date(c.createdAt).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                      </p>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5 whitespace-pre-wrap break-words">
                      {c.content}
                    </p>
                  </div>
                  {c.isOwn && !isPending && (
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                      aria-label="Удалить"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Добавь комментарий…"
          rows={1}
          maxLength={500}
          className="flex-1 resize-none rounded-xl bg-white dark:bg-zinc-900/70 px-3 py-2 text-sm border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          disabled={sending}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white disabled:opacity-40 hover:scale-105 active:scale-95 transition-transform"
          aria-label="Отправить"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
