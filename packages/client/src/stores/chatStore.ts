import { create } from 'zustand'
import type {
  AIConversationDTO,
  AIConversationListItemDTO,
  AIMessageDTO,
} from '@kvitifai/shared'
import { api, getAccessToken } from '../services/api'

interface ChatState {
  conversations: AIConversationListItemDTO[]
  activeId: string | null
  messages: AIMessageDTO[]
  isLoadingList: boolean
  isLoadingMessages: boolean
  isStreaming: boolean

  loadConversations: () => Promise<void>
  selectConversation: (id: string) => Promise<void>
  startNewChat: () => void
  sendMessage: (text: string) => Promise<void>
  stop: () => void
  renameConversation: (id: string, title: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
}

let streamAbort: AbortController | null = null

function localId() {
  return `local-${Math.random().toString(36).slice(2, 10)}`
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: [],
  activeId: null,
  messages: [],
  isLoadingList: false,
  isLoadingMessages: false,
  isStreaming: false,

  loadConversations: async () => {
    set({ isLoadingList: true })
    try {
      const { data } = await api.get<AIConversationListItemDTO[]>('/ai/conversations')
      set({ conversations: data, isLoadingList: false })
    } catch {
      set({ isLoadingList: false })
    }
  },

  selectConversation: async (id) => {
    if (get().activeId === id && get().messages.length > 0) return
    set({ activeId: id, messages: [], isLoadingMessages: true })
    try {
      const { data } = await api.get<AIConversationDTO>(`/ai/conversations/${id}`)
      set({ messages: data.messages, isLoadingMessages: false })
    } catch {
      set({ isLoadingMessages: false })
    }
  },

  startNewChat: () => {
    set({ activeId: null, messages: [] })
  },

  sendMessage: async (text) => {
    const { activeId, messages } = get()

    const userMsg: AIMessageDTO = {
      id: localId(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    }
    const assistantMsg: AIMessageDTO = {
      id: localId(),
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    }
    set({ messages: [...messages, userMsg, assistantMsg], isStreaming: true })

    streamAbort = new AbortController()
    let conversationId = activeId
    let accumulated = ''
    let title: string | null = null

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'kvitifai',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ message: text, conversationId: activeId ?? undefined }),
        signal: streamAbort.signal,
      })
      if (!res.ok || !res.body) throw new Error('AI request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue
          try {
            const data = JSON.parse(payload) as {
              content?: string
              conversationId?: string
              title?: string
              error?: string
            }
            if (data.conversationId) conversationId = data.conversationId
            if (data.title) title = data.title
            if (data.content) {
              accumulated += data.content
              set((state) => {
                const updated = [...state.messages]
                const last = updated[updated.length - 1]
                if (last?.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, content: accumulated }
                }
                return { messages: updated }
              })
            }
            if (data.error && !accumulated) {
              set((state) => {
                const updated = [...state.messages]
                const last = updated[updated.length - 1]
                if (last?.role === 'assistant') {
                  updated[updated.length - 1] = { ...last, content: data.error! }
                }
                return { messages: updated }
              })
            }
          } catch {
            /* ignore parse */
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        set((state) => {
          const updated = [...state.messages]
          const last = updated[updated.length - 1]
          if (last?.role === 'assistant' && !last.content) {
            updated[updated.length - 1] = {
              ...last,
              content: 'Не удалось получить ответ. Попробуйте позже.',
            }
          }
          return { messages: updated }
        })
      }
    } finally {
      set({ isStreaming: false })
      streamAbort = null
    }

    if (conversationId && conversationId !== activeId) {
      set({ activeId: conversationId })
    }
    if (conversationId) {
      const preview = accumulated.slice(0, 120)
      const isNew = !activeId
      set((state) => {
        const existing = state.conversations.find((c) => c.id === conversationId)
        if (existing) {
          return {
            conversations: state.conversations
              .map((c) =>
                c.id === conversationId
                  ? {
                      ...c,
                      preview: preview || c.preview,
                      title: title ?? c.title,
                      updatedAt: new Date().toISOString(),
                    }
                  : c,
              )
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
          }
        }
        return {
          conversations: [
            {
              id: conversationId!,
              title: title ?? text.slice(0, 40),
              preview,
              updatedAt: new Date().toISOString(),
            },
            ...state.conversations,
          ],
        }
        void isNew
      })
    }
  },

  stop: () => {
    streamAbort?.abort()
    streamAbort = null
    set({ isStreaming: false })
  },

  renameConversation: async (id, title) => {
    set((state) => ({
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, title } : c)),
    }))
    try {
      await api.patch(`/ai/conversations/${id}`, { title })
    } catch {
      /* swallow */
    }
  },

  deleteConversation: async (id) => {
    const wasActive = get().activeId === id
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      ...(wasActive ? { activeId: null, messages: [] } : {}),
    }))
    try {
      await api.delete(`/ai/conversations/${id}`)
    } catch {
      /* swallow */
    }
  },
}))
