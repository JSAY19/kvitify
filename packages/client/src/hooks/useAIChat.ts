import { useEffect } from 'react'
import { useChatStore } from '../stores/chatStore'

export function useAIChat(conversationId?: string | null) {
  const messages = useChatStore((s) => s.messages)
  const activeId = useChatStore((s) => s.activeId)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const isLoadingMessages = useChatStore((s) => s.isLoadingMessages)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const stop = useChatStore((s) => s.stop)
  const startNewChat = useChatStore((s) => s.startNewChat)
  const selectConversation = useChatStore((s) => s.selectConversation)

  useEffect(() => {
    if (conversationId && conversationId !== activeId) {
      selectConversation(conversationId)
    } else if (conversationId === null && activeId !== null) {
      startNewChat()
    }
  }, [conversationId, activeId, selectConversation, startNewChat])

  return {
    messages,
    activeId,
    isStreaming,
    isLoadingMessages,
    sendMessage,
    stop,
    clear: startNewChat,
  }
}
