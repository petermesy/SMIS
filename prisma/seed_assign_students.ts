// This script assigns a student to a class, academic year, and semester for testing the Teacher Dashboard
// Run with: npx ts-node prisma/seed_assign_students.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // === CONFIGURE THESE IDs FOR YOUR TEST CASE ===
  const studentEmail = 'Pitermessay2020@gmail.com'; // Real student email
  const className = 'B'; // Section B for Grade 11
  const academicYearName = '2024-2025'; // Change to your academic year name
  const semesterName = 'Spring 2025'; // Real semester name

  // === FETCH IDs ===
  const student = await prisma.user.findFirst({ where: { email: studentEmail, role: 'STUDENT' } });
  if (!student) throw new Error('Student not found');

  const academicYear = await prisma.academicYear.findFirst({ where: { name: academicYearName } });
  if (!academicYear) throw new Error('Academic year not found');

  const semester = await prisma.semester.findFirst({ where: { name: semesterName, academicYearId: academicYear.id } });
  if (!semester) throw new Error('Semester not found');

  const classObj = await prisma.class.findFirst({
    where: {
      academicYearId: academicYear.id,
      section: { name: className },
    },
    include: { section: true },
  });
  if (!classObj) throw new Error('Class not found');

  // === ASSIGN STUDENT ===
  const enrollment = await prisma.studentEnrollment.upsert({
    where: {
      studentId_classId_academicYearId_semesterId: {
        studentId: student.id,
        classId: classObj.id,
        academicYearId: academicYear.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      studentId: student.id,
      classId: classObj.id,
      academicYearId: academicYear.id,
      semesterId: semester.id,
    },
  });
  console.log('Assigned student', student.email, 'to class', classObj.id, 'for', academicYear.name, semester.name);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
