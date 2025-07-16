// Script to fetch and print all submitted grades for a class, subject, academic year, and semester
// Usage: npx ts-node scripts/list_submitted_grades.ts <classId> <subjectId> <academicYearId> <semesterId> [categoryId]

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Fetch all submitted grades (no filters)
  const grades = await prisma.gradeEntry.findMany({
    include: {
      student: true,
      category: true,
      subject: true,
      class: {
        include: {
          grade: true,
          section: true,
        },
      },
    },
    orderBy: [
      { student: { lastName: 'asc' } },
      { student: { firstName: 'asc' } }
    ],
  });

  if (grades.length === 0) {
    console.log('No grades found for the given filters.');
    return;
  }

  // Print column headers
  console.log([
    'Student Email',
    'Student Name',
    'Class',
    'Subject',
    'Category',
    'Points Earned',
    'Total Points',
    'Date',
  ].join('\t'));

  for (const g of grades) {
    console.log([
      g.student.email,
      `${g.student.firstName} ${g.student.lastName}`,
      `${g.class.grade.name} ${g.class.section.name}`,
      g.subject.name,
      g.category?.name || '',
      g.pointsEarned,
      g.totalPoints,
      g.date ? new Date(g.date).toLocaleDateString() : '',
    ].join('\t'));
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
