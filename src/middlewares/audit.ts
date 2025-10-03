import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export type AuthRequest = Request & { user?: any };

// Audit middleware: record requests made by SUPERADMIN users
export function auditMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // Only run for authenticated users who are SUPERADMIN
  const user = req.user;
  if (!user || user.role !== 'SUPERADMIN') {
    return next();
  }

  // Capture request data
  const record = {
    actorId: user.id,
    actorRole: user.role,
    route: req.originalUrl,
    method: req.method,
    params: req.params || {},
    body: req.body || {},
    ip: req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'] || null,
  } as any;

  // Create log after response finishes so we can include status
  res.on('finish', async () => {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: record.actorId,
          actorRole: record.actorRole,
          route: record.route,
          method: record.method,
          status: res.statusCode,
          params: record.params,
          body: record.body,
          ip: record.ip,
          userAgent: record.userAgent,
        },
      });
    } catch (err) {
      console.error('Failed to write audit log', err);
    }
  });

  next();
}

export default auditMiddleware;
