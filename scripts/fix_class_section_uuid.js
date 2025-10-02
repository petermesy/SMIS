const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { randomUUID } = require('crypto');

async function main() {
  // generate a UUID and create/find a fallback Grade and ClassSection with that id
  const id = randomUUID();
  console.log('Using fallback ClassSection id =', id);

  // ensure there's at least one Grade to attach the ClassSection to
  let grade = await prisma.grade.findFirst();
  if (!grade) {
    grade = await prisma.grade.create({ data: { name: 'Grade 1', level: 1 } });
    console.log('Created fallback Grade id=', grade.id);
  } else {
    console.log('Using existing Grade id=', grade.id);
  }

  // create the class section explicitly with id and connect to the grade
  const section = await prisma.classSection.create({
    data: {
      id,
      name: 'A',
      grade: { connect: { id: grade.id } },
    },
  });

  console.log('Created ClassSection:', section.id);

  // Update Class rows with null classSectionId to point to the fallback section
  // Use raw SQL because Prisma type definitions mark classSectionId as required
  // (the DB currently has nulls which caused the migration failure).
  const result = await prisma.$executeRaw`
    UPDATE "Class"
    SET "classSectionId" = ${section.id}
    WHERE "classSectionId" IS NULL;
  `;

  console.log('Classes updated (rows affected):', result);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
