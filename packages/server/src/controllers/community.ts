import type { RequestHandler } from 'express';
import { prisma } from '../config/db.js';
import { REACTION_EMOJIS, type ReactionEmoji } from '../validators/community.js';

interface PostWithRelations {
  id: string;
  content: string;
  createdAt: Date;
  user: { name: string };
  reactions: { emoji: string; userId: string }[];
  _count?: { comments: number };
}

function aggregateReactions(rows: { emoji: string; userId: string }[], myUserId: string) {
  const counts = new Map<string, number>();
  let myReaction: ReactionEmoji | null = null;
  for (const r of rows) {
    counts.set(r.emoji, (counts.get(r.emoji) ?? 0) + 1);
    if (r.userId === myUserId) myReaction = r.emoji as ReactionEmoji;
  }
  const reactions = REACTION_EMOJIS
    .map((emoji) => ({ emoji, count: counts.get(emoji) ?? 0 }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
  return { reactions, myReaction };
}

function shapePost(post: PostWithRelations, myUserId: string) {
  const { reactions, myReaction } = aggregateReactions(post.reactions, myUserId);
  return {
    id: post.id,
    content: post.content,
    authorName: post.user.name,
    createdAt: post.createdAt.toISOString(),
    reactions,
    myReaction,
    commentsCount: post._count?.comments ?? 0,
  };
}

export const getPosts: RequestHandler = async (req, res, next) => {
  try {
    const myUserId = req.userId!;
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { name: true } },
        reactions: { select: { emoji: true, userId: true } },
        _count: { select: { comments: true } },
      },
    });
    res.json(posts.map((p) => shapePost(p, myUserId)));
  } catch (err) {
    next(err);
  }
};

export const createPost: RequestHandler = async (req, res, next) => {
  try {
    const { content } = req.body as { content: string };

    const post = await prisma.communityPost.create({
      data: { userId: req.userId!, content },
      include: {
        user: { select: { name: true } },
        reactions: { select: { emoji: true, userId: true } },
        _count: { select: { comments: true } },
      },
    });

    res.status(201).json(shapePost(post, req.userId!));
  } catch (err) {
    next(err);
  }
};

export const setReaction: RequestHandler = async (req, res, next) => {
  try {
    const postId = String(req.params.id);
    const userId = req.userId!;
    const { emoji } = req.body as { emoji: ReactionEmoji };

    const existing = await prisma.postReaction.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing && existing.emoji === emoji) {
      await prisma.postReaction.delete({ where: { id: existing.id } });
    } else if (existing) {
      await prisma.postReaction.update({
        where: { id: existing.id },
        data: { emoji },
      });
    } else {
      await prisma.postReaction.create({
        data: { postId, userId, emoji },
      });
    }

    const rows = await prisma.postReaction.findMany({
      where: { postId },
      select: { emoji: true, userId: true },
    });

    res.json(aggregateReactions(rows, userId));
  } catch (err) {
    next(err);
  }
};

export const removeReaction: RequestHandler = async (req, res, next) => {
  try {
    const postId = String(req.params.id);
    const userId = req.userId!;
    await prisma.postReaction.deleteMany({ where: { postId, userId } });
    const rows = await prisma.postReaction.findMany({
      where: { postId },
      select: { emoji: true, userId: true },
    });
    res.json(aggregateReactions(rows, userId));
  } catch (err) {
    next(err);
  }
};

export const likePost: RequestHandler = async (req, res, next) => {
  (req as unknown as { body: { emoji: ReactionEmoji } }).body = { emoji: 'like' };
  return setReaction(req, res, next);
};

export const listComments: RequestHandler = async (req, res, next) => {
  try {
    const postId = String(req.params.id);
    const comments = await prisma.postComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { name: true } } },
    });
    res.json(
      comments.map((c) => ({
        id: c.id,
        content: c.content,
        authorName: c.user.name,
        isOwn: c.userId === req.userId,
        createdAt: c.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    next(err);
  }
};

export const createComment: RequestHandler = async (req, res, next) => {
  try {
    const postId = String(req.params.id);
    const { content } = req.body as { content: string };
    const post = await prisma.communityPost.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) {
      res.status(404).json({ error: 'Пост не найден' });
      return;
    }
    const comment = await prisma.postComment.create({
      data: { postId, userId: req.userId!, content },
      include: { user: { select: { name: true } } },
    });
    res.status(201).json({
      id: comment.id,
      content: comment.content,
      authorName: comment.user.name,
      isOwn: true,
      createdAt: comment.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

export const deleteComment: RequestHandler = async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const result = await prisma.postComment.deleteMany({
      where: { id, userId: req.userId! },
    });
    if (result.count === 0) {
      res.status(404).json({ error: 'Комментарий не найден' });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
