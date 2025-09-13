/*
  Warnings:

  - You are about to drop the column `sectionId` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the `Section` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `classSectionId` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_gradeId_fkey";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "sectionId",
ADD COLUMN     "classSectionId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Section";

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_classSectionId_fkey" FOREIGN KEY ("classSectionId") REFERENCES "ClassSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
