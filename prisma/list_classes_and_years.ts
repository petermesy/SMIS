// List all classes, sections, and academic years in the database
// Run with: npx ts-node prisma/list_classes_and_years.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const years = await prisma.academicYear.findMany({
    include: { semesters: true, classes: { include: { section: true, grade: true } } },
    orderBy: { startDate: 'desc' },
  });
  for (const year of years) {
    console.log(`Academic Year: ${year.name}`);
    for (const sem of year.semesters) {
      console.log(`  Semester: ${sem.name}`);
    }
    for (const cls of year.classes) {
      console.log(`  Class: ${cls.id} | Grade: ${cls.grade?.name} | Section: ${cls.section?.name}`);
    }
    console.log('---');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
