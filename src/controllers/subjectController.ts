import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const listSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany();
    res.json(subjects);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, code, description, gradeId } = req.body;
    if (!name || !code || !gradeId) {
      return res.status(400).json({ error: 'name, code, and gradeId are required' });
    }
    const subject = await prisma.subject.create({
      data: { name, code, description, gradeId }
    });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
};
