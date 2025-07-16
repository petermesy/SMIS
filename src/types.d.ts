import { User } from '@prisma/client';
import { Request } from 'express';

// Extend Express Request to include user property
export interface AuthenticatedRequest extends Request {
  user?: Pick<User, 'id' | 'role' | 'email'>;
}

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id' | 'role' | 'email'>;
    }
  }
}
