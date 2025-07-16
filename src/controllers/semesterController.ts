import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const listSemesters = async (req: Request, res: Response) => {
  const semesters = await prisma.semester.findMany({ orderBy: { startDate: 'desc' } });
  res.json(semesters);
};

export const createSemester = async (req: Request, res: Response) => {
  const { name, academicYearId, startDate, endDate, isCurrent } = req.body;
  if (!name || !academicYearId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const semester = await prisma.semester.create({
    data: {
      name,
      academicYearId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isCurrent: !!isCurrent,
    },
  });
  res.status(201).json(semester);
};
