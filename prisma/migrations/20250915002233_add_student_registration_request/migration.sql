-- CreateTable
CREATE TABLE "StudentRegistrationRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "adminId" TEXT,

    CONSTRAINT "StudentRegistrationRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudentRegistrationRequest" ADD CONSTRAINT "StudentRegistrationRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRegistrationRequest" ADD CONSTRAINT "StudentRegistrationRequest_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
