import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// List all documents for the current user
export const listDocuments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const documents = await prisma.document.findMany({ where: { uploadedById: userId } });
    res.json(documents);
  } catch (err) {
    next(err);
  }
};

// Upload a new document
export const uploadDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    const { originalname, filename, mimetype, size } = req.file;
    const category = req.body.category || 'General';
    const document = await prisma.document.create({
      data: {
        uploadedById: userId,
        fileName: filename,
        title: originalname,
        mimeType: mimetype,
        fileSize: size,
        filePath: req.file.path,
        category,
      },
    });
    res.status(201).json(document);
  } catch (err) {
    next(err);
  }
};

// Download a document by ID
export const downloadDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document || document.uploadedById !== userId) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    res.download(path.resolve(document.filePath), document.title);
  } catch (err) {
    next(err);
  }
};

// Delete a document by ID
export const deleteDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document || document.uploadedById !== userId) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    // Delete file from disk (async, non-blocking)
    fs.unlink(path.resolve(document.filePath), async (err) => {
      if (err) {
        // Log error but continue to delete DB record
        console.error('File deletion error:', err);
      }
      await prisma.document.delete({ where: { id } });
      res.status(204).send();
    });
  } catch (err) {
    next(err);
  }
};
