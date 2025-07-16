// backend/scripts/compare_frontend_backend_ids.ts
// This script compares frontend filter params (hardcoded or from a JSON file) with grade records in the DB.
// Usage: npx ts-node scripts/compare_frontend_backend_ids.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Example: Replace these with the actual params printed from your frontend console
const frontendParams = {
  classId: '5b8ccade-cec2-466f-8b43-7947a0049ef1',
  subjectId: '8ca307b0-0d24-4e7e-ad06-bf6ec2a9da03',
  categoryId: '632092a6-384c-46f1-b52c-d331a049b72b',
  academicYearId: 'bd30a5c7-6678-4775-a84b-2c4eb1be2374',
  semesterId: 'cf2b40e1-d6e8-4720-9f9b-2dbdb36daacf',
};

async function main() {
  try {
    console.log('Frontend params:', frontendParams);

    // Find all grade entry records
    const gradeEntries = await prisma.gradeEntry.findMany({
      select: {
        id: true,
        studentId: true,
        classId: true,
        subjectId: true,
        categoryId: true,
        academicYearId: true,
        semesterId: true,
        pointsEarned: true,
        totalPoints: true,
      },
    });
    console.log(`Found ${gradeEntries.length} grade entry records.`);

    // Print all grade entry record IDs
    gradeEntries.forEach((g, i) => {
      console.log(`GradeEntry[${i}]:`, {
        classId: g.classId,
        subjectId: g.subjectId,
        categoryId: g.categoryId,
        academicYearId: g.academicYearId,
        semesterId: g.semesterId,
        pointsEarned: g.pointsEarned,
        totalPoints: g.totalPoints,
      });
    });

    // Check for a match
    const match = gradeEntries.find(g =>
      g.classId === frontendParams.classId &&
      g.subjectId === frontendParams.subjectId &&
      g.categoryId === frontendParams.categoryId &&
      g.academicYearId === frontendParams.academicYearId &&
      g.semesterId === frontendParams.semesterId
    );
    if (match) {
      console.log('\n✅ Found a grade entry record matching all frontend params:', match);
    } else {
      console.log('\n❌ No grade entry record matches all frontend params.');
    }
  } catch (err) {
    console.error('Error comparing IDs:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
