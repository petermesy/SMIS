import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAttendanceForClassDate = async (req: Request, res: Response) => {
  const { classId, date } = req.params;
  const records = await prisma.attendanceRecord.findMany({
    where: { classId, date: new Date(date) },
  });
  res.json(records);
};

export const markAttendance = async (req: Request, res: Response) => {
  const { studentId, classId, subjectId, date, period, status, markedBy, remarks } = req.body;
  if (!studentId || !classId || !subjectId || !date || !status || !markedBy) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const record = await prisma.attendanceRecord.create({
    data: {
      studentId,
      classId,
      subjectId,
      date: new Date(date),
      period,
      status,
      markedById: markedBy,
      remarks,
    },
  });
  res.status(201).json(record);
};

export const updateAttendance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  try {
    const record = await prisma.attendanceRecord.update({
      where: { id },
      data: { status, remarks },
    });
    res.json(record);
  } catch (e) {
    res.status(404).json({ error: 'Attendance record not found' });
  }
};

export const getAttendanceStats = async (req: Request, res: Response) => {
  // Placeholder: implement stats logic
  res.json({ message: 'Attendance stats endpoint' });
};

export const getAttendanceReports = async (req: Request, res: Response) => {
  // Placeholder: implement report logic
  res.json({ message: 'Attendance reports endpoint' });
};
