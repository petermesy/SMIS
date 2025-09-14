import { Router } from 'express';
import multer from 'multer';
import { uploadDocument, downloadDocument, listDocuments, deleteDocument } from '../controllers/documentController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

// Configure Multer for file uploads
const upload = multer({
  dest: 'uploads/', // You may want to use a more robust storage config
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// List all documents for the current user
router.get('/', authenticateJWT, (req, res, next) => { void listDocuments(req as any, res, next); });

// Upload a new document
router.post('/upload', authenticateJWT, upload.single('file'), (req, res, next) => { void uploadDocument(req as any, res, next); });

// Download a document by ID
router.get('/:id/download', authenticateJWT, (req, res, next) => { void downloadDocument(req as any, res, next); });

// Delete a document by ID
router.delete('/:id', authenticateJWT, (req, res, next) => { void deleteDocument(req as any, res, next); });

export default router;
