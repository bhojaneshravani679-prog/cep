import type { Request } from 'express';
import { db } from '../config/db.js';
import type { UserRole } from '../types/index.js';

interface AuditParams {
  actorId: string;
  actorEmail: string;
  actorRole: UserRole | 'system';
  action: string;
  resourceType: 'AUTH' | 'APPOINTMENT' | 'MEDICAL_RECORD' | 'PRESCRIPTION' | 'DOCTOR' | 'USER' | 'SYSTEM';
  resourceId?: string;
  details: string;
  req?: Request;
}

export async function logAuditEvent(params: AuditParams) {
  try {
    const ipAddress =
      params.req?.headers['x-forwarded-for']?.toString().split(',')[0] ||
      params.req?.socket?.remoteAddress ||
      '127.0.0.1';
    const userAgent = params.req?.headers['user-agent'] || 'Unknown Client';

    await db.auditLogs.create({
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId || 'N/A',
      details: params.details,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error('[AUDIT] Failed to record audit log:', err);
  }
}
