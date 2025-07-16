// List all teacher assignments for all classes, subjects, and academic years
// Run with: npx ts-node prisma/list_teacher_assignments.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const assignments = await prisma.teacherSubject.findMany({
    include: {
      teacher: true,
      subject: true,
      class: { include: { grade: true, section: true, academicYear: true } },
      academicYear: true,
    },
    orderBy: { academicYearId: 'desc' },
  });
  for (const a of assignments) {
    console.log(`Teacher: ${a.teacher.firstName} ${a.teacher.lastName} <${a.teacher.email}>`);
    console.log(`  Academic Year: ${a.academicYear.name}`);
    console.log(`  Class: ${a.class.grade.name} ${a.class.section.name}`);
    console.log(`  Subject: ${a.subject.name}`);
    console.log('---');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
