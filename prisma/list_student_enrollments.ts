// List all student enrollments for a given class, academic year, and semester
// Run with: npx ts-node prisma/list_student_enrollments.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Set these to match your test case
  const classSection = 'B'; // Section B for Grade 11
  const academicYearName = '2024-2025';
  const semesterName = 'Spring 2025';

  // Find academic year, semester, and class
  const academicYear = await prisma.academicYear.findFirst({ where: { name: academicYearName } });
  if (!academicYear) throw new Error('Academic year not found');
  const semester = await prisma.semester.findFirst({ where: { name: semesterName, academicYearId: academicYear.id } });
  if (!semester) throw new Error('Semester not found');
  const classObj = await prisma.class.findFirst({
    where: {
      academicYearId: academicYear.id,
      section: { name: classSection },
    },
    include: { section: true },
  });
  if (!classObj) throw new Error('Class not found');

  // List enrollments
  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      classId: classObj.id,
      academicYearId: academicYear.id,
      semesterId: semester.id,
    },
    include: { student: true },
  });
  if (enrollments.length === 0) {
    console.log('No student enrollments found for this class/year/semester.');
    return;
  }
  for (const e of enrollments) {
    console.log(`Student: ${e.student.firstName} ${e.student.lastName} <${e.student.email}>`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
