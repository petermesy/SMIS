import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { computeEnglishAndMathsAveragesForAcademicYear } from '../lib/gradeUtils';

// Student submits registration request
export const submitRegistrationRequest = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user?.id;
    const { semesterId } = req.body;
    if (!semesterId) return res.status(400).json({ error: 'semesterId required' });

    // Check for existing pending/approved request
    const existing = await prisma.studentRegistrationRequest.findFirst({
      where: { studentId, semesterId, status: { in: ['PENDING', 'APPROVED'] } }
    });
    if (existing) return res.status(400).json({ error: 'Already requested or approved' });

    const request = await prisma.studentRegistrationRequest.create({
      data: { studentId, semesterId }
    });

    // TODO: Notify admin (e.g., create a Notification record)
    res.status(201).json({ message: 'Registration request submitted', request });
  } catch (err) {
    console.error('Error in submitRegistrationRequest:', err);
    res.status(500).json({ error: 'Internal server error', details: err instanceof Error ? err.message : err });
  }
};

// Admin lists all pending requests
export const listRegistrationRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.studentRegistrationRequest.findMany({
      where: { status: 'PENDING' },
      include: { student: true, semester: true }
    });
    res.json(requests);
  } catch (err) {
    console.error('Error in listRegistrationRequests:', err);
    res.status(500).json({ error: 'Internal server error', details: err instanceof Error ? err.message : err });
  }
};

// Admin approves a request
export const approveRegistrationRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const adminId = (req as any).user?.id;

    const request = await prisma.studentRegistrationRequest.findUnique({ where: { id: requestId } });
    if (!request || request.status !== 'PENDING') {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    const targetSemester = await prisma.semester.findUnique({ where: { id: request.semesterId } });
    if (!targetSemester) {
      return res.status(404).json({ error: 'Semester not found' });
    }

    // Find the student's latest enrollment by semester startDate
    const latestEnrollment = await prisma.studentEnrollment.findFirst({
      where: { studentId: request.studentId },
      orderBy: {
        semester: {
          startDate: 'desc'
        }
      },
      include: {
        class: { include: { grade: true, classSection: true } },
        semester: true
      },
    });
    if (!latestEnrollment) {
      console.error('No current enrollment found for student', request.studentId);
      return res.status(404).json({ error: 'No current enrollment found for student' });
    }

    let newClassId = latestEnrollment.classId;
    let newAcademicYearId = latestEnrollment.academicYearId;

    // If academic year changes, promote student to next grade/class
    if (targetSemester.academicYearId !== latestEnrollment.academicYearId) {
      // Ensure student meets promotion requirements (English & Maths averages >= 50% across the academic year)
      const eligibility = await computeEnglishAndMathsAveragesForAcademicYear(request.studentId, latestEnrollment.academicYearId);
      if (!eligibility.eligible) {
        console.warn('Student does not meet promotion requirements', request.studentId, eligibility);
        return res.status(403).json({ error: 'Student does not meet promotion requirements', details: { English: eligibility.englishPercent, Maths: eligibility.mathsPercent, reason: eligibility.reason } });
      }
      const currentGradeLevel = latestEnrollment.class.grade.level;
      const nextGrade = await prisma.grade.findFirst({ where: { level: currentGradeLevel + 1 } });
      if (nextGrade) {
        const nextClass = await prisma.class.findFirst({
          where: {
            gradeId: nextGrade.id,
            academicYearId: targetSemester.academicYearId,
            classSection: { name: latestEnrollment.class.classSection.name },
          },
        });
        if (nextClass) {
          newClassId = nextClass.id;
          newAcademicYearId = nextClass.academicYearId;
        } else {
          console.warn('No class found for next grade and section in new academic year for student', request.studentId, '- enrolling in same class/section for new academic year.');
          // Fallback: enroll in same class/section for new academic year
          const sameClass = await prisma.class.findFirst({
            where: {
              gradeId: latestEnrollment.class.grade.id,
              academicYearId: targetSemester.academicYearId,
              classSection: { name: latestEnrollment.class.classSection.name },
            },
          });
          if (sameClass) {
            newClassId = sameClass.id;
            newAcademicYearId = sameClass.academicYearId;
          } else {
            console.error('No class found for same grade and section in new academic year for student', request.studentId);
            return res.status(400).json({ error: 'No class found for same grade and section in new academic year.' });
          }
        }
      } else {
        console.warn('No next grade found for promotion for student', request.studentId, '- enrolling in same class/section for new academic year.');
        // Fallback: enroll in same class/section for new academic year
        const sameClass = await prisma.class.findFirst({
          where: {
            gradeId: latestEnrollment.class.grade.id,
            academicYearId: targetSemester.academicYearId,
            classSection: { name: latestEnrollment.class.classSection.name },
          },
        });
        if (sameClass) {
          newClassId = sameClass.id;
          newAcademicYearId = sameClass.academicYearId;
        } else {
          console.error('No class found for same grade and section in new academic year for student', request.studentId);
          return res.status(400).json({ error: 'No class found for same grade and section in new academic year.' });
        }
      }
    }

    // Check for existing enrollment in the target semester/class/year
    const existing = await prisma.studentEnrollment.findFirst({
      where: {
        studentId: request.studentId,
        classId: newClassId,
        academicYearId: newAcademicYearId,
        semesterId: targetSemester.id,
      },
    });

    if (!existing) {
      console.log('Creating new StudentEnrollment for student', request.studentId, 'semester', targetSemester.id, 'class', newClassId);
      await prisma.studentEnrollment.create({
        data: {
          studentId: request.studentId,
          semesterId: targetSemester.id,
          classId: newClassId,
          academicYearId: newAcademicYearId,
        }
      });
    } else {
      console.log('StudentEnrollment already exists for student', request.studentId, 'semester', targetSemester.id, 'class', newClassId);
    }

    await prisma.studentRegistrationRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED', approvedAt: new Date(), adminId }
    });

    res.json({ message: 'Student registered and approved' });
  } catch (err) {
    console.error('Error in approveRegistrationRequest:', err);
    res.status(500).json({ error: 'Internal server error', details: err instanceof Error ? err.message : err });
  }
};

// Admin rejects a request
export const rejectRegistrationRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    await prisma.studentRegistrationRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    });
    res.json({ message: 'Request rejected' });
  } catch (err) {
    console.error('Error in rejectRegistrationRequest:', err);
    res.status(500).json({ error: 'Internal server error', details: err instanceof Error ? err.message : err });
  }
};

// ...helper moved to src/lib/gradeUtils.ts