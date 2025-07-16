
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Check for existing grade entries
  const gradeEntries = await prisma.gradeEntry.findMany({
    where: {
      classId: '665ee3d6-12e5-43c6-ad89-6b34341e1b35',
      subjectId: '0bf0ddf8-100b-493f-b6d1-00afa72de08a',
      categoryId: 'a4625aeb-3ee5-4e38-a8b4-ce02dc9494e4',
      academicYearId: '6cfe3243-6d65-46e1-8a8d-64fc65494a83',
      semesterId: 'c7489083-8fdf-4371-bb68-54ed1ef3f81f',
    }
  });
  console.log('Existing grade entries:', gradeEntries);

  if (gradeEntries.length === 0) {
    // You need to provide a valid studentId and createdById for your system
    const studentId = 'REPLACE_WITH_STUDENT_ID';
    const createdById = 'REPLACE_WITH_TEACHER_ID';
    const newEntry = await prisma.gradeEntry.create({
      data: {
        studentId,
        classId: '665ee3d6-12e5-43c6-ad89-6b34341e1b35',
        subjectId: '0bf0ddf8-100b-493f-b6d1-00afa72de08a',
        categoryId: 'a4625aeb-3ee5-4e38-a8b4-ce02dc9494e4',
        academicYearId: '6cfe3243-6d65-46e1-8a8d-64fc65494a83',
        semesterId: 'c7489083-8fdf-4371-bb68-54ed1ef3f81f',
        pointsEarned: 10,
        totalPoints: 100,
        date: new Date(),
        createdById,
      }
    });
    console.log('Created new grade entry:', newEntry);
  } else {
    console.log('Grade entry already exists for these params.');
  }

  await prisma.$disconnect();
}

main();