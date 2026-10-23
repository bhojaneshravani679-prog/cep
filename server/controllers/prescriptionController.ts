import type { Response } from 'express';
import { db } from '../config/db.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';

export async function getPrescriptions(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    let prescriptions = await db.prescriptions.find();

    if (req.user.role === 'patient') {
      prescriptions = prescriptions.filter((p) => p.patientId === req.user!.id);
    } else if (req.user.role === 'doctor') {
      const doc = await db.doctors.findByUserId(req.user.id) || await db.doctors.findOne({ email: req.user.email });
      if (doc) {
        prescriptions = prescriptions.filter((p) => p.doctorId === doc._id);
      } else {
        prescriptions = prescriptions.filter((p) => p.doctorName.toLowerCase().includes(req.user!.name.toLowerCase()));
      }
    }

    return res.json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve prescriptions.' });
  }
}

export async function getPrescriptionById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { id } = req.params;
    const rx = await db.prescriptions.findById(id);

    if (!rx) {
      return res.status(404).json({ success: false, error: 'Prescription not found.' });
    }

    if (req.user.role === 'patient' && rx.patientId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized access to prescription.' });
    }

    return res.json({
      success: true,
      prescription: rx,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch prescription.' });
  }
}

export async function createPrescription(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only authorized medical doctors can issue prescriptions.',
      });
    }

    const { patientId, medications, instructions, recordId } = req.body;

    if (!patientId || !medications || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID and at least one medication item are required.',
      });
    }

    const patient = await db.users.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found.' });
    }

    let doctorId = 'doc_01';
    let doctorName = req.user.name;

    const docProfile = await db.doctors.findByUserId(req.user.id) || await db.doctors.findOne({ email: req.user.email });
    if (docProfile) {
      doctorId = docProfile._id;
      doctorName = docProfile.name;
    }

    const newRx = await db.prescriptions.create({
      recordId: recordId || '',
      patientId: patient._id,
      patientName: patient.name,
      doctorId,
      doctorName,
      prescriptionDate: new Date().toISOString().split('T')[0],
      medications,
      instructions: instructions || '',
    });

    await logAuditEvent({
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'PRESCRIPTION_ISSUED',
      resourceType: 'PRESCRIPTION',
      resourceId: newRx.prescriptionId,
      details: `Issued prescription ${newRx.prescriptionId} for patient ${patient.name}.`,
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Prescription generated successfully.',
      prescription: newRx,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to generate prescription.' });
  }
}
