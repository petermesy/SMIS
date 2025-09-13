import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List all classes with grade, classSection, and academicYear
export const listClasses = async (req: Request, res: Response) => {
  const classes = await prisma.class.findMany({
    include: {
      grade: true,
      classSection: true, // <-- updated to use classSection
      academicYear: true,
    },
    orderBy: { id: 'asc' },
  });
  res.json(classes);
};

// Get a single class with grade, classSection, and academicYear
export const getClass = async (req: Request, res: Response) => {
  const classItem = await prisma.class.findUnique({
    where: { id: req.params.id },
    include: {
      grade: true,
      classSection: true, // <-- updated to use classSection
      academicYear: true,
    },
  });
  if (!classItem) return res.status(404).json({ error: 'Class not found' });
  res.json(classItem);
};

// Assign a teacher to a class
export const assignTeacherToClass = async (req: Request, res: Response) => {
  const { teacherId, subjectId, academicYearId } = req.body;
  const { classId } = req.params;
  if (!teacherId || !subjectId || !academicYearId) {
    return res.status(400).json({ error: 'teacherId, subjectId, and academicYearId are required' });
  }
  try {
    const teacherSubject = await prisma.teacherSubject.create({
      data: {
        teacherId,
        subjectId,
        classId,
        academicYearId,
      },
    });
    res.status(201).json(teacherSubject);
  } catch (e) {
    res.status(500).json({ error: 'Failed to assign teacher to class' });
  }
};

// Assign a student to a class
export const assignStudentToClass = async (req: Request, res: Response) => {
  const { studentId, academicYearId, semesterId } = req.body;
  const { classId } = req.params;
  if (!studentId || !academicYearId || !semesterId) {
    return res.status(400).json({ error: 'studentId, academicYearId, and semesterId are required' });
  }
  try {
    const enrollment = await prisma.studentEnrollment.create({
      data: {
        studentId,
        classId,
        academicYearId,
        semesterId,
      },
    });
    res.status(201).json(enrollment);
  } catch (e) {
    res.status(500).json({ error: 'Failed to assign student to class' });
  }
};

// Get all students in a class (optionally filter by academic year and semester)
export const getStudentsByClass = async (req: Request, res: Response) => {
  const { classId } = req.params;
  let { academicYearId, semesterId } = req.query;
  const user = (req as any).user;
  try {
    academicYearId = typeof academicYearId === 'string' && academicYearId.trim() ? academicYearId : undefined;
    semesterId = typeof semesterId === 'string' && semesterId.trim() ? semesterId : undefined;

    if (user?.role === 'TEACHER') {
      const teacherAssignment = await prisma.teacherSubject.findFirst({
        where: {
          teacherId: user.id,
          classId: classId,
          academicYearId: academicYearId,
        },
      });
      if (!teacherAssignment) {
        return res.status(403).json({ error: 'You are not assigned to this class for the selected academic year.' });
      }
    }

    const where: any = { classId };
    if (academicYearId) where.academicYearId = academicYearId;
    if (semesterId) where.semesterId = semesterId;
    const enrollments = await prisma.studentEnrollment.findMany({
      where,
      include: {
        student: true,
      },
    });
    const seen = new Set();
    const students = enrollments
      .map(e => e.student)
      .filter(s => {
        if (!s || seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
    res.json(students);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch students for class' });
  }
};