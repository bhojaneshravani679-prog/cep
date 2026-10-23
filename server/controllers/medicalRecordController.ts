import type { Request, Response } from 'express';
import QRCode from 'qrcode';
import { db } from '../config/db.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';

export async function getMedicalRecords(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    let records = await db.medicalRecords.find();

    // Access control policy
    if (req.user.role === 'patient') {
      // Patients can ONLY view their own records
      records = records.filter((r) => r.patientId === req.user!.id);
    } else if (req.user.role === 'doctor') {
      // Doctors can view records where they are the treating doctor, or patient records under their care
      const doc = await db.doctors.findByUserId(req.user.id) || await db.doctors.findOne({ email: req.user.email });
      if (doc) {
        records = records.filter((r) => r.doctorId === doc._id);
      } else {
        records = records.filter((r) => r.doctorName.toLowerCase().includes(req.user!.name.toLowerCase()));
      }
    } else if (req.user.role === 'admin') {
      // Under HIPAA/principle of least privilege:
      // Administrators require defined authorization policy and all clinical record accesses are strictly audit-logged.
      await logAuditEvent({
        actorId: req.user.id,
        actorEmail: req.user.email,
        actorRole: 'admin',
        action: 'ADMIN_CLINICAL_RECORDS_AUDIT_ACCESS',
        resourceType: 'MEDICAL_RECORD',
        details: 'Administrator accessed clinical medical records registry under compliance monitoring policy.',
        req,
      });
    }

    return res.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve medical records.' });
  }
}

export async function getMedicalRecordById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { id } = req.params;
    const record = await db.medicalRecords.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, error: 'Medical record not found.' });
    }

    // Role-based access control
    if (req.user.role === 'patient' && record.patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You are not authorized to view this patient’s medical records.',
      });
    }

    // Generate QR verification data URL for the record
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/medical-records/verify/${record.verificationHash}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 200,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff',
      },
    });

    // Also fetch associated prescription if exists
    let prescription = null;
    if (record.prescriptionId) {
      prescription = await db.prescriptions.findById(record.prescriptionId);
    }

    await logAuditEvent({
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'MEDICAL_RECORD_VIEWED',
      resourceType: 'MEDICAL_RECORD',
      resourceId: record.recordId,
      details: `${req.user.name} (${req.user.role}) viewed medical record ${record.recordId}.`,
      req,
    });

    return res.json({
      success: true,
      record: {
        ...record,
        qrCodeImage: qrDataUrl,
        verificationUrl: verifyUrl,
      },
      prescription,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch medical record.' });
  }
}

export async function createMedicalRecord(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    // Only doctors (and admins if authorized) can create medical records
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only licensed healthcare professionals can create clinical medical records.',
      });
    }

    const {
      patientId,
      appointmentId,
      visitDate,
      diagnosis,
      treatmentNotes,
      vitals,
      medications,
      prescriptionInstructions,
    } = req.body;

    if (!patientId || !diagnosis || !treatmentNotes) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID, diagnosis, and treatment notes are required.',
      });
    }

    const patient = await db.users.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Target patient user could not be found.',
      });
    }

    // Resolve doctor info
    let doctorId = 'doc_01';
    let doctorName = req.user.name;

    const docProfile = await db.doctors.findByUserId(req.user.id) || await db.doctors.findOne({ email: req.user.email });
    if (docProfile) {
      doctorId = docProfile._id;
      doctorName = docProfile.name;
    }

    // Create medical record
    const newRecord = await db.medicalRecords.create({
      patientId: patient._id,
      patientName: patient.name,
      doctorId,
      doctorName,
      appointmentId: appointmentId || '',
      visitDate: visitDate || new Date().toISOString().split('T')[0],
      diagnosis: diagnosis.trim(),
      treatmentNotes: treatmentNotes.trim(),
      vitals: vitals || {},
    });

    // If medications are provided, create linked prescription
    let newPrescription = null;
    if (Array.isArray(medications) && medications.length > 0) {
      newPrescription = await db.prescriptions.create({
        recordId: newRecord._id,
        patientId: patient._id,
        patientName: patient.name,
        doctorId,
        doctorName,
        prescriptionDate: visitDate || new Date().toISOString().split('T')[0],
        medications,
        instructions: prescriptionInstructions || '',
      });

      // Update record with prescriptionId
      newRecord.prescriptionId = newPrescription.prescriptionId;
    }

    // If appointment is attached, mark it completed
    if (appointmentId) {
      await db.appointments.updateById(appointmentId, {
        status: 'Completed',
      });
    }

    await logAuditEvent({
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'MEDICAL_RECORD_CREATED',
      resourceType: 'MEDICAL_RECORD',
      resourceId: newRecord.recordId,
      details: `Created medical record for patient ${patient.name}. Diagnosis: ${diagnosis.slice(0, 50)}...`,
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Medical record and prescription created successfully.',
      record: newRecord,
      prescription: newPrescription,
    });
  } catch (err: any) {
    console.error('Error creating medical record:', err);
    return res.status(500).json({ success: false, error: 'Failed to create medical record.' });
  }
}

// Minimal, safe QR Verification Endpoint
// Requirement: "Do not encode private medical details, passwords, JWTs, or other sensitive information directly in the QR code. Validate access on the backend. Provide a verification page that reveals only the minimum permitted information."
export async function verifyRecordByQR(req: Request, res: Response) {
  try {
    const { hash } = req.params;
    if (!hash) {
      return res.status(400).json({ success: false, error: 'Verification code missing.' });
    }

    const record = await db.medicalRecords.findByHash(hash);
    if (!record) {
      return res.status(404).json({
        success: false,
        valid: false,
        error: 'Record verification failed. The provided QR token is invalid or expired.',
      });
    }

    // Log the verification attempt
    await logAuditEvent({
      actorId: 'public_qr_scanner',
      actorEmail: 'public@qr-verify',
      actorRole: 'system',
      action: 'QR_VERIFICATION_CHECK',
      resourceType: 'MEDICAL_RECORD',
      resourceId: record.recordId,
      details: `QR Code verification performed for record reference ${record.recordId}`,
      req,
    });

    // Reveal only the MINIMUM permitted non-sensitive verification facts
    return res.json({
      success: true,
      valid: true,
      verificationData: {
        recordId: record.recordId,
        visitDate: record.visitDate,
        authorizedDoctor: record.doctorName,
        patientInitials: record.patientName.replace(/(?<=\b\w)\w+/g, '.'), // Minimal redaction (e.g. A. M.)
        issuedBy: 'Secure Healthcare System - Clinical Verification Authority',
        verifiedAt: new Date().toISOString(),
        status: 'Authentic & Verified in System Registry',
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to perform verification check.' });
  }
}
