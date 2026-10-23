import mongoose, { Schema, Document } from 'mongoose';
import type { IAuditLog } from '../types/index.js';

export interface IAuditLogDocument extends Omit<IAuditLog, '_id'>, Document {}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    actorId: {
      type: String,
      required: true,
      index: true,
    },
    actorEmail: {
      type: String,
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      enum: ['AUTH', 'APPOINTMENT', 'MEDICAL_RECORD', 'PRESCRIPTION', 'DOCTOR', 'USER', 'SYSTEM'],
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      index: true,
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: String,
      default: () => new Date().toISOString(),
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

export const AuditLogModel =
  mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
