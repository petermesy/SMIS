import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';
// Bulk assign students to a class via CSV upload
export const bulkAssignStudentsToClass = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const results: any[] = [];
    const filePath = path.resolve(file.path);
    fs.createReadStream(filePath)
      .pipe(
        csvParser({ mapHeaders: ({ header }) => (header ? header.trim().toLowerCase() : header) })
      )
      .on('data', (data) => {
        // normalize values (trim strings)
        const normalized: any = {};
        for (const k of Object.keys(data)) {
          const v = data[k];
          normalized[k.trim().toLowerCase()] = typeof v === 'string' ? v.trim() : v;
        }
        results.push(normalized);
      })
      .on('end', async () => {
        let assigned = 0;
        const errors: any[] = [];
        let rowIndex = 0;
          // Determine default academicYearId (prefer value sent in form, else current)
          let defaultAcademicYearId = req.body?.defaultAcademicYearId;
          let defaultSemesterId = req.body?.defaultSemesterId;
          let defaultClassId = req.body?.defaultClassId;
          // validate provided defaults
          if (defaultAcademicYearId) {
            const found = await prisma.academicYear.findUnique({ where: { id: defaultAcademicYearId } });
            if (!found) {
              return res.status(400).json({ error: 'Provided defaultAcademicYearId not found' });
            }
          } else {
            const currentAcademicYear = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
            defaultAcademicYearId = currentAcademicYear ? currentAcademicYear.id : (await prisma.academicYear.findFirst())?.id;
            if (!defaultAcademicYearId) {
              return res.status(500).json({ error: 'No academic year configured in the system' });
            }
          }
          if (defaultSemesterId) {
            const foundSem = await prisma.semester.findUnique({ where: { id: defaultSemesterId } });
            if (!foundSem) {
              return res.status(400).json({ error: 'Provided defaultSemesterId not found' });
            }
          }
          if (defaultClassId) {
            const foundClass = await prisma.class.findUnique({ where: { id: defaultClassId } });
            if (!foundClass) {
              return res.status(400).json({ error: 'Provided defaultClassId not found' });
            }
          }
        for (const row of results) {
          rowIndex++;
          // support multiple header name variants
          const email = (row.email || row.e_mail || row['e-mail'] || '').toString().trim();
          let classId = (row.classid || row['class_id'] || row['class id'] || row.class || '').toString().trim();
          if (!classId && defaultClassId) classId = defaultClassId;
          const semesterId = (row.semesterid || row['semester_id'] || row['semester id'] || row.semester || '').toString().trim() || undefined;
          const academicYearId = (row.academicyearid || row['academic_year_id'] || row['academic year id'] || row.academicYear || row.academicyear || '').toString().trim() || defaultAcademicYearId;

          if (!email || !classId) {
            errors.push({ row: rowIndex, email: email || null, error: 'Missing email or classId' });
            continue;
          }

          // Find student by email (case-insensitive)
          const student = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
          if (!student || student.role !== 'STUDENT') {
            errors.push({ row: rowIndex, email, error: 'Student not found or not a student' });
            continue;
          }

          // Validate class exists (be tolerant: trim, remove BOM/quotes, extract UUID substring if present)
          let cleanedClassId = (classId || '').toString().trim();
          // remove BOM and surrounding quotes
          cleanedClassId = cleanedClassId.replace(/\uFEFF/g, '').replace(/^\s*"|"\s*$/g, '').trim();
          // try to extract UUID if the cell contains extra chars
          const uuidMatch = cleanedClassId.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
          if (uuidMatch) cleanedClassId = uuidMatch[0];

          let cls = await prisma.class.findUnique({ where: { id: cleanedClassId } });
          // fallback: try substring match (some exports may have small formatting issues)
          if (!cls) {
            cls = await prisma.class.findFirst({ where: { id: { contains: cleanedClassId } } });
          }
          if (!cls) {
            errors.push({ row: rowIndex, email, classId, attempted: cleanedClassId, error: 'Class ID not found' });
            continue;
          }

          // Check existing enrollment to avoid duplicate errors
          const existing = await prisma.studentEnrollment.findFirst({ where: { studentId: student.id, classId: cls.id, academicYearId: academicYearId || defaultAcademicYearId } });
          if (existing) {
            errors.push({ row: rowIndex, email, classId, error: 'Student already enrolled in this class' });
            continue;
          }

          // Assign to class (create StudentEnrollment)
          try {
            // Use scalar foreign keys for create (not nested connect)
            const createData: any = {
              studentId: student.id,
              classId: cls.id,
              academicYearId: academicYearId || defaultAcademicYearId,
            };
            if (semesterId) createData.semesterId = semesterId;
            else if (defaultSemesterId) createData.semesterId = defaultSemesterId;
            console.log('DEBUG studentEnrollment.create payload:', JSON.stringify(createData));
            await prisma.studentEnrollment.create({ data: createData });
            assigned++;
          } catch (err: any) {
            errors.push({ row: rowIndex, email, classId, error: err?.message || String(err) });
          }
        }
        try {
          fs.unlinkSync(filePath); // Clean up uploaded file
        } catch (e) {
          console.warn('Failed to remove uploaded file', e);
        }
        res.json({ assigned, errors });
      })
      .on('error', (err) => {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {}
        res.status(500).json({ error: err.message });
      });
  } catch (err: any) {
    res.status(500).json({ error: 'Bulk assignment failed', details: err?.message || String(err) });
  }
};
import { parse } from 'csv-parse';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';




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
  let historyCount = 0;
      for (const row of results) {
        try {
          // Required fields: fullName, email
          if (!row.fullName || !row.email) {
            errors.push({ row, error: 'Missing required fields' });
            continue;
          }
          // Split fullName into firstName, lastName, grandFatherName
          const nameParts = row.fullName.trim().split(/\s+/);
          const firstName = nameParts[0] || '';
          const lastName = nameParts[1] || '';
          const grandFatherName = nameParts[2] || '';
          // Check for existing email
          let user = await prisma.user.findUnique({ where: { email: row.email } });
          let role = (row.role || 'STUDENT').toUpperCase();
          if (role !== 'STUDENT' && role !== 'TEACHER') role = 'STUDENT';
          let isNewUser = false;
          if (!user) {
            // Default password: lastName+123 (should be changed by user)
            const passwordHash = await bcrypt.hash((lastName || 'user') + '123', 10);
            user = await prisma.user.create({
              data: {
                email: row.email,
                passwordHash,
                firstName,
                lastName,
                grandFatherName,
                gender: row.gender || null,
                role,
                phone: row.phone || null,
                address: row.address || null,
                school: row.school || null,
                status: 'ACTIVE',
              },
            });
            isNewUser = true;
            successCount++;
          }
          // Always add history after user is ensured to exist
          if (user && row.history && role === 'STUDENT') {
            // Format: "dropped out:1;repeated:2"
            const events = row.history.split(';');
            for (const eventStr of events) {
              const [event, countStr] = eventStr.split(':').map((s: string) => s.trim());
              const count = parseInt(countStr, 10);
              if (event && !isNaN(count)) {
                await prisma.studentHistory.create({
                  data: {
                    studentId: user.id,
                    event,
                    count,
                  },
                });
                historyCount++;
              }
            }
          }
        } catch (e: any) {
          errors.push({ row, error: e.message });
        }
      }
       fs.unlinkSync(filePath);
  res.json({ successCount, historyCount, errorCount: errors.length, errors });
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
        grandFatherName: true,
        school: true,
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
      grandFatherName: true,
      school: true,
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
      grandFatherName: true,
      school: true,
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
        grandFatherName: true,
        school: true,
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
