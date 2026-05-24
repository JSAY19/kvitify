import type { RequestHandler } from 'express';
import { prisma } from '../config/db.js';

export const getEntries: RequestHandler = async (req, res, next) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(entries.map((e) => ({
      id: e.id,
      title: e.title,
      content: e.content,
      mood: e.mood,
      createdAt: e.createdAt.toISOString(),
    })));
  } catch (err) {
    next(err);
  }
};

export const createEntry: RequestHandler = async (req, res, next) => {
  try {
    const { title, content, mood } = req.body as { title: string; content: string; mood?: number };

    const entry = await prisma.journalEntry.create({
      data: { userId: req.userId!, title, content, mood },
    });

    res.status(201).json({
      id: entry.id,
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      createdAt: entry.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

export const deleteEntry: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id as string;
    await prisma.journalEntry.deleteMany({
      where: { id, userId: req.userId! },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
