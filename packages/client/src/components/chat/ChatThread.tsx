import { useEffect, useRef, useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Square, Sparkles, Heart, Zap, Wind } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { useChatStore } from '../../stores/chatStore'
import { KvitiAvatar } from './KvitiAvatar'

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className']],
  },
}

const SUGGESTIONS = [
  { label: 'Сильно тянет', icon: Zap, msg: 'Я сейчас очень хочу закурить. Что мне сделать прямо сейчас?' },
  { label: 'Мотивация', icon: Sparkles, msg: 'Подбодри меня и напомни, зачем я бросаю курить.' },
  { label: 'Совет', icon: Heart, msg: 'Дай мне развёрнутый совет на сегодня — что поможет не сорваться.' },
  { label: 'Дыхание', icon: Wind, msg: 'Расскажи про технику дыхания 4-7-8: как делать и почему это помогает.' },
]

export function ChatThread() {
  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const isLoadingMessages = useChatStore((s) => s.isLoadingMessages)
  const activeId = useChatStore((s) => s.activeId)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const stop = useChatStore((s) => s.stop)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [activeId])

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    sendMessage(text)
  }

  const handleQuick = (msg: string) => {
    if (isStreaming) return
    sendMessage(msg)
  }

  const isEmpty = messages.length === 0 && !isLoadingMessages

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-soft px-3 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {isLoadingMessages && (
            <div className="text-center text-sm text-slate-400 py-12">Загружаем диалог…</div>
          )}

          {isEmpty && (
            <div className="flex flex-col items-center justify-center text-center py-16 space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/40 logo-glow">
                <KvitiAvatar size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Я Квити — твой проводник без сигарет</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
                  Спроси меня о тяге, мотивации, дыхании, абстиненции или просто поделись, как прошёл день.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => handleQuick(s.msg)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900/60 hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 transition-colors text-sm text-left"
                  >
                    <s.icon size={16} className="text-emerald-500 shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-white/20">
                    <KvitiAvatar size={18} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-br-md shadow shadow-emerald-500/30'
                      : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-900 dark:text-slate-100 rounded-bl-md border border-slate-200 dark:border-white/5'
                  }`}
                >
                  {m.role === 'assistant' ? (
                    m.content ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0 prose-headings:my-2 prose-strong:text-emerald-600 dark:prose-strong:text-emerald-300">
                        <ReactMarkdown rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex gap-1 items-center py-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-200 dark:border-white/5 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl px-3 sm:px-6 py-3"
      >
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="Напиши Квити сообщение…"
            rows={1}
            className="flex-1 resize-none max-h-40 bg-slate-100 dark:bg-zinc-900/70 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border border-transparent dark:border-white/5"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={stop}
              className="p-3 rounded-2xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Остановить"
            >
              <Square size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow shadow-emerald-500/30 disabled:opacity-40 disabled:shadow-none hover:scale-105 active:scale-95 transition-transform"
              aria-label="Отправить"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
