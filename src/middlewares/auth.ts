import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: any;
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  console.log('Backend received Authorization header:', authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    // If SUPERADMIN, attach a response finish listener to create an audit log
    if ((decoded as any).role === 'SUPERADMIN' && config.auditEnabled) {
      const user = decoded as any;
      res.on('finish', async () => {
        try {
          // redact sensitive fields from body before logging
          const bodyCopy = { ...req.body } as any;
          if (bodyCopy && typeof bodyCopy === 'object') {
            if ('password' in bodyCopy) bodyCopy.password = '[REDACTED]';
            if ('passwordHash' in bodyCopy) bodyCopy.passwordHash = '[REDACTED]';
            if ('token' in bodyCopy) bodyCopy.token = '[REDACTED]';
          }
          await prisma.auditLog.create({
            data: {
              actorId: user.id,
              actorRole: user.role,
              route: req.originalUrl,
              method: req.method,
              status: res.statusCode,
              params: req.params as any,
              body: bodyCopy,
              ip: req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
              userAgent: req.headers['user-agent'] as string | undefined,
            },
          });
        } catch (err) {
          // don't block request on audit errors
          console.error('Failed to write audit log', err);
        }
      });
    }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    // SUPERADMIN implicitly has all roles: allow through
    if (req.user.role === 'SUPERADMIN') {
      next();
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: insufficient role' });
      return;
    }
    next();
  };
}

// Helper to require at least one role from a set, used in routes for clarity
export function requireAtLeastRole(...roles: string[]) {
  return requireRole(...roles);
}

export function requireSuperAdmin() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (req.user.role !== 'SUPERADMIN') {
      res.status(403).json({ error: 'Forbidden: superadmin only' });
      return;
    }
    next();
  };
}
