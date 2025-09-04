import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const grades = Array.from({ length: 8 }, (_, i) => ({
    name: `Grade ${i + 1}`,
    level: i + 1,
  }));
  const result = await prisma.grade.createMany({
    data: grades,
    skipDuplicates: true,
  });
  console.log(`Seeded ${result.count} grades (skipped duplicates).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
