import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageSquare, Pencil, Trash2, Check, X } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'

interface ChatSidebarProps {
  onClose?: () => void
}

function relativeTime(iso: string) {
  const d = new Date(iso).getTime()
  const diff = Date.now() - d
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} мин`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days} дн`
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeId)
  const startNewChat = useChatStore((s) => s.startNewChat)
  const selectConversation = useChatStore((s) => s.selectConversation)
  const renameConversation = useChatStore((s) => s.renameConversation)
  const deleteConversation = useChatStore((s) => s.deleteConversation)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')

  const handleSelect = (id: string) => {
    selectConversation(id)
    onClose?.()
  }

  const handleNew = () => {
    startNewChat()
    onClose?.()
  }

  const startEdit = (id: string, title: string) => {
    setEditingId(id)
    setDraftTitle(title)
  }

  const commitEdit = (id: string) => {
    const next = draftTitle.trim()
    if (next) renameConversation(id, next)
    setEditingId(null)
  }

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-900/70 backdrop-blur-xl border-r border-slate-200 dark:border-white/5">
      <div className="p-3 border-b border-slate-200 dark:border-white/5">
        <button
          type="button"
          onClick={handleNew}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-medium text-sm shadow shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-transform"
        >
          <Plus size={16} /> Новый чат
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-soft p-2 space-y-1">
        {conversations.length === 0 && (
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 px-3 py-6">
            Пока нет диалогов. Начни первый чат!
          </p>
        )}
        <AnimatePresence initial={false}>
          {conversations.map((c) => {
            const isActive = c.id === activeId
            const isEditing = editingId === c.id
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`group relative rounded-xl border transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-400/30'
                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-1 p-2">
                    <input
                      autoFocus
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit(c.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="flex-1 bg-white dark:bg-zinc-900 rounded-md px-2 py-1 text-sm border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => commitEdit(c.id)}
                      className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600"
                      aria-label="Сохранить"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"
                      aria-label="Отмена"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelect(c.id)}
                    className="w-full text-left p-2.5 pr-16"
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium truncate ${isActive ? 'text-emerald-700 dark:text-emerald-200' : ''}`}>
                          {c.title}
                        </p>
                        {c.preview && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {c.preview}
                          </p>
                        )}
                        <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 mt-1">
                          {relativeTime(c.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {!isEditing && (
                  <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); startEdit(c.id, c.title) }}
                      className="p-1.5 rounded-md hover:bg-white dark:hover:bg-white/10 text-slate-500 hover:text-emerald-600"
                      aria-label="Переименовать"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Удалить этот диалог?')) deleteConversation(c.id)
                      }}
                      className="p-1.5 rounded-md hover:bg-white dark:hover:bg-white/10 text-slate-500 hover:text-rose-500"
                      aria-label="Удалить"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
