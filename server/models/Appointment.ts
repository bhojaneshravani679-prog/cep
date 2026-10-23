import mongoose, { Schema, Document } from 'mongoose';
import type { IAppointment } from '../types/index.js';

export interface IAppointmentDocument extends Omit<IAppointment, '_id'>, Document {}

const AppointmentSchema = new Schema<IAppointmentDocument>(
  {
    appointmentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
      index: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    doctorSpecialization: {
      type: String,
      required: true,
    },
    appointmentDate: {
      type: String,
      required: true,
      index: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    reasonForVisit: {
      type: String,
      required: [true, 'Reason for visit is required'],
      trim: true,
      minlength: [3, 'Reason must be at least 3 characters'],
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent double bookings
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 }, { unique: false });

export const AppointmentModel =
  mongoose.models.Appointment || mongoose.model<IAppointmentDocument>('Appointment', AppointmentSchema);
