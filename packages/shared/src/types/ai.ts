export type AIInteractionType = 'CRAVING_SUPPORT' | 'RECOMMENDATION' | 'MOTIVATION' | 'CHAT';

export interface AIInteractionDTO {
  id: string;
  userMessage: string;
  aiResponse: string;
  type: AIInteractionType;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatInput {
  message: string;
  history?: ChatMessage[];
  conversationId?: string;
}

export interface AIMessageDTO {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AIConversationListItemDTO {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
}

export interface AIConversationDTO {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AIMessageDTO[];
}
