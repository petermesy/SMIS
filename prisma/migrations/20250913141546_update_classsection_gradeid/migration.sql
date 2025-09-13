/*
  Warnings:

  - Added the required column `gradeId` to the `ClassSection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClassSection" ADD COLUMN "gradeId" TEXT; -- nullable at first

-- Set a valid gradeId for all existing rows (replace YOUR_GRADE_ID with a real id from the Grade table)
UPDATE "ClassSection" SET "gradeId" = 'YOUR_GRADE_ID' WHERE "gradeId" IS NULL;

ALTER TABLE "ClassSection" ALTER COLUMN "gradeId" SET NOT NULL;

ALTER TABLE "ClassSection" ADD CONSTRAINT "ClassSection_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;