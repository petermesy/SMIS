import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: any;
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  // Accept token from several common sources to be tolerant of client variations:
  // - Authorization: Bearer <token>
  // - Authorization: <token> (raw token)
  // - x-access-token header
  // - query param ?token= or ?access_token=
  // - cookie `token` (if cookie-parser is used)
  const rawAuth = (req.headers.authorization || '') as string;
  const xAccess = (req.headers['x-access-token'] || req.headers['x_access_token'] || req.headers['x-access_token']) as string | undefined;
  const qToken = (req.query && (req.query.token || req.query.access_token)) as string | undefined;
  const cookieToken = (req as any).cookies?.token as string | undefined;

  let token: string | undefined;
  if (rawAuth && rawAuth.toString().trim()) {
    // support 'Bearer <token>' and raw token values
    const v = rawAuth.toString().trim();
    if (/^Bearer\s+/i.test(v)) token = v.replace(/^Bearer\s+/i, '').trim();
    else token = v;
  }
  if (!token && xAccess) token = xAccess;
  if (!token && qToken) token = qToken;
  if (!token && cookieToken) token = cookieToken;

  // Debug: show we received something (never print full token)
  try {
    if (token) console.log('Backend received auth token (truncated):', token.substring(0, 12) + '...');
    else console.log('Backend did not receive an auth token');
  } catch (e) {}

  if (!token) {
    res.status(401).json({ error: 'Missing authentication token' });
    return;
  }

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
  } catch (err: any) {
    // Provide more specific reason when available but avoid leaking token details
    if (err && err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    console.error('JWT verification failed:', err && err.message ? err.message : err);
    res.status(401).json({ error: 'Invalid authentication token' });
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
