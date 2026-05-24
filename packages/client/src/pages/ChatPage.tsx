import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Trash2, MessageSquare } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import { ChatSidebar } from '../components/chat/ChatSidebar'
import { ChatThread } from '../components/chat/ChatThread'
import { KvitiAvatar } from '../components/chat/KvitiAvatar'

const CRAVING_HELP_MESSAGE = 'Мне сейчас очень хочется курить, помоги пережить тягу прямо сейчас.'

export function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeId)
  const loadConversations = useChatStore((s) => s.loadConversations)
  const startNewChat = useChatStore((s) => s.startNewChat)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const deleteConversation = useChatStore((s) => s.deleteConversation)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const handledCravingRef = useRef(false)

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (handledCravingRef.current) return
    if (searchParams.get('cravingHelp') === '1') {
      handledCravingRef.current = true
      startNewChat()
      sendMessage(CRAVING_HELP_MESSAGE)
      const next = new URLSearchParams(searchParams)
      next.delete('cravingHelp')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams, startNewChat, sendMessage])

  const activeConv = conversations.find((c) => c.id === activeId)

  const handleDeleteActive = () => {
    if (!activeId) return
    if (confirm('Удалить текущий диалог?')) {
      deleteConversation(activeId)
    }
  }

  return (
    <div className="flex h-[calc(100dvh-9rem)] sm:h-[calc(100dvh-10rem)] -mx-4 sm:-mx-6 lg:-mx-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-zinc-950/30 backdrop-blur-xl">
      <aside className="hidden md:block w-72 lg:w-80 shrink-0 border-r border-slate-200 dark:border-white/5">
        <ChatSidebar />
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/50"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 z-50"
            >
              <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900/95 backdrop-blur-xl">
                <p className="font-semibold text-sm">Диалоги</p>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                  aria-label="Закрыть"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="h-[calc(100%-3rem)]">
                <ChatSidebar onClose={() => setDrawerOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-2 px-3 sm:px-6 py-3 border-b border-slate-200 dark:border-white/5 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
              aria-label="Открыть диалоги"
            >
              <Menu size={18} />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 ring-1 ring-white/20">
              <KvitiAvatar size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight">Квити</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {activeConv ? activeConv.title : 'Новый чат'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!activeId && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <MessageSquare size={11} /> новый диалог
              </span>
            )}
            {activeId && (
              <button
                type="button"
                onClick={handleDeleteActive}
                className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                aria-label="Удалить диалог"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 min-h-0">
          <ChatThread />
        </div>
      </div>
    </div>
  )
}
