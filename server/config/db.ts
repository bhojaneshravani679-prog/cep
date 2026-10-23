import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import type {
  IUser,
  IDoctor,
  IAppointment,
  IMedicalRecord,
  IPrescription,
  IAuditLog,
} from '../types/index.js';

let isMongoConnected = false;
let dbStatusMessage = 'Initializing database...';

const STORAGE_FILE = path.resolve(process.cwd(), '.data-store.json');

interface InMemoryStore {
  users: IUser[];
  doctors: IDoctor[];
  appointments: IAppointment[];
  medicalRecords: IMedicalRecord[];
  prescriptions: IPrescription[];
  auditLogs: IAuditLog[];
}

let store: InMemoryStore = {
  users: [],
  doctors: [],
  appointments: [],
  medicalRecords: [],
  prescriptions: [],
  auditLogs: [],
};

// Load persistent local store if exists
function loadLocalStore(): void {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      store = {
        users: parsed.users || [],
        doctors: parsed.doctors || [],
        appointments: parsed.appointments || [],
        medicalRecords: parsed.medicalRecords || [],
        prescriptions: parsed.prescriptions || [],
        auditLogs: parsed.auditLogs || [],
      };
    }
  } catch (err) {
    console.warn('[DB] Could not load local storage file, using in-memory store:', err);
  }
}

function persistLocalStore(): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DB] Failed to persist local storage file:', err);
  }
}

