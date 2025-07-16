/*
  Warnings:

  - A unique constraint covering the columns `[studentId,classId,academicYearId,semesterId]` on the table `StudentEnrollment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StudentEnrollment_studentId_classId_academicYearId_semester_key" ON "StudentEnrollment"("studentId", "classId", "academicYearId", "semesterId");
