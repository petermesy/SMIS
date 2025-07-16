import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Returns all classes and subjects assigned to the logged-in teacher
export const getTeacherAssignments = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user?.id;
    if (!teacherId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Find all teacherSubject assignments for this teacher
    const assignments = await prisma.teacherSubject.findMany({
      where: { teacherId },
      include: {
        class: {
          include: {
            grade: true,
            section: true,
            academicYear: {
              include: {
                semesters: true
              }
            }
          }
        },
        subject: true,
        academicYear: {
          include: {
            semesters: true
          }
        },
      },
    });
    res.json(assignments);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch teacher assignments' });
  }
};
