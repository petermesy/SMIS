import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Returns all classes and subjects assigned to the logged-in teacher
export const getTeacherAssignments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user || {};
    const teacherId = user.id;
    const role = (user.role || '').toString().toUpperCase();
    const { academicYearId, semesterId } = req.query;

    // If the requester is ADMIN or SUPERADMIN, allow fetching all assignments (optionally filtered)
    const whereClause: any = {};
    if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
      if (!teacherId) return res.status(401).json({ error: 'Unauthorized' });
      whereClause.teacherId = teacherId;
    }
    if (academicYearId) whereClause.academicYearId = String(academicYearId);
    if (semesterId) whereClause.semesterId = String(semesterId);

    // Find teacherSubject assignments matching the whereClause
    const assignments = await prisma.teacherSubject.findMany({
      where: whereClause,
      include: {
        class: {
          include: {
            grade: true,
            classSection: true, // updated to use classSection
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
        teacher: true,
      },
    });
    res.json(assignments);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch teacher assignments' });
  }
};

// Assign a teacher to a class and subject
export const assignTeacherToClass = async (req: Request, res: Response) => {
  try {
    const { teacherId, classId, subjectId, academicYearId, semesterId } = req.body;
    if (!teacherId || !classId || !subjectId || !academicYearId) {
      return res.status(400).json({ error: 'teacherId, classId, subjectId, and academicYearId are required.' });
    }
    const assignment = await prisma.teacherSubject.create({
      data: {
        teacherId,
        classId,
        subjectId,
        academicYearId,
        semesterId: semesterId || null,
      },
    });
    res.status(201).json({ assignment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign teacher to class.' });
    console.error(err);
  }
};