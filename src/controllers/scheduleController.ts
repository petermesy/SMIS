import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getClassSchedule = async (req: Request, res: Response) => {
  const { classId } = req.params;
  const schedules = await prisma.classSchedule.findMany({
    where: { classId },
    include: { subject: true, teacher: true },
  });
  res.json(schedules);
};

export const createSchedule = async (req: Request, res: Response) => {
  // Only allow admins to create schedules
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Only admins can create schedules.' });
  }
  const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime } = req.body;
  if (!classId || !subjectId || !teacherId || dayOfWeek === undefined || !startTime || !endTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // Check for duplicate schedule for the same class, day, and startTime
    const existing = await prisma.classSchedule.findFirst({
      where: {
        classId,
        dayOfWeek,
        startTime,
      },
    });
    if (existing) {
      return res.status(400).json({ error: 'A schedule already exists for this class at the same day and time.' });
    }
    const schedule = await prisma.classSchedule.create({
      data: { classId, subjectId, teacherId, dayOfWeek, startTime, endTime },
    });
    res.status(201).json(schedule);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    const errorStack = e instanceof Error && e.stack ? e.stack : null;
    res.status(500).json({ error: 'Internal server error', details: errorMessage, stack: errorStack });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { subjectId, teacherId, dayOfWeek, startTime, endTime } = req.body;
  try {
    const schedule = await prisma.classSchedule.update({
      where: { id },
      data: { subjectId, teacherId, dayOfWeek, startTime, endTime },
    });
    res.json(schedule);
  } catch (e) {
    res.status(404).json({ error: 'Schedule not found' });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.classSchedule.delete({ where: { id } });
    res.json({ message: 'Schedule deleted' });
  } catch (e) {
    res.status(404).json({ error: 'Schedule not found' });
  }
};
