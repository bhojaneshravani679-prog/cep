export type UserRole = 'patient' | 'doctor' | 'admin';
export type AccountStatus = 'active' | 'deactivated';
export type DoctorVerificationStatus = 'sample' | 'verified' | 'pending' | 'unverified';
export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  accountStatus: AccountStatus;
  createdAt: string;
  doctorProfile?: Doctor;
}

export interface Doctor {
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
}

export interface Appointment {
  _id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  appointmentDate: string;
  appointmentTime: string;
  reasonForVisit: string;
  status: AppointmentStatus;
  cancellationReason?: string;
  cancelledBy?: string;
  createdAt: string;
}

export interface MedicalRecord {
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
  qrCodeImage?: string;
  verificationUrl?: string;
  createdAt: string;
}

export interface PrescriptionItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  _id: string;
  prescriptionId: string;
  recordId?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  prescriptionDate: string;
  medications: PrescriptionItem[];
  instructions?: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole | 'system';
  action: string;
  resourceType: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  patientCount: number;
  doctorCount: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  medicalRecordsCount: number;
  prescriptionsCount: number;
}
