import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPERADMIN_EMAIL || 'superadmin@example.com';
  const password = process.env.SUPERADMIN_PW || 'SuperAdmin123!';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Superadmin already exists:', existing.id);
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: {
    email,
    passwordHash: hash,
    firstName: 'Super',
    lastName: 'Admin',
    role: 'SUPERADMIN' as any,
    status: 'ACTIVE'
  }});
  console.log('Created superadmin:', user.id, 'email=', email, 'pw=', password);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
