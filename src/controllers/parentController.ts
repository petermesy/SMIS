import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

import { prisma } from '../lib/prisma';

// List children for a parent
export const listChildren = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    // Only allow parents
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'PARENT') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const children = await prisma.user.findMany({ where: { parentId: userId } });
    res.json(children);
  } catch (err) {
    next(err);
  }
};

// Link a child to a parent
export const linkChild = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { childId } = req.body;
    // Only allow parents
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'PARENT') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    // Check child exists and is a student
    const child = await prisma.user.findUnique({ where: { id: childId } });
    if (!child || child.role !== 'STUDENT') {
      res.status(404).json({ error: 'Child not found' });
      return;
    }
    await prisma.user.update({ where: { id: childId }, data: { parentId: userId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// Unlink a child from a parent
export const unlinkChild = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { childId } = req.body;
    // Only allow parents
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'PARENT') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    // Check child exists and is linked to this parent
    const child = await prisma.user.findUnique({ where: { id: childId } });
    if (!child || child.parentId !== userId) {
      res.status(404).json({ error: 'Child not found or not linked to you' });
      return;
    }
    await prisma.user.update({ where: { id: childId }, data: { parentId: null } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
