export const REACTION_EMOJIS = ['like', 'love', 'celebrate', 'strong', 'pray'] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export interface ReactionAggregate {
  emoji: ReactionEmoji;
  count: number;
}

export interface CommunityPostDTO {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  reactions: ReactionAggregate[];
  myReaction: ReactionEmoji | null;
  commentsCount: number;
}

export interface PostCommentDTO {
  id: string;
  content: string;
  authorName: string;
  isOwn: boolean;
  createdAt: string;
}

export interface ReactionStateDTO {
  reactions: ReactionAggregate[];
  myReaction: ReactionEmoji | null;
}
