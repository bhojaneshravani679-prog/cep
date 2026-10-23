export type UserRole = 'patient' | 'doctor' | 'admin';
export type AccountStatus = 'active' | 'deactivated';
export type DoctorVerificationStatus = 'sample' | 'verified' | 'pending' | 'unverified';
export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  accountStatus: AccountStatus;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDoctor {
  _id: string;
  userId?: string;
  name: string;
  email?: string;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  consultationFee: number;
  availableDays: string[];
  workingHours: {
    start: string;
    end: string;
  };
  slotDurationMinutes: number;
  verificationStatus: DoctorVerificationStatus;
  isSample: boolean;
  hospitalAffiliation?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAppointment {
  _id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "10:00 AM" or "10:00"
  reasonForVisit: string;
  status: AppointmentStatus;
  cancellationReason?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMedicalRecord {
  _id: string;
  recordId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  visitDate: string;
  diagnosis: string;
  treatmentNotes: string;
  vitals?: {
    bloodPressure?: string;
    pulseRate?: string;
    temperature?: string;
    weightKg?: string;
  };
  prescriptionId?: string;
  verificationHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPrescriptionItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface IPrescription {
  _id: string;
  prescriptionId: string;
  recordId?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  prescriptionDate: string;
  medications: IPrescriptionItem[];
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAuditLog {
  _id: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole | 'system';
  action: string;
  resourceType: 'AUTH' | 'APPOINTMENT' | 'MEDICAL_RECORD' | 'PRESCRIPTION' | 'DOCTOR' | 'USER' | 'SYSTEM';
  resourceId?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
