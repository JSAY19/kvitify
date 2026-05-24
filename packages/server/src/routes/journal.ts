import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getEntries, createEntry, deleteEntry } from '../controllers/journal.js';
import { journalEntrySchema } from '../validators/journal.js';

export const journalRouter = Router();
journalRouter.use(requireAuth);
journalRouter.get('/', getEntries);
journalRouter.post('/', validate(journalEntrySchema), createEntry);
journalRouter.delete('/:id', deleteEntry);
