import mongoose, { Schema, Document } from 'mongoose';
import type { IPrescription, IPrescriptionItem } from '../types/index.js';

export interface IPrescriptionDocument extends Omit<IPrescription, '_id'>, Document {}

const PrescriptionItemSchema = new Schema<IPrescriptionItem>({
  medicationName: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String, default: '' },
});

const PrescriptionSchema = new Schema<IPrescriptionDocument>(
  {
    prescriptionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    recordId: {
      type: String,
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
    prescriptionDate: {
      type: String,
      required: true,
    },
    medications: {
      type: [PrescriptionItemSchema],
      required: true,
    },
    instructions: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const PrescriptionModel =
  mongoose.models.Prescription || mongoose.model<IPrescriptionDocument>('Prescription', PrescriptionSchema);
