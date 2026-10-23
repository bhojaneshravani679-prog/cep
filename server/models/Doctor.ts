import mongoose, { Schema, Document } from 'mongoose';
import type { IDoctor } from '../types/index.js';

export interface IDoctorDocument extends Omit<IDoctor, '_id'>, Document {}

const DoctorSchema = new Schema<IDoctorDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      index: true,
    },
    qualifications: {
      type: String,
      required: true,
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
      default: 50,
    },
    availableDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
    },
    verificationStatus: {
      type: String,
      enum: ['sample', 'verified', 'pending', 'unverified'],
      default: 'sample',
      index: true,
    },
    isSample: {
      type: Boolean,
      default: false,
    },
    hospitalAffiliation: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DoctorModel = mongoose.models.Doctor || mongoose.model<IDoctorDocument>('Doctor', DoctorSchema);
