import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createClassSection = async (req: Request, res: Response) => {
  try {
    const { name, grade } = req.body;
    if (!name || !grade) {
      return res.status(400).json({ error: 'Name and grade are required.' });
    }
    const section = await prisma.classSection.create({
      data: { name, grade: Number(grade) },
    });
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create class section.' });
  }
};