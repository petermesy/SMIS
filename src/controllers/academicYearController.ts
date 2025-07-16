import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List all academic years
export const listAcademicYears = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const years = await prisma.academicYear.findMany({
      orderBy: { startDate: 'desc' },
      include: { semesters: { orderBy: { startDate: 'asc' } } },
    });
    res.json(years);
  } catch (err) {
    next(err);
  }
};

// Create a new academic year
export const createAcademicYear = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, startDate, endDate, isCurrent, createdBy } = req.body;
    if (!name || !startDate || !endDate || !createdBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Validate date order
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ error: 'startDate must be before endDate' });
    }
    // Only one current academic year allowed
    if (isCurrent) {
      await prisma.academicYear.updateMany({ data: { isCurrent: false }, where: { isCurrent: true } });
    }
    const year = await prisma.academicYear.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent: !!isCurrent,
        createdBy,
      },
    });
    res.status(201).json(year);
  } catch (err) {
    next(err);
  }
};

// Get a single academic year by ID
export const getAcademicYear = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const year = await prisma.academicYear.findUnique({ where: { id } });
    if (!year) return res.status(404).json({ error: 'Academic year not found' });
    res.json(year);
  } catch (err) {
    next(err);
  }
};

// Update an academic year
export const updateAcademicYear = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, isCurrent } = req.body;
    const year = await prisma.academicYear.findUnique({ where: { id } });
    if (!year) return res.status(404).json({ error: 'Academic year not found' });
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ error: 'startDate must be before endDate' });
    }
    if (isCurrent) {
      await prisma.academicYear.updateMany({ data: { isCurrent: false }, where: { isCurrent: true } });
    }
    const updated = await prisma.academicYear.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(typeof isCurrent === 'boolean' && { isCurrent }),
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete an academic year
export const deleteAcademicYear = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const year = await prisma.academicYear.findUnique({ where: { id } });
    if (!year) return res.status(404).json({ error: 'Academic year not found' });
    await prisma.academicYear.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
