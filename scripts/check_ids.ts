// backend/scripts/check_ids.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function checkIds() {
  try {
    // Classes (Grade 10 A, Grade 11 B)
    const classes = await prisma.class.findMany({
      where: {
        OR: [
          { grade: { name: 'Grade 10' }, section: { name: 'A' } },
          { grade: { name: 'Grade 11' }, section: { name: 'B' } },
        ],
      },
      select: { id: true, grade: { select: { name: true } }, section: { select: { name: true } } },
    });
    console.log('Classes:', classes);

    // Subject (Mathematics)
    const subject = await prisma.subject.findFirst({
      where: { name: 'Mathematics' },
      select: { id: true, name: true },
    });
    console.log('Subject:', subject);

    // Category (Test 1)
    const category = await prisma.gradeCategory.findFirst({
      where: { name: 'Test 1' },
      select: { id: true, name: true, classId: true, subjectId: true },
    });
    console.log('Category:', category);

    // Academic Year (for 7/11/2025)
    const academicYear = await prisma.academicYear.findFirst({
      where: { startDate: { lte: new Date('2025-07-11') }, endDate: { gte: new Date('2025-07-11') } },
      select: { id: true, name: true },
    });
    console.log('Academic Year:', academicYear);

    // Semester (for 7/11/2025)
    const semester = await prisma.semester.findFirst({
      where: {
        academicYearId: academicYear?.id,
        startDate: { lte: new Date('2025-07-11') },
        endDate: { gte: new Date('2025-07-11') },
      },
      select: { id: true, name: true, academicYearId: true },
    });
    console.log('Semester:', semester);

    // Students
    const students = await prisma.user.findMany({
      where: {
        email: { in: ['Pitermessay2020@gmail.com', 'dibo@gmail.com'] },
        role: 'STUDENT',
      },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    console.log('Students:', students);
  } catch (err) {
    console.error('Error checking IDs:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkIds();