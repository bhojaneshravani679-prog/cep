import type { Response } from 'express';
import { db, getDbStatus } from '../config/db.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';

export async function getAdminStats(req: AuthenticatedRequest, res: Response) {
  try {
    const users = await db.users.find();
    const doctors = await db.doctors.find();
    const appointments = await db.appointments.find();
    const medicalRecords = await db.medicalRecords.find();
    const prescriptions = await db.prescriptions.find();
    const dbStatus = getDbStatus();

    const patientCount = users.filter((u) => u.role === 'patient').length;
    const doctorCount = doctors.length;
    const pendingAppointments = appointments.filter((a) => a.status === 'Pending').length;
    const confirmedAppointments = appointments.filter((a) => a.status === 'Confirmed').length;
    const completedAppointments = appointments.filter((a) => a.status === 'Completed').length;
    const cancelledAppointments = appointments.filter((a) => a.status === 'Cancelled').length;

    return res.json({
      success: true,
      statistics: {
        totalUsers: users.length,
        patientCount,
        doctorCount,
        totalAppointments: appointments.length,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        medicalRecordsCount: medicalRecords.length,
        prescriptionsCount: prescriptions.length,
      },
      databaseStatus: dbStatus,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to compute admin statistics.' });
  }
}

export async function getAllUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const users = await db.users.find();
    // Sanitize: never return password hashes
    const sanitized = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      accountStatus: u.accountStatus,
      phone: u.phone,
      createdAt: u.createdAt,
    }));

    return res.json({
      success: true,
      count: sanitized.length,
      users: sanitized,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch users list.' });
  }
}

export async function toggleUserStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const user = await db.users.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (user.role === 'admin' && user._id === req.user?.id) {
      return res.status(400).json({
        success: false,
        error: 'Administrators cannot deactivate their own active account.',
      });
    }

    const newStatus = user.accountStatus === 'active' ? 'deactivated' : 'active';
    const updated = await db.users.updateById(id, { accountStatus: newStatus });

    if (req.user) {
      await logAuditEvent({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'USER_STATUS_TOGGLED',
        resourceType: 'USER',
        resourceId: id,
        details: `Account status for ${user.email} changed to ${newStatus}.`,
        req,
      });
    }

    return res.json({
      success: true,
      message: `User status changed to ${newStatus}.`,
      user: {
        id: updated?._id,
        name: updated?.name,
        email: updated?.email,
        role: updated?.role,
        accountStatus: updated?.accountStatus,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to toggle user status.' });
  }
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const { action, resourceType, limit } = req.query;
    const maxEntries = limit ? Number(limit) : 200;

    let logs = await db.auditLogs.find(maxEntries);

    if (action && typeof action === 'string') {
      logs = logs.filter((l) => l.action.toLowerCase().includes(action.toLowerCase()));
    }

    if (resourceType && typeof resourceType === 'string' && resourceType !== 'ALL') {
      logs = logs.filter((l) => l.resourceType === resourceType);
    }

    return res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve audit logs.' });
  }
}
