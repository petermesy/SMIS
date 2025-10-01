import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getMessages = async (req: Request, res: Response) => {
  // For simplicity, return all messages for the current user
  const userId = req.user?.id;
  const messages = await prisma.message.findMany({
    where: { recipientId: userId },
    orderBy: { sentAt: 'desc' },
  });
  res.json(messages);
};

export const sendMessage = async (req: Request, res: Response) => {
  const { senderId, recipientId, subject, content, parentMessageId } = req.body;
  if (!senderId || !recipientId || !subject || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const message = await prisma.message.create({
    data: { senderId, recipientId, subject, content, parentMessageId },
  });
  res.status(201).json(message);
};

export const markMessageRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const message = await prisma.message.update({
      where: { id },
      data: { isRead: true },
    });
    res.json(message);
  } catch (e) {
    res.status(404).json({ error: 'Message not found' });
  }
};
