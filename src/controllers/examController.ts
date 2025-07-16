import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const listExams = async (req: Request, res: Response) => {
  try {
    const exams = await prisma.exam.findMany();
    res.json(exams);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

export const createExam = async (req: Request, res: Response) => {
  const { title, subjectId, classId, type, date, duration, maxScore, status, instructions } = req.body;
  if (!title || !subjectId || !classId || !type || !date || !duration || !maxScore || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const exam = await prisma.exam.create({
      data: { title, subjectId, classId, type, date, duration, maxScore, status, instructions },
    });
    res.status(201).json(exam);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create exam' });
  }
};
