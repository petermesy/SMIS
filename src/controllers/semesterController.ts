
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// PATCH /api/semesters/:id/registration
export const updateRegistrationOpen = async (req, res) => {
  const { id } = req.params;
  const { registrationOpen, minAverage, noFailedSubjects } = req.body;
  const semester = await prisma.semester.update({
    where: { id },
    data: {
      registrationOpen,
      minAverage,
      noFailedSubjects,
    },
  });
  res.json(semester);
};

export const listSemesters = async (req, res) => {
  try {
    const semesters = await prisma.semester.findMany();
    res.json(semesters);
  } catch (err) {
    console.error('Failed to load semesters:', err);
    res.status(500).json({ error: 'Failed to load semesters' });
  }
};

export const createSemester = async (req: Request, res: Response) => {
  const { name, academicYearId, startDate, endDate, isCurrent, registrationOpen } = req.body;
  if (!name || !academicYearId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  await prisma.semester.create({
    data: {
      name,
      academicYearId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isCurrent: !!isCurrent,
      registrationOpen: !!registrationOpen,
    },
  });
  return res.status(201).json({ success: true });
  return;
};
