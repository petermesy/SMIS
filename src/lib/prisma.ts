import { PrismaClient } from '@prisma/client';

// Export a singleton PrismaClient to avoid multiple instances in dev/hot-reload
const prisma = globalThis.__prisma__ || new PrismaClient();
if (!globalThis.__prisma__) (globalThis as any).__prisma__ = prisma;

export { prisma };
