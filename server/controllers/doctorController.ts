import type { Request, Response } from 'express';
import { db } from '../config/db.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';

export async function getAllDoctors(req: Request, res: Response) {
  try {
    const { search, specialization, verifiedOnly } = req.query;
    let doctors = await db.doctors.find();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.qualifications.toLowerCase().includes(q)
      );
    }

    if (specialization && typeof specialization === 'string' && specialization !== 'All') {
      doctors = doctors.filter(
        (d) => d.specialization.toLowerCase() === specialization.toLowerCase()
      );
    }

    if (verifiedOnly === 'true') {
      doctors = doctors.filter((d) => d.verificationStatus === 'verified');
    }

    return res.json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch doctors list.' });
  }
}

export async function getDoctorById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const doctor = await db.doctors.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found.' });
    }

    // Generate standard time slots based on doctor's working hours
    const slots = [
      '09:00 AM',
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
      '04:30 PM',
    ];

    return res.json({
      success: true,
      doctor,
      availableSlots: slots,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve doctor details.' });
  }
}

export async function createDoctor(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      name,
      email,
      specialization,
      qualifications,
      experienceYears,
      consultationFee,
      availableDays,
      workingHours,
      slotDurationMinutes,
      hospitalAffiliation,
      bio,
      verificationStatus,
    } = req.body;

    if (!name || !specialization || !qualifications) {
      return res.status(400).json({
        success: false,
        error: 'Name, specialization, and qualifications are required.',
      });
    }

    const newDoctor = await db.doctors.create({
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      specialization: specialization.trim(),
      qualifications: qualifications.trim(),
      experienceYears: Number(experienceYears) || 1,
      consultationFee: Number(consultationFee) || 50,
      availableDays: Array.isArray(availableDays) && availableDays.length > 0
        ? availableDays
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: workingHours || { start: '09:00', end: '17:00' },
      slotDurationMinutes: Number(slotDurationMinutes) || 30,
      verificationStatus: verificationStatus || 'verified',
      isSample: false,
      hospitalAffiliation: hospitalAffiliation || 'Secure Healthcare Center',
      bio: bio || '',
    });

    if (req.user) {
      await logAuditEvent({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'DOCTOR_CREATED',
        resourceType: 'DOCTOR',
        resourceId: newDoctor._id,
        details: `Administrator created doctor profile for ${newDoctor.name} (${newDoctor.specialization})`,
        req,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully.',
      doctor: newDoctor,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to create doctor profile.' });
  }
}

export async function updateDoctor(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const existing = await db.doctors.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Doctor not found.' });
    }

    const updated = await db.doctors.updateById(id, req.body);

    if (req.user) {
      await logAuditEvent({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'DOCTOR_UPDATED',
        resourceType: 'DOCTOR',
        resourceId: id,
        details: `Doctor profile for ${existing.name} was updated by admin.`,
        req,
      });
    }

    return res.json({
      success: true,
      message: 'Doctor updated successfully.',
      doctor: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update doctor.' });
  }
}

export async function updateDoctorVerification(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;

    if (!['sample', 'verified', 'pending', 'unverified'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification status.',
      });
    }

    const updated = await db.doctors.updateById(id, {
      verificationStatus,
      isSample: verificationStatus === 'sample',
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Doctor not found.' });
    }

    if (req.user) {
      await logAuditEvent({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        action: 'DOCTOR_VERIFICATION_STATUS_CHANGED',
        resourceType: 'DOCTOR',
        resourceId: id,
        details: `Doctor verification status changed to "${verificationStatus}" by admin.`,
        req,
      });
    }

    return res.json({
      success: true,
      message: `Doctor verification updated to ${verificationStatus}.`,
      doctor: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update verification status.' });
  }
}
