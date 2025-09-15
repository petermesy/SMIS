import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import academicYearRoutes from './academic-years';
import semesterRoutes from './semesters';
import classRoutes from './classes';
import attendanceRoutes from './attendance';
import gradeRoutes from './grades';
import scheduleRoutes from './schedules';
import notificationRoutes from './notifications';
import documentRoutes from './documents';
import parentRoutes from './parents';
import subjectRoutes from './subjects';
import examRoutes from './exams';
import teacherAssignmentsRoutes from './teacherAssignments';
import studentRoutes from './students';
import classSectionRoutes from './classSections';
import studentRegistrationRequestRoutes from './studentRegistrationRequests';

const router = Router();

// Import and use all route modules here
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/academic-years', academicYearRoutes);
router.use('/semesters', semesterRoutes);
router.use('/classes', classRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/grades', gradeRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/notifications', notificationRoutes);
router.use('/documents', documentRoutes);
router.use('/parents', parentRoutes);
router.use('/subjects', subjectRoutes);
router.use('/exams', examRoutes);
router.use('/teacher-assignments', teacherAssignmentsRoutes);
router.use('/students', studentRoutes);
router.use('/class-sections', classSectionRoutes);
router.use('/student-registration-requests', studentRegistrationRequestRoutes);

// ... add other route modules here

export default router;