import { Request, Response, NextFunction } from 'express';
import { computeEnglishAndMathsAveragesForAcademicYear } from '../lib/gradeUtils';
import { prisma } from '../lib/prisma';



export const getRegistrationEligibility = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id;
    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

    // Find the semester where registration is open (the next semester)
    const openSemester = await prisma.semester.findFirst({
      where: { registrationOpen: true },
      orderBy: { startDate: 'desc' },
    });
    if (!openSemester) return res.json({ eligible: false, reason: 'Registration not open' });

    // Find the previous semester (the most recent semester before the open one)
    let previousSemester = await prisma.semester.findFirst({
      where: {
        startDate: { lt: openSemester.startDate },
        academicYearId: openSemester.academicYearId,
      },
      orderBy: { startDate: 'desc' },
    });

    // If not found, look for the last semester of the previous academic year
    if (!previousSemester) {
      // Find previous academic year
      const prevAcademicYear = await prisma.academicYear.findFirst({
        where: { endDate: { lt: openSemester.startDate } },
        orderBy: { endDate: 'desc' },
      });
      if (prevAcademicYear) {
        previousSemester = await prisma.semester.findFirst({
          where: {
            academicYearId: prevAcademicYear.id,
            startDate: { lt: openSemester.startDate },
          },
          orderBy: { startDate: 'desc' },
        });
      }
    }
    if (!previousSemester) return res.json({ eligible: false, reason: 'No previous semester found' });

    // We need to check both semesters for the academic year that contains the previousSemester
    const academicYearToCheckId = previousSemester.academicYearId;
    const averagesResult = await computeEnglishAndMathsAveragesForAcademicYear(studentId, academicYearToCheckId);

    res.json({
      eligible: averagesResult.eligible,
      averages: { English: averagesResult.englishPercent, Maths: averagesResult.mathsPercent },
      previousAcademicYearId: academicYearToCheckId,
      openSemesterId: openSemester.id,
      reason: averagesResult.reason,
    });
  } catch (err) {
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
    const studentId = (req as any).user?.id;
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
      include: { class: { include: { grade: true, classSection: true } } },
    });
    if (!latestEnrollment) {
      return res.status(404).json({ error: 'No current enrollment found for student' });
    }

    let newClassId = latestEnrollment.classId;
    let newAcademicYearId = latestEnrollment.academicYearId;

    // If academic year changes, promote student to next grade/class
    if (nextSemester.academicYearId !== latestEnrollment.academicYearId) {
      // Before promoting across academic years, ensure student meets English & Maths both-semester averages >= 50%
        const eligibility = await computeEnglishAndMathsAveragesForAcademicYear(studentId, latestEnrollment.academicYearId);
        if (!eligibility.eligible) {
          return res.status(403).json({ error: 'Student does not meet promotion requirements', details: { English: eligibility.englishPercent, Maths: eligibility.mathsPercent, reason: eligibility.reason } });
        }
      const currentGradeLevel = latestEnrollment.class.grade.level;
      const nextGrade = await prisma.grade.findFirst({ where: { level: currentGradeLevel + 1 } });
      if (!nextGrade) {
        return res.status(400).json({ error: 'No next grade found for promotion.' });
      }
      // Find class in next grade, same section name, and new academic year
      const nextClass = await prisma.class.findFirst({
        where: {
          gradeId: nextGrade.id,
          academicYearId: nextSemester.academicYearId,
          classSection: { name: latestEnrollment.class.classSection.name },
        },
      });
      if (!nextClass) {
        return res.status(400).json({ error: 'No class found for next grade and section in new academic year.' });
      }
      newClassId = nextClass.id;
      newAcademicYearId = nextClass.academicYearId;
    }

    // 7. Enroll student in next semester (and possibly new class/grade/year)
    const enrollment = await prisma.studentEnrollment.create({
      data: {
        studentId,
        semesterId: nextSemester.id,
        classId: newClassId,
        academicYearId: newAcademicYearId,
      },
    });
    res.status(201).json({ message:'Registered for next semester', enrollment });
  } catch (err) {
    console.error('Error in registerNextSemester:', err);
    next(err);
  }
};

// ...helper moved to src/lib/gradeUtils.ts