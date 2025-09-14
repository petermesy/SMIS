import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRegistrationEligibility = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id;
    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

    // Find the semester where registration is open
    const semester = await prisma.semester.findFirst({
      where: { registrationOpen: true },
      orderBy: { startDate: 'desc' },
    });
    if (!semester) return res.json({ eligible: false, reason: 'Registration not open' });

    // Get all grade entries for this student in this semester for English and Maths
    const grades = await prisma.gradeEntry.findMany({
      where: {
        studentId,
        semesterId: semester.id,
        subject: { name: { in: ['English', 'Maths'] } },
      },
      include: { subject: true },
    });
 // Calculate average for each subject
    const subjectAverages: Record<string, number> = {};
    for (const subjectName of ['English', 'Maths']) {
      const subjectGrades = grades.filter(g => g.subject.name === subjectName);
      if (subjectGrades.length === 0) {
        subjectAverages[subjectName] = 0;
      } else {
        const total = subjectGrades.reduce((sum, g) => sum + (g.pointsEarned || 0), 0);
        const max = subjectGrades.reduce((sum, g) => sum + (g.totalPoints || 0), 0);
        subjectAverages[subjectName] = max > 0 ? (total / max) * 100 : 0;
      }
    }

    const eligible =
      subjectAverages['English'] >= 50 &&
      subjectAverages['Maths'] >= 50;

    res.json({
      eligible,
      averages: subjectAverages,
      semesterId: semester.id,
    });
  }catch (err) {
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
};



// Helper: Calculate average and check for failed subjects
async function getStudentSemesterStats(studentId: string, semesterId: string) {
  const grades = await prisma.gradeEntry.findMany({
    where: { studentId, semesterId },
    select: { pointsEarned: true, totalPoints: true },
  });
  if (grades.length === 0) return { avg: 0, hasFailed: true };
  const totalEarned = grades.reduce((sum, g) => sum + (g.pointsEarned || 0), 0);
  const totalPossible = grades.reduce((sum, g) => sum + (g.totalPoints || 0), 0);
  const avg = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
  const hasFailed = grades.some(g => (g.pointsEarned || 0) < (g.totalPoints || 0) * 0.5);
  return { avg, hasFailed };
}


export const enrollStudentInClass = async (req: Request, res: Response) => {
  try {
    const { studentId, classId, academicYearId, semesterId } = req.body;
    if (!studentId || !classId || !academicYearId) {
      return res.status(400).json({ error: 'studentId, classId, and academicYearId are required.' });
    }
    const enrollment = await prisma.studentEnrollment.create({
      data: {
        studentId,
        classId,
        academicYearId,
        semesterId: semesterId || null,
      },
    });
    res.status(201).json({ enrollment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to enroll student in class.' });
    console.error(err);
  }
};

// POST /students/:id/register-next-semester
export const registerNextSemester = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.params.id;
    const { currentSemesterId } = req.body;
    if (!currentSemesterId) {
      return res.status(400).json({ error: 'Current semester ID required' });
    }

    // 1. Find current and next semester
    const currentSemester = await prisma.semester.findUnique({ where: { id: currentSemesterId } });
    if (!currentSemester) return res.status(404).json({ error: 'Current semester not found' });

    const nextSemester = await prisma.semester.findFirst({
      where: {
        academicYearId: currentSemester.academicYearId,
        startDate: { gt: currentSemester.startDate }
      },
      orderBy: { startDate: 'asc' },
    });
    if (!nextSemester) return res.status(404).json({ error: 'No next semester found' });

    // 2. Check if registration is open
    if (!nextSemester.registrationOpen) {
      return res.status(403).json({ error: 'Registration is not open for the next semester' });
    }

    // 3. Get requirements from next semester
    const { minAverage, noFailedSubjects } = nextSemester;

    // 4. Get student stats for current semester
    const { avg, hasFailed } = await getStudentSemesterStats(studentId, currentSemesterId);

    // 5. Check requirements
    if (typeof minAverage === 'number' && avg < minAverage) {
      return res.status(403).json({ error: `Minimum average required: ${minAverage}` });
    }
    if (noFailedSubjects && hasFailed) {
      return res.status(403).json({ error: 'You have failed subjects and cannot register.' });
    }

    // 6. Get latest enrollment for classId and academicYearId
    const latestEnrollment = await prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        semesterId: currentSemesterId,
      },
      orderBy: { enrollmentDate: 'desc' },
    });
    if (!latestEnrollment) {
      return res.status(404).json({ error: 'No current enrollment found for student' });
    }

    // 7. Enroll student in next semester
    const enrollment = await prisma.studentEnrollment.create({
      data: {
        studentId,
        semesterId: nextSemester.id,
        classId: latestEnrollment.classId,
        academicYearId: latestEnrollment.academicYearId,
      },
    });
    res.status(201).json({ message:'Registered for next semester', enrollment });
  } catch (err) {
    console.error('Error in registerNextSemester:', err);
    next(err);
  }
};