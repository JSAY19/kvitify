import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getPosts,
  createPost,
  likePost,
  setReaction,
  removeReaction,
  listComments,
  createComment,
  deleteComment,
} from '../controllers/community.js';
import { createPostSchema, reactionSchema, commentSchema } from '../validators/community.js';

export const communityRouter = Router();
communityRouter.use(requireAuth);

communityRouter.get('/', getPosts);
communityRouter.post('/', validate(createPostSchema), createPost);

communityRouter.post('/:id/reaction', validate(reactionSchema), setReaction);
communityRouter.delete('/:id/reaction', removeReaction);
communityRouter.post('/:id/like', likePost);

communityRouter.get('/:id/comments', listComments);
communityRouter.post('/:id/comments', validate(commentSchema), createComment);
communityRouter.delete('/comments/:id', deleteComment);
