import mongoose, { Schema, Document } from 'mongoose';
import type { IMedicalRecord } from '../types/index.js';

export interface IMedicalRecordDocument extends Omit<IMedicalRecord, '_id'>, Document {}

const MedicalRecordSchema = new Schema<IMedicalRecordDocument>(
  {
    recordId: {
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
    doctorId: {
      type: String,
      required: true,
      index: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    appointmentId: {
      type: String,
      index: true,
    },
    visitDate: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    treatmentNotes: {
      type: String,
      required: [true, 'Treatment notes are required'],
      trim: true,
    },
    vitals: {
      bloodPressure: { type: String, default: '' },
      pulseRate: { type: String, default: '' },
      temperature: { type: String, default: '' },
      weightKg: { type: String, default: '' },
    },
    prescriptionId: {
      type: String,
      default: '',
    },
    verificationHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MedicalRecordModel =
  mongoose.models.MedicalRecord || mongoose.model<IMedicalRecordDocument>('MedicalRecord', MedicalRecordSchema);
