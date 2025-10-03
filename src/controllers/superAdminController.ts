import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const listAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list admins' });
  }
};

export const setUserStatus = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { status } = req.body; // 'ACTIVE' | 'INACTIVE'
  if (!userId || !status) return res.status(400).json({ error: 'Missing params' });
  if (!['ACTIVE', 'INACTIVE'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    const user = await prisma.user.update({ where: { id: userId }, data: { status } });
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user status', details: err.message });
    return;
  }
};

export const changeUserRole = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body; // 'ADMIN'|'TEACHER'|'STUDENT'|'PARENT'|'SUPERADMIN'
  if (!userId || !role) { res.status(400).json({ error: 'Missing params' }); return; }
  const allowed = ['SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT'];
  if (!allowed.includes(role)) { res.status(400).json({ error: 'Invalid role' }); return; }
  try {
    const user = await prisma.user.update({ where: { id: userId }, data: { role } });
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to change user role', details: err.message });
    return;
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const pageSize = Math.min(parseInt((req.query.pageSize as string) || '50'), 200);
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (req.query.actorId) where.actorId = req.query.actorId as string;
    if (req.query.route) where.route = { contains: req.query.route as string };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({ items, total, page, pageSize });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
  }
};

export default { listAllAdmins, setUserStatus, changeUserRole, getAuditLogs };
