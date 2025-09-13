import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createClassSection = async (req: Request, res: Response) => {
  try {
    const { name, gradeId, academicYearId } = req.body;
    if (!name || !gradeId || !academicYearId) {
      return res.status(400).json({ error: 'Name, gradeId, and academicYearId are required.' });
    }
    // 1. Create the section
const section = await prisma.classSection.create({
  data: { name, gradeId: String(gradeId) },
});

const newClass = await prisma.class.create({
  data: {
    gradeId: String(gradeId),
    classSectionId: section.id, // <-- use classSectionId
    academicYearId: academicYearId,
  },
});

    res.status(201).json({ section, newClass });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create class section and class.' });
    console.error(err);
  }
};