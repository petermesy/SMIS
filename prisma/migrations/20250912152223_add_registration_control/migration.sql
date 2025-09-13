-- AlterTable
ALTER TABLE "Semester" ADD COLUMN     "minAverage" DOUBLE PRECISION,
ADD COLUMN     "noFailedSubjects" BOOLEAN,
ADD COLUMN     "registrationOpen" BOOLEAN NOT NULL DEFAULT false;
