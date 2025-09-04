import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete all student enrollments first
  const enrollmentsDeleted = await prisma.studentEnrollment.deleteMany({});
  console.log(`Deleted ${enrollmentsDeleted.count} student enrollments.`);

  // Now delete all students
  const studentsDeleted = await prisma.user.deleteMany({ where: { role: 'STUDENT' } });
  console.log(`Deleted ${studentsDeleted.count} students.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
