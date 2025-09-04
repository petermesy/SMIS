import fs from 'fs';
import { parse } from 'csv-parse';
// Bulk import students from CSV
export const importStudents = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const results: any[] = [];
  const errors: any[] = [];
  const filePath = req.file.path;
  fs.createReadStream(filePath)
    .pipe(parse({ columns: true, trim: true }))
    .on('data', (row) => {
      results.push(row);
    })
    .on('end', async () => {
      let successCount = 0;
      for (const row of results) {
        try {
          // Required fields: firstName, lastName, email
          if (!row.firstName || !row.lastName || !row.email) {
            errors.push({ row, error: 'Missing required fields' });
            continue;
          }
          // Check for existing email
          const existing = await prisma.user.findUnique({ where: { email: row.email } });
          if (existing) {
            errors.push({ row, error: 'Email already exists' });
            continue;
          }
          // Default password: lastName+123 (should be changed by user)
          const passwordHash = await bcrypt.hash((row.lastName || 'student') + '123', 10);
          await prisma.user.create({
            data: {
              email: row.email,
              passwordHash,
              firstName: row.firstName,
              lastName: row.lastName,
              gender: row.gender || null,
              role: 'STUDENT',
              phone: row.phone || null,
              address: row.address || null,
              status: 'ACTIVE',
            },
          });
          successCount++;
        } catch (e) {
          errors.push({ row, error: e.message });
        }
      }
      fs.unlinkSync(filePath);
      res.json({ successCount, errorCount: errors.length, errors });
    })
    .on('error', (err) => {
      fs.unlinkSync(filePath);
      res.status(500).json({ error: err.message });
    });
};
// Change password for logged-in user
export const changePassword = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id; // user from JWT middleware
  const { oldPassword, newPassword } = req.body;
  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const valid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Old password is incorrect' });
  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
  res.json({ message: 'Password changed successfully' });
};
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const listUsers = async (req: Request, res: Response) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  const where: any = {};
  if (role) where.role = String(role).toUpperCase();
  if (status) where.status = String(status).toUpperCase();
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        status: true,
        gender: true,
        createdAt: true,
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);
  res.json({ users, total, page: Number(page), limit: Number(limit) });
};

export const createUser = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role, phone, address, status, gender } = req.body;
  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Email already exists' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, role, phone, address, status: status || 'ACTIVE', gender },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
      address: true,
      status: true,
      gender: true,
      createdAt: true,
    },
  });
  res.status(201).json(user);
};

export const getUser = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
      address: true,
      status: true,
      gender: true,
      createdAt: true,
    },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

export const updateUser = async (req: Request, res: Response) => {
  const allowedFields = ['firstName', 'lastName', 'role', 'phone', 'address', 'status', 'gender'];
  const updateData: any = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        address: true,
        status: true,
        gender: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
  }
};
