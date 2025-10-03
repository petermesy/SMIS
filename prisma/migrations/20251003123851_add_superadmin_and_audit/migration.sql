-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPERADMIN';

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" "Role",
    "route" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" INTEGER,
    "params" JSONB,
    "body" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