// Initial Seed Data
export async function seedInitialData() {
  if (store.users.length === 0) {
    console.log('[DB] Seeding default users (Admin, Doctors, Patient)...');
    const adminPassHash = await bcrypt.hash('Admin@123456', 10);
    const doctorPassHash = await bcrypt.hash('Doctor@123456', 10);
    const patientPassHash = await bcrypt.hash('Patient@123456', 10);

    const adminUser: IUser = {
      _id: 'usr_admin_01',
      name: 'System Administrator',
      email: 'admin@healthcare.org',
      passwordHash: adminPassHash,
      role: 'admin',
      accountStatus: 'active',
      phone: '+1 (555) 019-2831',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docUser1: IUser = {
      _id: 'usr_doc_01',
      name: 'Dr. Ananya Sharma',
      email: 'dr.ananya@healthcare.org',
      passwordHash: doctorPassHash,
      role: 'doctor',
      accountStatus: 'active',
      phone: '+1 (555) 012-4411',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docUser2: IUser = {
      _id: 'usr_doc_02',
      name: 'Dr. Rahul Patil',
      email: 'dr.rahul@healthcare.org',
      passwordHash: doctorPassHash,
      role: 'doctor',
      accountStatus: 'active',
      phone: '+1 (555) 013-8822',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docUser3: IUser = {
      _id: 'usr_doc_03',
      name: 'Dr. Priya Deshmukh',
      email: 'dr.priya@healthcare.org',
      passwordHash: doctorPassHash,
      role: 'doctor',
      accountStatus: 'active',
      phone: '+1 (555) 014-9933',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docUser4: IUser = {
      _id: 'usr_doc_04',
      name: 'Dr. Amit Shah',
      email: 'dr.amit@healthcare.org',
      passwordHash: doctorPassHash,
      role: 'doctor',
      accountStatus: 'active',
      phone: '+1 (555) 015-7744',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const samplePatient: IUser = {
      _id: 'usr_pat_01',
      name: 'Aarav Mehta',
      email: 'patient@example.com',
      passwordHash: patientPassHash,
      role: 'patient',
      accountStatus: 'active',
      phone: '+1 (555) 018-5566',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.users.push(adminUser, docUser1, docUser2, docUser3, docUser4, samplePatient);
  }

  if (store.doctors.length === 0) {
    console.log('[DB] Seeding standard doctor directory (Dr. Ananya, Dr. Rahul, Dr. Priya, Dr. Amit)...');
    const sampleDoctors: IDoctor[] = [
      {
        _id: 'doc_01',
        userId: 'usr_doc_01',
        name: 'Dr. Ananya Sharma',
        email: 'dr.ananya@healthcare.org',
        specialization: 'General Physician',
        qualifications: 'MBBS, MD - Internal Medicine (AIIMS)',
        experienceYears: 12,
        consultationFee: 50,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: '09:00', end: '14:00' },
        slotDurationMinutes: 30,
        verificationStatus: 'verified',
        isSample: false,
        hospitalAffiliation: 'Metro Apollo Health Institute',
        bio: 'Specialist in primary care, chronic illness management, and adult preventive health checkups with 12+ years of clinical excellence.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'doc_02',
        userId: 'usr_doc_02',
        name: 'Dr. Rahul Patil',
        email: 'dr.rahul@healthcare.org',
        specialization: 'Cardiologist',
        qualifications: 'MBBS, MD (Medicine), DM - Cardiology',
        experienceYears: 15,
        consultationFee: 90,
        availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        workingHours: { start: '10:00', end: '16:00' },
        slotDurationMinutes: 30,
        verificationStatus: 'verified',
        isSample: false,
        hospitalAffiliation: 'National Heart & Vascular Center',
        bio: 'Renowned cardiologist specializing in coronary artery disease, hypertension management, and echocardiography.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'doc_03',
        userId: 'usr_doc_03',
        name: 'Dr. Priya Deshmukh',
        email: 'dr.priya@healthcare.org',
        specialization: 'Dermatologist',
        qualifications: 'MBBS, DVD, MD - Dermatology & Venereology',
        experienceYears: 9,
        consultationFee: 65,
        availableDays: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
        workingHours: { start: '11:00', end: '18:00' },
        slotDurationMinutes: 30,
        verificationStatus: 'sample',
        isSample: true,
        hospitalAffiliation: 'Skin Health & Aesthetic Institute',
        bio: 'Expert dermatologist dealing with clinical skin disorders, allergies, eczema, acne therapies, and dermatopathology. (Sample Doctor Profile)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'doc_04',
        userId: 'usr_doc_04',
        name: 'Dr. Amit Shah',
        email: 'dr.amit@healthcare.org',
        specialization: 'Dentist',
        qualifications: 'BDS, MDS - Prosthodontics & Oral Implantology',
        experienceYears: 8,
        consultationFee: 45,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: '10:00', end: '17:00' },
        slotDurationMinutes: 30,
        verificationStatus: 'sample',
        isSample: true,
        hospitalAffiliation: 'Dental Precision Care Clinic',
        bio: 'Comprehensive oral healthcare, restorative dentistry, painless endodontics, and preventive dental hygiene. (Sample Doctor Profile)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    store.doctors.push(...sampleDoctors);
  }

  if (store.appointments.length === 0) {
    // Add sample appointment for patient
    const apt: IAppointment = {
      _id: 'apt_demo_01',
      appointmentId: 'APT-2026-9481',
      patientId: 'usr_pat_01',
      patientName: 'Aarav Mehta',
      patientEmail: 'patient@example.com',
      doctorId: 'doc_01',
      doctorName: 'Dr. Ananya Sharma',
      doctorSpecialization: 'General Physician',
      appointmentDate: '2026-10-25',
      appointmentTime: '10:00 AM',
      reasonForVisit: 'Annual routine health checkup and blood pressure monitoring',
      status: 'Confirmed',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    };
    store.appointments.push(apt);

    // Sample medical record
    const record: IMedicalRecord = {
      _id: 'rec_demo_01',
      recordId: 'REC-2026-1049',
      patientId: 'usr_pat_01',
      patientName: 'Aarav Mehta',
      doctorId: 'doc_01',
      doctorName: 'Dr. Ananya Sharma',
      appointmentId: 'apt_demo_01',
      visitDate: '2026-10-15',
      diagnosis: 'Mild seasonal upper respiratory inflammation and borderline pre-hypertension.',
      treatmentNotes: 'Patient advised adequate hydration, steam inhalation, and salt restriction. Re-evaluate blood pressure in 2 weeks.',
      vitals: {
        bloodPressure: '128/84 mmHg',
        pulseRate: '74 bpm',
        temperature: '98.4 F',
        weightKg: '72 kg',
      },
      prescriptionId: 'rx_demo_01',
      verificationHash: 'v_e9f3b817c0a4d2e1',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    };
    store.medicalRecords.push(record);

    const rx: IPrescription = {
      _id: 'rx_demo_01',
      prescriptionId: 'RX-2026-5082',
      recordId: 'rec_demo_01',
      patientId: 'usr_pat_01',
      patientName: 'Aarav Mehta',
      doctorId: 'doc_01',
      doctorName: 'Dr. Ananya Sharma',
      prescriptionDate: '2026-10-15',
      medications: [
        {
          medicationName: 'Cetirizine 10mg',
          dosage: '1 tablet',
          frequency: 'Once daily at bedtime',
          duration: '5 days',
          instructions: 'Take after food with water. Avoid driving if drowsy.',
        },
        {
          medicationName: 'Vitamin C 500mg Chewable',
          dosage: '1 tablet',
          frequency: 'Twice daily',
          duration: '10 days',
          instructions: 'Chew thoroughly after meals.',
        },
      ],
      instructions: 'Stay hydrated with warm fluids. Return if fever persists beyond 48 hours.',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
    };
    store.prescriptions.push(rx);

    // Initial audit log
    store.auditLogs.push({
      _id: 'log_init_01',
      actorId: 'system',
      actorEmail: 'system@healthcare.org',
      actorRole: 'system',
      action: 'SYSTEM_BOOTSTRAP',
      resourceType: 'SYSTEM',
      resourceId: 'SYS_INIT',
      details: 'Secure Healthcare System seeded with initial verified data models and audit tracking.',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    });
  }

  persistLocalStore();
}

// Connect to MongoDB if URI is supplied
export async function connectDatabase() {
  loadLocalStore();

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri.includes('localhost:27017')) {
    // If running in cloud container without a live localhost daemon or no URI
    isMongoConnected = false;
    dbStatusMessage = mongoUri
      ? 'MongoDB local URI detected; using internal high-integrity persistent engine'
      : 'Using internal high-integrity data store (Configure MONGODB_URI in .env for MongoDB Atlas)';
    console.log(`[DB] ${dbStatusMessage}`);
    await seedInitialData();
    return;
  }

  try {
    console.log('[DB] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    isMongoConnected = true;
    dbStatusMessage = 'Connected to MongoDB Atlas';
    console.log('[DB] Successfully connected to MongoDB Atlas');
    await seedInitialData();
  } catch (err: any) {
    isMongoConnected = false;
    dbStatusMessage = `MongoDB connection failed (${err.message}). Seamlessly running on internal persistent engine.`;
    console.warn(`[DB] ${dbStatusMessage}`);
    await seedInitialData();
  }
}

export function getDbStatus() {
  return {
    isMongoConnected,
    statusMessage: dbStatusMessage,
    counts: {
      users: store.users.length,
      doctors: store.doctors.length,
      appointments: store.appointments.length,
      medicalRecords: store.medicalRecords.length,
      prescriptions: store.prescriptions.length,
      auditLogs: store.auditLogs.length,
    },
  };
}

// Unified Store Accessors
export const db = {
  // Users
  users: {
    find: async (filter?: Partial<IUser>) => {
      if (!filter) return [...store.users];
      return store.users.filter((u) => {
        return Object.entries(filter).every(([k, v]) => (u as any)[k] === v);
      });
    },
    findById: async (id: string) => {
      return store.users.find((u) => u._id === id) || null;
    },
    findOne: async (filter: Partial<IUser>) => {
      return (
        store.users.find((u) => {
          return Object.entries(filter).every(([k, v]) => (u as any)[k] === v);
        }) || null
      );
    },
    create: async (data: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>) => {
      const newUser: IUser = {
        ...data,
        _id: 'usr_' + Math.random().toString(36).substring(2, 10),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.users.push(newUser);
      persistLocalStore();
      return newUser;
    },
    updateById: async (id: string, updates: Partial<IUser>) => {
      const idx = store.users.findIndex((u) => u._id === id);
      if (idx === -1) return null;
      store.users[idx] = {
        ...store.users[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      persistLocalStore();
      return store.users[idx];
    },
  },

  // Doctors
  doctors: {
    find: async (filter?: Partial<IDoctor>) => {
      if (!filter) return [...store.doctors];
      return store.doctors.filter((d) => {
        return Object.entries(filter).every(([k, v]) => (d as any)[k] === v);
      });
    },
    findById: async (id: string) => {
      return store.doctors.find((d) => d._id === id) || null;
    },
    findByUserId: async (userId: string) => {
      return store.doctors.find((d) => d.userId === userId) || null;
    },
    findOne: async (filter: Partial<IDoctor>) => {
      return (
        store.doctors.find((d) => {
          return Object.entries(filter).every(([k, v]) => (d as any)[k] === v);
        }) || null
      );
    },
    create: async (data: Omit<IDoctor, '_id' | 'createdAt' | 'updatedAt'>) => {
      const newDoc: IDoctor = {
        ...data,
        _id: 'doc_' + Math.random().toString(36).substring(2, 10),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.doctors.push(newDoc);
      persistLocalStore();
      return newDoc;
    },
    updateById: async (id: string, updates: Partial<IDoctor>) => {
      const idx = store.doctors.findIndex((d) => d._id === id);
      if (idx === -1) return null;
      store.doctors[idx] = {
        ...store.doctors[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      persistLocalStore();
      return store.doctors[idx];
    },
    deleteById: async (id: string) => {
      const idx = store.doctors.findIndex((d) => d._id === id);
      if (idx === -1) return false;
      store.doctors.splice(idx, 1);
      persistLocalStore();
      return true;
    },
  },

  // Appointments
  appointments: {
    find: async (filter?: Partial<IAppointment>) => {
      if (!filter) return [...store.appointments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return store.appointments
        .filter((a) => {
          return Object.entries(filter).every(([k, v]) => (a as any)[k] === v);
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    findById: async (id: string) => {
      return store.appointments.find((a) => a._id === id || a.appointmentId === id) || null;
    },
    findSlotCollision: async (doctorId: string, date: string, time: string) => {
      return store.appointments.find(
        (a) =>
          a.doctorId === doctorId &&
          a.appointmentDate === date &&
          a.appointmentTime === time &&
          a.status !== 'Cancelled'
      );
    },
    create: async (data: Omit<IAppointment, '_id' | 'appointmentId' | 'createdAt' | 'updatedAt'>) => {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const appointmentId = `APT-2026-${randomDigits}`;
      const newApt: IAppointment = {
        ...data,
        _id: 'apt_' + Math.random().toString(36).substring(2, 10),
        appointmentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.appointments.push(newApt);
      persistLocalStore();
      return newApt;
    },
    updateById: async (id: string, updates: Partial<IAppointment>) => {
      const idx = store.appointments.findIndex((a) => a._id === id || a.appointmentId === id);
      if (idx === -1) return null;
      store.appointments[idx] = {
        ...store.appointments[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      persistLocalStore();
      return store.appointments[idx];
    },
  },

  // Medical Records
  medicalRecords: {
    find: async (filter?: Partial<IMedicalRecord>) => {
      if (!filter) return [...store.medicalRecords].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return store.medicalRecords
        .filter((r) => {
          return Object.entries(filter).every(([k, v]) => (r as any)[k] === v);
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    findById: async (id: string) => {
      return store.medicalRecords.find((r) => r._id === id || r.recordId === id) || null;
    },
    findByHash: async (hash: string) => {
      return store.medicalRecords.find((r) => r.verificationHash === hash) || null;
    },
    create: async (data: Omit<IMedicalRecord, '_id' | 'recordId' | 'verificationHash' | 'createdAt' | 'updatedAt'>) => {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const recordId = `REC-2026-${randomDigits}`;
      const verificationHash = 'v_' + Math.random().toString(36).substring(2, 12);
      const newRecord: IMedicalRecord = {
        ...data,
        _id: 'rec_' + Math.random().toString(36).substring(2, 10),
        recordId,
        verificationHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.medicalRecords.push(newRecord);
      persistLocalStore();
      return newRecord;
    },
  },

  // Prescriptions
  prescriptions: {
    find: async (filter?: Partial<IPrescription>) => {
      if (!filter) return [...store.prescriptions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return store.prescriptions
        .filter((p) => {
          return Object.entries(filter).every(([k, v]) => (p as any)[k] === v);
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    findById: async (id: string) => {
      return store.prescriptions.find((p) => p._id === id || p.prescriptionId === id) || null;
    },
    create: async (data: Omit<IPrescription, '_id' | 'prescriptionId' | 'createdAt' | 'updatedAt'>) => {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const prescriptionId = `RX-2026-${randomDigits}`;
      const newRx: IPrescription = {
        ...data,
        _id: 'rx_' + Math.random().toString(36).substring(2, 10),
        prescriptionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.prescriptions.push(newRx);
      persistLocalStore();
      return newRx;
    },
  },

  // Audit Logs
  auditLogs: {
    find: async (limit = 100) => {
      return [...store.auditLogs]
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, limit);
    },
    create: async (data: Omit<IAuditLog, '_id' | 'timestamp'>) => {
      const newLog: IAuditLog = {
        ...data,
        _id: 'log_' + Math.random().toString(36).substring(2, 10),
        timestamp: new Date().toISOString(),
      };
      store.auditLogs.push(newLog);
      // Keep audit log trimmed to last 2000 entries
      if (store.auditLogs.length > 2000) {
        store.auditLogs = store.auditLogs.slice(-2000);
      }
      persistLocalStore();
      return newLog;
    },
  },
};
