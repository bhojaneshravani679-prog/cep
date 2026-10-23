import type { Response } from 'express';
import { db } from '../config/db.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/audit.js';
import type { AppointmentStatus } from '../types/index.js';

export async function bookAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required to book an appointment.',
      });
    }

    const { doctorId, appointmentDate, appointmentTime, reasonForVisit } = req.body;

    // Validation
    if (!doctorId || !appointmentDate || !appointmentTime || !reasonForVisit) {
      return res.status(400).json({
        success: false,
        error: 'Doctor, appointment date, appointment time, and reason for visit are required.',
      });
    }

    const trimmedReason = reasonForVisit.trim();
    if (trimmedReason.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Reason for visit must be at least 5 characters.',
      });
    }

    // Verify date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Appointment date cannot be in the past. Please select today or a future date.',
      });
    }

    // Check doctor exists
    const doctor = await db.doctors.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Selected doctor could not be found.',
      });
    }

    // Prevent double booking for the same doctor and slot
    const existingConflict = await db.appointments.findSlotCollision(
      doctorId,
      appointmentDate,
      appointmentTime
    );

    if (existingConflict) {
      const displayName = doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`;
      return res.status(409).json({
        success: false,
        error: `The slot ${appointmentTime} on ${appointmentDate} is already booked for ${displayName}. Please select another time or date.`,
      });
    }

    // Patient info derived strictly from verified token
    const patientUser = await db.users.findById(req.user.id);
    const patientName = patientUser ? patientUser.name : req.user.name;
    const patientEmail = patientUser ? patientUser.email : req.user.email;

    const newAppointment = await db.appointments.create({
      patientId: req.user.id,
      patientName,
      patientEmail,
      doctorId: doctor._id,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      appointmentDate,
      appointmentTime,
      reasonForVisit: trimmedReason,
      status: 'Pending',
    });

    await logAuditEvent({
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'APPOINTMENT_BOOKED',
      resourceType: 'APPOINTMENT',
      resourceId: newAppointment.appointmentId,
      details: `Booked appointment with ${doctor.name} on ${appointmentDate} at ${appointmentTime}.`,
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      appointment: newAppointment,
    });
  } catch (err: any) {
    console.error('Error booking appointment:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to book appointment. Please try again later.',
    });
  }
}

export async function getAppointments(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { status, doctorId } = req.query;
    let appointments = await db.appointments.find();

    // Role-based filtering
    if (req.user.role === 'patient') {
      // Patients can only view their own appointments
      appointments = appointments.filter((a) => a.patientId === req.user!.id);
    } else if (req.user.role === 'doctor') {
      // Doctor can only see their assigned appointments
      // Check doctor profile associated with this user
      const doc = await db.doctors.findByUserId(req.user.id) || await db.doctors.findOne({ email: req.user.email });
      if (doc) {
        appointments = appointments.filter((a) => a.doctorId === doc._id);
      } else {
        // Fallback: match by doctor name if not linked directly
        appointments = appointments.filter((a) => a.doctorName.toLowerCase().includes(req.user!.name.toLowerCase()));
      }
    } else if (req.user.role === 'admin') {
      // Admin can filter by doctor if requested
      if (doctorId && typeof doctorId === 'string') {
        appointments = appointments.filter((a) => a.doctorId === doctorId);
      }
    }

    if (status && typeof status === 'string' && status !== 'All') {
      appointments = appointments.filter((a) => a.status.toLowerCase() === status.toLowerCase());
    }

    return res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve appointments.' });
  }
}

export async function getAppointmentById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { id } = req.params;
    const appointment = await db.appointments.findById(id);

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    // Role-based permission check
    if (req.user.role === 'patient' && appointment.patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only view your own appointments.',
      });
    }

    return res.json({
      success: true,
      appointment,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch appointment details.' });
  }
}

export async function updateAppointmentStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { id } = req.params;
    const { status, note } = req.body;

    const allowedStatuses: AppointmentStatus[] = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const appointment = await db.appointments.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    // Only doctors assigned to this appointment or admins can update general status
    if (req.user.role === 'patient') {
      return res.status(403).json({
        success: false,
        error: 'Patients cannot change appointment status directly. Use cancellation endpoint instead.',
      });
    }

    const updated = await db.appointments.updateById(id, {
      status,
      cancellationReason: status === 'Cancelled' ? note || 'Cancelled by provider' : undefined,
    });

    await logAuditEvent({
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'APPOINTMENT_STATUS_UPDATE',
      resourceType: 'APPOINTMENT',
      resourceId: appointment.appointmentId,
      details: `Status changed from "${appointment.status}" to "${status}" by ${req.user.name}.`,
      req,
    });

    return res.json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      appointment: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update appointment status.' });
  }
}

export async function cancelAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await db.appointments.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    // Ownership check
    if (req.user.role === 'patient' && appointment.patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You cannot cancel another patient’s appointment.',
      });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        error: 'This appointment is already cancelled.',
      });
    }

    if (appointment.status === 'Completed') {
      return res.status(400).json({
        success: false,
        error: 'Completed appointments cannot be cancelled.',
      });
    }

    const updated = await db.appointments.updateById(id, {
      status: 'Cancelled',
      cancellationReason: reason?.trim() || 'Cancelled by user',
      cancelledBy: req.user.role,
    });

    await logAuditEvent({
      actorId: req.user.id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'APPOINTMENT_CANCELLED',
      resourceType: 'APPOINTMENT',
      resourceId: appointment.appointmentId,
      details: `Appointment ${appointment.appointmentId} cancelled by ${req.user.name}. Reason: ${reason || 'Not specified'}`,
      req,
    });

    return res.json({
      success: true,
      message: 'Appointment has been cancelled successfully.',
      appointment: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to cancel appointment.' });
  }
}
