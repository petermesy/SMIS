import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

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
      // If semesterId was provided but academicYearId not, infer academicYearId from semester
      if (!academicYearId && semesterId) {
        try {
          const sem = await prisma.semester.findUnique({ where: { id: semesterId as string } });
          if (sem) academicYearId = sem.academicYearId;
        } catch (e) {
          console.warn('Failed to infer academicYearId from semesterId', semesterId, e);
        }
      }

      // Build teacherAssignment query: include academicYearId only when known
      const teacherWhere: any = { teacherId: user.id, classId };
      if (academicYearId) teacherWhere.academicYearId = academicYearId;
      const teacherAssignment = await prisma.teacherSubject.findFirst({ where: teacherWhere });
      console.debug('getStudentsByClass teacherAssignment check', { teacherWhere, found: !!teacherAssignment });
      if (!teacherAssignment) {
        // Fallback: allow teachers who are assigned to this class in any academic year to view students
        // If no assignment for the requested academic year/classId, try to allow access when the teacher
        // is assigned to the same grade + section in another academic year (class records may be different objects per year)
        const anyAssignment = await prisma.teacherSubject.findFirst({ where: { teacherId: user.id, classId } });
        if (anyAssignment) {
          console.warn('Teacher assignment not found for requested academic year; allowing access because teacher has assignment for this class in another year', { teacherId: user.id, classId, anyAssignmentAcademicYear: anyAssignment.academicYearId });
        } else {
          // Try to match by grade + classSection (handles classId changes across academic years)
          try {
            const cls = await prisma.class.findUnique({ where: { id: classId } });
            if (cls) {
              const gradeSectionAssignment = await prisma.teacherSubject.findFirst({
                where: {
                  teacherId: user.id,
                  class: { gradeId: cls.gradeId, classSectionId: cls.classSectionId },
                },
              });
              if (gradeSectionAssignment) {
                console.warn('Teacher has assignment for same grade+section in another year; allowing access', { teacherId: user.id, classId, matchedClassId: gradeSectionAssignment.classId, matchedAcademicYear: gradeSectionAssignment.academicYearId });
              } else {
                return res.status(403).json({ error: 'You are not assigned to this class for the selected academic year.' });
              }
            } else {
              return res.status(403).json({ error: 'You are not assigned to this class for the selected academic year.' });
            }
          } catch (e) {
            console.error('Error while checking grade+section teacher assignment fallback', e);
            return res.status(403).json({ error: 'You are not assigned to this class for the selected academic year.' });
          }
        }
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
  return s.status !== 'INACTIVE';
      });
    res.json(students);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch students for class' });
  }
};