import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
const prisma = new PrismaClient();

export const addStudentHistory = async (req: Request, res: Response) => {
  const { studentId, event, count } = req.body;
  try {
    const history = await prisma.studentHistory.create({
      data: { studentId, event, count }
    });
    res.status(201).json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add history' });
  }
};

export const getStudentHistory = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  try {
    const history = await prisma.studentHistory.findMany({
      where: { studentId }
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
