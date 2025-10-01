import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';


export const getAnnouncements = async (req: Request, res: Response) => {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(announcements);
};

export const createAnnouncement = async (req: Request, res: Response) => {
  const { title, content, authorId, targetRoles, targetClasses, expiresAt } = req.body;
  if (!title || !content || !authorId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      authorId,
      targetRoles,
      targetClasses,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    },
  });
  res.status(201).json(announcement);
};
